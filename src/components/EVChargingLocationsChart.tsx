import { PieChart, Pie, Cell, ResponsiveContainer, Label } from "recharts";
import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";

const COLORS = ["#E88D7D", "#FDE1D3", "#FFDEE2", "#E5DEFF", "#D8E1FF"];

export const EVChargingLocationsChart = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [topIssue, setTopIssue] = useState<string | null>(null);
  const [selectedCount, setSelectedCount] = useState<number | null>(null);

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

  const handlePieClick = async (data: any) => {
    setSelectedCategory(data.name);
    setSelectedCount(data.value);

    // Fetch top issue for selected category
    const { data: issueData, error } = await supabase
      .from('ticket_analysis')
      .select('issue')
      .eq('category', data.name)
      .not('issue', 'is', null);

    if (!error && issueData.length > 0) {
      // Count occurrences of each issue
      const issueCounts = issueData.reduce((acc, curr) => {
        if (curr.issue) {
          acc[curr.issue] = (acc[curr.issue] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>);

      // Get the most common issue
      const topIssue = Object.entries(issueCounts)
        .sort((a, b) => b[1] - a[1])[0];
      
      setTopIssue(topIssue[0]);
    }
  };

  const total = categoryData?.reduce((sum, item) => sum + item.value, 0) || 0;

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

        <div className="flex gap-6">
          <div className="h-[300px] flex-1">
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

          {selectedCategory && topIssue && (
            <div className="w-64 p-4 bg-gray-50 rounded-lg self-center">
              <h4 className="font-medium text-sm text-gray-600 mb-2">{selectedCategory}</h4>
              <p className="text-sm font-semibold mb-2">Count: {selectedCount} tickets ({((selectedCount! / total) * 100).toFixed(1)}%)</p>
              <div>
                <h5 className="text-sm text-gray-600 mb-1">Top Issue:</h5>
                <p className="text-sm text-gray-900">{topIssue}</p>
              </div>
            </div>
          )}
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