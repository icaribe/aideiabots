
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Conversation, Message } from "@/types/chat";

export function useMessageSending(
  agentId: string | undefined,
  conversation: Conversation | null,
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>
) {
  const [sendingMessage, setSendingMessage] = useState(false);
  const navigate = useNavigate();

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
        console.error("Error saving message:", messageError);
        toast.error("Erro ao enviar mensagem");
        return;
      }

      const response = await supabase.functions.invoke('chat', {
        body: { 
          botId: agentId,
          message: content,
          conversationId: conversation.id
        }
      });
      
      if (response.error) {
        console.error("Error processing message:", response.error);
        
        let errorMessage = "Erro desconhecido ao processar mensagem";
        
        if (response.error.message) {
          errorMessage = response.error.message;
          
          if (errorMessage.includes("API") && errorMessage.includes("Groq")) {
            errorMessage += ". Por favor, adicione a chave API do Groq nas configurações do projeto.";
          }
        }
        
        const errorResponseMessage: Message = {
          id: crypto.randomUUID(),
          content: errorMessage,
          is_from_user: false,
          conversation_id: conversation.id,
          created_at: new Date().toISOString(),
          error: true,
          bot_id: agentId || "",
          user_id: session.user.id
        };
        
        setMessages(prev => [...prev, errorResponseMessage]);
        
        await supabase
          .from('messages')
          .insert({
            conversation_id: conversation.id,
            content: errorMessage,
            is_from_user: false,
            user_id: session.user.id,
            bot_id: agentId,
            error: true
          });
        
        return;
      }

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
      toast.error("Erro ao enviar mensagem");
      
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        content: error instanceof Error ? error.message : "Erro desconhecido ao processar mensagem",
        is_from_user: false,
        conversation_id: conversation?.id || "",
        created_at: new Date().toISOString(),
        error: true,
        bot_id: agentId || "",
        user_id: currentSession?.user?.id || ""
      };
      
      setMessages(prev => [...prev, errorMessage]);
      
    } finally {
      setSendingMessage(false);
    }
  };

  return { sendMessage, sendingMessage };
}
