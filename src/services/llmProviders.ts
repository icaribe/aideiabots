
export const fetchGroqModels = async (apiKey: string): Promise<string[]> => {
  return [
    'llama2-70b-4096',
    'mixtral-8x7b-32768',
    'gemma-7b-it'
  ];
};

export const fetchOpenAIModels = async (apiKey: string): Promise<string[]> => {
  try {
    const response = await fetch('https://api.openai.com/v1/models', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error('Falha ao buscar modelos da OpenAI');
    }
    
    const data = await response.json();
    return data.data
      .filter((model: any) => model.id.includes('gpt'))
      .map((model: any) => model.id);
  } catch (error) {
    throw new Error('Erro ao conectar com a API da OpenAI');
  }
};

export const fetchAnthropicModels = async (apiKey: string): Promise<string[]> => {
  try {
    const response = await fetch('https://api.anthropic.com/v1/models', {
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      }
    });
    
    if (!response.ok) {
      throw new Error('Falha ao buscar modelos da Anthropic');
    }
    
    const data = await response.json();
    return data.models.map((model: any) => model.id);
  } catch (error) {
    throw new Error('Erro ao conectar com a API da Anthropic');
  }
};

export const fetchGeminiModels = async (apiKey: string): Promise<string[]> => {
  return [
    'gemini-pro',
    'gemini-pro-vision',
    'gemini-ultra',
    'gemini-ultra-vision'
  ];
};

export const fetchOpenRouterModels = async (apiKey: string): Promise<string[]> => {
  try {
    const response = await fetch('https://openrouter.ai/api/v1/models', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error('Falha ao buscar modelos do OpenRouter');
    }
    
    const data = await response.json();
    return data.data.map((model: any) => model.id);
  } catch (error) {
    throw new Error('Erro ao conectar com a API do OpenRouter');
  }
};

export const fetchOllamaModels = async (): Promise<string[]> => {
  try {
    const response = await fetch('http://localhost:11434/api/tags');
    
    if (!response.ok) {
      throw new Error('Falha ao buscar modelos do Ollama');
    }
    
    const data = await response.json();
    return data.models.map((model: any) => model.name);
  } catch (error) {
    throw new Error('Erro ao conectar com o Ollama. Certifique-se que o servidor local está rodando.');
  }
};
