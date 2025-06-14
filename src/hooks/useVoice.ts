
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useVoice = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const textToSpeech = async (text: string, voiceId?: string) => {
    try {
      setIsProcessing(true);
      
      const { data, error } = await supabase.functions.invoke('text-to-speech', {
        body: { text, voiceId }
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data.audioContent) {
        // Create audio from base64
        const audioBlob = new Blob(
          [Uint8Array.from(atob(data.audioContent), c => c.charCodeAt(0))], 
          { type: 'audio/mpeg' }
        );
        const audioUrl = URL.createObjectURL(audioBlob);
        
        const audio = new Audio(audioUrl);
        setIsPlaying(true);
        
        audio.onended = () => {
          setIsPlaying(false);
          URL.revokeObjectURL(audioUrl);
        };
        
        await audio.play();
        return audio;
      }
    } catch (error) {
      console.error('Text-to-speech error:', error);
      toast.error(error.message || 'Erro ao gerar áudio');
    } finally {
      setIsProcessing(false);
    }
  };

  const speechToText = async (audioBlob: Blob): Promise<string | null> => {
    try {
      setIsProcessing(true);
      
      // Convert blob to base64
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onload = () => {
          const result = reader.result as string;
          resolve(result.split(',')[1]); // Remove data:audio/webm;base64, prefix
        };
        reader.onerror = reject;
      });
      
      reader.readAsDataURL(audioBlob);
      const audioData = await base64Promise;

      const { data, error } = await supabase.functions.invoke('speech-to-text', {
        body: { audioData }
      });

      if (error) {
        throw new Error(error.message);
      }

      return data.text;
    } catch (error) {
      console.error('Speech-to-text error:', error);
      toast.error(error.message || 'Erro ao converter áudio em texto');
      return null;
    } finally {
      setIsProcessing(false);
    }
  };

  const startRecording = async (): Promise<MediaRecorder | null> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];

      mediaRecorder.ondataavailable = (event) => {
        chunks.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunks, { type: 'audio/webm' });
        const text = await speechToText(audioBlob);
        
        // Stop all tracks to release microphone
        stream.getTracks().forEach(track => track.stop());
        
        if (text) {
          // Emit custom event with transcribed text
          window.dispatchEvent(new CustomEvent('voiceTranscription', { 
            detail: { text } 
          }));
        }
        
        setIsRecording(false);
      };

      setIsRecording(true);
      mediaRecorder.start();
      
      return mediaRecorder;
    } catch (error) {
      console.error('Recording error:', error);
      toast.error('Erro ao acessar microfone');
      setIsRecording(false);
      return null;
    }
  };

  return {
    isPlaying,
    isRecording,
    isProcessing,
    textToSpeech,
    speechToText,
    startRecording,
  };
};
