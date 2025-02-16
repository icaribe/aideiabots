
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
