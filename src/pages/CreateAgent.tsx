
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronLeft, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
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
    if (!agentName || !selectedProvider || !selectedModel) {
      toast.error("Por favor, preencha todos os campos obrigatórios");
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error("Você precisa estar logado para criar um agente");
        navigate("/");
        return;
      }

      // Create the bot
      const { data: bot, error: botError } = await supabase
        .from('bots')
        .insert({
          name: agentName,
          description: agentDescription,
          user_id: session.user.id,
          llm_provider: selectedProvider,
          model: selectedModel,
          webhook_url: intents[0]?.webhookUrl || null
        })
        .select()
        .single();

      if (botError) {
        console.error("Erro ao criar agente:", botError);
        toast.error("Erro ao criar agente. Por favor, tente novamente.");
        return;
      }

      // Create intents for the bot
      if (intents.length > 0 && bot) {
        const intentsToInsert = intents.map(intent => ({
          bot_id: bot.id,
          name: intent.name,
          description: intent.description,
          webhook_url: intent.webhookUrl
        }));

        const { error: intentsError } = await supabase
          .from('intents')
          .insert(intentsToInsert);

        if (intentsError) {
          console.error("Erro ao criar intents:", intentsError);
          // Continue anyway since the bot was created
        }
      }

      toast.success("Agente criado com sucesso!");
      navigate("/agents");
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
            onClick={() => navigate("/agents")}
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
