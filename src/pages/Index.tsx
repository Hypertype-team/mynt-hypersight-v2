import { useQuery } from "@tanstack/react-query";
import { Layout } from "@/components/Layout";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";

const Index = () => {
  const { toast } = useToast();

  const { data: tickets, isLoading, error } = useQuery({
    queryKey: ["tickets"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ticket_analysis")
        .select("*");
      
      if (error) {
        toast({
          title: "Error fetching tickets",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }
      
      return data;
    },
  });

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
          <p className="text-muted-foreground">Loading tickets...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Ticket Analysis</h1>
          <p className="text-muted-foreground">
            View and analyze your ticket data
          </p>
        </div>
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Company</TableHead>
                <TableHead>Issue</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>State</TableHead>
                <TableHead>Sentiment</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tickets?.map((ticket) => (
                <TableRow key={ticket.id}>
                  <TableCell>{ticket.company_name || "N/A"}</TableCell>
                  <TableCell>{ticket.issue || "N/A"}</TableCell>
                  <TableCell>{ticket.category || "N/A"}</TableCell>
                  <TableCell>{ticket.priority || "N/A"}</TableCell>
                  <TableCell>{ticket.state || "N/A"}</TableCell>
                  <TableCell>{ticket.sentiment || "N/A"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>
    </Layout>
  );
};

export default Index;