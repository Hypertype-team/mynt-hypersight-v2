import { ScrollArea } from "@/components/ui/scroll-area";
import { TicketCard } from "./TicketCard";

interface Ticket {
  id: string;
  priority?: string;
  sentiment?: string;
  issue_summary?: string;
}

interface CommonIssueGroupProps {
  commonIssue: string;
  tickets: Ticket[];
}

export const CommonIssueGroup = ({ commonIssue, tickets }: CommonIssueGroupProps) => {
  return (
    <div className="p-3 rounded-lg bg-background/80 border shadow-sm hover:shadow-md transition-shadow">
      <h4 className="font-medium mb-2 text-primary">{commonIssue}</h4>
      <div className="space-y-2">
        {tickets.map((ticket) => (
          <TicketCard key={ticket.id} ticket={ticket} />
        ))}
      </div>
    </div>
  );
};