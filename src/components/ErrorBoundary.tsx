
import React, { Component, ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error Boundary capturou um erro:", error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Card className="p-8 max-w-md mx-auto mt-8">
          <div className="flex flex-col items-center space-y-4 text-center">
            <AlertTriangle className="h-12 w-12 text-red-500" />
            <div>
              <h3 className="text-lg font-semibold">Ops! Algo deu errado</h3>
              <p className="text-sm text-muted-foreground mt-2">
                {this.state.error?.message || "Ocorreu um erro inesperado"}
              </p>
            </div>
            <Button onClick={this.handleRetry} className="flex items-center space-x-2">
              <RefreshCw className="h-4 w-4" />
              <span>Tentar Novamente</span>
            </Button>
          </div>
        </Card>
      );
    }

    return this.props.children;
  }
}
