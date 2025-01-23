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

  // Group tickets by category and count them
  const ticketsByCategory = data?.reduce((acc, ticket) => {
    const category = ticket.category || "Uncategorized";
    if (!acc[category]) {
      acc[category] = {
        tickets: [],
        count: 0,
      };
    }
    acc[category].tickets.push(ticket);
    acc[category].count += 1;
    return acc;
  }, {} as Record<string, { tickets: any[]; count: number }>);

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Ticket Analysis</h2>
          <p className="text-muted-foreground">
            Detailed overview of support tickets and their analysis
          </p>
        </div>

        <ScrollArea className="h-[800px] pr-4">
          {Object.entries(ticketsByCategory || {}).map(([category, { tickets, count }]) => (
            <div key={category} className="mb-8">
              <h3 className="text-xl font-semibold mb-4">
                {category} ({count} total tickets)
              </h3>

              <Accordion type="single" collapsible className="space-y-4">
                {tickets.map((ticket) => (
                  <AccordionItem key={ticket.id} value={`ticket-${ticket.id}`}>
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex flex-col items-start text-left">
                        <div className="font-medium">{ticket.issue_summary}</div>
                        <div className="text-sm text-muted-foreground mt-1">
                          Ticket #{ticket.id}
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="space-y-4 pt-4">
                      <div>
                        <div className="font-medium mb-2">Summary:</div>
                        <p className="text-muted-foreground">
                          {ticket.summary || "No summary available"}
                        </p>
                      </div>

                      <div>
                        <div className="font-medium mb-2">Responsible Department:</div>
                        <Badge variant="secondary">
                          {ticket.responsible_department || "Unassigned"}
                        </Badge>
                      </div>

                      {ticket.responsible_department_justification && (
                        <div>
                          <div className="font-medium mb-2">Department Assignment Justification:</div>
                          <p className="text-muted-foreground">
                            {ticket.responsible_department_justification}
                          </p>
                        </div>
                      )}

                      <div className="flex gap-2 flex-wrap">
                        {ticket.priority && (
                          <Badge variant="outline">Priority: {ticket.priority}</Badge>
                        )}
                        {ticket.sentiment && (
                          <Badge variant="outline">Sentiment: {ticket.sentiment}</Badge>
                        )}
                        {ticket.subcategory && (
                          <Badge variant="outline">Subcategory: {ticket.subcategory}</Badge>
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
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          ))}
        </ScrollArea>
      </div>
    </Card>
  );
};