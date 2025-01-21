import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const CategoryBreakdownChart = () => {
  const { data: categoryData, isLoading } = useQuery({
    queryKey: ["category-breakdown"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ticket_analysis")
        .select("category");

      if (error) throw error;

      // Count occurrences of each category
      const categoryCounts = data.reduce((acc: { [key: string]: number }, item) => {
        const category = item.category || "Uncategorized";
        acc[category] = (acc[category] || 0) + 1;
        return acc;
      }, {});

      // Transform into format needed for chart
      return Object.entries(categoryCounts).map(([name, count]) => ({
        name,
        count,
      }));
    },
  });

  if (isLoading) {
    return (
      <Card className="p-6">
        <p>Loading category breakdown...</p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold">Category Breakdown</h3>
        <p className="text-sm text-muted-foreground">
          Distribution of tickets across categories
        </p>
      </div>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={categoryData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="name"
              angle={-45}
              textAnchor="end"
              height={70}
              interval={0}
            />
            <YAxis />
            <Tooltip />
            <Bar
              dataKey="count"
              fill="hsl(var(--primary))"
              name="Number of Tickets"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};