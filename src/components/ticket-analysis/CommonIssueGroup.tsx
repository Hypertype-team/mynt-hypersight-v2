import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
} from "@/components/ui/collapsible";
import { TicketCard } from "./TicketCard";

interface CommonIssueGroupProps {
  issue: string;
  count?: number;
  summary?: string;
  department?: string;
  tickets: any[];
  index?: number;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
}

export const CommonIssueGroup = ({
  issue,
  count = 0,
  summary = "",
  department = "",
  tickets,
  index = 0,
  isExpanded = false,
  onToggleExpand = () => {},
}: CommonIssueGroupProps) => {
  return (
    <div className="p-6 bg-white shadow-sm">
      <div className="space-y-4">
        <div className="border-b pb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            {index + 1}. {issue} ({count} tickets)
          </h2>
          {summary && (
            <p className="text-gray-700 mt-2">
              <span className="font-medium">Summary:</span> {summary}
            </p>
          )}
          {department && (
            <p className="text-gray-700">
              <span className="font-medium">Responsible Department:</span> {department}
            </p>
          )}
        </div>
        
        <div className="pt-2">
          <Button
            variant="ghost"
            className="text-gray-700 hover:text-gray-900"
            onClick={onToggleExpand}
          >
            View Tickets {isExpanded ? <ChevronUp className="ml-2 h-4 w-4" /> : <ChevronDown className="ml-2 h-4 w-4" />}
          </Button>
          
          <Collapsible open={isExpanded}>
            <CollapsibleContent className="space-y-4 mt-4">
              {tickets.map((ticket, ticketIndex) => (
                <TicketCard 
                  key={ticket.id} 
                  ticket={ticket} 
                  index={ticketIndex}
                />
              ))}
            </CollapsibleContent>
          </Collapsible>
        </div>
      </div>
    </div>
  );
};