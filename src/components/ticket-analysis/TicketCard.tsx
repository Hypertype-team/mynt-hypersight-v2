import { Badge } from "@/components/ui/badge";
import { FileText } from "lucide-react";

interface Ticket {
  id: string;
  priority?: string;
  sentiment?: string;
  issue_summary?: string;
}

interface TicketCardProps {
  ticket: Ticket;
}

export const TicketCard = ({ ticket }: TicketCardProps) => {
  return (
    <div key={ticket.id} className="text-sm text-muted-foreground">
      <div className="flex items-center gap-2 mb-1">
        <Badge
          variant={ticket.priority?.toLowerCase() === "high" ? "destructive" : "secondary"}
          className="text-xs"
        >
          {ticket.priority || "No Priority"}
        </Badge>
        {ticket.sentiment && (
          <Badge
            variant="outline"
            className={
              ticket.sentiment.toLowerCase() === "positive"
                ? "bg-green-500/10 text-green-700 border-green-300"
                : ticket.sentiment.toLowerCase() === "negative"
                ? "bg-red-500/10 text-red-700 border-red-300"
                : "bg-yellow-500/10 text-yellow-700 border-yellow-300"
            }
          >
            {ticket.sentiment}
          </Badge>
        )}
      </div>
      <p className="line-clamp-2">{ticket.issue_summary}</p>
    </div>
  );
};