import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Volume2 } from "lucide-react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { VoiceModel, VoiceProviderCredential } from "@/types/provider";
import { createProviderCredential, updateProviderCredential, validateVoiceProviderApiKey } from "@/services/providerCredentials";
import { voiceProviders } from "@/services/voiceProviders";
import { supabase } from "@/integrations/supabase/client";

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
    if (!selectedVoice) {
      toast.error("Selecione uma voz para testar");
      return;
    }

    if (!apiKey.trim()) {
      toast.error("API Key é necessária para testar a voz");
      return;
    }

    setIsTestingVoice(true);
    try {
      console.log('Testing voice with:', { provider: providerId, voice: selectedVoice });
      
      const testText = "Olá! Esta é uma prévia da voz selecionada para teste.";
      
      // Use Supabase Edge Function instead of local API route
      const { data, error } = await supabase.functions.invoke('test-voice', {
        body: {
          text: testText,
          voiceId: selectedVoice,
          provider: providerId,
          apiKey: apiKey
        }
      });

      console.log('Supabase function response:', { data, error });

      if (error) {
        console.error('Test voice Edge Function error:', error);
        throw new Error(error.message || 'Erro ao chamar função de teste de voz');
      }

      if (!data) {
        throw new Error('Nenhuma resposta recebida da função de teste');
      }
      
      if (data.error) {
        throw new Error(data.error);
      }

      if (data.audioContent) {
        console.log('Creating audio from base64, length:', data.audioContent.length);
        
        try {
          // Create audio from base64
          const binaryString = atob(data.audioContent);
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          
          const audioBlob = new Blob([bytes], { type: 'audio/mpeg' });
          const audioUrl = URL.createObjectURL(audioBlob);
          
          console.log('Audio blob created, size:', audioBlob.size);
          
          const audio = new Audio(audioUrl);
          
          audio.oncanplaythrough = () => {
            console.log('Audio can play through');
          };
          
          audio.onended = () => {
            console.log('Audio playback ended');
            URL.revokeObjectURL(audioUrl);
          };

          audio.onerror = (e) => {
            console.error('Audio playback error:', e);
            URL.revokeObjectURL(audioUrl);
            toast.error('Erro ao reproduzir o áudio gerado');
          };
          
          audio.onloadstart = () => {
            console.log('Audio loading started');
          };
          
          audio.onloadeddata = () => {
            console.log('Audio data loaded');
          };
          
          console.log('Starting audio playback...');
          await audio.play();
          toast.success('Teste de voz reproduzido com sucesso!');
          
        } catch (audioError) {
          console.error('Audio processing error:', audioError);
          toast.error('Erro ao processar o áudio: ' + audioError.message);
        }
      } else {
        console.error('No audio content in response:', data);
        throw new Error('Nenhum conteúdo de áudio foi recebido do servidor');
      }
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
        <div>
          <Label>Nome da Credencial</Label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: Minhas Vozes OpenAI"
            className="mt-1"
          />
        </div>

        <div>
          <Label>Provedor de Voz</Label>
          <Select
            value={providerId}
            onValueChange={(value) => {
              setProviderId(value);
              setIsValidated(false);
              setAvailableVoices([]);
              setSelectedVoice("");
            }}
            disabled={isEditing}
          >
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Selecione um provedor" />
            </SelectTrigger>
            <SelectContent>
              {voiceProviders.map((provider) => (
                <SelectItem key={provider.id} value={provider.id}>
                  {provider.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>API Key</Label>
          <div className="flex gap-2 mt-1">
            <Input
              type="password"
              value={apiKey}
              onChange={(e) => {
                setApiKey(e.target.value);
                setIsValidated(false);
                setAvailableVoices([]);
                setSelectedVoice("");
              }}
              placeholder="Digite sua API Key"
            />
            <Button
              onClick={validateApiKey}
              disabled={!apiKey.trim() || !providerId || isValidating}
            >
              {isValidating ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Validar
            </Button>
          </div>
        </div>

        {isValidated && availableVoices.length > 0 && (
          <div className="mt-4 p-4 bg-green-50 rounded border border-green-200 space-y-4">
            <p className="text-green-700 text-sm">
              ✓ API Key validada com sucesso!
            </p>
            <p className="text-sm text-gray-600">
              {availableVoices.length} vozes disponíveis
            </p>
            
            <div className="space-y-2">
              <Label>Voz Padrão</Label>
              <div className="flex gap-2">
                <Select value={selectedVoice} onValueChange={setSelectedVoice}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma voz" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableVoices.map((voice) => (
                      <SelectItem key={voice.id} value={voice.id}>
                        {voice.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Button
                  size="icon"
                  variant="outline"
                  onClick={previewVoice}
                  disabled={!selectedVoice || isTestingVoice}
                  title="Testar voz selecionada"
                >
                  {isTestingVoice ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Volume2 className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>
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
