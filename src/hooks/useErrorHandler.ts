
import { useState, useCallback } from "react";
import { toast } from "sonner";

interface ErrorState {
  hasError: boolean;
  error: Error | null;
  errorCode?: string;
  retryable: boolean;
}

export const useErrorHandler = () => {
  const [errorState, setErrorState] = useState<ErrorState>({
    hasError: false,
    error: null,
    retryable: false
  });

  const handleError = useCallback((error: unknown, context?: string) => {
    console.error(`Error in ${context}:`, error);
    
    let errorMessage = "Erro desconhecido";
    let retryable = false;
    let errorCode = "";

    if (error instanceof Error) {
      errorMessage = error.message;
      
      // Categorizar tipos de erro
      if (errorMessage.includes("Network") || errorMessage.includes("fetch")) {
        errorCode = "NETWORK_ERROR";
        retryable = true;
        errorMessage = "Erro de conexão. Verifique sua internet.";
      } else if (errorMessage.includes("API") || errorMessage.includes("Unauthorized")) {
        errorCode = "API_ERROR";
        retryable = true;
        errorMessage = "Erro de autenticação. Tente fazer login novamente.";
      } else if (errorMessage.includes("RLS") || errorMessage.includes("row-level security")) {
        errorCode = "PERMISSION_ERROR";
        retryable = false;
        errorMessage = "Você não tem permissão para esta operação.";
      } else if (errorMessage.includes("Groq") || errorMessage.includes("OpenAI")) {
        errorCode = "LLM_ERROR";
        retryable = true;
        errorMessage = "Erro no processamento da IA. Configure as credenciais nas configurações.";
      }
    }

    setErrorState({
      hasError: true,
      error: error as Error,
      errorCode,
      retryable
    });

    toast.error(errorMessage);
  }, []);

  const clearError = useCallback(() => {
    setErrorState({
      hasError: false,
      error: null,
      retryable: false
    });
  }, []);

  return {
    errorState,
    handleError,
    clearError
  };
};
