
import { useCallback } from "react";
import { z } from "zod";

// Schemas de validação
const messageSchema = z.object({
  content: z.string().min(1, "Mensagem não pode estar vazia").max(4000, "Mensagem muito longa"),
  conversation_id: z.string().uuid("ID de conversa inválido"),
  bot_id: z.string().uuid("ID do bot inválido"),
  user_id: z.string().uuid("ID do usuário inválido")
});

const agentSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório").max(100, "Nome muito longo"),
  description: z.string().max(500, "Descrição muito longa").optional(),
  llm_provider: z.string().min(1, "Provedor LLM é obrigatório"),
  model: z.string().min(1, "Modelo é obrigatório"),
  llm_credential_id: z.string().uuid("Credencial inválida").optional()
});

const credentialSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório").max(100, "Nome muito longo"),
  provider_id: z.string().min(1, "Provedor é obrigatório"),
  api_key: z.string().min(1, "API Key é obrigatória"),
  provider_type: z.enum(["llm", "voice"], { errorMap: () => ({ message: "Tipo de provedor inválido" }) })
});

export const useDataValidation = () => {
  const validateMessage = useCallback((data: unknown) => {
    try {
      return messageSchema.parse(data);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(error.errors[0].message);
      }
      throw error;
    }
  }, []);

  const validateAgent = useCallback((data: unknown) => {
    try {
      return agentSchema.parse(data);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(error.errors[0].message);
      }
      throw error;
    }
  }, []);

  const validateCredential = useCallback((data: unknown) => {
    try {
      return credentialSchema.parse(data);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(error.errors[0].message);
      }
      throw error;
    }
  }, []);

  const validateApiKey = useCallback((apiKey: string, provider: string) => {
    if (!apiKey || apiKey.trim().length === 0) {
      throw new Error("API Key é obrigatória");
    }

    // Validações específicas por provedor
    switch (provider) {
      case 'openai':
        if (!apiKey.startsWith('sk-')) {
          throw new Error("API Key do OpenAI deve começar com 'sk-'");
        }
        break;
      case 'groq':
        if (!apiKey.startsWith('gsk_')) {
          throw new Error("API Key do Groq deve começar com 'gsk_'");
        }
        break;
      case 'anthropic':
        if (!apiKey.startsWith('sk-ant-')) {
          throw new Error("API Key do Anthropic deve começar com 'sk-ant-'");
        }
        break;
      case 'elevenlabs':
        if (apiKey.length < 20) {
          throw new Error("API Key do ElevenLabs parece ser muito curta");
        }
        break;
    }

    return true;
  }, []);

  return {
    validateMessage,
    validateAgent,
    validateCredential,
    validateApiKey
  };
};
