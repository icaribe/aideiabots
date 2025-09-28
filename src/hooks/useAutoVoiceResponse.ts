import { useEffect, useRef } from "react";
import { useVoice } from "./useVoice";
import { Message } from "@/types/chat";

interface UseAutoVoiceResponseProps {
  messages: Message[];
  voiceConfig?: {
    enabled: boolean;
    voiceId?: string;
    provider?: string;
    autoPlay?: boolean;
  };
}

export const useAutoVoiceResponse = ({ messages, voiceConfig }: UseAutoVoiceResponseProps) => {
  const { textToSpeech } = useVoice();
  const lastMessageRef = useRef<string>("");
  const isPlayingRef = useRef(false);

  useEffect(() => {
    if (!voiceConfig?.enabled || !voiceConfig?.autoPlay) return;

    const lastMessage = messages[messages.length - 1];
    
    // Only play if it's a new bot message (not from user) and not an error
    if (
      lastMessage &&
      !lastMessage.is_from_user &&
      !lastMessage.error &&
      lastMessage.id !== lastMessageRef.current &&
      !isPlayingRef.current
    ) {
      lastMessageRef.current = lastMessage.id;
      
      // Play the message automatically
      const playMessage = async () => {
        isPlayingRef.current = true;
        try {
          const audio = await textToSpeech(
            lastMessage.content,
            voiceConfig.voiceId,
            voiceConfig.provider || 'elevenlabs'
          );
          
          if (audio) {
            audio.onended = () => {
              isPlayingRef.current = false;
            };
            audio.onerror = () => {
              isPlayingRef.current = false;
            };
          } else {
            isPlayingRef.current = false;
          }
        } catch (error) {
          console.error('Auto voice response error:', error);
          isPlayingRef.current = false;
        }
      };

      // Small delay to ensure the message is rendered
      setTimeout(playMessage, 500);
    }
  }, [messages, voiceConfig, textToSpeech]);

  return {
    isPlaying: isPlayingRef.current
  };
};