import { Card } from "@/components/ui/card";
import { CommonIssueGroup } from "./CommonIssueGroup";
import { TicketGroups } from "@/types/ticket";

interface TicketListProps {
  selectedTheme: string;
  filteredTickets: any[];
  groupedByIssue: TicketGroups;
  sortedIssues: [string, { tickets: any[]; count: number; summary: string; department: string }][];
  expandedTickets: string[];
  setExpandedTickets: (tickets: string[]) => void;
}

export const TicketList = ({
  selectedTheme,
  filteredTickets,
  sortedIssues,
  expandedTickets,
  setExpandedTickets,
}: TicketListProps) => {
  return (
    <div className="space-y-6">
      {selectedTheme && (
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-gray-900">
            {selectedTheme}
          </h3>
          <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
            {filteredTickets?.length || 0} tickets
          </span>
        </div>
      )}
      
      {sortedIssues.map(([issue, { tickets, count, summary, department }], index) => (
        <Card key={issue}>
          <CommonIssueGroup
            issue={issue}
            count={count}
            summary={summary}
            department={department}
            tickets={tickets}
            index={index}
            isExpanded={expandedTickets.includes(issue)}
            onToggleExpand={() => setExpandedTickets(prev => 
              prev.includes(issue) 
                ? prev.filter(id => id !== issue)
                : [...prev, issue]
            )}
          />
        </Card>
      ))}
    </div>
  );
};