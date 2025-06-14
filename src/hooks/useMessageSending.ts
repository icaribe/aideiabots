
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Conversation, Message } from "@/types/chat";
import { useRetry } from "@/hooks/useRetry";

export function useMessageSending(
  agentId: string | undefined,
  conversation: Conversation | null,
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>
) {
  const [sendingMessage, setSendingMessage] = useState(false);
  const navigate = useNavigate();
  const { executeWithRetry, isRetrying, retryCount } = useRetry();

  const sendMessage = async (content: string) => {
    if (!content.trim() || !conversation) return;

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

      // Salvar mensagem do usuário
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

      // Processar mensagem com retry
      const response = await executeWithRetry(async () => {
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
      }

    } catch (error) {
      console.error("Error sending message:", error);
      
      let errorMessage = "Erro desconhecido ao processar mensagem";
      
      if (error instanceof Error) {
        errorMessage = error.message;
        
        if (errorMessage.includes("API") && errorMessage.includes("Groq")) {
          errorMessage += ". Por favor, adicione a chave API do Groq nas configurações do projeto.";
        }
      }
      
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      
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
      
      try {
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
      } catch (dbError) {
        console.error("Erro ao salvar mensagem de erro:", dbError);
      }
      
    } finally {
      setSendingMessage(false);
    }
  };

  return { 
    sendMessage, 
    sendingMessage: sendingMessage || isRetrying,
    isRetrying,
    retryCount
  };
}
