import { PieChart, Pie, Cell, ResponsiveContainer, Label } from "recharts";
import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";

const COLORS = ["#2B4C7E", "#567B95", "#1A936F", "#114B5F", "#E34F32"];
const ACTIVE_OPACITY = 1;
const INACTIVE_OPACITY = 0.6;

export const EVChargingLocationsChart = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedCount, setSelectedCount] = useState<number | null>(null);
  const [subcategories, setSubcategories] = useState<string[]>([]);
  const [showMoreCharts, setShowMoreCharts] = useState(false);

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

  return (
    <Card className="p-6 pt-8">
      <div className="space-y-4">
        <div>
          <h3 className="text-xl font-medium">
            Top Issue Categories Distribution
          </h3>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-semibold">{total}</p>
            <span className="text-sm text-muted-foreground">total issues analyzed</span>
          </div>
        </div>

        <div className="flex gap-4">
          <div className="w-48 space-y-1 pt-4">
            <p className="text-sm font-medium text-muted-foreground mb-3">Categories</p>
            {categoryData?.map((item, index) => (
              <div 
                key={index} 
                className={`flex items-center gap-2.5 cursor-pointer p-2 rounded-md transition-all
                  ${item.name === selectedCategory 
                    ? 'bg-muted/80 shadow-sm' 
                    : 'hover:bg-muted/50'}`}
                onClick={() => handlePieClick(item)}
              >
                <div
                  className="min-w-[10px] w-2.5 h-2.5 rounded-sm flex-shrink-0"
                  style={{ 
                    backgroundColor: COLORS[index % COLORS.length],
                    opacity: item.name === selectedCategory ? ACTIVE_OPACITY : INACTIVE_OPACITY
                  }}
                />
                <span className={`text-sm ${item.name === selectedCategory ? 'font-medium' : ''} truncate`}>
                  {item.name}
                </span>
              </div>
            ))}
          </div>

          <div className="flex-1 relative">
            <div className="h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius="65%"
                    outerRadius="90%"
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
                              className="fill-foreground font-medium text-2xl"
                            >
                              {selectedCount || categoryData?.[0]?.value || 0}
                            </text>
                            <text
                              x={viewBox.cx}
                              y={viewBox.cy + 15}
                              textAnchor="middle"
                              dominantBaseline="middle"
                              className="fill-muted-foreground text-sm"
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
            <Button
              variant="outline"
              className="absolute top-4 right-4"
              onClick={() => setShowMoreCharts(!showMoreCharts)}
            >
              Want more charts?
            </Button>
          </div>

          {selectedCategory && (
            <div className="flex-1 bg-muted/30 rounded-lg self-stretch">
              <div className="p-3 border-b">
                <h4 className="font-medium">{selectedCategory}</h4>
                <p className="text-sm text-muted-foreground">
                  {selectedCount} tickets ({((selectedCount! / total) * 100).toFixed(1)}%)
                </p>
              </div>
              <div className="p-3">
                <h5 className="text-sm font-medium mb-2">Subcategories</h5>
                <ScrollArea className="h-[180px] pr-4">
                  {subcategories.length > 0 ? (
                    <div className="space-y-1.5">
                      {subcategories.map((subcategory, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="px-2 py-1 w-full justify-start font-normal text-xs"
                        >
                          {subcategory}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">No subcategories found</p>
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
