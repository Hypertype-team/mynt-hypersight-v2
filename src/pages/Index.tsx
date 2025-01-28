import { Layout } from "@/components/Layout";
import { TicketAnalysisTable } from "@/components/TicketAnalysisTable";
import { CategoryBreakdownChart } from "@/components/CategoryBreakdownChart";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Maximize2, Minimize2, X } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { TicketFilters } from "@/components/ticket-analysis/TicketFilters";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

const Index = () => {
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState("Dec 01 - Dec 15");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [subcategoryFilter, setSubcategoryFilter] = useState("");
  const [commonIssueFilter, setCommonIssueFilter] = useState("");
  const [isFiltersExpanded, setIsFiltersExpanded] = useState(false);

  const { data: dashboardData } = useQuery({
    queryKey: ["dashboard-info"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ticket_analysis")
        .select("*");
      
      if (error) throw error;
      return data;
    },
  });

  const categories = dashboardData ? 
    Object.entries(
      dashboardData.reduce((acc, ticket) => {
        const category = ticket.category || 'Uncategorized';
        acc[category] = (acc[category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    ).map(([name, count]) => ({ name, count }))
    : [];

  const totalTickets = dashboardData?.length || 0;

  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">HyperSight Dashboard</h1>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <div>
                <span className="font-medium">Total Tickets: </span>
                <span>{totalTickets}</span>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Report Period</p>
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger>
                  <SelectValue>{selectedPeriod}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Dec 01 - Dec 15">Dec 01 - Dec 15</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Card className="border-2 shadow-lg">
            <Collapsible open={isFiltersExpanded} onOpenChange={setIsFiltersExpanded}>
              <div className="flex justify-between items-center p-4">
                <h3 className="font-semibold">Filters</h3>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                    {isFiltersExpanded ? (
                      <Minimize2 className="h-4 w-4" />
                    ) : (
                      <Maximize2 className="h-4 w-4" />
                    )}
                  </Button>
                </CollapsibleTrigger>
              </div>
              <CollapsibleContent className="px-4 pb-4">
                <TicketFilters
                  selectedCategory={selectedCategory}
                  setSelectedCategory={setSelectedCategory}
                  subcategoryFilter={subcategoryFilter}
                  setSubcategoryFilter={setSubcategoryFilter}
                  commonIssueFilter={commonIssueFilter}
                  setCommonIssueFilter={setCommonIssueFilter}
                  categories={categories}
                />
              </CollapsibleContent>
            </Collapsible>
          </Card>

          <TicketAnalysisTable />

          {showAnalysis && (
            <>
              <div 
                className="fixed inset-0 bg-black/20 z-40"
                onClick={() => setShowAnalysis(false)}
              />
              <div className="fixed top-0 right-0 w-full md:w-1/2 h-full bg-background p-6 shadow-lg animate-slideIn z-50">
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-4 top-4"
                  onClick={() => setShowAnalysis(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
                <CategoryBreakdownChart showAnalysisPanel={true} />
              </div>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Index;