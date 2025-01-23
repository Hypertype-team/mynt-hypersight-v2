import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Search, Layers, FolderTree, FileText, MessageSquare, ChevronDown, Folder, FolderOpen } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

    // Apply filters
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
    categories[category].subcategories[subcategory].commonIssues[commonIssue].tickets.push(ticket);

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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Layers className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
            >
              <SelectTrigger className="pl-8">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {uniqueCategories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="relative">
            <FolderTree className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Filter by subcategory..."
              value={subcategoryFilter}
              onChange={(e) => setSubcategoryFilter(e.target.value)}
              className="pl-8"
            />
          </div>
          <div className="relative">
            <MessageSquare className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Filter by common issue..."
              value={commonIssueFilter}
              onChange={(e) => setCommonIssueFilter(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>

        <ScrollArea className="h-[800px] pr-4">
          <div className="space-y-6">
            {Object.entries(groupedTickets || {}).map(([category, { subcategories, count }]) => (
              <div key={category} className="space-y-4">
                <div className="font-semibold text-lg flex items-center gap-2 text-primary">
                  <Folder className="h-5 w-5" />
                  {category}
                  <Badge variant="outline" className="ml-2">
                    {count} {count === 1 ? 'ticket' : 'tickets'}
                  </Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(subcategories).map(([subcategory, { commonIssues, count: subCount }]) => (
                    <Card 
                      key={subcategory}
                      className="overflow-hidden transition-all duration-200 hover:shadow-lg border-2"
                      style={{ backgroundColor: '#F1F0FB' }}
                    >
                      <Accordion type="single" collapsible>
                        <AccordionItem value={subcategory} className="border-none">
                          <AccordionTrigger className="px-4 py-3 hover:no-underline group">
                            <div className="flex flex-col items-start text-left space-y-1">
                              <div className="font-medium text-primary flex items-center gap-2">
                                {subcategory}
                                <ChevronDown className="h-4 w-4 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                              </div>
                              <div className="text-sm text-muted-foreground flex items-center gap-1">
                                <FileText className="h-4 w-4" />
                                {subCount} {subCount === 1 ? 'ticket' : 'tickets'}
                              </div>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="px-4 pb-4 space-y-3">
                              {Object.entries(commonIssues).map(([commonIssue, { tickets }]) => (
                                <div 
                                  key={commonIssue}
                                  className="p-3 rounded-lg bg-background/80 border shadow-sm hover:shadow-md transition-shadow"
                                >
                                  <h4 className="font-medium mb-2 text-primary">{commonIssue}</h4>
                                  <div className="space-y-2">
                                    {tickets.map((ticket) => (
                                      <div 
                                        key={ticket.id}
                                        className="text-sm text-muted-foreground"
                                      >
                                        <div className="flex items-center gap-2 mb-1">
                                          <Badge 
                                            variant={ticket.priority?.toLowerCase() === 'high' ? 'destructive' : 'secondary'}
                                            className="text-xs"
                                          >
                                            {ticket.priority || 'No Priority'}
                                          </Badge>
                                          {ticket.sentiment && (
                                            <Badge 
                                              variant="outline"
                                              className={
                                                ticket.sentiment.toLowerCase() === 'positive' 
                                                  ? 'bg-green-500/10 text-green-700 border-green-300'
                                                  : ticket.sentiment.toLowerCase() === 'negative'
                                                  ? 'bg-red-500/10 text-red-700 border-red-300'
                                                  : 'bg-yellow-500/10 text-yellow-700 border-yellow-300'
                                              }
                                            >
                                              {ticket.sentiment}
                                            </Badge>
                                          )}
                                        </div>
                                        <p className="line-clamp-2">{ticket.issue_summary}</p>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    </Card>
  );
};
