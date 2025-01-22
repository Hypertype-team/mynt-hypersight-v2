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
  bar: "#E5DEFF", // Soft Purple
  hover: "#D3E4FD", // Soft Blue
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
    <Card className="p-6 bg-white border border-gray-100">
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-black">Sentiment Analysis</h3>
        <p className="text-sm text-gray-600 mt-1">
          Distribution of ticket sentiments
        </p>
      </div>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="name" 
              stroke="#000000"
              tick={{ fill: '#000000' }}
            />
            <YAxis 
              stroke="#000000"
              tick={{ fill: '#000000' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '8px 12px',
              }}
              itemStyle={{
                color: '#000000',
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