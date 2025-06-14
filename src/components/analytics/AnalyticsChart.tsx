
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Line,
  LineChart,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Bar,
  BarChart,
  Area,
  AreaChart
} from "recharts";

interface AnalyticsChartProps {
  title: string;
  data: any[];
  dataKey: string;
  xAxisKey: string;
  type?: "line" | "bar" | "area";
  color?: string;
  description?: string;
}

const chartConfig = {
  conversations: {
    label: "Conversas",
  },
  messages: {
    label: "Mensagens",
  },
  response_time: {
    label: "Tempo de Resposta",
  },
  satisfaction: {
    label: "Satisfação",
  },
};

export const AnalyticsChart = ({
  title,
  data,
  dataKey,
  xAxisKey,
  type = "line",
  color = "#8b5cf6",
  description
}: AnalyticsChartProps) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      month: 'short',
      day: 'numeric'
    });
  };

  const formatXAxisData = (data: any[]) => {
    return data.map(item => ({
      ...item,
      [xAxisKey]: formatDate(item[xAxisKey])
    }));
  };

  const chartData = formatXAxisData(data);

  const renderChart = () => {
    const commonProps = {
      data: chartData,
      margin: { top: 5, right: 30, left: 20, bottom: 5 }
    };

    switch (type) {
      case "bar":
        return (
          <BarChart {...commonProps}>
            <XAxis dataKey={xAxisKey} />
            <YAxis />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey={dataKey} fill={color} />
          </BarChart>
        );
      case "area":
        return (
          <AreaChart {...commonProps}>
            <XAxis dataKey={xAxisKey} />
            <YAxis />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Area
              type="monotone"
              dataKey={dataKey}
              stroke={color}
              fill={color}
              fillOpacity={0.3}
            />
          </AreaChart>
        );
      default:
        return (
          <LineChart {...commonProps}>
            <XAxis dataKey={xAxisKey} />
            <YAxis />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Line
              type="monotone"
              dataKey={dataKey}
              stroke={color}
              strokeWidth={2}
              dot={{ fill: color }}
            />
          </LineChart>
        );
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
        {description && (
          <p className="text-sm text-gray-500">{description}</p>
        )}
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            {renderChart()}
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};
