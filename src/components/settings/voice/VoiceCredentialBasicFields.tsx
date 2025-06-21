
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { voiceProviders } from "@/services/voiceProviders";

type VoiceCredentialBasicFieldsProps = {
  name: string;
  providerId: string;
  onNameChange: (name: string) => void;
  onProviderChange: (providerId: string) => void;
  isEditing: boolean;
};

export const VoiceCredentialBasicFields = ({
  name,
  providerId,
  onNameChange,
  onProviderChange,
  isEditing
}: VoiceCredentialBasicFieldsProps) => {
  return (
    <>
      <div>
        <Label>Nome da Credencial</Label>
        <Input
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder="Ex: Minhas Vozes OpenAI"
          className="mt-1"
        />
      </div>

      <div>
        <Label>Provedor de Voz</Label>
        <Select
          value={providerId}
          onValueChange={onProviderChange}
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
    </>
  );
};
