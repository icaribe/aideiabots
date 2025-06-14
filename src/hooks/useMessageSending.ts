
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Conversation, Message } from "@/types/chat";
import { useRetry } from "@/hooks/useRetry";
import { useErrorHandler } from "@/hooks/useErrorHandler";
import { useAnalytics } from "@/hooks/useAnalytics";

export function useMessageSending(
  agentId: string | undefined,
  conversation: Conversation | null,
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>
) {
  const [sendingMessage, setSendingMessage] = useState(false);
  const navigate = useNavigate();
  const { executeWithRetry, isRetrying, retryCount } = useRetry();
  const { handleError } = useErrorHandler();
  const { trackEvent, updateConversationMetrics } = useAnalytics();

  const sendMessage = async (content: string) => {
    if (!content.trim() || !conversation) return;

    const messageStartTime = Date.now();

    try {
      setSendingMessage(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate('/');
        return;
      }

      const userMessage: Message = {
        id: crypto.randomUUID(),
        content,
        is_from_user: true,
        conversation_id: conversation.id,
        created_at: new Date().toISOString(),
        bot_id: agentId || "",
        user_id: session.user.id,
        error: false
      };

      setMessages(prev => [...prev, userMessage]);

      // Track analytics: message sent by user
      if (agentId) {
        await trackEvent(agentId, 'message_sent', {
          conversation_id: conversation.id,
          message_length: content.length,
          is_from_user: true
        });
      }

      // Salvar mensagem do usuário com retry
      await executeWithRetry(async () => {
        const { error: messageError } = await supabase
          .from('messages')
          .insert({
            conversation_id: conversation.id,
            content,
            is_from_user: true,
            user_id: session.user.id,
            bot_id: agentId,
            error: false
          });

        if (messageError) {
          throw new Error("Erro ao salvar mensagem: " + messageError.message);
        }
      }, { maxAttempts: 2 });

      // Processar mensagem com retry e validação
      const response = await executeWithRetry(async () => {
        // Validar se o agente existe e tem configurações válidas
        const { data: botData, error: botError } = await supabase
          .from('bots')
          .select('llm_credential_id, llm_provider, model')
          .eq('id', agentId)
          .single();

        if (botError || !botData) {
          throw new Error("Agente não encontrado ou configuração inválida");
        }

        if (!botData.llm_credential_id) {
          throw new Error("Agente não possui credenciais configuradas. Configure nas configurações do projeto.");
        }

        const result = await supabase.functions.invoke('chat', {
          body: { 
            botId: agentId,
            message: content,
            conversationId: conversation.id
          }
        });
        
        if (result.error) {
          throw new Error(result.error.message || 'Erro ao processar mensagem');
        }
        
        return result;
      }, { 
        maxAttempts: 3,
        baseDelay: 2000,
        exponentialBackoff: true
      });

      const responseTime = (Date.now() - messageStartTime) / 1000;

      if (response.data && response.data.response) {
        const botMessage: Message = {
          id: crypto.randomUUID(),
          content: response.data.response,
          is_from_user: false,
          conversation_id: conversation.id,
          created_at: new Date().toISOString(),
          bot_id: agentId || "",
          user_id: session.user.id,
          error: false
        };

        setMessages(prev => [...prev, botMessage]);

        // Track analytics: message received from bot
        if (agentId) {
          await trackEvent(agentId, 'message_received', {
            conversation_id: conversation.id,
            response_time: responseTime,
            message_length: response.data.response.length,
            is_from_user: false
          });

          // Update conversation metrics
          const currentMessageCount = await getCurrentMessageCount(conversation.id);
          await updateConversationMetrics(conversation.id, agentId, {
            message_count: currentMessageCount + 2, // user + bot message
            response_time_avg: responseTime
          });
        }
      }

    } catch (error) {
      handleError(error, "sendMessage");
      
      // Salvar mensagem de erro no banco
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        
        let errorMessage = "Erro desconhecido ao processar mensagem";
        
        if (error instanceof Error) {
          errorMessage = error.message;
        }
        
        const errorResponseMessage: Message = {
          id: crypto.randomUUID(),
          content: errorMessage,
          is_from_user: false,
          conversation_id: conversation?.id || "",
          created_at: new Date().toISOString(),
          error: true,
          bot_id: agentId || "",
          user_id: currentSession?.user?.id || ""
        };
        
        setMessages(prev => [...prev, errorResponseMessage]);
        
        await supabase
          .from('messages')
          .insert({
            conversation_id: conversation.id,
            content: errorMessage,
            is_from_user: false,
            user_id: currentSession?.user?.id,
            bot_id: agentId,
            error: true
          });

        // Track analytics: error occurred
        if (agentId) {
          await trackEvent(agentId, 'message_error', {
            conversation_id: conversation.id,
            error_message: errorMessage,
            response_time: (Date.now() - messageStartTime) / 1000
          });
        }
      } catch (dbError) {
        console.error("Erro ao salvar mensagem de erro:", dbError);
      }
      
    } finally {
      setSendingMessage(false);
    }
  };

  const getCurrentMessageCount = async (conversationId: string) => {
    try {
      const { count } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('conversation_id', conversationId);
      
      return count || 0;
    } catch (error) {
      console.error('Error getting message count:', error);
      return 0;
    }
  };

  return { 
    sendMessage, 
    sendingMessage: sendingMessage || isRetrying,
    isRetrying,
    retryCount
  };
}
