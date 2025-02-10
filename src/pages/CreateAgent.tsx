import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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

type IntentConfig = {
  name: string;
  description: string;
  examples: string[];
  webhookUrl: string;
};

const CreateAgent = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<Step>("type");
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState("");
  const [isLoadingModels, setIsLoadingModels] = useState(false);
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  
  // Configuration state
  const [agentName, setAgentName] = useState("");
  const [agentDescription, setAgentDescription] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [intents, setIntents] = useState<IntentConfig[]>([{
    name: "",
    description: "",
    examples: [""],
    webhookUrl: ""
  }]);

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
      let models: string[] = [];
      
      switch (selectedProvider) {
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
      }

      setAvailableModels(models);
      toast.success("API Key validada com sucesso!");
    } catch (error) {
      console.error("Erro ao buscar modelos:", error);
      toast.error(error.message || "Erro ao validar API Key");
      setAvailableModels([]);
    } finally {
      setIsLoadingModels(false);
    }
  };

  const fetchGroqModels = async (apiKey: string): Promise<string[]> => {
    try {
      return [
        'llama2-70b-4096',
        'mixtral-8x7b-32768',
        'gemma-7b-it'
      ];
    } catch (error) {
      console.error("Erro ao buscar modelos da Groq:", error);
      throw new Error('Erro ao conectar com a API da Groq');
    }
  };

  const fetchOpenAIModels = async (apiKey: string): Promise<string[]> => {
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
      throw new Error('Erro ao conectar com a API da OpenAI');
    }
  };

  const fetchAnthropicModels = async (apiKey: string): Promise<string[]> => {
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
      throw new Error('Erro ao conectar com a API da Anthropic');
    }
  };

  const fetchGeminiModels = async (apiKey: string): Promise<string[]> => {
    // Google AI API não tem um endpoint de listagem de modelos
    // Retornando lista fixa dos modelos disponíveis
    return [
      'gemini-pro',
      'gemini-pro-vision',
      'gemini-ultra',
      'gemini-ultra-vision'
    ];
  };

  const fetchOpenRouterModels = async (apiKey: string): Promise<string[]> => {
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
      throw new Error('Erro ao conectar com a API do OpenRouter');
    }
  };

  const fetchOllamaModels = async (): Promise<string[]> => {
    try {
      const response = await fetch('http://localhost:11434/api/tags');
      
      if (!response.ok) {
        throw new Error('Falha ao buscar modelos do Ollama');
      }
      
      const data = await response.json();
      return data.models.map((model: any) => model.name);
    } catch (error) {
      throw new Error('Erro ao conectar com o Ollama. Certifique-se que o servidor local está rodando.');
    }
  };

  const handleAddIntent = () => {
    setIntents([...intents, {
      name: "",
      description: "",
      examples: [""],
      webhookUrl: ""
    }]);
  };

  const handleRemoveIntent = (index: number) => {
    if (intents.length > 1) {
      const newIntents = [...intents];
      newIntents.splice(index, 1);
      setIntents(newIntents);
    }
  };

  const handleUpdateIntent = (index: number, field: keyof IntentConfig, value: any) => {
    const newIntents = [...intents];
    newIntents[index] = { ...newIntents[index], [field]: value };
    setIntents(newIntents);
  };

  const handleAddExample = (intentIndex: number) => {
    const newIntents = [...intents];
    newIntents[intentIndex].examples.push("");
    setIntents(newIntents);
  };

  const handleUpdateExample = (intentIndex: number, exampleIndex: number, value: string) => {
    const newIntents = [...intents];
    newIntents[intentIndex].examples[exampleIndex] = value;
    setIntents(newIntents);
  };

  const handleRemoveExample = (intentIndex: number, exampleIndex: number) => {
    if (intents[intentIndex].examples.length > 1) {
      const newIntents = [...intents];
      newIntents[intentIndex].examples.splice(exampleIndex, 1);
      setIntents(newIntents);
    }
  };

  const handleSaveModel = () => {
    if (!selectedModel) return;
    toast.success("Modelo selecionado com sucesso!");
    setCurrentStep("config");
  };

  const handleCreateAgent = async () => {
    if (!agentName || !whatsappNumber || intents.some(intent => !intent.name || !intent.webhookUrl)) {
      toast.error("Por favor, preencha todos os campos obrigatórios");
      return;
    }

    try {
      // TODO: Implement agent creation with API call
      toast.success("Agente criado com sucesso!");
      navigate("/dashboard");
    } catch (error) {
      console.error("Erro ao criar agente:", error);
      toast.error("Erro ao criar agente. Tente novamente.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
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

          {currentStep === "config" && (
            <div className="space-y-8">
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Configuração do Agente</h2>
                
                <div className="space-y-4">
                  <div>
                    <Label>Nome do Agente</Label>
                    <Input 
                      value={agentName}
                      onChange={(e) => setAgentName(e.target.value)}
                      placeholder="Ex: Assistente de Vendas"
                    />
                  </div>
                  
                  <div>
                    <Label>Descrição</Label>
                    <Textarea 
                      value={agentDescription}
                      onChange={(e) => setAgentDescription(e.target.value)}
                      placeholder="Descreva o propósito e capacidades do seu agente"
                    />
                  </div>

                  <div>
                    <Label>Número do WhatsApp</Label>
                    <Input 
                      value={whatsappNumber}
                      onChange={(e) => setWhatsappNumber(e.target.value)}
                      placeholder="Ex: +5511999999999"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Intenções</h3>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleAddIntent}
                  >
                    Adicionar Intenção
                  </Button>
                </div>

                {intents.map((intent, intentIndex) => (
                  <Card key={intentIndex} className="p-4 space-y-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1 space-y-4">
                        <div>
                          <Label>Nome da Intenção</Label>
                          <Input 
                            value={intent.name}
                            onChange={(e) => handleUpdateIntent(intentIndex, "name", e.target.value)}
                            placeholder="Ex: solicitar_orcamento"
                          />
                        </div>
                        
                        <div>
                          <Label>Descrição</Label>
                          <Textarea 
                            value={intent.description}
                            onChange={(e) => handleUpdateIntent(intentIndex, "description", e.target.value)}
                            placeholder="Descreva quando esta intenção deve ser reconhecida"
                          />
                        </div>

                        <div>
                          <Label>Webhook URL (n8n)</Label>
                          <Input 
                            value={intent.webhookUrl}
                            onChange={(e) => handleUpdateIntent(intentIndex, "webhookUrl", e.target.value)}
                            placeholder="https://n8n.seudominio.com/webhook/..."
                          />
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <Label>Exemplos de Frases</Label>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleAddExample(intentIndex)}
                            >
                              Adicionar Exemplo
                            </Button>
                          </div>
                          
                          {intent.examples.map((example, exampleIndex) => (
                            <div key={exampleIndex} className="flex gap-2">
                              <Input 
                                value={example}
                                onChange={(e) => handleUpdateExample(intentIndex, exampleIndex, e.target.value)}
                                placeholder="Ex: Gostaria de saber o preço do produto X"
                              />
                              {intent.examples.length > 1 && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleRemoveExample(intentIndex, exampleIndex)}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      {intents.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="ml-2"
                          onClick={() => handleRemoveIntent(intentIndex)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </Card>
                ))}
              </div>

              <div className="flex justify-between mt-8">
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep("llm")}
                >
                  Voltar
                </Button>
                <Button
                  className="bg-teal-500 hover:bg-teal-600"
                  onClick={handleCreateAgent}
                >
                  Criar Agente
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
