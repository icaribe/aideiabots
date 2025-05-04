
export const fetchGroqModels = async (apiKey: string): Promise<string[]> => {
  try {
    const response = await fetch('https://api.groq.com/v1/models', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error('Falha ao buscar modelos da Groq');
    }
    
    const data = await response.json();
    return data.data
      .filter((model: any) => model.id.includes('llama') || model.id.includes('mixtral'))
      .map((model: any) => model.id);
  } catch (error) {
    console.error("Erro ao conectar com a API da Groq:", error);
    throw new Error('Erro ao conectar com a API da Groq');
  }
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
    console.error("Erro ao conectar com a API da OpenAI:", error);
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
    console.error("Erro ao conectar com a API da Anthropic:", error);
    throw new Error('Erro ao conectar com a API da Anthropic');
  }
};

export const fetchGeminiModels = async (apiKey: string): Promise<string[]> => {
  try {
    // A API do Google AI não tem um endpoint específico para listar modelos
    // Usamos um endpoint de metadados para verificar a validade da API key
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
    );
    
    if (!response.ok) {
      throw new Error('Falha ao validar API key do Google AI');
    }
    
    const data = await response.json();
    return data.models
      .filter((model: any) => model.name.includes('gemini'))
      .map((model: any) => model.name.split('/').pop());
  } catch (error) {
    console.error("Erro ao conectar com a API do Google AI:", error);
    throw new Error('Erro ao conectar com a API do Google AI');
  }
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
    console.error("Erro ao conectar com a API do OpenRouter:", error);
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
    console.error("Erro ao conectar com o Ollama:", error);
    throw new Error('Erro ao conectar com o Ollama. Certifique-se que o servidor local está rodando.');
  }
};
