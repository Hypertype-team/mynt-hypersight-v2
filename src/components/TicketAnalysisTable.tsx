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
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

const ITEMS_PER_PAGE = 10;

export const TicketAnalysisTable = () => {
  const [currentPage, setCurrentPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["tickets", currentPage],
    queryFn: async () => {
      // First, get total count
      const { count } = await supabase
        .from("ticket_analysis")
        .select("*", { count: "exact", head: true });

      // Then get paginated data
      const { data, error } = await supabase
        .from("ticket_analysis")
        .select("*")
        .order("created_at", { ascending: false })
        .range((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE - 1);

      if (error) throw error;

      return {
        tickets: data,
        totalCount: count || 0,
        totalPages: Math.ceil((count || 0) / ITEMS_PER_PAGE),
      };
    },
  });

  if (isLoading) {
    return (
      <Card className="p-6">
        <p>Loading ticket analysis data...</p>
      </Card>
    );
  }

  const tickets = data?.tickets || [];
  const totalPages = data?.totalPages || 1;

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
          {tickets.map((ticket) => (
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
      <div className="p-4">
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
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <PaginationItem key={page}>
                <PaginationLink
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setCurrentPage(page);
                  }}
                  isActive={currentPage === page}
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            ))}
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