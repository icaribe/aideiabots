
import { supabase } from "@/integrations/supabase/client";
import { LLMModel, ProviderCredential, ProviderType, VoiceModel } from "@/types/provider";
import { fetchGroqModels, fetchOpenAIModels, fetchAnthropicModels, fetchGeminiModels, fetchOpenRouterModels, fetchOllamaModels } from "./llmProviders";
import { fetchElevenLabsVoices, fetchOpenAIVoices } from "./voiceProviders";

// Get all provider credentials for the current user
export const getProviderCredentials = async (): Promise<ProviderCredential[]> => {
  const { data, error } = await supabase
    .from('provider_credentials')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Error fetching provider credentials:", error);
    throw new Error("Falha ao buscar as credenciais");
  }

  // Cast data to the correct type
  return (data || []).map(cred => ({
    ...cred,
    provider_type: cred.provider_type as ProviderType,
  })) as ProviderCredential[];
};

// Create a new provider credential
export const createProviderCredential = async (credential: Omit<ProviderCredential, 'id' | 'created_at'>): Promise<ProviderCredential> => {
  // Get user_id from current session
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    throw new Error("User not authenticated");
  }

  const { data, error } = await supabase
    .from('provider_credentials')
    .insert({
      ...credential,
      user_id: session.user.id
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating provider credential:", error);
    throw new Error("Falha ao criar a credencial");
  }

  // Cast data to the correct type
  return {
    ...data,
    provider_type: data.provider_type as ProviderType,
  } as ProviderCredential;
};

// Update a provider credential
export const updateProviderCredential = async (id: string, credential: Partial<ProviderCredential>): Promise<ProviderCredential> => {
  const { data, error } = await supabase
    .from('provider_credentials')
    .update(credential)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error("Error updating provider credential:", error);
    throw new Error("Falha ao atualizar a credencial");
  }

  // Cast data to the correct type
  return {
    ...data,
    provider_type: data.provider_type as ProviderType,
  } as ProviderCredential;
};

// Delete a provider credential
export const deleteProviderCredential = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('provider_credentials')
    .delete()
    .eq('id', id);

  if (error) {
    console.error("Error deleting provider credential:", error);
    throw new Error("Falha ao excluir a credencial");
  }
};

// Validate an LLM provider API key and fetch models with retry logic
export const validateLLMProviderApiKey = async (
  providerId: string, 
  apiKey: string,
  maxRetries: number = 2
): Promise<LLMModel[]> => {
  let lastError;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Validating ${providerId} API key (attempt ${attempt + 1}/${maxRetries + 1})`);
      
      let models: string[] = [];
      
      switch (providerId) {
        case 'groq':
          models = await fetchGroqModels(apiKey);
          break;
        case 'openai':
          models = await fetchOpenAIModels(apiKey);
          break;
        case 'anthropic':
          models = await fetchAnthropicModels(apiKey);
          break;
        case 'gemini':
          models = await fetchGeminiModels(apiKey);
          break;
        case 'openrouter':
          models = await fetchOpenRouterModels(apiKey);
          break;
        case 'ollama':
          models = await fetchOllamaModels();
          break;
        default:
          throw new Error("Provedor não suportado");
      }

      console.log(`Successfully fetched ${models.length} models for ${providerId}`);
      return models.map(modelId => ({
        id: modelId,
        name: modelId
      }));
    } catch (error) {
      console.error(`Error validating ${providerId} API key (attempt ${attempt + 1}):`, error);
      lastError = error;
      
      // Wait before retrying (exponential backoff)
      if (attempt < maxRetries) {
        const delay = Math.pow(2, attempt) * 1000; // 1s, 2s, 4s...
        console.log(`Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw new Error(`Falha ao validar API Key do ${providerId} após ${maxRetries + 1} tentativas: ${lastError?.message}`);
};

// Validate a voice provider API key and fetch voices with improved error handling
export const validateVoiceProviderApiKey = async (
  providerId: string, 
  apiKey: string
): Promise<VoiceModel[]> => {
  try {
    console.log(`Starting validation for ${providerId} voice provider`);
    
    let voices: any[] = [];
    
    switch (providerId) {
      case 'elevenlabs':
        voices = await fetchElevenLabsVoices(apiKey);
        break;
      case 'openai':
        voices = await fetchOpenAIVoices(apiKey);
        break;
      default:
        throw new Error("Provedor de voz não suportado");
    }

    console.log(`Successfully validated ${providerId} and fetched ${voices.length} voices`);
    return voices;
  } catch (error) {
    console.error(`Error validating ${providerId} voice API key:`, error);
    
    // Pass through the specific error message from the provider validation
    if (error.message.includes('API Key') || 
        error.message.includes('inválida') || 
        error.message.includes('Limite de uso') ||
        error.message.includes('Erro na API')) {
      throw error;
    }
    
    throw new Error(`Falha ao validar API Key do ${providerId}: ${error.message}`);
  }
};
