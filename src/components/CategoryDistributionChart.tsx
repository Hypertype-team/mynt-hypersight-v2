import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const COLORS = [
  "#E88D7D", // Soft Coral
  "#FFE5D3", // Soft Peach
  "#F8D7E8", // Soft Pink
  "#E5DEFF", // Soft Purple
  "#D3E4FD", // Soft Blue
];

const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
}: any) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="#000000"
      textAnchor={x > cx ? 'start' : 'end'}
      dominantBaseline="central"
      className="text-sm font-medium"
    >
      {`${(percent * 100).toFixed(1)}`}
    </text>
  );
};

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
    <Card className="p-6 bg-white border border-gray-100">
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-black">Category Distribution</h3>
        <p className="text-sm text-gray-600 mt-1">
          Distribution of tickets by category
        </p>
      </div>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={80}
              outerRadius={120}
              paddingAngle={4}
              labelLine={false}
              label={renderCustomizedLabel}
            >
              {chartData?.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                  stroke="none"
                />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value: number) => [`${value}`, 'Count']}
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
            <Legend 
              layout="horizontal" 
              verticalAlign="bottom" 
              align="center"
              wrapperStyle={{
                paddingTop: '20px',
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};