import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, ExternalLink } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
} from "@/components/ui/collapsible";

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
                <div key={ticket.id} className="pl-6 border-l-2 border-purple-200 bg-white rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-medium text-gray-900">
                      Ticket {ticketIndex + 1}
                    </h3>
                    {ticket.link && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-purple-600 hover:text-purple-700 hover:bg-purple-50" 
                        asChild
                      >
                        <a href={ticket.link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1">
                          View Issue <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    )}
                  </div>
                  <div className="space-y-3">
                    <div className="bg-gray-50 p-3 rounded-md">
                      <p className="font-medium text-gray-900 mb-1">Ticket Issue:</p>
                      <p className="text-gray-700">{ticket.issue}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-md">
                      <p className="font-medium text-gray-900 mb-1">Ticket Summary:</p>
                      <p className="text-gray-700">{ticket.summary}</p>
                    </div>
                  </div>
                </div>
              ))}
            </CollapsibleContent>
          </Collapsible>
        </div>
      </div>
    </div>
  );
};