
import { useState, useEffect } from "react";
import { Message } from "@/types/chat";

interface ConversationContext {
  recentMessages: Message[];
  contextSummary?: string;
  lastActivity: Date;
}

export const useConversationContext = (
  messages: Message[],
  maxContextMessages: number = 10
) => {
  const [context, setContext] = useState<ConversationContext>({
    recentMessages: [],
    lastActivity: new Date()
  });

  useEffect(() => {
    // Manter apenas as mensagens mais recentes para contexto
    const recentMessages = messages
      .slice(-maxContextMessages)
      .filter(msg => !msg.error);

    // Gerar resumo do contexto se houver muitas mensagens
    let contextSummary;
    if (messages.length > maxContextMessages) {
      const olderMessages = messages
        .slice(0, -maxContextMessages)
        .filter(msg => !msg.error);
      
      if (olderMessages.length > 0) {
        contextSummary = `Conversa anterior: ${olderMessages.length} mensagens trocadas sobre diversos tópicos.`;
      }
    }

    setContext({
      recentMessages,
      contextSummary,
      lastActivity: new Date()
    });
  }, [messages, maxContextMessages]);

  const getContextForLLM = (): string => {
    let contextString = "";
    
    if (context.contextSummary) {
      contextString += `Contexto anterior: ${context.contextSummary}\n\n`;
    }
    
    contextString += "Histórico recente da conversa:\n";
    context.recentMessages.forEach((msg, index) => {
      const role = msg.is_from_user ? "Usuário" : "Assistente";
      contextString += `${role}: ${msg.content}\n`;
    });
    
    return contextString;
  };

  return {
    context,
    getContextForLLM
  };
};
