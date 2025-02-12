
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

type ChartData = {
  date: string;
  atendimentos: number;
}[];

type ChartCardProps = {
  data: ChartData;
};

export const ChartCard = ({ data }: ChartCardProps) => {
  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Histórico de Atendimentos</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="atendimentos"
                stroke="#8b5cf6"
                fill="#ddd6fe"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
