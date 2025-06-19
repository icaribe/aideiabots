
export const voiceProviders = [
  {
    id: 'elevenlabs',
    name: 'ElevenLabs',
    description: 'Vozes realistas e emocionais com suporte a múltiplos idiomas'
  },
  {
    id: 'openai',
    name: 'OpenAI',
    description: 'Vozes do sistema TTS da OpenAI'
  }
];

// Fetch ElevenLabs voices
export const fetchElevenLabsVoices = async (apiKey: string) => {
  try {
    const response = await fetch('https://api.elevenlabs.io/v1/voices', {
      headers: {
        'Accept': 'application/json',
        'xi-api-key': apiKey
      }
    });

    if (!response.ok) {
      throw new Error('Falha ao buscar vozes da ElevenLabs');
    }

    const data = await response.json();
    return data.voices.map((voice: any) => ({
      id: voice.voice_id,
      name: voice.name
    }));
  } catch (error) {
    console.error('Erro ao buscar vozes da ElevenLabs:', error);
    throw new Error('Erro ao conectar com a API da ElevenLabs');
  }
};

// Fetch OpenAI voices with REAL validation
export const fetchOpenAIVoices = async (apiKey: string) => {
  try {
    console.log('Validating OpenAI API key by making a test call...');
    
    // Make a real test call to OpenAI TTS API to validate the key
    const testResponse = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'tts-1',
        input: 'test',
        voice: 'alloy',
        response_format: 'mp3',
      }),
    });

    if (!testResponse.ok) {
      const errorData = await testResponse.json().catch(() => ({}));
      console.error('OpenAI API validation failed:', errorData);
      
      if (testResponse.status === 401) {
        throw new Error('API Key da OpenAI inválida. Verifique sua chave de API.');
      } else if (testResponse.status === 429) {
        throw new Error('Limite de uso da API OpenAI excedido. Tente novamente mais tarde.');
      } else {
        throw new Error(`Erro na API da OpenAI: ${errorData.error?.message || 'Erro desconhecido'}`);
      }
    }

    console.log('OpenAI API key validated successfully');

    // Only return the voices list after successful validation
    return [
      { id: 'alloy', name: 'Alloy' },
      { id: 'echo', name: 'Echo' },
      { id: 'fable', name: 'Fable' },
      { id: 'onyx', name: 'Onyx' },
      { id: 'nova', name: 'Nova' },
      { id: 'shimmer', name: 'Shimmer' }
    ];
  } catch (error) {
    console.error('Erro ao validar API Key da OpenAI:', error);
    if (error.message.includes('API Key da OpenAI inválida') || 
        error.message.includes('Limite de uso') || 
        error.message.includes('Erro na API da OpenAI')) {
      throw error;
    }
    throw new Error('Erro ao conectar com a API da OpenAI. Verifique sua chave de API.');
  }
};
