
export const fetchGroqModels = async (apiKey: string): Promise<string[]> => {
  try {
    console.log('Fetching Groq models...');
    
    const response = await fetch('https://api.groq.com/openai/v1/models', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Groq API error response:', errorText);
      throw new Error(`Falha ao buscar modelos da Groq: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('Groq models response:', data);
    
    const models = data.data
      .filter((model: any) => model.id.includes('llama') || model.id.includes('mixtral') || model.id.includes('gemma'))
      .map((model: any) => model.id);
    
    console.log('Filtered Groq models:', models);
    return models;
  } catch (error) {
    console.error("Erro ao conectar com a API da Groq:", error);
    throw new Error(`Erro ao conectar com a API da Groq: ${error.message}`);
  }
};

export const fetchOpenAIModels = async (apiKey: string): Promise<string[]> => {
  try {
    console.log('Fetching OpenAI models...');
    
    const response = await fetch('https://api.openai.com/v1/models', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error response:', errorText);
      throw new Error(`Falha ao buscar modelos da OpenAI: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('OpenAI models response:', data);
    
    const models = data.data
      .filter((model: any) => model.id.includes('gpt'))
      .map((model: any) => model.id);
    
    console.log('Filtered OpenAI models:', models);
    return models;
  } catch (error) {
    console.error("Erro ao conectar com a API da OpenAI:", error);
    throw new Error(`Erro ao conectar com a API da OpenAI: ${error.message}`);
  }
};

export const fetchAnthropicModels = async (apiKey: string): Promise<string[]> => {
  try {
    console.log('Fetching Anthropic models...');
    
    // Anthropic não tem endpoint público para listar modelos
    // Retornamos uma lista de modelos conhecidos
    const knownModels = [
      'claude-3-5-sonnet-20241022',
      'claude-3-opus-20240229',
      'claude-3-sonnet-20240229',
      'claude-3-haiku-20240307'
    ];
    
    // Validamos a API key fazendo uma requisição simples
    const testResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 10,
        messages: [{ role: 'user', content: 'test' }],
      }),
    });
    
    if (!testResponse.ok && testResponse.status !== 400) {
      // 400 é esperado para teste de validação, outros erros são problemas
      const errorText = await testResponse.text();
      console.error('Anthropic API error response:', errorText);
      throw new Error(`Falha ao validar API key da Anthropic: ${testResponse.status}`);
    }
    
    console.log('Anthropic API key validated, returning known models');
    return knownModels;
  } catch (error) {
    console.error("Erro ao conectar com a API da Anthropic:", error);
    throw new Error(`Erro ao conectar com a API da Anthropic: ${error.message}`);
  }
};

export const fetchGeminiModels = async (apiKey: string): Promise<string[]> => {
  try {
    console.log('Fetching Gemini models...');
    
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
    );
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error response:', errorText);
      throw new Error(`Falha ao validar API key do Google AI: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('Gemini models response:', data);
    
    const models = data.models
      .filter((model: any) => model.name.includes('gemini'))
      .map((model: any) => model.name.split('/').pop());
    
    console.log('Filtered Gemini models:', models);
    return models;
  } catch (error) {
    console.error("Erro ao conectar com a API do Google AI:", error);
    throw new Error(`Erro ao conectar com a API do Google AI: ${error.message}`);
  }
};

export const fetchOpenRouterModels = async (apiKey: string): Promise<string[]> => {
  try {
    console.log('Fetching OpenRouter models...');
    
    const response = await fetch('https://openrouter.ai/api/v1/models', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenRouter API error response:', errorText);
      throw new Error(`Falha ao buscar modelos do OpenRouter: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('OpenRouter models response:', data);
    
    const models = data.data.map((model: any) => model.id);
    console.log('OpenRouter models:', models);
    return models;
  } catch (error) {
    console.error("Erro ao conectar com a API do OpenRouter:", error);
    throw new Error(`Erro ao conectar com a API do OpenRouter: ${error.message}`);
  }
};

export const fetchOllamaModels = async (): Promise<string[]> => {
  try {
    console.log('Fetching Ollama models...');
    
    const response = await fetch('http://localhost:11434/api/tags');
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Ollama API error response:', errorText);
      throw new Error(`Falha ao buscar modelos do Ollama: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('Ollama models response:', data);
    
    const models = data.models.map((model: any) => model.name);
    console.log('Ollama models:', models);
    return models;
  } catch (error) {
    console.error("Erro ao conectar com o Ollama:", error);
    throw new Error('Erro ao conectar com o Ollama. Certifique-se que o servidor local está rodando.');
  }
};
