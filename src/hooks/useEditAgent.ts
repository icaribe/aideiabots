
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Step, IntentConfig } from "@/types/agent";

export const useEditAgent = (id: string | undefined) => {
  const navigate = useNavigate();
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
        throw botError;
      }

      if (intents.length > 0) {
        const { error: deleteIntentsError } = await supabase
          .from('intents')
          .delete()
          .eq('bot_id', id);

        if (deleteIntentsError) {
          console.error("Erro ao atualizar intents:", deleteIntentsError);
        }

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
          throw intentsError;
        }
      }

      toast.success("Agente atualizado com sucesso!");
      navigate("/agents");
    } catch (error) {
      console.error("Erro ao atualizar agente:", error);
      toast.error("Erro ao atualizar agente. Tente novamente.");
    }
  };

  const handleDelete = async () => {
    try {
      const { error } = await supabase
        .from('bots')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success("Agente excluído com sucesso!");
      navigate("/agents");
    } catch (error) {
      console.error('Erro ao excluir agente:', error);
      toast.error("Erro ao excluir agente. Por favor, tente novamente.");
    }
  };

  return {
    currentStep,
    setCurrentStep,
    selectedType,
    setSelectedType,
    selectedProvider,
    setSelectedProvider,
    selectedModel,
    setSelectedModel,
    agentName,
    setAgentName,
    agentDescription,
    setAgentDescription,
    intents,
    setIntents,
    handleUpdateAgent,
    handleDelete
  };
};
