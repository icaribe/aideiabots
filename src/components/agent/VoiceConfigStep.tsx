import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Volume2, Play, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { testVoice } from "@/components/settings/voice/VoiceTestService";

interface VoiceConfigStepProps {
  selectedVoiceCredentialId: string | null;
  selectedVoiceProvider: string | null;
  selectedVoiceModel: string | null;
  onVoiceCredentialSelect: (credentialId: string | null) => void;
  onVoiceProviderSelect: (provider: string | null) => void;
  onVoiceModelSelect: (model: string | null) => void;
}

interface VoiceCredential {
  id: string;
  name: string;
  provider_id: string;
  api_key: string;
}

interface VoiceModel {
  id: string;
  name: string;
}

export const VoiceConfigStep = ({
  selectedVoiceCredentialId,
  selectedVoiceProvider,
  selectedVoiceModel,
  onVoiceCredentialSelect,
  onVoiceProviderSelect,
  onVoiceModelSelect
}: VoiceConfigStepProps) => {
  const [voiceCredentials, setVoiceCredentials] = useState<VoiceCredential[]>([]);
  const [availableVoices, setAvailableVoices] = useState<VoiceModel[]>([]);
  const [isLoadingVoices, setIsLoadingVoices] = useState(false);
  const [isTestingVoice, setIsTestingVoice] = useState(false);

  useEffect(() => {
    fetchVoiceCredentials();
  }, []);

  useEffect(() => {
    if (selectedVoiceCredentialId) {
      const credential = voiceCredentials.find(c => c.id === selectedVoiceCredentialId);
      if (credential) {
        onVoiceProviderSelect(credential.provider_id);
        loadAvailableVoices(credential);
      }
    }
  }, [selectedVoiceCredentialId, voiceCredentials]);

  const fetchVoiceCredentials = async () => {
    try {
      const { data, error } = await supabase
        .from('provider_credentials')
        .select('*')
        .eq('provider_type', 'voice');

      if (error) throw error;
      setVoiceCredentials(data || []);
    } catch (error) {
      console.error('Erro ao buscar credenciais de voz:', error);
      toast.error('Erro ao carregar credenciais de voz');
    }
  };

  const loadAvailableVoices = async (credential: VoiceCredential) => {
    setIsLoadingVoices(true);
    try {
      let voices: VoiceModel[] = [];
      
      if (credential.provider_id === 'elevenlabs') {
        const response = await fetch('https://api.elevenlabs.io/v1/voices', {
          headers: {
            'Accept': 'application/json',
            'xi-api-key': credential.api_key
          }
        });

        if (response.ok) {
          const data = await response.json();
          voices = data.voices?.map((voice: any) => ({
            id: voice.voice_id,
            name: `${voice.name} (${voice.category || 'Custom'})`
          })) || [];
        }
      } else if (credential.provider_id === 'openai') {
        voices = [
          { id: 'alloy', name: 'Alloy (Natural, Equilibrada)' },
          { id: 'echo', name: 'Echo (Masculina, Clara)' },
          { id: 'fable', name: 'Fable (Britânica, Calorosa)' },
          { id: 'onyx', name: 'Onyx (Grave, Autoritativa)' },
          { id: 'nova', name: 'Nova (Feminina, Agradável)' },
          { id: 'shimmer', name: 'Shimmer (Suave, Gentil)' }
        ];
      }

      setAvailableVoices(voices);
      if (voices.length > 0 && !selectedVoiceModel) {
        onVoiceModelSelect(voices[0].id);
      }
    } catch (error) {
      console.error('Erro ao carregar vozes:', error);
      toast.error('Erro ao carregar vozes disponíveis');
    } finally {
      setIsLoadingVoices(false);
    }
  };

  const handleTestVoice = async () => {
    if (!selectedVoiceModel || !selectedVoiceCredentialId) {
      toast.error('Selecione uma voz para testar');
      return;
    }

    const credential = voiceCredentials.find(c => c.id === selectedVoiceCredentialId);
    if (!credential) return;

    setIsTestingVoice(true);
    try {
      await testVoice(selectedVoiceModel, credential.provider_id, credential.api_key);
    } catch (error) {
      console.error('Erro ao testar voz:', error);
    } finally {
      setIsTestingVoice(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Volume2 className="h-5 w-5" />
            Configuração de Voz
          </CardTitle>
          <CardDescription>
            Configure a voz que o agente usará para responder aos usuários
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Credencial de Voz</Label>
            <Select
              value={selectedVoiceCredentialId || ""}
              onValueChange={(value) => onVoiceCredentialSelect(value || null)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma credencial de voz" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Nenhuma (sem voz)</SelectItem>
                {voiceCredentials.map((credential) => (
                  <SelectItem key={credential.id} value={credential.id}>
                    <div className="flex items-center gap-2">
                      <span>{credential.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {credential.provider_id}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedVoiceCredentialId && (
            <div>
              <Label>Voz Selecionada</Label>
              <Select
                value={selectedVoiceModel || ""}
                onValueChange={(value) => onVoiceModelSelect(value || null)}
                disabled={isLoadingVoices}
              >
                <SelectTrigger>
                  <SelectValue placeholder={isLoadingVoices ? "Carregando vozes..." : "Selecione uma voz"} />
                </SelectTrigger>
                <SelectContent>
                  {availableVoices.map((voice) => (
                    <SelectItem key={voice.id} value={voice.id}>
                      {voice.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {selectedVoiceModel && (
                <div className="mt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleTestVoice}
                    disabled={isTestingVoice}
                    className="flex items-center gap-2"
                  >
                    {isTestingVoice ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Play className="h-4 w-4" />
                    )}
                    {isTestingVoice ? 'Testando...' : 'Testar Voz'}
                  </Button>
                </div>
              )}
            </div>
          )}

          {!selectedVoiceCredentialId && (
            <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                💡 Para habilitar respostas por voz, você precisa configurar uma credencial de voz nas configurações.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};