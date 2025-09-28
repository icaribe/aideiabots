
import { MessageList } from "@/components/chat/MessageList";
import { MessageInput } from "@/components/chat/MessageInput";
import { ChatHeader } from "@/components/chat/ChatHeader";
import { LoadingState } from "@/components/ui/loading-state";
import { Badge } from "@/components/ui/badge";
import { HotwordConfig } from "@/components/voice/HotwordConfig";
import { useHotwordDetection } from "@/hooks/useHotwordDetection";
import { useAutoVoiceResponse } from "@/hooks/useAutoVoiceResponse";
import { Message } from "@/types/chat";
import { useState } from "react";

interface ChatInterfaceProps {
  agentName: string;
  agentId?: string;
  messages: Message[];
  onSendMessage: (content: string) => void;
  sendingMessage: boolean;
  voiceConfig?: {
    enabled: boolean;
    voiceId?: string;
    provider?: string;
    autoPlay?: boolean;
  };
}

export const ChatInterface = ({ 
  agentName,
  agentId,
  messages, 
  onSendMessage, 
  sendingMessage,
  voiceConfig 
}: ChatInterfaceProps) => {
  const [hotwordConfig, setHotwordConfig] = useState({
    enabled: false,
    keyword: agentName.toLowerCase() || 'assistente',
    sensitivity: 0.8,
    contextDuration: 5
  });

  const {
    isListening,
    isProcessingHotword,
    toggleContinuousListening
  } = useHotwordDetection(agentId, onSendMessage, hotwordConfig);

  // Auto voice response for bot messages
  useAutoVoiceResponse({ messages, voiceConfig });
  return (
    <div className="flex-1 flex flex-col h-screen">
      <ChatHeader agentName={agentName} />
      
      {voiceConfig?.enabled && (
        <div className="px-4 py-2 bg-blue-50 dark:bg-blue-950 border-b space-y-2">
          <Badge variant="outline" className="text-blue-600">
            🎤 Voice Chat Ativado
          </Badge>
          
          <HotwordConfig
            config={hotwordConfig}
            onChange={setHotwordConfig}
            isListening={isListening}
            onToggleListening={toggleContinuousListening}
          />
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
