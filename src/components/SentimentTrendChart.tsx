import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export const SentimentTrendChart = () => {
  const { data: chartData } = useQuery({
    queryKey: ["sentiment-trend"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ticket_analysis")
        .select("sentiment")
        .not("sentiment", "is", null);

      if (error) throw error;

      const sentimentCounts = data.reduce((acc: Record<string, number>, curr) => {
        acc[curr.sentiment] = (acc[curr.sentiment] || 0) + 1;
        return acc;
      }, {});

      return Object.entries(sentimentCounts).map(([name, value]) => ({
        name,
        value,
      }));
    },
  });

  return (
    <Card className="p-6 bg-secondary border-none">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-white">Sentiment Analysis</h3>
        <p className="text-sm text-muted-foreground">
          Distribution of ticket sentiments
        </p>
      </div>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis 
              dataKey="name" 
              stroke="#a1a1aa"
              tick={{ fill: '#a1a1aa' }}
            />
            <YAxis 
              stroke="#a1a1aa"
              tick={{ fill: '#a1a1aa' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1a1d2d',
                border: '1px solid rgba(255,255,255,0.1)',
                color: 'white',
              }}
            />
            <Bar
              dataKey="value"
              fill="#9b87f5"
              name="Count"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};