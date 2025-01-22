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
import { Card } from "@/components/ui/card";
import { ChevronDown, ChevronUp } from "lucide-react";

export const TicketAnalysisTable = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [expandedTickets, setExpandedTickets] = useState<number[]>([]);

  const { data, isLoading } = useQuery({
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

  const toggleTicketExpansion = (ticketId: number) => {
    setExpandedTickets((prev) =>
      prev.includes(ticketId)
        ? prev.filter((id) => id !== ticketId)
        : [...prev, ticketId]
    );
  };

  return (
    <div className="space-y-4 w-full max-w-[calc(100%-24rem)]">
      {tickets.map((ticket) => (
        <Card key={ticket.id} className="p-6">
          <div 
            className="flex items-center justify-between cursor-pointer"
            onClick={() => toggleTicketExpansion(ticket.id)}
          >
            <div>
              <h3 className="text-lg font-semibold">
                {ticket.issue_summary || "No Issue Summary"}
              </h3>
              <p className="text-sm text-muted-foreground">
                {ticket.company_name || "No Company Name"}
              </p>
            </div>
            {expandedTickets.includes(ticket.id) ? (
              <ChevronUp className="h-5 w-5" />
            ) : (
              <ChevronDown className="h-5 w-5" />
            )}
          </div>

          {expandedTickets.includes(ticket.id) && (
            <div className="mt-4 space-y-3 border-t pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">State</p>
                  <p className="text-sm text-muted-foreground">{ticket.state || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Read Status</p>
                  <p className="text-sm text-muted-foreground">
                    {ticket.read ? "Read" : "Unread"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Priority</p>
                  <p className="text-sm text-muted-foreground">{ticket.priority || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Sentiment</p>
                  <p className="text-sm text-muted-foreground">{ticket.sentiment || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Category</p>
                  <p className="text-sm text-muted-foreground">{ticket.category || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Department</p>
                  <p className="text-sm text-muted-foreground">
                    {ticket.responsible_department || "N/A"}
                  </p>
                </div>
              </div>
              
              <div>
                <p className="text-sm font-medium">Summary</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {ticket.summary || "No summary available"}
                </p>
              </div>
            </div>
          )}
        </Card>
      ))}

      <div className="flex items-center justify-between mt-4">
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
    </div>
  );
};