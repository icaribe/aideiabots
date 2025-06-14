
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { LoadingState } from "./loading-state";

interface UniversalLoadingProps {
  isLoading: boolean;
  error?: Error | null;
  retry?: () => void;
  children: React.ReactNode;
  loadingMessage?: string;
  errorMessage?: string;
  className?: string;
}

export const UniversalLoading = ({
  isLoading,
  error,
  retry,
  children,
  loadingMessage = "Carregando...",
  errorMessage,
  className
}: UniversalLoadingProps) => {
  if (error) {
    return (
      <div className={cn("flex flex-col items-center justify-center min-h-[200px] space-y-4", className)}>
        <div className="text-red-500 text-center">
          <p className="font-medium">Ops! Algo deu errado</p>
          <p className="text-sm text-muted-foreground mt-2">
            {errorMessage || error.message}
          </p>
          {retry && (
            <button
              onClick={retry}
              className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              Tentar Novamente
            </button>
          )}
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <LoadingState 
        message={loadingMessage}
        className={className}
      />
    );
  }

  return <>{children}</>;
};
