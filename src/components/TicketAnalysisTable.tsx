import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

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
        <div className="flex items-center justify-center h-64 text-muted-foreground">
          <p>Loading ticket analysis data...</p>
        </div>
      </Card>
    );
  }

  // Group tickets by category and subcategory
  const groupedTickets = data?.reduce((acc, ticket) => {
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
        {Object.entries(groupedTickets || {}).map(([category, { tickets, count }]) => (
          <div key={category} className="space-y-4">
            <div className="border-b pb-2">
              <h2 className="text-xl font-semibold">
                {category} ({count} total tickets)
              </h2>
            </div>
            
            {tickets.map((ticket, index) => (
              <div key={ticket.id} className="space-y-4">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium">Ticket {index + 1}:</h3>
                    <Button variant="link" size="sm" className="text-blue-600">
                      View Issue
                    </Button>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <p className="font-medium">Ticket Issue:</p>
                      <p className="text-muted-foreground">{ticket.issue}</p>
                    </div>
                    <div>
                      <p className="font-medium">Ticket Summary:</p>
                      <p className="text-muted-foreground">{ticket.issue_summary}</p>
                    </div>
                  </div>
                </div>
                {index < tickets.length - 1 && <hr className="my-4" />}
              </div>
            ))}
          </div>
        ))}
      </div>
    </Card>
  );
};