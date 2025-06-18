
import { useState, useEffect } from "react";
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
import { Loader2, PlusCircle, AlertCircle } from "lucide-react";
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
import { LLMModel, LLMProviderCredential } from "@/types/provider";
import { getProviderCredentials, validateLLMProviderApiKey } from "@/services/providerCredentials";
import { useNavigate } from "react-router-dom";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface LLMStepProps {
  selectedProvider: string | null;
  selectedModel: string | null;
  selectedCredentialId: string | null;
  onProviderSelect: (provider: string) => void;
  onModelSelect: (model: string) => void;
  onCredentialSelect: (credentialId: string) => void;
  onBack: () => void;
  onNext: () => void;
}

export const LLMStep = ({
  selectedProvider,
  selectedModel,
  selectedCredentialId,
  onProviderSelect,
  onModelSelect,
  onCredentialSelect,
  onBack,
  onNext
}: LLMStepProps) => {
  const navigate = useNavigate();
  const [apiKey, setApiKey] = useState("");
  const [isLoadingModels, setIsLoadingModels] = useState(false);
  const [isLoadingCredentials, setIsLoadingCredentials] = useState(false);
  const [availableModels, setAvailableModels] = useState<LLMModel[]>([]);
  const [credentials, setCredentials] = useState<LLMProviderCredential[]>([]);
  const [useCredential, setUseCredential] = useState(true);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    loadCredentials();
  }, []);

  useEffect(() => {
    if (selectedCredentialId) {
      loadModelsFromCredential(selectedCredentialId);
    }
  }, [selectedCredentialId]);

  const loadCredentials = async () => {
    setIsLoadingCredentials(true);
    try {
      const allCredentials = await getProviderCredentials();
      const llmCredentials = allCredentials.filter(
        cred => cred.provider_type === 'llm'
      ) as LLMProviderCredential[];
      
      setCredentials(llmCredentials);
      
      // If we have credentials and none selected, select first provider type
      if (llmCredentials.length > 0 && !selectedProvider && !selectedCredentialId) {
        const firstCred = llmCredentials[0];
        onProviderSelect(firstCred.provider_id);
        onCredentialSelect(firstCred.id);
      }
      
      // If we have no credentials, default to manual entry
      if (llmCredentials.length === 0) {
        setUseCredential(false);
      }
    } catch (error) {
      console.error("Error loading credentials:", error);
      toast.error("Erro ao carregar credenciais");
    } finally {
      setIsLoadingCredentials(false);
    }
  };

  const loadModelsFromCredential = async (credentialId: string) => {
    const credential = credentials.find(c => c.id === credentialId);
    if (!credential) return;
    
    setIsLoadingModels(true);
    setValidationError(null);
    try {
      const models = await validateLLMProviderApiKey(credential.provider_id, credential.api_key);
      setAvailableModels(models);
      onProviderSelect(credential.provider_id);
      toast.success("Modelos carregados com sucesso!");
    } catch (error) {
      console.error("Error loading models from credential:", error);
      setValidationError(error.message);
      toast.error("Erro ao carregar modelos: " + error.message);
    } finally {
      setIsLoadingModels(false);
    }
  };

  const handleProviderSelect = (providerId: string) => {
    onProviderSelect(providerId);
    setAvailableModels([]);
    setValidationError(null);
    onModelSelect("");
  };

  const handleCredentialSelect = (credentialId: string) => {
    onCredentialSelect(credentialId);
    setValidationError(null);
    onModelSelect(""); // Reset model when changing credential
  };

  const handleSaveApiKey = async () => {
    if (!apiKey.trim() || !selectedProvider) return;

    setIsLoadingModels(true);
    setValidationError(null);
    try {
      let models: LLMModel[] = [];
      
      switch (selectedProvider) {
        case 'groq':
          models = (await fetchGroqModels(apiKey)).map(id => ({ id, name: id }));
          break;
        case 'openai':
          models = (await fetchOpenAIModels(apiKey)).map(id => ({ id, name: id }));
          break;
        case 'anthropic':
          models = (await fetchAnthropicModels(apiKey)).map(id => ({ id, name: id }));
          break;
        case 'gemini':
          models = (await fetchGeminiModels(apiKey)).map(id => ({ id, name: id }));
          break;
        case 'openrouter':
          models = (await fetchOpenRouterModels(apiKey)).map(id => ({ id, name: id }));
          break;
        case 'ollama':
          models = (await fetchOllamaModels()).map(id => ({ id, name: id }));
          break;
      }

      setAvailableModels(models);
      toast.success("API Key validada com sucesso!");
    } catch (error) {
      console.error("Erro ao buscar modelos:", error);
      setValidationError(error.message);
      toast.error("Erro ao validar API Key: " + error.message);
      setAvailableModels([]);
    } finally {
      setIsLoadingModels(false);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-6">Selecione o Provedor LLM</h2>
      
      {credentials.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <Label>Usar credencial salva</Label>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/settings')}
              className="text-sm"
            >
              <PlusCircle className="h-4 w-4 mr-1" />
              Gerenciar Credenciais
            </Button>
          </div>
          
          <Select 
            value={useCredential ? "credential" : "manual"}
            onValueChange={(value) => setUseCredential(value === "credential")}
          >
            <SelectTrigger>
              <SelectValue placeholder="Escolha como configurar o LLM" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="credential">Usar credencial salva</SelectItem>
              <SelectItem value="manual">Configurar manualmente</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {validationError && (
        <Alert className="mb-4 border-orange-200 bg-orange-50">
          <AlertCircle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            {validationError}
          </AlertDescription>
        </Alert>
      )}

      {useCredential && credentials.length > 0 ? (
        <div className="space-y-4 mb-8">
          <div className="space-y-2">
            <Label>Credencial</Label>
            <Select 
              value={selectedCredentialId || ""} 
              onValueChange={handleCredentialSelect}
              disabled={isLoadingCredentials}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma credencial" />
              </SelectTrigger>
              <SelectContent>
                {credentials.map((cred) => (
                  <SelectItem key={cred.id} value={cred.id}>
                    {cred.name} ({cred.provider_id})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {isLoadingModels && (
            <div className="flex items-center justify-center p-4">
              <Loader2 className="h-6 w-6 animate-spin text-purple-600" />
              <span className="ml-2">Carregando modelos...</span>
            </div>
          )}

          {availableModels.length > 0 && (
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
                    <SelectItem key={model.id} value={model.id}>
                      {model.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      ) : (
        <>
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
                          <SelectItem key={model.id} value={model.id}>
                            {model.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </div>
          )}
        </>
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
