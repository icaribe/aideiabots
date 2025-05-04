
import { useState } from "react";
import { useParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/dashboard/AppSidebar";
import { MessageList } from "@/components/chat/MessageList";
import { MessageInput } from "@/components/chat/MessageInput";
import { ConversationSidebar } from "@/components/chat/ConversationSidebar";
import { ChatHeader } from "@/components/chat/ChatHeader";
import { useConversations } from "@/hooks/useConversations";
import { useMessageSending } from "@/hooks/useMessageSending";

const ChatConversation = () => {
  const { agentId } = useParams<{ agentId: string }>();
  const [workspace] = useState("Meu Workspace");
  
  const {
    agent,
    loading,
    conversations,
    conversation,
    messages,
    setMessages,
    selectConversation,
    createNewConversation
  } = useConversations(agentId);
  
  const { sendMessage, sendingMessage } = useMessageSending(
    agentId,
    conversation,
    setMessages
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50">
        <AppSidebar workspace={workspace} />
        <main className="flex-1 flex flex-col md:flex-row">
          <ConversationSidebar
            conversations={conversations}
            activeConversationId={conversation?.id}
            onSelect={selectConversation}
            onNewConversation={createNewConversation}
          />

          <div className="flex-1 flex flex-col h-screen">
            <ChatHeader agentName={agent?.name || 'Agente'} />
            
            <div className="flex-1 overflow-auto p-4">
              <MessageList messages={messages} />
            </div>
            
            <div className="p-4 border-t bg-white">
              <MessageInput 
                onSend={sendMessage}
                disabled={sendingMessage}
              />
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default ChatConversation;
