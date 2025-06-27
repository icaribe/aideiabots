
import { useParams } from "react-router-dom";
import { useConversations } from "@/hooks/useConversations";
import { useMessageSending } from "@/hooks/useMessageSending";

export function useChat() {
  const { agentId } = useParams<{ agentId: string }>();
  
  const {
    agent,
    loading,
    conversations,
    conversation: currentConversation,
    messages,
    setMessages,
    selectConversation,
    createNewConversation,
    error
  } = useConversations(agentId);

  const { 
    sendMessage, 
    sendingMessage 
  } = useMessageSending(agentId, currentConversation, setMessages);

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
    error
  };
}
