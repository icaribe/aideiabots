
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronLeft, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Step, IntentConfig } from "@/types/agent";
import { StepHeader } from "@/components/agent/StepHeader";
import { TypeStep } from "@/components/agent/TypeStep";
import { LLMStep } from "@/components/agent/LLMStep";
import { ConfigStep } from "@/components/agent/ConfigStep";

const EditAgent = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [currentStep, setCurrentStep] = useState<Step>("type");
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [agentName, setAgentName] = useState("");
  const [agentDescription, setAgentDescription] = useState("");
  const [intents, setIntents] = useState<IntentConfig[]>([{
    name: "",
    description: "",
    examples: [""],
    webhookUrl: ""
  }]);

  useEffect(() => {
    const fetchAgent = async () => {
      try {
        const { data: agent, error } = await supabase
          .from('bots')
          .select(`
            *,
            intents (*)
          `)
          .eq('id', id)
          .single();

        if (error) throw error;

        if (agent) {
          setSelectedType(agent.provider || 'custom');
          setSelectedProvider(agent.llm_provider);
          setSelectedModel(agent.model);
          setAgentName(agent.name);
          setAgentDescription(agent.description || '');
          
          if (agent.intents && agent.intents.length > 0) {
            setIntents(agent.intents.map((intent: any) => ({
              name: intent.name,
              description: intent.description || '',
              examples: [''],
              webhookUrl: intent.webhook_url
            })));
          }
        }
      } catch (error) {
        console.error('Erro ao carregar agente:', error);
        toast.error("Erro ao carregar dados do agente");
      }
    };

    if (id) {
      fetchAgent();
    }
  }, [id]);

  const handleUpdateAgent = async () => {
    if (!agentName || !selectedProvider || !selectedModel) {
      toast.error("Por favor, preencha todos os campos obrigatórios");
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error("Você precisa estar logado para atualizar um agente");
        navigate("/");
        return;
      }

      // Update the bot
      const { error: botError } = await supabase
        .from('bots')
        .update({
          name: agentName,
          description: agentDescription,
          llm_provider: selectedProvider,
          model: selectedModel,
          provider: selectedType,
          webhook_url: intents[0]?.webhookUrl || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (botError) {
        console.error("Erro ao atualizar agente:", botError);
        toast.error("Erro ao atualizar agente. Por favor, tente novamente.");
        return;
      }

      // Update intents
      if (intents.length > 0) {
        // First, delete existing intents
        const { error: deleteIntentsError } = await supabase
          .from('intents')
          .delete()
          .eq('bot_id', id);

        if (deleteIntentsError) {
          console.error("Erro ao atualizar intents:", deleteIntentsError);
        }

        // Then, insert new intents
        const intentsToInsert = intents.map(intent => ({
          bot_id: id,
          name: intent.name,
          description: intent.description,
          webhook_url: intent.webhookUrl
        }));

        const { error: intentsError } = await supabase
          .from('intents')
          .insert(intentsToInsert);

        if (intentsError) {
          console.error("Erro ao criar intents:", intentsError);
        }
      }

      toast.success("Agente atualizado com sucesso!");
      navigate("/agents");
    } catch (error) {
      console.error("Erro ao atualizar agente:", error);
      toast.error("Erro ao atualizar agente. Tente novamente.");
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
              whatsappNumber=""
              intents={intents}
              onAgentNameChange={setAgentName}
              onAgentDescriptionChange={setAgentDescription}
              onWhatsappNumberChange={() => {}}
              onIntentsChange={setIntents}
              onBack={() => setCurrentStep("llm")}
              onSubmit={handleUpdateAgent}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default EditAgent;
