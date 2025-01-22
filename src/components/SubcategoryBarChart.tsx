import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface SubcategoryBarChartProps {
  selectedCategory: string | null;
}

export const SubcategoryBarChart = ({ selectedCategory }: SubcategoryBarChartProps) => {
  const { data: subcategoryData, isLoading } = useQuery({
    queryKey: ['subcategories', selectedCategory],
    queryFn: async () => {
      if (!selectedCategory) return [];

      const { data, error } = await supabase
        .from('ticket_analysis')
        .select('subcategory')
        .eq('category', selectedCategory)
        .not('subcategory', 'is', null);

      if (error) throw error;

      // Count occurrences of each subcategory
      const subcategoryCounts = data.reduce((acc, curr) => {
        if (curr.subcategory) {
          acc[curr.subcategory] = (acc[curr.subcategory] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>);

      // Convert to array format needed for chart
      return Object.entries(subcategoryCounts)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value);
    },
    enabled: !!selectedCategory
  });

  if (!selectedCategory) return null;

  if (isLoading) {
    return (
      <Card className="p-8 rounded-3xl">
        <div>Loading subcategories...</div>
      </Card>
    );
  }

  return (
    <Card className="p-8 rounded-3xl mt-6">
      <div className="space-y-6">
        <div className="space-y-2">
          <h3 className="text-xl font-medium text-black">
            Subcategories for {selectedCategory}
          </h3>
          <p className="text-base text-gray-600">Distribution of subcategories</p>
        </div>

        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={subcategoryData}>
              <XAxis 
                dataKey="name" 
                angle={-45}
                textAnchor="end"
                height={70}
                interval={0}
                tick={{ fontSize: 12 }}
              />
              <YAxis />
              <Tooltip />
              <Bar 
                dataKey="value" 
                fill="#E88D7D"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Card>
  );
};