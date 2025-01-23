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

export const TicketAnalysisTable = () => {
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

  // Group tickets by category, subcategory, and common_issue
  const groupedTickets = data?.reduce((categories, ticket) => {
    const category = ticket.category || "Uncategorized";
    const subcategory = ticket.subcategory || "Uncategorized";
    const commonIssue = ticket.common_issue || "Uncategorized";

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

        <ScrollArea className="h-[800px] pr-4">
          <Accordion type="single" collapsible className="space-y-4">
            {Object.entries(groupedTickets || {}).map(([category, { subcategories, count }]) => (
              <AccordionItem key={category} value={category}>
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex flex-col items-start text-left">
                    <div className="font-medium">{category}</div>
                    <div className="text-sm text-muted-foreground">
                      {count} tickets
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
                                {subCount} tickets
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
                                          {issueCount} tickets
                                        </div>
                                      </div>
                                    </AccordionTrigger>
                                    <AccordionContent>
                                      <div className="pl-4 space-y-4">
                                        {tickets.map((ticket) => (
                                          <div key={ticket.id} className="border-l p-4">
                                            <div className="space-y-4">
                                              <div>
                                                <div className="font-medium mb-2">
                                                  Ticket #{ticket.id}: {ticket.issue_summary}
                                                </div>
                                                <p className="text-muted-foreground">
                                                  {ticket.summary || "No summary available"}
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
                                                <Badge variant="secondary">
                                                  {ticket.responsible_department || "Unassigned"}
                                                </Badge>
                                                {ticket.responsible_department_justification && (
                                                  <p className="text-sm text-muted-foreground mt-2">
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
                                                    className="text-primary hover:underline"
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