
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

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
  return (
    <div>
      <Label>API Key</Label>
      <div className="flex gap-2 mt-1">
        <Input
          type="password"
          value={apiKey}
          onChange={(e) => onApiKeyChange(e.target.value)}
          placeholder="Digite sua API Key"
        />
        <Button
          onClick={onValidate}
          disabled={!apiKey.trim() || !providerId || isValidating}
        >
          {isValidating ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : null}
          Validar
        </Button>
      </div>
    </div>
  );
};
