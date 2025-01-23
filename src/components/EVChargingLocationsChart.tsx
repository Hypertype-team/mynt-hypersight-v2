import { PieChart, Pie, Cell, ResponsiveContainer, Label } from "recharts";
import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

const COLORS = ["#8B5CF6", "#D946EF", "#F97316", "#0EA5E9", "#2DD4BF"];
const ACTIVE_OPACITY = 1;
const INACTIVE_OPACITY = 0.5;

export const EVChargingLocationsChart = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedCount, setSelectedCount] = useState<number | null>(null);
  const [subcategories, setSubcategories] = useState<string[]>([]);

  const { data: categoryData, isLoading } = useQuery({
    queryKey: ['ticket-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ticket_analysis')
        .select('category')
        .not('category', 'is', null);

      if (error) throw error;

      const categoryCounts = data.reduce((acc, curr) => {
        if (curr.category) {
          acc[curr.category] = (acc[curr.category] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>);

      const chartData = Object.entries(categoryCounts)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5);

      return chartData;
    }
  });

  const handlePieClick = async (data: any) => {
    setSelectedCategory(data.name);
    setSelectedCount(data.value);

    const { data: subcategoryData, error } = await supabase
      .from('ticket_analysis')
      .select('subcategory')
      .eq('category', data.name)
      .not('subcategory', 'is', null);

    if (!error && subcategoryData.length > 0) {
      const uniqueSubcategories = Array.from(new Set(
        subcategoryData
          .map(item => item.subcategory)
          .filter((subcategory): subcategory is string => subcategory !== null)
      ));
      setSubcategories(uniqueSubcategories.sort());
    } else {
      setSubcategories([]);
    }
  };

  useEffect(() => {
    if (categoryData && categoryData.length > 0 && !selectedCategory) {
      handlePieClick(categoryData[0]);
    }
  }, [categoryData]);

  const total = categoryData?.reduce((sum, item) => sum + item.value, 0) || 0;

  if (isLoading) {
    return (
      <Card className="p-6 bg-gradient-to-br from-[#F1F0FB] to-[#FEF7CD]/20">
        <div>Loading...</div>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-gradient-to-br from-[#F1F0FB] to-[#FEF7CD]/20">
      <div className="space-y-4">
        <div className="bg-white/50 rounded-lg p-4">
          <h3 className="text-xl font-medium text-[#222222]">
            Top Issue Categories Distribution
          </h3>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-semibold text-[#8B5CF6]">{total}</p>
            <span className="text-sm text-[#8E9196]">total issues analyzed</span>
          </div>
        </div>

        <div className="flex gap-4">
          <div className="flex-1 bg-white/30 rounded-lg p-4">
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius="60%"
                    outerRadius="85%"
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
                        opacity={entry.name === selectedCategory ? ACTIVE_OPACITY : INACTIVE_OPACITY}
                      />
                    ))}
                    <Label
                      content={({ viewBox }: { viewBox: { cx: number; cy: number } }) => {
                        return (
                          <>
                            <text
                              x={viewBox.cx}
                              y={viewBox.cy - 10}
                              textAnchor="middle"
                              dominantBaseline="middle"
                              className="fill-[#222222] font-medium text-2xl"
                            >
                              {selectedCount || categoryData?.[0]?.value || 0}
                            </text>
                            <text
                              x={viewBox.cx}
                              y={viewBox.cy + 15}
                              textAnchor="middle"
                              dominantBaseline="middle"
                              className="fill-[#8E9196] text-sm"
                            >
                              tickets
                            </text>
                          </>
                        );
                      }}
                    />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-4">
              {categoryData?.map((item, index) => (
                <div 
                  key={index} 
                  className="flex items-center gap-2 cursor-pointer hover:bg-white/50 p-2 rounded-md transition-all duration-200"
                  onClick={() => handlePieClick(item)}
                >
                  <div
                    className="w-3 h-3 rounded"
                    style={{ 
                      backgroundColor: COLORS[index % COLORS.length],
                      opacity: item.name === selectedCategory ? ACTIVE_OPACITY : INACTIVE_OPACITY
                    }}
                  />
                  <span className="text-sm text-[#222222]">{item.name}</span>
                </div>
              ))}
            </div>
          </div>

          {selectedCategory && (
            <div className="w-64 bg-white/50 rounded-lg self-stretch backdrop-blur-sm">
              <div className="p-3 border-b border-[#E5DEFF]">
                <h4 className="font-medium text-[#222222]">{selectedCategory}</h4>
                <p className="text-sm text-[#8E9196]">
                  {selectedCount} tickets ({((selectedCount! / total) * 100).toFixed(1)}%)
                </p>
              </div>
              <div className="p-3">
                <h5 className="text-sm font-medium mb-2 text-[#222222]">Subcategories</h5>
                <ScrollArea className="h-[180px] pr-4">
                  {subcategories.length > 0 ? (
                    <div className="space-y-1.5">
                      {subcategories.map((subcategory, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="px-2 py-1 w-full justify-start font-normal text-xs bg-white/70 hover:bg-white transition-colors"
                        >
                          {subcategory}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-[#8E9196] italic">No subcategories found</p>
                  )}
                </ScrollArea>
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};