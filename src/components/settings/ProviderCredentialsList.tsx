
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Key } from "lucide-react";
import { ProviderCredential } from "@/types/provider";
import { useState } from "react";
import { toast } from "sonner";
import { deleteProviderCredential } from "@/services/providerCredentials";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type ProviderCredentialsListProps = {
  credentials: ProviderCredential[];
  onEdit: (credential: ProviderCredential) => void;
  onDeleted: () => void;
};

export const ProviderCredentialsList = ({
  credentials,
  onEdit,
  onDeleted
}: ProviderCredentialsListProps) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCredentialId, setSelectedCredentialId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!selectedCredentialId) return;

    setIsDeleting(true);
    try {
      await deleteProviderCredential(selectedCredentialId);
      toast.success("Credencial excluída com sucesso");
      onDeleted();
    } catch (error) {
      toast.error("Erro ao excluir credencial");
      console.error("Error deleting credential:", error);
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setSelectedCredentialId(null);
    }
  };

  const confirmDelete = (id: string) => {
    setSelectedCredentialId(id);
    setDeleteDialogOpen(true);
  };

  const getProviderName = (providerId: string): string => {
    const providerMap: Record<string, string> = {
      'openai': 'OpenAI',
      'anthropic': 'Anthropic',
      'groq': 'Groq',
      'gemini': 'Google Gemini',
      'openrouter': 'OpenRouter',
      'ollama': 'Ollama',
      'elevenlabs': 'ElevenLabs'
    };
    
    return providerMap[providerId] || providerId;
  };

  return (
    <div className="space-y-4">
      {credentials.length === 0 && (
        <Card>
          <CardContent className="p-6 text-center text-gray-500">
            Nenhuma credencial cadastrada
          </CardContent>
        </Card>
      )}

      {credentials.map((credential) => (
        <Card key={credential.id} className="hover:shadow-sm transition-shadow">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>{credential.name}</CardTitle>
                <CardDescription>
                  {getProviderName(credential.provider_id)}
                </CardDescription>
              </div>
              <Badge variant={credential.provider_type === 'llm' ? 'default' : 'secondary'}>
                {credential.provider_type === 'llm' ? 'LLM' : 'Voz'}
              </Badge>
            </div>
          </CardHeader>
          <CardFooter className="flex justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(credential)}
            >
              <Edit className="h-4 w-4 mr-1" />
              Editar
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-destructive"
              onClick={() => confirmDelete(credential.id)}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Excluir
            </Button>
          </CardFooter>
        </Card>
      ))}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir credencial</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta credencial? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleDelete();
              }}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
