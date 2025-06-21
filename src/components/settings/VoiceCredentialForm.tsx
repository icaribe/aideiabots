
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { VoiceModel, VoiceProviderCredential } from "@/types/provider";
import { createProviderCredential, updateProviderCredential, validateVoiceProviderApiKey } from "@/services/providerCredentials";
import { VoiceCredentialBasicFields } from "./voice/VoiceCredentialBasicFields";
import { ApiKeyValidation } from "./voice/ApiKeyValidation";
import { VoiceSelection } from "./voice/VoiceSelection";
import { testVoice } from "./voice/VoiceTestService";

type VoiceCredentialFormProps = {
  credential?: VoiceProviderCredential;
  onSaved: () => void;
  onCancel: () => void;
};

export const VoiceCredentialForm = ({
  credential,
  onSaved,
  onCancel
}: VoiceCredentialFormProps) => {
  const [name, setName] = useState(credential?.name || "");
  const [providerId, setProviderId] = useState(credential?.provider_id || "");
  const [apiKey, setApiKey] = useState(credential?.api_key || "");
  const [isValidating, setIsValidating] = useState(false);
  const [isValidated, setIsValidated] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [availableVoices, setAvailableVoices] = useState<VoiceModel[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<string>("");
  const [isTestingVoice, setIsTestingVoice] = useState(false);

  const isEditing = !!credential;

  useEffect(() => {
    if (credential && credential.api_key) {
      setIsValidated(true);
    }
  }, [credential]);

  const handleProviderChange = (value: string) => {
    setProviderId(value);
    setIsValidated(false);
    setAvailableVoices([]);
    setSelectedVoice("");
  };

  const handleApiKeyChange = (value: string) => {
    setApiKey(value);
    setIsValidated(false);
    setAvailableVoices([]);
    setSelectedVoice("");
  };

  const validateApiKey = async () => {
    if (!apiKey.trim() || !providerId) {
      toast.error("Selecione um provedor e digite sua API Key");
      return;
    }

    setIsValidating(true);
    try {
      const voices = await validateVoiceProviderApiKey(providerId, apiKey);
      setAvailableVoices(voices);
      setIsValidated(true);
      if (voices.length > 0) {
        setSelectedVoice(voices[0].id);
      }
      toast.success("API Key validada com sucesso!");
    } catch (error) {
      console.error('Validation error:', error);
      toast.error(error.message || "Erro ao validar API Key");
    } finally {
      setIsValidating(false);
    }
  };

  const previewVoice = async () => {
    setIsTestingVoice(true);
    try {
      await testVoice(selectedVoice, providerId, apiKey);
    } catch (error) {
      console.error('Voice preview error:', error);
      toast.error(error.message || 'Erro ao testar a voz');
    } finally {
      setIsTestingVoice(false);
    }
  };

  const handleSubmit = async () => {
    if (!name.trim() || !providerId || !apiKey.trim() || !isValidated) {
      toast.error("Preencha todos os campos e valide a API Key");
      return;
    }

    setIsSaving(true);
    try {
      const credentialData = {
        name,
        provider_type: "voice" as const,
        provider_id: providerId,
        api_key: apiKey,
      };

      if (isEditing && credential) {
        await updateProviderCredential(credential.id, credentialData);
        toast.success("Credencial atualizada com sucesso!");
      } else {
        await createProviderCredential(credentialData);
        toast.success("Credencial criada com sucesso!");
      }
      
      onSaved();
    } catch (error) {
      toast.error(error.message || "Erro ao salvar credencial");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <VoiceCredentialBasicFields
          name={name}
          providerId={providerId}
          onNameChange={setName}
          onProviderChange={handleProviderChange}
          isEditing={isEditing}
        />

        <ApiKeyValidation
          apiKey={apiKey}
          providerId={providerId}
          isValidating={isValidating}
          onApiKeyChange={handleApiKeyChange}
          onValidate={validateApiKey}
        />

        {isValidated && (
          <VoiceSelection
            availableVoices={availableVoices}
            selectedVoice={selectedVoice}
            isTestingVoice={isTestingVoice}
            onVoiceChange={setSelectedVoice}
            onTestVoice={previewVoice}
          />
        )}
      </div>

      <div className="flex justify-end gap-2 pt-4 border-t">
        <Button variant="outline" onClick={onCancel} disabled={isSaving}>
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={!isValidated || !name.trim() || isSaving}
        >
          {isSaving ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : null}
          {isEditing ? "Atualizar" : "Salvar"} Credencial
        </Button>
      </div>
    </div>
  );
};
