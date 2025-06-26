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
    console.log('Validating ElevenLabs API key and fetching voices...');
    
    const response = await fetch('https://api.elevenlabs.io/v1/voices', {
      headers: {
        'Accept': 'application/json',
        'xi-api-key': apiKey
      }
    });

    console.log('ElevenLabs API response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('ElevenLabs API error:', errorData);
      
      if (response.status === 401) {
        const message = errorData.detail?.message || 'API Key da ElevenLabs inválida';
        if (message.includes('missing_permissions')) {
          throw new Error('API Key da ElevenLabs não tem permissões necessárias. Verifique se a chave tem acesso às vozes.');
        }
        throw new Error('API Key da ElevenLabs inválida. Verifique sua chave de API.');
      } else if (response.status === 429) {
        throw new Error('Limite de uso da API ElevenLabs excedido. Tente novamente mais tarde.');
      } else {
        throw new Error(`Erro na API da ElevenLabs: ${errorData.detail?.message || 'Erro desconhecido'}`);
      }
    }

    const data = await response.json();
    console.log('ElevenLabs voices fetched successfully:', data.voices?.length || 0);
    
    if (!data.voices || !Array.isArray(data.voices)) {
      throw new Error('Formato de resposta inválido da API ElevenLabs');
    }

    return data.voices.map((voice: any) => ({
      id: voice.voice_id,
      name: `${voice.name} (${voice.category || 'Custom'})`
    }));
  } catch (error) {
    console.error('Erro ao buscar vozes da ElevenLabs:', error);
    
    if (error.message.includes('API Key') || 
        error.message.includes('inválida') || 
        error.message.includes('Limite de uso') ||
        error.message.includes('permissões') ||
        error.message.includes('Erro na API')) {
      throw error;
    }
    
    throw new Error('Erro ao conectar com a API da ElevenLabs. Verifique sua conexão e chave de API.');
  }
};

// Fetch OpenAI voices dynamically from API
export const fetchOpenAIVoices = async (apiKey: string) => {
  try {
    console.log('Validating OpenAI API key and fetching available models...');
    
    // First, validate the API key by making a test call to the TTS endpoint
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

    // Now fetch available models to determine TTS capabilities
    const modelsResponse = await fetch('https://api.openai.com/v1/models', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!modelsResponse.ok) {
      console.warn('Could not fetch models from OpenAI, using default voices');
      // Fallback to known voices if models endpoint fails
      return [
        { id: 'alloy', name: 'Alloy (Natural, Balanced)' },
        { id: 'echo', name: 'Echo (Male, Clear)' },
        { id: 'fable', name: 'Fable (British, Warm)' },
        { id: 'onyx', name: 'Onyx (Deep, Authoritative)' },
        { id: 'nova', name: 'Nova (Female, Pleasant)' },
        { id: 'shimmer', name: 'Shimmer (Soft, Gentle)' }
      ];
    }

    const modelsData = await modelsResponse.json();
    console.log('Fetched models from OpenAI:', modelsData);

    // Check if TTS models are available
    const ttsModels = modelsData.data?.filter((model: any) => 
      model.id?.includes('tts') || model.object === 'model'
    ) || [];

    console.log('Available TTS models:', ttsModels);

    // Since OpenAI doesn't provide a direct voices endpoint, we'll check if TTS is available
    // and return the known voices that work with their TTS API
    if (ttsModels.length > 0 || modelsData.data?.length > 0) {
      console.log('TTS functionality confirmed, returning available voices');
      return [
        { id: 'alloy', name: 'Alloy (Natural, Balanced)' },
        { id: 'echo', name: 'Echo (Male, Clear)' },
        { id: 'fable', name: 'Fable (British, Warm)' },
        { id: 'onyx', name: 'Onyx (Deep, Authoritative)' },
        { id: 'nova', name: 'Nova (Female, Pleasant)' },
        { id: 'shimmer', name: 'Shimmer (Soft, Gentle)' }
      ];
    } else {
      throw new Error('TTS functionality not available for this API key');
    }

  } catch (error) {
    console.error('Erro ao validar/buscar vozes da OpenAI:', error);
    if (error.message.includes('API Key da OpenAI inválida') || 
        error.message.includes('Limite de uso') || 
        error.message.includes('Erro na API da OpenAI') ||
        error.message.includes('TTS functionality not available')) {
      throw error;
    }
    throw new Error('Erro ao conectar com a API da OpenAI. Verifique sua chave de API.');
  }
};
