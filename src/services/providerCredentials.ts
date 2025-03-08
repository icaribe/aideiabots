
import { supabase } from "@/integrations/supabase/client";
import { LLMModel, ProviderCredential, VoiceModel } from "@/types/provider";
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

  return data || [];
};

// Create a new provider credential
export const createProviderCredential = async (credential: Omit<ProviderCredential, 'id' | 'created_at'>): Promise<ProviderCredential> => {
  const { data, error } = await supabase
    .from('provider_credentials')
    .insert(credential)
    .select()
    .single();

  if (error) {
    console.error("Error creating provider credential:", error);
    throw new Error("Falha ao criar a credencial");
  }

  return data;
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

  return data;
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

// Validate an LLM provider API key and fetch models
export const validateLLMProviderApiKey = async (
  providerId: string, 
  apiKey: string
): Promise<LLMModel[]> => {
  try {
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

    return models.map(modelId => ({
      id: modelId,
      name: modelId
    }));
  } catch (error) {
    console.error(`Error validating ${providerId} API key:`, error);
    throw new Error(`Falha ao validar API Key do ${providerId}: ${error.message}`);
  }
};

// Validate a voice provider API key and fetch voices
export const validateVoiceProviderApiKey = async (
  providerId: string, 
  apiKey: string
): Promise<VoiceModel[]> => {
  try {
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

    return voices;
  } catch (error) {
    console.error(`Error validating ${providerId} voice API key:`, error);
    throw new Error(`Falha ao validar API Key do ${providerId}: ${error.message}`);
  }
};
