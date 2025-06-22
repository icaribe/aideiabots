
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const testVoice = async (
  selectedVoice: string,
  providerId: string,
  apiKey: string
): Promise<void> => {
  if (!selectedVoice) {
    toast.error("Selecione uma voz para testar");
    return;
  }

  if (!apiKey.trim()) {
    toast.error("API Key é necessária para testar a voz");
    return;
  }

  console.log('Testing voice with:', { provider: providerId, voice: selectedVoice });
  
  // Texto de teste personalizado por provedor
  const testTexts = {
    elevenlabs: "Olá! Esta é uma prévia da voz selecionada usando ElevenLabs. A qualidade do áudio é excelente para projetos profissionais.",
    openai: "Olá! Esta é uma prévia da voz selecionada usando OpenAI. Perfeito para aplicações rápidas e eficientes."
  };
  
  const testText = testTexts[providerId as keyof typeof testTexts] || "Olá! Esta é uma prévia da voz selecionada para teste.";
  
  try {
    const { data, error } = await supabase.functions.invoke('test-voice', {
      body: {
        text: testText,
        voiceId: selectedVoice,
        provider: providerId,
        apiKey: apiKey
      }
    });

    console.log('Supabase function response:', { data, error });

    if (error) {
      console.error('Test voice Edge Function error:', error);
      throw new Error(error.message || 'Erro ao chamar função de teste de voz');
    }

    if (!data) {
      throw new Error('Nenhuma resposta recebida da função de teste');
    }
    
    if (data.error) {
      throw new Error(data.error);
    }

    if (data.audioContent) {
      console.log('Creating audio from base64, length:', data.audioContent.length);
      
      try {
        // Create audio from base64
        const binaryString = atob(data.audioContent);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        
        const audioBlob = new Blob([bytes], { type: 'audio/mpeg' });
        const audioUrl = URL.createObjectURL(audioBlob);
        
        console.log('Audio blob created, size:', audioBlob.size);
        
        const audio = new Audio(audioUrl);
        
        audio.oncanplaythrough = () => {
          console.log('Audio can play through');
        };
        
        audio.onended = () => {
          console.log('Audio playback ended');
          URL.revokeObjectURL(audioUrl);
        };

        audio.onerror = (e) => {
          console.error('Audio playback error:', e);
          URL.revokeObjectURL(audioUrl);
          toast.error('Erro ao reproduzir o áudio gerado');
        };
        
        audio.onloadstart = () => {
          console.log('Audio loading started');
        };
        
        audio.onloadeddata = () => {
          console.log('Audio data loaded');
        };
        
        console.log('Starting audio playback...');
        await audio.play();
        
        // Mensagem de sucesso personalizada por provedor
        const successMessages = {
          elevenlabs: 'Teste de voz ElevenLabs reproduzido com sucesso!',
          openai: 'Teste de voz OpenAI reproduzido com sucesso!'
        };
        
        toast.success(successMessages[providerId as keyof typeof successMessages] || 'Teste de voz reproduzido com sucesso!');
        
      } catch (audioError) {
        console.error('Audio processing error:', audioError);
        toast.error('Erro ao processar o áudio: ' + audioError.message);
      }
    } else {
      console.error('No audio content in response:', data);
      throw new Error('Nenhum conteúdo de áudio foi recebido do servidor');
    }
  } catch (error) {
    console.error('Voice test error:', error);
    
    // Mensagens de erro mais específicas
    if (error.message.includes('missing_permissions')) {
      toast.error('API Key não tem permissões para acessar vozes. Verifique suas permissões no painel da ElevenLabs.');
    } else if (error.message.includes('401')) {
      toast.error('API Key inválida. Verifique sua chave de API.');
    } else if (error.message.includes('429')) {
      toast.error('Limite de uso excedido. Tente novamente mais tarde.');
    } else {
      toast.error(error.message || 'Erro ao testar a voz');
    }
    
    throw error;
  }
};
