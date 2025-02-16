
import { Button } from "@/components/ui/button";
import { ChevronLeft, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const EditAgentHeader = () => {
  const navigate = useNavigate();

  return (
    <div className="flex justify-between items-center mb-8">
      <Button 
        variant="ghost" 
        className="gap-2"
        onClick={() => navigate(-1)}
      >
        <ChevronLeft className="h-4 w-4" />
        Voltar
      </Button>
      <Button 
        variant="ghost" 
        onClick={() => navigate("/agents")}
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
};
