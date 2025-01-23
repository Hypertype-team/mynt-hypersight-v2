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
import { Search } from "lucide-react";

export const TicketAnalysisTable = () => {
  const [categoryFilter, setCategoryFilter] = useState("");
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
        <p>Loading ticket analysis data...</p>
      </Card>
    );
  }

  // Filter and group tickets
  const groupedTickets = data?.reduce((categories, ticket) => {
    const category = ticket.category || "Uncategorized";
    const subcategory = ticket.subcategory || "Uncategorized";
    const commonIssue = ticket.common_issue || "Uncategorized";

    // Apply filters
    if (
      categoryFilter &&
      !category.toLowerCase().includes(categoryFilter.toLowerCase())
    )
      return categories;
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

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Ticket Analysis</h2>
          <p className="text-muted-foreground">
            Hierarchical view of support tickets and their analysis
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Filter by category..."
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="pl-8"
            />
          </div>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Filter by subcategory..."
              value={subcategoryFilter}
              onChange={(e) => setSubcategoryFilter(e.target.value)}
              className="pl-8"
            />
          </div>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
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
              <AccordionItem key={category} value={category} className="border rounded-lg px-4">
                <AccordionTrigger className="hover:no-underline py-4">
                  <div className="flex flex-col items-start text-left">
                    <div className="font-medium">{category}</div>
                    <div className="text-sm text-muted-foreground">
                      {count} {count === 1 ? 'ticket' : 'tickets'}
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="pl-4 space-y-4">
                    {Object.entries(subcategories).map(([subcategory, { commonIssues, count: subCount }]) => (
                      <Accordion key={subcategory} type="single" collapsible className="border-l">
                        <AccordionItem value={subcategory}>
                          <AccordionTrigger className="hover:no-underline">
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
                                  <AccordionItem value={commonIssue}>
                                    <AccordionTrigger className="hover:no-underline">
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
                                          <div key={ticket.id} className="border-l p-6 bg-accent/50 rounded-lg">
                                            <div className="space-y-4">
                                              <div>
                                                <div className="font-medium mb-2 text-lg">
                                                  Ticket #{ticket.id}
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
                                                <Badge variant="secondary" className="mb-2">
                                                  {ticket.responsible_department || "Unassigned"}
                                                </Badge>
                                                {ticket.responsible_department_justification && (
                                                  <p className="text-sm text-muted-foreground">
                                                    {ticket.responsible_department_justification}
                                                  </p>
                                                )}
                                              </div>

                                              <div className="flex gap-2 flex-wrap">
                                                {ticket.priority && (
                                                  <Badge variant="outline">Priority: {ticket.priority}</Badge>
                                                )}
                                                {ticket.sentiment && (
                                                  <Badge variant="outline">Sentiment: {ticket.sentiment}</Badge>
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