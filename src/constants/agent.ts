
import { 
  Bot, 
  Calendar, 
  Globe,
  HeartHandshake,
  ShoppingCart,
  User 
} from "lucide-react";
import { AgentType, LLMProvider } from "@/types/agent";

export const llmProviders: LLMProvider[] = [
  {
    id: "openai",
    name: "OpenAI",
    description: "GPT-3.5, GPT-4 e outros modelos da OpenAI"
  },
  {
    id: "gemini",
    name: "Google Gemini",
    description: "Modelos Gemini Pro e Ultra da Google"
  },
  {
    id: "anthropic",
    name: "Anthropic Claude",
    description: "Claude 2 e 3 da Anthropic"
  },
  {
    id: "groq",
    name: "Groq",
    description: "LLama2 e Mixtral otimizados para velocidade"
  },
  {
    id: "openrouter",
    name: "OpenRouter",
    description: "Acesso a múltiplos modelos de diferentes provedores"
  },
  {
    id: "ollama",
    name: "Ollama",
    description: "Rode modelos localmente em seu servidor"
  }
];

export const agentTypes: AgentType[] = [
  {
    id: "personal",
    title: "Assistente Pessoal",
    description: "Um assistente virtual para tarefas gerais e produtividade",
    icon: User
  },
  {
    id: "support",
    title: "Suporte",
    description: "Atendimento ao cliente e resolução de problemas",
    icon: HeartHandshake
  },
  {
    id: "sales",
    title: "Vendas",
    description: "Qualificação de leads e suporte a vendas",
    icon: ShoppingCart
  },
  {
    id: "scheduler",
    title: "Agendador",
    description: "Gerenciamento de compromissos e calendário",
    icon: Calendar
  },
  {
    id: "custom",
    title: "Personalizado",
    description: "Crie um bot com funcionalidades específicas",
    icon: Globe
  }
];

export const steps = [
  { id: "type", label: "Tipo" },
  { id: "llm", label: "LLM" },
  { id: "config", label: "Configuração" }
];
