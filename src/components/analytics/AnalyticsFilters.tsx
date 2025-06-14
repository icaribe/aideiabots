
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Filter } from "lucide-react";

interface AnalyticsFiltersProps {
  timeRange: number;
  setTimeRange: (range: number) => void;
  selectedBot?: string;
  setSelectedBot?: (botId: string) => void;
  bots?: Array<{ id: string; name: string }>;
}

export const AnalyticsFilters = ({
  timeRange,
  setTimeRange,
  selectedBot,
  setSelectedBot,
  bots = []
}: AnalyticsFiltersProps) => {
  const timeRanges = [
    { value: 7, label: "Últimos 7 dias" },
    { value: 14, label: "Últimos 14 dias" },
    { value: 30, label: "Últimos 30 dias" },
    { value: 90, label: "Últimos 90 dias" },
  ];

  return (
    <div className="flex flex-wrap gap-4 items-center mb-6 p-4 bg-gray-50 rounded-lg">
      <div className="flex items-center gap-2">
        <Calendar className="h-4 w-4 text-gray-500" />
        <span className="text-sm font-medium">Período:</span>
      </div>
      
      <div className="flex gap-2">
        {timeRanges.map((range) => (
          <Button
            key={range.value}
            variant={timeRange === range.value ? "default" : "outline"}
            size="sm"
            onClick={() => setTimeRange(range.value)}
          >
            {range.label}
          </Button>
        ))}
      </div>
      
      {setSelectedBot && bots.length > 0 && (
        <>
          <div className="flex items-center gap-2 ml-4">
            <Filter className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium">Agente:</span>
          </div>
          
          <Select value={selectedBot} onValueChange={setSelectedBot}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Todos os agentes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os agentes</SelectItem>
              {bots.map((bot) => (
                <SelectItem key={bot.id} value={bot.id}>
                  {bot.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </>
      )}
    </div>
  );
};
