
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useVoice = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const textToSpeech = async (text: string, voiceId?: string, provider: string = 'elevenlabs') => {
    try {
      setIsProcessing(true);
      console.log('Starting text-to-speech:', { text: text.substring(0, 50), voiceId, provider });
      
      const { data, error } = await supabase.functions.invoke('text-to-speech', {
        body: { text, voiceId, provider }
      });

      if (error) {
        console.error('TTS Error:', error);
        throw new Error(error.message);
      }

      if (data?.error) {
        console.error('TTS API Error:', data.error);
        throw new Error(data.error);
      }

      if (data?.audioContent) {
        console.log('Received audio content, creating audio element...');
        
        // Create audio from base64
        const audioBlob = new Blob(
          [Uint8Array.from(atob(data.audioContent), c => c.charCodeAt(0))], 
          { type: 'audio/mpeg' }
        );
        const audioUrl = URL.createObjectURL(audioBlob);
        
        const audio = new Audio(audioUrl);
        setIsPlaying(true);
        
        audio.onended = () => {
          console.log('Audio playback ended');
          setIsPlaying(false);
          URL.revokeObjectURL(audioUrl);
        };

        audio.onerror = (e) => {
          console.error('Audio playback error:', e);
          setIsPlaying(false);
          URL.revokeObjectURL(audioUrl);
        };
        
        await audio.play();
        console.log('Audio playback started');
        return audio;
      } else {
        throw new Error('No audio content received');
      }
    } catch (error) {
      console.error('Text-to-speech error:', error);
      toast.error(error.message || 'Erro ao gerar áudio');
    } finally {
      setIsProcessing(false);
    }
  };

  const speechToText = async (audioBlob: Blob, provider: string = 'openai'): Promise<string | null> => {
    try {
      setIsProcessing(true);
      console.log('Starting speech-to-text:', { size: audioBlob.size, type: audioBlob.type, provider });
      
      // Convert blob to base64
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onload = () => {
          const result = reader.result as string;
          const base64Data = result.split(',')[1]; // Remove data:audio/webm;base64, prefix
          console.log('Audio converted to base64, length:', base64Data.length);
          resolve(base64Data);
        };
        reader.onerror = (e) => {
          console.error('FileReader error:', e);
          reject(new Error('Failed to read audio file'));
        };
      });
      
      reader.readAsDataURL(audioBlob);
      const audioData = await base64Promise;

      const { data, error } = await supabase.functions.invoke('speech-to-text', {
        body: { audioData, provider }
      });

      if (error) {
        console.error('STT Error:', error);
        throw new Error(error.message);
      }

      if (data?.error) {
        console.error('STT API Error:', data.error);
        throw new Error(data.error);
      }

      console.log('Speech-to-text result:', data);
      return data?.text || null;
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
      console.log('Starting audio recording...');
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 44100,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      const chunks: Blob[] = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
          console.log('Audio chunk received:', event.data.size);
        }
      };

      mediaRecorder.onstop = async () => {
        console.log('Recording stopped, processing audio...');
        
        const audioBlob = new Blob(chunks, { type: 'audio/webm' });
        console.log('Created audio blob:', { size: audioBlob.size, type: audioBlob.type });
        
        // Stop all tracks to release microphone
        stream.getTracks().forEach(track => {
          track.stop();
          console.log('Audio track stopped');
        });
        
        const text = await speechToText(audioBlob);
        
        if (text) {
          console.log('Transcription successful:', text);
          // Emit custom event with transcribed text
          window.dispatchEvent(new CustomEvent('voiceTranscription', { 
            detail: { text } 
          }));
        }
        
        setIsRecording(false);
      };

      mediaRecorder.onerror = (event) => {
        console.error('MediaRecorder error:', event);
        toast.error('Erro na gravação de áudio');
        setIsRecording(false);
      };

      setIsRecording(true);
      mediaRecorder.start(1000); // Collect data every second
      console.log('MediaRecorder started');
      
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
