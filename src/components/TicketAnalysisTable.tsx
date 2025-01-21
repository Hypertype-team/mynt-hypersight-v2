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
import { useState } from "react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

export const TicketAnalysisTable = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [analyzingTicketId, setAnalyzingTicketId] = useState<number | null>(null);
  const { toast } = useToast();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["tickets", currentPage, itemsPerPage],
    queryFn: async () => {
      const { count } = await supabase
        .from("ticket_analysis")
        .select("*", { count: "exact", head: true });

      const { data, error } = await supabase
        .from("ticket_analysis")
        .select("*")
        .order("created_at", { ascending: false })
        .range(
          (currentPage - 1) * itemsPerPage,
          currentPage * itemsPerPage - 1
        );

      if (error) throw error;

      return {
        tickets: data,
        totalCount: count || 0,
        totalPages: Math.ceil((count || 0) / itemsPerPage),
      };
    },
  });

  const analyzeTicket = async (ticketId: number, issue: string) => {
    setAnalyzingTicketId(ticketId);
    try {
      const response = await supabase.functions.invoke('analyze-ticket', {
        body: { ticketId, content: issue },
      });

      if (response.error) throw new Error(response.error.message);
      
      await refetch();
      toast({
        title: "Analysis Complete",
        description: "The ticket has been analyzed successfully.",
      });
    } catch (error) {
      console.error('Error analyzing ticket:', error);
      toast({
        title: "Analysis Failed",
        description: "Failed to analyze the ticket. Please try again.",
        variant: "destructive",
      });
    } finally {
      setAnalyzingTicketId(null);
    }
  };

  if (isLoading) {
    return (
      <Card className="p-6">
        <p>Loading ticket analysis data...</p>
      </Card>
    );
  }

  const tickets = data?.tickets || [];
  const totalPages = data?.totalPages || 1;

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(Number(value));
    setCurrentPage(1);
  };

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
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tickets.map((ticket) => (
            <TableRow key={ticket.id}>
              <TableCell>{ticket.company_name || "N/A"}</TableCell>
              <TableCell>{ticket.category || "N/A"}</TableCell>
              <TableCell>{ticket.issue_summary || "N/A"}</TableCell>
              <TableCell>{ticket.priority || "N/A"}</TableCell>
              <TableCell>{ticket.sentiment || "N/A"}</TableCell>
              <TableCell>{ticket.responsible_department || "N/A"}</TableCell>
              <TableCell>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => analyzeTicket(ticket.id, ticket.issue || "")}
                  disabled={analyzingTicketId === ticket.id || !ticket.issue}
                >
                  {analyzingTicketId === ticket.id ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing
                    </>
                  ) : (
                    "Analyze"
                  )}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Items per page:</span>
          <Select
            value={String(itemsPerPage)}
            onValueChange={handleItemsPerPageChange}
          >
            <SelectTrigger className="w-[100px]">
              <SelectValue placeholder="10" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5</SelectItem>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Pagination>
          <PaginationContent>
            {currentPage > 1 && (
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setCurrentPage((prev) => Math.max(1, prev - 1));
                  }}
                />
              </PaginationItem>
            )}
            <PaginationItem>
              <span className="px-4 py-2">
                Page {currentPage} of {totalPages}
              </span>
            </PaginationItem>
            {currentPage < totalPages && (
              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setCurrentPage((prev) => Math.min(totalPages, prev + 1));
                  }}
                />
              </PaginationItem>
            )}
          </PaginationContent>
        </Pagination>
      </div>
    </Card>
  );
};