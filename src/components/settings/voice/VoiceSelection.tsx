
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Volume2 } from "lucide-react";
import { VoiceModel } from "@/types/provider";

type VoiceSelectionProps = {
  availableVoices: VoiceModel[];
  selectedVoice: string;
  isTestingVoice: boolean;
  onVoiceChange: (voice: string) => void;
  onTestVoice: () => void;
};

export const VoiceSelection = ({
  availableVoices,
  selectedVoice,
  isTestingVoice,
  onVoiceChange,
  onTestVoice
}: VoiceSelectionProps) => {
  if (availableVoices.length === 0) {
    return null;
  }

  return (
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
          <Select value={selectedVoice} onValueChange={onVoiceChange}>
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
            onClick={onTestVoice}
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
  );
};
