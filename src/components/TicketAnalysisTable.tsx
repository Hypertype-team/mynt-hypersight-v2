import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState } from "react";
import { TicketFilters } from "./ticket-analysis/TicketFilters";
import { CategoryGroup } from "./ticket-analysis/CategoryGroup";

export const TicketAnalysisTable = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [subcategoryFilter, setSubcategoryFilter] = useState("");
  const [commonIssueFilter, setCommonIssueFilter] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["tickets"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ticket_analysis")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center h-64 text-muted-foreground">
          <p>Loading ticket analysis data...</p>
        </div>
      </Card>
    );
  }

  const groupedTickets = data?.reduce((categories, ticket) => {
    const category = ticket.category || "Uncategorized";
    const subcategory = ticket.subcategory || "Uncategorized";
    const commonIssue = ticket.common_issue || "Uncategorized";

    if (selectedCategory !== "all" && category !== selectedCategory) return categories;
    if (
      subcategoryFilter &&
      !subcategory.toLowerCase().includes(subcategoryFilter.toLowerCase())
    )
      return categories;
    if (
      commonIssueFilter &&
      !commonIssue.toLowerCase().includes(commonIssueFilter.toLowerCase())
    )
      return categories;

    if (!categories[category]) {
      categories[category] = {
        subcategories: {},
        count: 0,
      };
    }

    if (!categories[category].subcategories[subcategory]) {
      categories[category].subcategories[subcategory] = {
        commonIssues: {},
        count: 0,
      };
    }

    if (!categories[category].subcategories[subcategory].commonIssues[commonIssue]) {
      categories[category].subcategories[subcategory].commonIssues[commonIssue] = {
        tickets: [],
        count: 0,
      };
    }

    categories[category].count += 1;
    categories[category].subcategories[subcategory].count += 1;
    categories[category].subcategories[subcategory].commonIssues[commonIssue].count += 1;
    categories[category].subcategories[subcategory].commonIssues[commonIssue].tickets.push(
      ticket
    );

    return categories;
  }, {} as Record<string, {
    subcategories: Record<string, {
      commonIssues: Record<string, {
        tickets: any[];
        count: number;
      }>;
      count: number;
    }>;
    count: number;
  }>);

  const uniqueCategories = Object.keys(groupedTickets || {});

  return (
    <Card className="p-6 border-2">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-primary/80 to-primary bg-clip-text text-transparent">
            Ticket Analysis
          </h2>
          <p className="text-muted-foreground">
            Hierarchical view of support tickets and their analysis
          </p>
        </div>

        <TicketFilters
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          subcategoryFilter={subcategoryFilter}
          setSubcategoryFilter={setSubcategoryFilter}
          commonIssueFilter={commonIssueFilter}
          setCommonIssueFilter={setCommonIssueFilter}
          categories={uniqueCategories}
        />

        <ScrollArea className="h-[calc(100vh-300px)] pr-4 mt-6">
          <div className="space-y-6">
            {Object.entries(groupedTickets || {}).map(([category, { subcategories, count }]) => (
              <CategoryGroup
                key={category}
                category={category}
                count={count}
                subcategories={subcategories}
              />
            ))}
          </div>
        </ScrollArea>
      </div>
    </Card>
  );
};