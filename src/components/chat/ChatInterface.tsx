
import { MessageList } from "@/components/chat/MessageList";
import { MessageInput } from "@/components/chat/MessageInput";
import { ChatHeader } from "@/components/chat/ChatHeader";
import { LoadingState } from "@/components/ui/loading-state";
import { Badge } from "@/components/ui/badge";
import { Message } from "@/types/chat";

interface ChatInterfaceProps {
  agentName: string;
  messages: Message[];
  onSendMessage: (content: string) => void;
  sendingMessage: boolean;
  voiceConfig?: {
    enabled: boolean;
    voiceId?: string;
  };
}

export const ChatInterface = ({ 
  agentName, 
  messages, 
  onSendMessage, 
  sendingMessage,
  voiceConfig 
}: ChatInterfaceProps) => {
  return (
    <div className="flex-1 flex flex-col h-screen">
      <ChatHeader agentName={agentName} />
      
      {voiceConfig?.enabled && (
        <div className="px-4 py-2 bg-blue-50 border-b">
          <Badge variant="outline" className="text-blue-600">
            🎤 Voice Chat Ativado
          </Badge>
        </div>
      )}
      
      <div className="flex-1 overflow-auto p-4">
        <MessageList 
          messages={messages} 
          voiceConfig={voiceConfig}
        />
      </div>
      
      <div className="p-4 border-t bg-white">
        <MessageInput 
          onSend={onSendMessage}
          disabled={sendingMessage}
        />
        
        {sendingMessage && (
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
  );
};
