
import { useState, useCallback } from "react";
import { toast } from "sonner";

interface RetryOptions {
  maxAttempts?: number;
  baseDelay?: number;
  maxDelay?: number;
  exponentialBackoff?: boolean;
}

export const useRetry = () => {
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const executeWithRetry = useCallback(async <T>(
    operation: () => Promise<T>,
    options: RetryOptions = {}
  ): Promise<T> => {
    const {
      maxAttempts = 3,
      baseDelay = 1000,
      maxDelay = 10000,
      exponentialBackoff = true
    } = options;

    let lastError: Error;
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        setRetryCount(attempt - 1);
        
        if (attempt > 1) {
          setIsRetrying(true);
          const delay = exponentialBackoff 
            ? Math.min(baseDelay * Math.pow(2, attempt - 2), maxDelay)
            : baseDelay;
          
          await new Promise(resolve => setTimeout(resolve, delay));
        }

        const result = await operation();
        setIsRetrying(false);
        setRetryCount(0);
        return result;
        
      } catch (error) {
        lastError = error as Error;
        console.warn(`Tentativa ${attempt}/${maxAttempts} falhou:`, error);
        
        if (attempt === maxAttempts) {
          setIsRetrying(false);
          setRetryCount(0);
          toast.error(`Falha após ${maxAttempts} tentativas: ${lastError.message}`);
          throw lastError;
        }
      }
    }

    throw lastError!;
  }, []);

  return {
    executeWithRetry,
    isRetrying,
    retryCount
  };
};
