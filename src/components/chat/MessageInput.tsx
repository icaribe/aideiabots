
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SendHorizontal } from "lucide-react";

type MessageInputProps = {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
};

export const MessageInput = ({
  value,
  onChange,
  onSubmit,
  isLoading,
}: MessageInputProps) => {
  return (
    <form onSubmit={onSubmit} className="p-4 border-t bg-white">
      <div className="max-w-3xl mx-auto flex gap-2">
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Digite sua mensagem..."
          disabled={isLoading}
        />
        <Button type="submit" disabled={isLoading}>
          <SendHorizontal className="h-4 w-4" />
        </Button>
      </div>
    </form>
  );
};
