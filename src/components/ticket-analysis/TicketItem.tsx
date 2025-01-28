import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

interface TicketItemProps {
  ticket: any;
  index: number;
}

export const TicketItem = ({ ticket, index }: TicketItemProps) => {
  return (
    <div className="pl-6 border-l-2 border-purple-200 bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-medium text-gray-900 flex items-center gap-2">
          <span className="bg-purple-100 text-purple-800 text-sm px-2 py-1 rounded-full">
            Ticket {index + 1}
          </span>
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
  );
};