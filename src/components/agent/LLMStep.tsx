
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { llmProviders } from "@/constants/agent";
import {
  fetchGroqModels,
  fetchOpenAIModels,
  fetchAnthropicModels,
  fetchGeminiModels,
  fetchOpenRouterModels,
  fetchOllamaModels
} from "@/services/llmProviders";

interface LLMStepProps {
  selectedProvider: string | null;
  selectedModel: string | null;
  onProviderSelect: (provider: string) => void;
  onModelSelect: (model: string) => void;
  onBack: () => void;
  onNext: () => void;
}

export const LLMStep = ({
  selectedProvider,
  selectedModel,
  onProviderSelect,
  onModelSelect,
  onBack,
  onNext
}: LLMStepProps) => {
  const [apiKey, setApiKey] = useState("");
  const [isLoadingModels, setIsLoadingModels] = useState(false);
  const [availableModels, setAvailableModels] = useState<string[]>([]);

  const handleProviderSelect = (providerId: string) => {
    onProviderSelect(providerId);
    setAvailableModels([]);
    onModelSelect("");
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

  return (
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
                  onValueChange={onModelSelect}
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
          onClick={onBack}
        >
          Voltar
        </Button>
        <Button
          className="bg-teal-500 hover:bg-teal-600"
          disabled={!selectedModel}
          onClick={onNext}
        >
          Continuar
        </Button>
      </div>
    </div>
  );
};
