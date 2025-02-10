
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronLeft, X } from "lucide-react";
import { toast } from "sonner";
import { Step, IntentConfig } from "@/types/agent";
import { StepHeader } from "@/components/agent/StepHeader";
import { TypeStep } from "@/components/agent/TypeStep";
import { LLMStep } from "@/components/agent/LLMStep";
import { ConfigStep } from "@/components/agent/ConfigStep";

const CreateAgent = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<Step>("type");
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
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

        <StepHeader currentStep={currentStep} />

        <div className="max-w-2xl mx-auto">
          {currentStep === "type" && (
            <TypeStep
              selectedType={selectedType}
              onTypeSelect={setSelectedType}
              onNext={() => setCurrentStep("llm")}
            />
          )}

          {currentStep === "llm" && (
            <LLMStep
              selectedProvider={selectedProvider}
              selectedModel={selectedModel}
              onProviderSelect={setSelectedProvider}
              onModelSelect={setSelectedModel}
              onBack={() => setCurrentStep("type")}
              onNext={() => setCurrentStep("config")}
            />
          )}

          {currentStep === "config" && (
            <ConfigStep
              agentName={agentName}
              agentDescription={agentDescription}
              whatsappNumber={whatsappNumber}
              intents={intents}
              onAgentNameChange={setAgentName}
              onAgentDescriptionChange={setAgentDescription}
              onWhatsappNumberChange={setWhatsappNumber}
              onIntentsChange={setIntents}
              onBack={() => setCurrentStep("llm")}
              onSubmit={handleCreateAgent}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateAgent;
