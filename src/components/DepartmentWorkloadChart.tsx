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

export const DepartmentWorkloadChart = () => {
  const { data: chartData } = useQuery({
    queryKey: ["department-workload"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ticket_analysis")
        .select("responsible_department")
        .not("responsible_department", "is", null);

      if (error) throw error;

      const deptCounts = data.reduce((acc: Record<string, number>, curr) => {
        acc[curr.responsible_department] = (acc[curr.responsible_department] || 0) + 1;
        return acc;
      }, {});

      return Object.entries(deptCounts)
        .map(([name, value]) => ({
          name,
          value,
        }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5); // Show top 5 departments
    },
  });

  return (
    <Card className="p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold">Department Workload</h3>
        <p className="text-sm text-muted-foreground">
          Top 5 departments by ticket volume
        </p>
      </div>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis dataKey="name" type="category" width={150} />
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