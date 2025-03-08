
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

// Fetch OpenAI voices
export const fetchOpenAIVoices = async (apiKey: string) => {
  try {
    // OpenAI doesn't provide an API to list voices, so we return the fixed set
    return [
      { id: 'alloy', name: 'Alloy' },
      { id: 'echo', name: 'Echo' },
      { id: 'fable', name: 'Fable' },
      { id: 'onyx', name: 'Onyx' },
      { id: 'nova', name: 'Nova' },
      { id: 'shimmer', name: 'Shimmer' }
    ];
  } catch (error) {
    console.error('Erro ao buscar vozes da OpenAI:', error);
    throw new Error('Erro ao conectar com a API da OpenAI');
  }
};
