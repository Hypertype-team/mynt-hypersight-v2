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

const COLORS = {
  bar: "#E88D7D", // Soft Coral
  hover: "#FFE5D3", // Soft Peach
};

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
    <Card className="p-8 bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border-0">
      <div className="mb-6">
        <h3 className="text-2xl font-medium text-[#1a1a1a]">Sentiment Analysis</h3>
        <p className="text-base text-[#666666] mt-1">
          Distribution of ticket sentiments
        </p>
      </div>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="name" 
              stroke="#1a1a1a"
              tick={{ fill: '#1a1a1a' }}
            />
            <YAxis 
              stroke="#1a1a1a"
              tick={{ fill: '#1a1a1a' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '8px 12px',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
              }}
              itemStyle={{
                color: '#1a1a1a',
              }}
            />
            <Bar
              dataKey="value"
              fill={COLORS.bar}
              name="Count"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};