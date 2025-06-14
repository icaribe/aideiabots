
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Step, IntentConfig } from "@/types/agent";
import { useErrorHandler } from "@/hooks/useErrorHandler";
import { useDataValidation } from "@/hooks/useDataValidation";

export const useEditAgent = (id: string | undefined) => {
  const navigate = useNavigate();
  const { errorState, handleError, clearError } = useErrorHandler();
  const { validateAgent } = useDataValidation();
  
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
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchAgent = async () => {
      try {
        setLoading(true);
        clearError();
        
        const { data: agent, error } = await supabase
          .from('bots')
          .select(`
            *,
            intents (*)
          `)
          .eq('id', id)
          .single();

        if (error) {
          handleError(error, "fetchAgent");
          return;
        }

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
        handleError(error, "fetchAgent");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchAgent();
    }
  }, [id, handleError, clearError]);

  const handleUpdateAgent = async () => {
    try {
      setLoading(true);
      clearError();

      // Validar dados do agente
      const agentData = {
        name: agentName,
        description: agentDescription,
        llm_provider: selectedProvider,
        model: selectedModel,
        llm_credential_id: selectedCredentialId
      };

      validateAgent(agentData);

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
        handleError(botError, "updateAgent");
        return;
      }

      // Validar e processar intents
      const validIntents = intents.filter(intent => intent.name.trim() !== "");
      if (validIntents.length > 0) {
        // Deletar intents existentes
        const { error: deleteIntentsError } = await supabase
          .from('intents')
          .delete()
          .eq('bot_id', id);

        if (deleteIntentsError) {
          console.error("Erro ao deletar intents:", deleteIntentsError);
        }

        // Inserir novas intents
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
          handleError(intentsError, "updateIntents");
          return;
        }
      }

      toast.success("Agente atualizado com sucesso!");
      navigate("/agents");
    } catch (error) {
      handleError(error, "updateAgent");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setLoading(true);
      clearError();
      
      const { error } = await supabase
        .from('bots')
        .delete()
        .eq('id', id);

      if (error) {
        handleError(error, "deleteAgent");
        return;
      }

      toast.success("Agente excluído com sucesso!");
      navigate("/agents");
    } catch (error) {
      handleError(error, "deleteAgent");
    } finally {
      setLoading(false);
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
    handleDelete,
    loading,
    error: errorState.error
  };
};
