
import { LucideIcon } from "lucide-react";

export type AgentType = {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
};

export type LLMProvider = {
  id: string;
  name: string;
  description: string;
};

export type IntentConfig = {
  name: string;
  description: string;
  examples: string[];
  webhookUrl: string;
};

export type Step = "type" | "llm" | "config" | "integrations";

export type Message = {
  bot_id: string;
  content: string;
  conversation_id: string;
  created_at: string;
  id: string;
  is_from_user: boolean;
  user_id: string;
  error?: boolean; // Adding error property as optional boolean
};

export type Conversation = {
  id: string;
  bot_id: string;
  user_id: string;
  created_at: string;
  title: string;
};
