
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Bot, 
  Calendar, 
  ChevronLeft,
  Globe,
  HeartHandshake,
  Loader2,
  ShoppingCart,
  User,
  X 
} from "lucide-react";
import { toast } from "sonner";

type AgentType = {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
};

type LLMProvider = {
  id: string;
  name: string;
  description: string;
};

const llmProviders: LLMProvider[] = [
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

const agentTypes: AgentType[] = [
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

type Step = "type" | "llm" | "config";

const CreateAgent = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<Step>("type");
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState("");
  const [isLoadingModels, setIsLoadingModels] = useState(false);
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [selectedModel, setSelectedModel] = useState<string | null>(null);

  const steps = [
    { id: "type", label: "Tipo" },
    { id: "llm", label: "LLM" },
    { id: "config", label: "Configuração" }
  ];

  const handleProviderSelect = (providerId: string) => {
    setSelectedProvider(providerId);
    setAvailableModels([]);
    setSelectedModel(null);
  };

  const handleSaveApiKey = async () => {
    if (!apiKey.trim() || !selectedProvider) return;

    setIsLoadingModels(true);
    try {
      // Simulação de chamada à API para obter modelos
      // Em um caso real, isso seria uma chamada à API do provedor selecionado
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockModels: Record<string, string[]> = {
        openai: ["gpt-3.5-turbo", "gpt-4", "gpt-4-turbo"],
        gemini: ["gemini-pro", "gemini-ultra"],
        anthropic: ["claude-2", "claude-3-opus", "claude-3-sonnet"],
        groq: ["llama2-70b", "mixtral-8x7b"],
        openrouter: ["openai/gpt-4", "anthropic/claude-3", "google/gemini-pro"],
        ollama: ["llama2", "mistral", "mixtral"]
      };

      setAvailableModels(mockModels[selectedProvider] || []);
      toast.success("API Key salva com sucesso!");
    } catch (error) {
      toast.error("Erro ao validar API Key");
    } finally {
      setIsLoadingModels(false);
    }
  };

  const handleSaveModel = () => {
    if (!selectedModel) return;
    toast.success("Modelo selecionado com sucesso!");
    setCurrentStep("config");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <Button 
            variant="ghost" 
            className="gap-2"
            onClick={() => navigate(-1)}
          >
            <ChevronLeft className="h-4 w-4" />
            Voltar
          </Button>
          <Button 
            variant="ghost" 
            onClick={() => navigate("/dashboard")}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Progress Steps */}
        <div className="mb-12">
          <h1 className="text-2xl font-bold text-center mb-6">Criar Novo Agente</h1>
          <div className="flex justify-center gap-4">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`
                  flex items-center justify-center w-8 h-8 rounded-full
                  ${currentStep === step.id ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-400'}
                `}>
                  {index + 1}
                </div>
                <span className={`
                  ml-2 
                  ${currentStep === step.id ? 'text-purple-600' : 'text-gray-400'}
                `}>
                  {step.label}
                </span>
                {index < steps.length - 1 && (
                  <div className="w-16 h-[1px] bg-gray-200 mx-2" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="max-w-2xl mx-auto">
          {currentStep === "type" && (
            <div>
              <h2 className="text-xl font-semibold mb-2">Escolha o tipo do seu agente</h2>
              <div className="space-y-4">
                {agentTypes.map((type) => (
                  <Card
                    key={type.id}
                    className={`
                      p-4 cursor-pointer transition-all hover:border-purple-200
                      ${selectedType === type.id ? 'border-purple-500 bg-purple-50' : ''}
                    `}
                    onClick={() => setSelectedType(type.id)}
                  >
                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-white rounded-lg">
                        <type.icon className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{type.title}</h3>
                        <p className="text-gray-500 text-sm">{type.description}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
              <div className="mt-8 flex justify-end">
                <Button
                  className="bg-teal-500 hover:bg-teal-600"
                  disabled={!selectedType}
                  onClick={() => setCurrentStep("llm")}
                >
                  Continuar
                </Button>
              </div>
            </div>
          )}

          {currentStep === "llm" && (
            <div>
              <h2 className="text-xl font-semibold mb-6">Selecione o Provedor LLM</h2>
              
              {/* Provider Selection */}
              <div className="space-y-4 mb-8">
                {llmProviders.map((provider) => (
                  <Card
                    key={provider.id}
                    className={`
                      p-4 cursor-pointer transition-all hover:border-purple-200
                      ${selectedProvider === provider.id ? 'border-purple-500 bg-purple-50' : ''}
                    `}
                    onClick={() => handleProviderSelect(provider.id)}
                  >
                    <div>
                      <h3 className="font-semibold">{provider.name}</h3>
                      <p className="text-gray-500 text-sm">{provider.description}</p>
                    </div>
                  </Card>
                ))}
              </div>

              {/* API Key Input */}
              {selectedProvider && (
                <div className="space-y-4 mb-8">
                  <div className="space-y-2">
                    <Label>API Key do Provedor</Label>
                    <div className="flex gap-2">
                      <Input
                        type="password"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        placeholder="Digite sua API Key"
                      />
                      <Button 
                        onClick={handleSaveApiKey}
                        disabled={!apiKey.trim() || isLoadingModels}
                      >
                        {isLoadingModels ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          'Validar'
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Model Selection */}
                  {availableModels.length > 0 && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Modelo</Label>
                        <Select 
                          value={selectedModel || ""} 
                          onValueChange={setSelectedModel}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione um modelo" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableModels.map((model) => (
                              <SelectItem key={model} value={model}>
                                {model}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-8">
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep("type")}
                >
                  Voltar
                </Button>
                <Button
                  className="bg-teal-500 hover:bg-teal-600"
                  disabled={!selectedModel}
                  onClick={handleSaveModel}
                >
                  Continuar
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateAgent;

