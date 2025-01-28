import { Layout } from "@/components/Layout";
import { TicketAnalysisTable } from "@/components/TicketAnalysisTable";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useState } from "react";
import { TicketFilters } from "@/components/ticket-analysis/TicketFilters";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Maximize2, Minimize2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Index = () => {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [subcategoryFilter, setSubcategoryFilter] = useState("");
  const [commonIssueFilter, setCommonIssueFilter] = useState("");
  const [isFiltersExpanded, setIsFiltersExpanded] = useState(false);

  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">HyperSight Dashboard</h1>
        
        <div className="space-y-4">
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
                />
              </CollapsibleContent>
            </Collapsible>
          </Card>

          <TicketAnalysisTable />
        </div>
      </div>
    </Layout>
  );
};

export default Index;