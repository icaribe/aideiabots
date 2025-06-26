
import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Conversation, Message } from "@/types/chat";
import { useErrorHandler } from "@/hooks/useErrorHandler";
import { useAnalytics } from "@/hooks/useAnalytics";

export function useChat() {
  const { agentId } = useParams<{ agentId: string }>();
  const navigate = useNavigate();
  const { errorState, handleError, clearError } = useErrorHandler();
  const { trackEvent, updateConversationMetrics } = useAnalytics();
  
  const [agent, setAgent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [sendingMessage, setSendingMessage] = useState(false);

  // Load agent and conversations
  useEffect(() => {
    const loadAgent = async () => {
      try {
        setLoading(true);
        clearError();
        
        if (!agentId) return;

        const { data, error } = await supabase
          .from('bots')
          .select('*')
          .eq('id', agentId)
          .single();

        if (error) {
          handleError(error, "loadAgent");
          navigate("/chat");
          return;
        }

        setAgent(data);
        await loadConversations();
      } catch (error) {
        handleError(error, "loadAgent");
      } finally {
        setLoading(false);
      }
    };

    loadAgent();
  }, [agentId, navigate, handleError, clearError]);

  const loadConversations = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/');
        return;
      }

      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .eq('bot_id', agentId)
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (error) {
        handleError(error, "loadConversations");
        return;
      }

      setConversations(data || []);

      if (data && data.length > 0) {
        await selectConversation(data[0]);
      } else {
        await createNewConversation();
      }
    } catch (error) {
      handleError(error, "loadConversations");
    }
  };

  const selectConversation = async (conversation: Conversation) => {
    setCurrentConversation(conversation);
    
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversation.id)
        .order('created_at', { ascending: true });

      if (error) {
        handleError(error, "selectConversation");
        return;
      }

      const formattedMessages: Message[] = (data || []).map(msg => ({
        id: msg.id,
        content: msg.content,
        is_from_user: msg.is_from_user || false,
        conversation_id: msg.conversation_id,
        created_at: msg.created_at,
        bot_id: msg.bot_id || "",
        user_id: msg.user_id,
        error: Boolean(msg.error)
      }));

      setMessages(formattedMessages);

      // Track analytics
      if (agentId) {
        await trackEvent(agentId, 'conversation_viewed', {
          conversation_id: conversation.id,
          message_count: formattedMessages.length
        });
      }
    } catch (error) {
      handleError(error, "selectConversation");
    }
  };

  const createNewConversation = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/');
        return;
      }

      const { data, error } = await supabase
        .from('conversations')
        .insert({
          bot_id: agentId,
          user_id: session.user.id,
          title: `Nova conversa com ${agent?.name || 'Agente'}`
        })
        .select()
        .single();

      if (error) {
        handleError(error, "createNewConversation");
        return;
      }

      setCurrentConversation(data);
      setConversations(prev => [data, ...prev]);
      setMessages([]);

      // Track analytics
      if (agentId) {
        await trackEvent(agentId, 'conversation_started', {
          conversation_id: data.id
        });

        await updateConversationMetrics(data.id, agentId, {
          started_at: new Date().toISOString(),
          message_count: 0,
          response_time_avg: 0
        });
      }
    } catch (error) {
      handleError(error, "createNewConversation");
    }
  };

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || !currentConversation || sendingMessage) return;

    const messageStartTime = Date.now();

    try {
      setSendingMessage(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate('/');
        return;
      }

      // Add user message to UI immediately
      const userMessage: Message = {
        id: crypto.randomUUID(),
        content,
        is_from_user: true,
        conversation_id: currentConversation.id,
        created_at: new Date().toISOString(),
        bot_id: agentId || "",
        user_id: session.user.id,
        error: false
      };

      setMessages(prev => [...prev, userMessage]);

      // Save user message to database
      const { error: messageError } = await supabase
        .from('messages')
        .insert({
          conversation_id: currentConversation.id,
          content,
          is_from_user: true,
          user_id: session.user.id,
          bot_id: agentId,
          error: false
        });

      if (messageError) {
        throw new Error("Erro ao salvar mensagem: " + messageError.message);
      }

      // Track analytics
      if (agentId) {
        await trackEvent(agentId, 'message_sent', {
          conversation_id: currentConversation.id,
          message_length: content.length,
          is_from_user: true
        });
      }

      // Send to chat processing function
      const { data: response, error: chatError } = await supabase.functions.invoke('chat', {
        body: { 
          botId: agentId,
          message: content,
          conversationId: currentConversation.id
        }
      });
      
      if (chatError) {
        throw new Error(chatError.message || 'Erro ao processar mensagem');
      }

      const responseTime = (Date.now() - messageStartTime) / 1000;

      if (response && response.response) {
        const botMessage: Message = {
          id: crypto.randomUUID(),
          content: response.response,
          is_from_user: false,
          conversation_id: currentConversation.id,
          created_at: new Date().toISOString(),
          bot_id: agentId || "",
          user_id: session.user.id,
          error: false
        };

        setMessages(prev => [...prev, botMessage]);

        // Track analytics
        if (agentId) {
          await trackEvent(agentId, 'message_received', {
            conversation_id: currentConversation.id,
            response_time: responseTime,
            message_length: response.response.length,
            is_from_user: false
          });

          const currentMessageCount = messages.length + 2; // user + bot message
          await updateConversationMetrics(currentConversation.id, agentId, {
            message_count: currentMessageCount,
            response_time_avg: responseTime
          });
        }
      }

    } catch (error) {
      handleError(error, "sendMessage");
      
      // Add error message to UI
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        content: error instanceof Error ? error.message : "Erro desconhecido ao processar mensagem",
        is_from_user: false,
        conversation_id: currentConversation?.id || "",
        created_at: new Date().toISOString(),
        error: true,
        bot_id: agentId || "",
        user_id: ""
      };
      
      setMessages(prev => [...prev, errorMessage]);
      
    } finally {
      setSendingMessage(false);
    }
  }, [currentConversation, sendingMessage, agentId, messages.length, navigate, handleError, trackEvent, updateConversationMetrics]);

  return {
    agent,
    loading,
    conversations,
    currentConversation,
    messages,
    sendingMessage,
    selectConversation,
    createNewConversation,
    sendMessage,
    error: errorState.error
  };
}
