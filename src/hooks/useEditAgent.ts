
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
  const [selectedCredentialId, setSelectedCredentialId] = useState<string | null>(null);
  const [selectedVoiceCredentialId, setSelectedVoiceCredentialId] = useState<string | null>(null);
  const [selectedVoiceProvider, setSelectedVoiceProvider] = useState<string | null>(null);
  const [selectedVoiceModel, setSelectedVoiceModel] = useState<string | null>(null);
  const [agentName, setAgentName] = useState("");
  const [agentDescription, setAgentDescription] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
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
          setSelectedCredentialId(agent.llm_credential_id || null);
          setSelectedVoiceCredentialId(agent.voice_credential_id || null);
          setSelectedVoiceProvider(agent.voice_provider || null);
          setSelectedVoiceModel(agent.voice_model || null);
          setAgentName(agent.name);
          setAgentDescription(agent.description || '');
          // Use webhook_url for whatsapp_number
          setWhatsappNumber(agent.webhook_url || '');
          
          if (agent.intents && agent.intents.length > 0) {
            setIntents(agent.intents.map((intent: any) => ({
              name: intent.name,
              description: intent.description || '',
              examples: intent.examples || [''],
              webhookUrl: intent.webhook_url || ''
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
    if (!agentName) {
      toast.error("Por favor, preencha o nome do agente");
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
          webhook_url: whatsappNumber || null,
          llm_credential_id: selectedCredentialId,
          voice_credential_id: selectedVoiceCredentialId,
          voice_provider: selectedVoiceProvider,
          voice_model: selectedVoiceModel,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (botError) {
        throw botError;
      }

      // Apenas processe as intenções se houver pelo menos uma com nome preenchido
      const validIntents = intents.filter(intent => intent.name.trim() !== "");
      if (validIntents.length > 0) {
        const { error: deleteIntentsError } = await supabase
          .from('intents')
          .delete()
          .eq('bot_id', id);

        if (deleteIntentsError) {
          console.error("Erro ao atualizar intents:", deleteIntentsError);
        }

        const intentsToInsert = validIntents.map(intent => ({
          bot_id: id,
          name: intent.name,
          description: intent.description,
          webhook_url: intent.webhookUrl,
          examples: intent.examples.filter(example => example.trim() !== "")
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
    selectedCredentialId,
    setSelectedCredentialId,
    selectedVoiceCredentialId,
    setSelectedVoiceCredentialId,
    selectedVoiceProvider,
    setSelectedVoiceProvider,
    selectedVoiceModel,
    setSelectedVoiceModel,
    agentName,
    setAgentName,
    agentDescription,
    setAgentDescription,
    whatsappNumber,
    setWhatsappNumber,
    intents,
    setIntents,
    handleUpdateAgent,
    handleDelete
  };
};
