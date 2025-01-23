import { PieChart, Pie, Cell, ResponsiveContainer, Label } from "recharts";
import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

const COLORS = ["#E34F32", "#2B4C7E", "#567B95", "#1A936F", "#114B5F"];
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
      <Card className="p-8 rounded-3xl">
        <div>Loading...</div>
      </Card>
    );
  }

  return (
    <div className="relative">
      <div className={`transition-all duration-300 ${selectedCategory ? 'md:w-1/2' : 'w-full'}`}>
        <Card className="p-8 rounded-3xl h-full">
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
                              className="fill-black font-medium text-2xl"
                            >
                              {selectedCount || categoryData?.[0]?.value || 0}
                            </text>
                            <text
                              x={viewBox.cx}
                              y={viewBox.cy + 15}
                              textAnchor="middle"
                              dominantBaseline="middle"
                              className="fill-gray-500 text-sm"
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

            <div className="grid grid-cols-2 gap-4">
              {categoryData?.map((item, index) => (
                <div 
                  key={index} 
                  className="flex items-center gap-2 cursor-pointer hover:opacity-80"
                  onClick={() => handlePieClick(item)}
                >
                  <div
                    className="w-3 h-3 rounded"
                    style={{ 
                      backgroundColor: COLORS[index % COLORS.length],
                      opacity: item.name === selectedCategory ? ACTIVE_OPACITY : INACTIVE_OPACITY
                    }}
                  />
                  <span className="text-sm text-gray-600">{item.name}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {selectedCategory && (
        <div className="fixed top-0 right-0 h-screen w-72 bg-background border-l animate-slideIn">
          <div className="p-4 border-b border-gray-200">
            <h4 className="font-medium text-gray-900">{selectedCategory}</h4>
            <p className="text-sm text-gray-600 mt-1">
              {selectedCount} tickets ({((selectedCount! / total) * 100).toFixed(1)}%)
            </p>
          </div>
          <div className="p-4">
            <h5 className="text-sm font-medium text-gray-700 mb-3">Subcategories</h5>
            <ScrollArea className="h-[calc(100vh-180px)] pr-4">
              {subcategories.length > 0 ? (
                <div className="space-y-2">
                  {subcategories.map((subcategory, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="px-3 py-1 w-full justify-start font-normal text-sm"
                    >
                      {subcategory}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 italic">No subcategories found</p>
              )}
            </ScrollArea>
          </div>
        </div>
      )}
    </div>
  );
};