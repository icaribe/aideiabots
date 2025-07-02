
import { useState } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/dashboard/AppSidebar";
import { ConversationSidebar } from "@/components/chat/ConversationSidebar";
import { ChatInterface } from "@/components/chat/ChatInterface";
import { LoadingState } from "@/components/ui/loading-state";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { useChat } from "@/hooks/useChat";

const ChatConversation = () => {
  const [workspace] = useState("Meu Workspace");
  
  const {
    agent,
    loading,
    conversations,
    currentConversation,
    messages,
    sendingMessage,
    selectConversation,
    createNewConversation,
    sendMessage
  } = useChat();

  // Voice configuration from agent
  const voiceConfig = {
    enabled: !!(agent?.voice_credential_id && agent?.voice_model),
    voiceId: agent?.voice_model,
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingState 
          message="Carregando conversa..." 
          size="lg" 
          variant="card"
        />
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-gray-50">
          <AppSidebar workspace={workspace} />
          <main className="flex-1 flex flex-col md:flex-row">
            <ConversationSidebar
              conversations={conversations}
              activeConversationId={currentConversation?.id}
              onSelect={selectConversation}
              onNewConversation={createNewConversation}
            />

            <ChatInterface
              agentName={agent?.name || 'Agente'}
              agentId={agent?.id}
              messages={messages}
              onSendMessage={sendMessage}
              sendingMessage={sendingMessage}
              voiceConfig={voiceConfig}
            />
          </main>
        </div>
      </SidebarProvider>
    </ErrorBoundary>
  );
};

export default ChatConversation;
