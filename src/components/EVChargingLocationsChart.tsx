import { PieChart, Pie, Cell, ResponsiveContainer, Label } from "recharts";
import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

const COLORS = ["#E88D7D", "#FDE1D3", "#FFDEE2", "#E5DEFF", "#D8E1FF"];

export const EVChargingLocationsChart = () => {
  const { toast } = useToast();
  const { data: categoryData, isLoading } = useQuery({
    queryKey: ['ticket-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ticket_analysis')
        .select('category')
        .not('category', 'is', null);

      if (error) throw error;

      // Count occurrences of each category
      const categoryCounts = data.reduce((acc, curr) => {
        if (curr.category) {
          acc[curr.category] = (acc[curr.category] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>);

      // Convert to array format needed for chart
      const chartData = Object.entries(categoryCounts)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value) // Sort by value descending
        .slice(0, 5); // Take top 5 categories

      return chartData;
    }
  });

  const total = categoryData?.reduce((sum, item) => sum + item.value, 0) || 0;

  const handlePieClick = (data: any) => {
    toast({
      title: data.name,
      description: `Count: ${data.value} tickets (${((data.value / total) * 100).toFixed(1)}%)`,
    });
  };

  if (isLoading) {
    return (
      <Card className="p-8 rounded-3xl">
        <div>Loading...</div>
      </Card>
    );
  }

  return (
    <Card className="p-8 rounded-3xl">
      <div className="space-y-6">
        <div className="space-y-2">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <h3 className="text-xl font-medium text-black">
                Top Issue Categories Distribution
              </h3>
              <p className="text-base text-gray-600">Total issues analyzed</p>
            </div>
            <span className="text-sm text-gray-500">Count</span>
          </div>
          <p className="text-4xl font-semibold text-black">{total}</p>
        </div>

        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                innerRadius="70%"
                outerRadius="100%"
                paddingAngle={2}
                dataKey="value"
                startAngle={180}
                endAngle={-180}
                onClick={handlePieClick}
                cursor="pointer"
              >
                {categoryData?.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={COLORS[index % COLORS.length]} 
                    stroke="none"
                  />
                ))}
                <Label
                  content={({ viewBox }: { viewBox: { cx: number; cy: number } }) => {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        className="fill-black font-medium text-2xl"
                      >
                        {categoryData?.[0]?.value || 0}
                      </text>
                    );
                  }}
                />
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {categoryData?.map((item, index) => (
            <div 
              key={index} 
              className="flex items-center gap-2 cursor-pointer hover:opacity-80"
              onClick={() => handlePieClick(item)}
            >
              <div
                className="w-3 h-3 rounded"
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              />
              <span className="text-sm text-gray-600">{item.name}</span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};