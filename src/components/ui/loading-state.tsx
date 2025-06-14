
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingStateProps {
  message?: string;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "card" | "inline";
  className?: string;
  showProgress?: boolean;
  progress?: number;
}

export const LoadingState = ({ 
  message = "Carregando...", 
  size = "md",
  variant = "default",
  className,
  showProgress = false,
  progress = 0
}: LoadingStateProps) => {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8", 
    lg: "h-12 w-12"
  };

  const variants = {
    default: "flex flex-col items-center justify-center min-h-[200px] space-y-4",
    card: "flex flex-col items-center justify-center p-8 bg-white rounded-lg border space-y-4",
    inline: "flex items-center space-x-2"
  };

  return (
    <div className={cn(variants[variant], className)}>
      <div className="flex flex-col items-center space-y-3">
        <Loader2 className={cn("animate-spin text-primary", sizeClasses[size])} />
        <p className="text-sm text-muted-foreground text-center">{message}</p>
        {showProgress && (
          <div className="w-48 bg-gray-200 rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
            />
          </div>
        )}
      </div>
    </div>
  );
};
