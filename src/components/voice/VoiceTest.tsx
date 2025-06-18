
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Mic, Volume2, MicOff } from 'lucide-react';
import { useVoice } from '@/hooks/useVoice';
import { toast } from 'sonner';

export const VoiceTest = () => {
  const { textToSpeech, speechToText, startRecording, isPlaying, isRecording, isProcessing } = useVoice();
  const [testText, setTestText] = useState('Olá! Este é um teste de síntese de voz.');
  const [transcribedText, setTranscribedText] = useState('');
  const [currentRecorder, setCurrentRecorder] = useState<MediaRecorder | null>(null);

  const handleTestTTS = async () => {
    if (!testText.trim()) {
      toast.error('Digite um texto para testar');
      return;
    }
    await textToSpeech(testText);
  };

  const handleStartRecording = async () => {
    if (isRecording && currentRecorder) {
      // Stop recording
      currentRecorder.stop();
      setCurrentRecorder(null);
    } else {
      // Start recording
      const recorder = await startRecording();
      setCurrentRecorder(recorder);
    }
  };

  // Listen for transcription events
  useState(() => {
    const handleTranscription = (event: CustomEvent) => {
      setTranscribedText(event.detail.text);
    };

    window.addEventListener('voiceTranscription', handleTranscription as EventListener);
    
    return () => {
      window.removeEventListener('voiceTranscription', handleTranscription as EventListener);
    };
  });

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Teste de Text-to-Speech</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="test-text">Texto para sintetizar</Label>
            <Input
              id="test-text"
              value={testText}
              onChange={(e) => setTestText(e.target.value)}
              placeholder="Digite o texto que deseja ouvir..."
              className="mt-1"
            />
          </div>
          
          <Button 
            onClick={handleTestTTS}
            disabled={isProcessing || isPlaying || !testText.trim()}
            className="w-full"
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processando...
              </>
            ) : isPlaying ? (
              <>
                <Volume2 className="h-4 w-4 mr-2" />
                Reproduzindo...
              </>
            ) : (
              <>
                <Volume2 className="h-4 w-4 mr-2" />
                Testar Síntese de Voz
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Teste de Speech-to-Text</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={handleStartRecording}
            disabled={isProcessing}
            variant={isRecording ? "destructive" : "default"}
            className="w-full"
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processando...
              </>
            ) : isRecording ? (
              <>
                <MicOff className="h-4 w-4 mr-2" />
                Parar Gravação
              </>
            ) : (
              <>
                <Mic className="h-4 w-4 mr-2" />
                Iniciar Gravação
              </>
            )}
          </Button>

          {transcribedText && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <Label className="text-sm font-medium">Texto transcrito:</Label>
              <p className="mt-1 text-sm">{transcribedText}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
