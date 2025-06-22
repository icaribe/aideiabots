
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Info } from "lucide-react";

type ApiKeyValidationProps = {
  apiKey: string;
  providerId: string;
  isValidating: boolean;
  onApiKeyChange: (apiKey: string) => void;
  onValidate: () => void;
};

export const ApiKeyValidation = ({
  apiKey,
  providerId,
  isValidating,
  onApiKeyChange,
  onValidate
}: ApiKeyValidationProps) => {
  const getProviderInfo = () => {
    switch (providerId) {
      case 'elevenlabs':
        return {
          name: 'ElevenLabs',
          placeholder: 'sk_...',
          help: 'Sua chave de API deve ter permissões para acessar vozes'
        };
      case 'openai':
        return {
          name: 'OpenAI',
          placeholder: 'sk-proj-...',
          help: 'Sua chave de API deve ter acesso ao TTS (Text-to-Speech)'
        };
      default:
        return {
          name: 'API',
          placeholder: 'Digite sua API Key',
          help: 'Verifique se a chave tem as permissões necessárias'
        };
    }
  };

  const providerInfo = getProviderInfo();

  return (
    <div className="space-y-2">
      <Label>API Key do {providerInfo.name}</Label>
      <div className="flex gap-2">
        <Input
          type="password"
          value={apiKey}
          onChange={(e) => onApiKeyChange(e.target.value)}
          placeholder={providerInfo.placeholder}
          className="flex-1"
        />
        <Button
          onClick={onValidate}
          disabled={!apiKey.trim() || !providerId || isValidating}
          className="min-w-[100px]"
        >
          {isValidating ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Validando...
            </>
          ) : (
            'Validar'
          )}
        </Button>
      </div>
      {providerId && (
        <div className="flex items-start gap-2 text-sm text-gray-600">
          <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <span>{providerInfo.help}</span>
        </div>
      )}
    </div>
  );
};
