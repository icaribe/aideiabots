
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface AnalyticsCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ReactNode;
  description?: string;
  className?: string;
}

export const AnalyticsCard = ({
  title,
  value,
  change,
  icon,
  description,
  className
}: AnalyticsCardProps) => {
  const changeColor = change && change > 0 ? "text-green-600" : change && change < 0 ? "text-red-600" : "text-gray-500";

  return (
    <Card className={cn("hover:shadow-md transition-shadow", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">{title}</CardTitle>
        <div className="text-gray-400">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold mb-1">{value}</div>
        {change !== undefined && (
          <p className={cn("text-xs", changeColor)}>
            {change > 0 ? "+" : ""}{change}% em relação ao período anterior
          </p>
        )}
        {description && (
          <p className="text-xs text-gray-500 mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  );
};
