import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const TicketAnalysisTable = () => {
  const { data: tickets, isLoading } = useQuery({
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

  return (
    <Card>
      <div className="p-6 pb-0">
        <h3 className="text-lg font-semibold">Ticket Analysis</h3>
        <p className="text-sm text-muted-foreground">Overview of analyzed tickets</p>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Company</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Issue</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Sentiment</TableHead>
            <TableHead>Department</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tickets?.map((ticket) => (
            <TableRow key={ticket.id}>
              <TableCell>{ticket.company_name || "N/A"}</TableCell>
              <TableCell>{ticket.category || "N/A"}</TableCell>
              <TableCell>{ticket.issue_summary || "N/A"}</TableCell>
              <TableCell>{ticket.priority || "N/A"}</TableCell>
              <TableCell>{ticket.sentiment || "N/A"}</TableCell>
              <TableCell>{ticket.responsible_department || "N/A"}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
};