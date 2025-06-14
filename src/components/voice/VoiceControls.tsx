
import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Volume2, VolumeX, Loader2 } from 'lucide-react';
import { useVoice } from '@/hooks/useVoice';
import { cn } from '@/lib/utils';

interface VoiceControlsProps {
  onTranscription?: (text: string) => void;
  disabled?: boolean;
}

export const VoiceControls = ({ onTranscription, disabled }: VoiceControlsProps) => {
  const { isPlaying, isRecording, isProcessing, startRecording } = useVoice();
  const [isMuted, setIsMuted] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  const handleStartRecording = async () => {
    if (isRecording && mediaRecorderRef.current) {
      // Stop recording
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current = null;
    } else {
      // Start recording
      const recorder = await startRecording();
      mediaRecorderRef.current = recorder;
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    // This would control audio output volume in a real implementation
  };

  // Listen for voice transcription events
  useState(() => {
    const handleVoiceTranscription = (event: CustomEvent) => {
      if (onTranscription) {
        onTranscription(event.detail.text);
      }
    };

    window.addEventListener('voiceTranscription', handleVoiceTranscription as EventListener);
    
    return () => {
      window.removeEventListener('voiceTranscription', handleVoiceTranscription as EventListener);
    };
  });

  return (
    <div className="flex items-center gap-2">
      <Button
        size="icon"
        variant={isRecording ? "destructive" : "outline"}
        onClick={handleStartRecording}
        disabled={disabled || isProcessing}
        className={cn(
          "transition-all duration-200",
          isRecording && "animate-pulse"
        )}
      >
        {isProcessing ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : isRecording ? (
          <MicOff className="h-4 w-4" />
        ) : (
          <Mic className="h-4 w-4" />
        )}
      </Button>

      <Button
        size="icon"
        variant="outline"
        onClick={toggleMute}
        disabled={disabled}
        className={cn(
          "transition-all duration-200",
          isMuted && "text-red-500"
        )}
      >
        {isMuted ? (
          <VolumeX className="h-4 w-4" />
        ) : (
          <Volume2 className="h-4 w-4" />
        )}
      </Button>

      {(isPlaying || isRecording || isProcessing) && (
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          {isProcessing && "Processando..."}
          {isRecording && "Gravando..."}
          {isPlaying && "Reproduzindo..."}
        </div>
      )}
    </div>
  );
};
