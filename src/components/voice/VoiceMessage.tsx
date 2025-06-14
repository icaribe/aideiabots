
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Volume2, Loader2 } from 'lucide-react';
import { useVoice } from '@/hooks/useVoice';

interface VoiceMessageProps {
  text: string;
  voiceId?: string;
}

export const VoiceMessage = ({ text, voiceId }: VoiceMessageProps) => {
  const { textToSpeech, isProcessing } = useVoice();
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlay = async () => {
    if (isPlaying) return;
    
    setIsPlaying(true);
    const audio = await textToSpeech(text, voiceId);
    
    if (audio) {
      audio.onended = () => setIsPlaying(false);
    } else {
      setIsPlaying(false);
    }
  };

  return (
    <Button
      size="sm"
      variant="ghost"
      onClick={handlePlay}
      disabled={isProcessing || isPlaying}
      className="ml-2 p-1 h-6 w-6"
    >
      {isProcessing || isPlaying ? (
        <Loader2 className="h-3 w-3 animate-spin" />
      ) : (
        <Volume2 className="h-3 w-3" />
      )}
    </Button>
  );
};
