import { useState, useEffect, useRef } from 'react';
import { useVoice } from '@/hooks/useVoice';
import { toast } from 'sonner';

interface HotwordConfig {
  enabled: boolean;
  keyword: string;
  sensitivity: number;
  contextDuration: number; // seconds to capture after hotword
}

export const useHotwordDetection = (
  agentId: string | undefined,
  onTranscription: (text: string) => void,
  hotwordConfig: HotwordConfig = {
    enabled: false,
    keyword: 'assistente',
    sensitivity: 0.8,
    contextDuration: 5
  }
) => {
  const [isListening, setIsListening] = useState(false);
  const [isProcessingHotword, setIsProcessingHotword] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioBufferRef = useRef<Blob[]>([]);
  const hotwordTimerRef = useRef<number | null>(null);
  const { speechToText } = useVoice();

  const normalizeText = (text: string): string => {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove accents
      .replace(/[^\w\s]/g, '') // Remove special characters
      .trim();
  };

  const detectHotword = (text: string): boolean => {
    if (!hotwordConfig.keyword) return false;
    
    const normalizedText = normalizeText(text);
    const normalizedKeyword = normalizeText(hotwordConfig.keyword);
    
    // Check for exact match or partial match based on sensitivity
    if (hotwordConfig.sensitivity >= 1.0) {
      return normalizedText.includes(normalizedKeyword);
    } else {
      const words = normalizedText.split(/\s+/);
      return words.some(word => {
        const similarity = calculateSimilarity(word, normalizedKeyword);
        return similarity >= hotwordConfig.sensitivity;
      });
    }
  };

  const calculateSimilarity = (word1: string, word2: string): number => {
    const longer = word1.length > word2.length ? word1 : word2;
    const shorter = word1.length > word2.length ? word2 : word1;
    
    if (longer.length === 0) return 1.0;
    
    const distance = levenshteinDistance(longer, shorter);
    return (longer.length - distance) / longer.length;
  };

  const levenshteinDistance = (str1: string, str2: string): number => {
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
    
    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;
    
    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,
          matrix[j - 1][i] + 1,
          matrix[j - 1][i - 1] + indicator
        );
      }
    }
    
    return matrix[str2.length][str1.length];
  };

  const startContinuousListening = async () => {
    try {
      console.log('Starting continuous listening for hotword:', hotwordConfig.keyword);
      
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      streamRef.current = stream;
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      audioBufferRef.current = [];

      // Process audio in chunks for hotword detection
      mediaRecorder.ondataavailable = async (event) => {
        if (event.data.size > 0) {
          audioBufferRef.current.push(event.data);
          
          // Keep only last 10 seconds of audio for hotword detection
          if (audioBufferRef.current.length > 20) {
            audioBufferRef.current = audioBufferRef.current.slice(-20);
          }
          
          // Process recent audio for hotword detection
          if (!isProcessingHotword && audioBufferRef.current.length >= 2) {
            await processAudioForHotword();
          }
        }
      };

      mediaRecorder.onstop = () => {
        console.log('Continuous listening stopped');
        setIsListening(false);
      };

      setIsListening(true);
      mediaRecorder.start(500); // Record in 500ms chunks
      
      toast.success(`Escuta ativa iniciada. Diga "${hotwordConfig.keyword}" para ativar.`);
      
    } catch (error) {
      console.error('Error starting continuous listening:', error);
      toast.error('Erro ao iniciar escuta contínua');
      setIsListening(false);
    }
  };

  const processAudioForHotword = async () => {
    if (isProcessingHotword || audioBufferRef.current.length === 0) return;
    
    setIsProcessingHotword(true);
    
    try {
      // Take recent audio chunks for processing
      const recentChunks = audioBufferRef.current.slice(-4); // Last 2 seconds
      const audioBlob = new Blob(recentChunks, { type: 'audio/webm' });
      
      const transcription = await speechToText(audioBlob);
      
      if (transcription && detectHotword(transcription)) {
        console.log('Hotword detected in:', transcription);
        await handleHotwordDetected();
      }
      
    } catch (error) {
      console.error('Error processing audio for hotword:', error);
    } finally {
      setIsProcessingHotword(false);
    }
  };

  const handleHotwordDetected = async () => {
    console.log('Hotword detected! Starting context capture...');
    toast.info(`Palavra-chave detectada! Gravando por ${hotwordConfig.contextDuration}s...`);
    
    // Clear existing timer
    if (hotwordTimerRef.current) {
      clearTimeout(hotwordTimerRef.current);
    }
    
    // Clear buffer and start fresh recording for context
    audioBufferRef.current = [];
    
    // Set timer to process context after specified duration
    hotwordTimerRef.current = window.setTimeout(async () => {
      await processContextAudio();
    }, hotwordConfig.contextDuration * 1000);
  };

  const processContextAudio = async () => {
    if (audioBufferRef.current.length === 0) {
      console.log('No context audio to process');
      return;
    }
    
    try {
      console.log('Processing context audio...');
      const contextBlob = new Blob(audioBufferRef.current, { type: 'audio/webm' });
      
      const transcription = await speechToText(contextBlob);
      
      if (transcription) {
        console.log('Context transcription:', transcription);
        
        // Remove hotword from transcription
        const cleanedText = transcription
          .replace(new RegExp(hotwordConfig.keyword, 'gi'), '')
          .trim();
        
        if (cleanedText) {
          onTranscription(cleanedText);
          toast.success('Comando processado com sucesso!');
        }
      }
      
      // Clear buffer after processing
      audioBufferRef.current = [];
      
    } catch (error) {
      console.error('Error processing context audio:', error);
      toast.error('Erro ao processar comando de voz');
    }
  };

  const stopContinuousListening = () => {
    console.log('Stopping continuous listening');
    
    if (hotwordTimerRef.current) {
      clearTimeout(hotwordTimerRef.current);
      hotwordTimerRef.current = null;
    }
    
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    mediaRecorderRef.current = null;
    audioBufferRef.current = [];
    setIsListening(false);
    setIsProcessingHotword(false);
    
    toast.info('Escuta contínua interrompida');
  };

  const toggleContinuousListening = () => {
    if (isListening) {
      stopContinuousListening();
    } else {
      startContinuousListening();
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopContinuousListening();
    };
  }, []);

  return {
    isListening,
    isProcessingHotword,
    startContinuousListening,
    stopContinuousListening,
    toggleContinuousListening
  };
};
