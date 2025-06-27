
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Conversation, Message } from "@/types/chat";
import { useErrorHandler } from "@/hooks/useErrorHandler";
import { useAnalytics } from "@/hooks/useAnalytics";

export function useConversations(agentId: string | undefined) {
  const navigate = useNavigate();
  const { errorState, handleError, clearError } = useErrorHandler();
  const { trackEvent, updateConversationMetrics } = useAnalytics();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [agent, setAgent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAgent = async () => {
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
          handleError(error, "fetchAgent");
          navigate("/chat");
          return;
        }

        setAgent(data);
        await fetchConversations();
      } catch (error) {
        handleError(error, "fetchAgent");
      } finally {
        setLoading(false);
      }
    };

    fetchAgent();
  }, [agentId, navigate, handleError, clearError]);

  const fetchConversations = async () => {
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
        handleError(error, "fetchConversations");
        return;
      }

      setConversations(data || []);

      if (data && data.length > 0) {
        await selectConversation(data[0]);
      } else {
        await createNewConversation();
      }
    } catch (error) {
      handleError(error, "fetchConversations");
    }
  };

  const selectConversation = async (selectedConversation: Conversation) => {
    setConversation(selectedConversation);
    
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', selectedConversation.id)
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

      // Track analytics: conversation viewed
      if (agentId) {
        await trackEvent(agentId, 'conversation_viewed', {
          conversation_id: selectedConversation.id,
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

      setConversation(data);
      setConversations(prev => [data, ...prev]);
      setMessages([]);

      // Track analytics: conversation started
      if (agentId) {
        await trackEvent(agentId, 'conversation_started', {
          conversation_id: data.id
        });

        // Initialize conversation metrics
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

  const retryOperation = () => {
    clearError();
    if (agentId) {
      setLoading(true);
      fetchConversations();
    }
  };

  return {
    agent,
    loading,
    conversations,
    conversation,
    messages,
    setMessages,
    selectConversation,
    createNewConversation,
    error: errorState.error,
    retryOperation
  };
}
