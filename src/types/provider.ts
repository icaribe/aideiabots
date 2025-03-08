
export type ProviderType = "llm" | "voice";

export type LLMProviderCredential = {
  id: string;
  name: string;
  provider_type: "llm";
  provider_id: string;
  api_key: string;
  created_at: string;
};

export type VoiceProviderCredential = {
  id: string;
  name: string;
  provider_type: "voice";
  provider_id: string;
  api_key: string;
  created_at: string;
};

export type ProviderCredential = LLMProviderCredential | VoiceProviderCredential;

export type LLMModel = {
  id: string;
  name: string;
};

export type VoiceModel = {
  id: string;
  name: string;
};

export type VoiceProvider = {
  id: string;
  name: string;
  description: string;
};

// ElevenLabs specific types
export type ElevenLabsVoice = {
  voice_id: string;
  name: string;
};

// OpenAI specific types for voice
export type OpenAIVoice = {
  id: string;
  name: string;
};
