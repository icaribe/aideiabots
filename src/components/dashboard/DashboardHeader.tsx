
import { Bot } from "lucide-react";
import { Button } from "@/components/ui/button";

type DashboardHeaderProps = {
  timeFilter: string;
  setTimeFilter: (filter: string) => void;
};

export const DashboardHeader = ({ timeFilter, setTimeFilter }: DashboardHeaderProps) => {
  return (
    <div className="flex justify-between items-center mb-8">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Bot className="h-6 w-6 text-purple-600" />
          Dashboards
        </h1>
        <p className="text-gray-500 mt-1">Informações em tempo real sobre sua conta e agentes</p>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" onClick={() => setTimeFilter("7 dias")}>7 dias</Button>
        <Button variant="outline" className={timeFilter === "14 dias" ? "bg-teal-500 text-white" : ""} onClick={() => setTimeFilter("14 dias")}>14 dias</Button>
        <Button variant="outline" onClick={() => setTimeFilter("30 dias")}>30 dias</Button>
      </div>
    </div>
  );
};
