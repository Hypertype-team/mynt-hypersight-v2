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

export const CategoryDistributionChart = () => {
  const { data: chartData } = useQuery({
    queryKey: ["category-distribution"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ticket_analysis")
        .select("category")
        .not("category", "is", null);

      if (error) throw error;

      const categoryCounts = data.reduce((acc: Record<string, number>, curr) => {
        acc[curr.category] = (acc[curr.category] || 0) + 1;
        return acc;
      }, {});

      return Object.entries(categoryCounts).map(([name, value]) => ({
        name,
        value,
      }));
    },
  });

  return (
    <Card className="p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold">Category Distribution</h3>
        <p className="text-sm text-muted-foreground">
          Number of tickets per category
        </p>
      </div>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar
              dataKey="value"
              fill="hsl(var(--primary))"
              name="Count"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};