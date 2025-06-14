
import { useState } from "react";
import { useParams } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/dashboard/AppSidebar";
import { MessageList } from "@/components/chat/MessageList";
import { MessageInput } from "@/components/chat/MessageInput";
import { ConversationSidebar } from "@/components/chat/ConversationSidebar";
import { ChatHeader } from "@/components/chat/ChatHeader";
import { LoadingState } from "@/components/ui/loading-state";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { useConversations } from "@/hooks/useConversations";
import { useMessageSending } from "@/hooks/useMessageSending";
import { Badge } from "@/components/ui/badge";

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
  
  const { 
    sendMessage, 
    sendingMessage, 
    isRetrying, 
    retryCount 
  } = useMessageSending(
    agentId,
    conversation,
    setMessages
  );

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
              activeConversationId={conversation?.id}
              onSelect={selectConversation}
              onNewConversation={createNewConversation}
            />

            <div className="flex-1 flex flex-col h-screen">
              <ChatHeader agentName={agent?.name || 'Agente'} />
              
              <div className="flex-1 overflow-auto p-4">
                <ErrorBoundary fallback={
                  <div className="p-4 text-center text-red-500">
                    Erro ao carregar mensagens
                  </div>
                }>
                  <MessageList messages={messages} />
                </ErrorBoundary>
              </div>
              
              <div className="p-4 border-t bg-white">
                {isRetrying && (
                  <div className="mb-2 flex items-center space-x-2">
                    <Badge variant="outline" className="text-orange-600">
                      Tentativa {retryCount + 1}/3
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      Reprocessando mensagem...
                    </span>
                  </div>
                )}
                
                <MessageInput 
                  onSend={sendMessage}
                  disabled={sendingMessage}
                />
                
                {sendingMessage && !isRetrying && (
                  <div className="mt-2">
                    <LoadingState 
                      message="Enviando mensagem..." 
                      size="sm" 
                      variant="inline"
                    />
                  </div>
                )}
              </div>
            </div>
          </main>
        </div>
      </SidebarProvider>
    </ErrorBoundary>
  );
};

export default ChatConversation;
