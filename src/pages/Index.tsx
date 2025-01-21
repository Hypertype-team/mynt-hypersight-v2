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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TicketCharts } from "@/components/TicketCharts";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

const Index = () => {
  const { toast } = useToast();

  const { data: tickets, isLoading, error, refetch } = useQuery({
    queryKey: ["tickets"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ticket_analysis")
        .select("*")
        .order('created_at', { ascending: false });
      
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
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const handleRefresh = async () => {
    toast({
      title: "Refreshing data...",
    });
    await refetch();
    toast({
      title: "Data refreshed",
      description: "The latest ticket data has been loaded.",
    });
  };

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
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Ticket Analysis</h1>
            <p className="text-muted-foreground">
              View and analyze your ticket data
            </p>
          </div>
          <Button
            onClick={handleRefresh}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh Data
          </Button>
        </div>
        <Tabs defaultValue="table">
          <TabsList>
            <TabsTrigger value="table">Table View</TabsTrigger>
            <TabsTrigger value="charts">Charts</TabsTrigger>
          </TabsList>
          <TabsContent value="table">
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
          </TabsContent>
          <TabsContent value="charts">
            <TicketCharts tickets={tickets || []} />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Index;