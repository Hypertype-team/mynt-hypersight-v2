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
import { Search, Layers, FolderTree, FileText, MessageSquare } from "lucide-react";
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

  // Filter and group tickets
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
          <Accordion type="single" collapsible className="space-y-4">
            {Object.entries(groupedTickets || {}).map(([category, { subcategories, count }]) => (
              <AccordionItem 
                key={category} 
                value={category} 
                className="border rounded-lg px-4 hover:bg-accent/50 transition-colors"
              >
                <AccordionTrigger className="hover:no-underline py-4">
                  <div className="flex flex-col items-start text-left">
                    <div className="font-medium text-lg">{category}</div>
                    <div className="text-sm text-muted-foreground flex items-center gap-1">
                      <FileText className="h-4 w-4" />
                      {count} {count === 1 ? 'ticket' : 'tickets'}
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="pl-4 space-y-4">
                    {Object.entries(subcategories).map(([subcategory, { commonIssues, count: subCount }]) => (
                      <Accordion key={subcategory} type="single" collapsible className="border-l">
                        <AccordionItem value={subcategory} className="border-none">
                          <AccordionTrigger className="hover:no-underline rounded-md hover:bg-accent/30 px-4">
                            <div className="flex flex-col items-start text-left">
                              <div className="font-medium">{subcategory}</div>
                              <div className="text-sm text-muted-foreground">
                                {subCount} {subCount === 1 ? 'ticket' : 'tickets'}
                              </div>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="pl-4 space-y-4">
                              {Object.entries(commonIssues).map(([commonIssue, { tickets, count: issueCount }]) => (
                                <Accordion key={commonIssue} type="single" collapsible className="border-l">
                                  <AccordionItem value={commonIssue} className="border-none">
                                    <AccordionTrigger className="hover:no-underline rounded-md hover:bg-accent/20 px-4">
                                      <div className="flex flex-col items-start text-left">
                                        <div className="font-medium">{commonIssue}</div>
                                        <div className="text-sm text-muted-foreground">
                                          {issueCount} {issueCount === 1 ? 'ticket' : 'tickets'}
                                        </div>
                                      </div>
                                    </AccordionTrigger>
                                    <AccordionContent>
                                      <div className="pl-4 space-y-6">
                                        {tickets.map((ticket) => (
                                          <div 
                                            key={ticket.id} 
                                            className="border-l p-6 bg-card hover:bg-accent/5 transition-colors rounded-lg shadow-sm"
                                          >
                                            <div className="space-y-4">
                                              <div>
                                                <div className="font-medium mb-2 text-lg flex items-center gap-2">
                                                  Ticket #{ticket.id}
                                                  {ticket.priority && (
                                                    <Badge variant={ticket.priority.toLowerCase() === 'high' ? 'destructive' : 'secondary'}>
                                                      {ticket.priority}
                                                    </Badge>
                                                  )}
                                                </div>
                                                <p className="text-muted-foreground">
                                                  {ticket.issue_summary || "No summary available"}
                                                </p>
                                              </div>

                                              <div>
                                                <div className="font-medium mb-2">Issue Details:</div>
                                                <p className="text-muted-foreground">
                                                  {ticket.issue || "No issue details available"}
                                                </p>
                                              </div>

                                              <div>
                                                <div className="font-medium mb-2">Responsible Department:</div>
                                                <Badge variant="outline" className="mb-2">
                                                  {ticket.responsible_department || "Unassigned"}
                                                </Badge>
                                                {ticket.responsible_department_justification && (
                                                  <p className="text-sm text-muted-foreground mt-2">
                                                    {ticket.responsible_department_justification}
                                                  </p>
                                                )}
                                              </div>

                                              <div className="flex gap-2 flex-wrap">
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

                                              {ticket.link && (
                                                <div>
                                                  <a
                                                    href={ticket.link}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-primary hover:underline inline-flex items-center gap-1"
                                                  >
                                                    View Issue
                                                  </a>
                                                </div>
                                              )}
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </AccordionContent>
                                  </AccordionItem>
                                </Accordion>
                              ))}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </ScrollArea>
      </div>
    </Card>
  );
};