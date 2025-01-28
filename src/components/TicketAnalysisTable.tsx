import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { TicketFilters } from "./ticket-analysis/TicketFilters";
import { CommonIssueGroup } from "./ticket-analysis/CommonIssueGroup";
import { LoadingState } from "./ticket-analysis/LoadingState";
import { 
  getFilteredTickets, 
  getCategoriesWithCounts, 
  getThemesWithCounts,
  groupTicketsByIssue 
} from "./ticket-analysis/TicketFilterLogic";
import { Ticket, TicketGroups } from "@/types/ticket";

interface TicketData {
  tickets: Ticket[];
  totalCount: number;
}

export const TicketAnalysisTable = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedTheme, setSelectedTheme] = useState<string>("");
  const [selectedDepartment, setSelectedDepartment] = useState<string>("All");
  const [sortAscending, setSortAscending] = useState(false);
  const [expandedTickets, setExpandedTickets] = useState<string[]>([]);
  const { toast } = useToast();

  const { data: ticketsData, isLoading, refetch } = useQuery<TicketData>({
    queryKey: ["tickets"],
    queryFn: async () => {
      console.log("Fetching all tickets...");

      const { data, error, count } = await supabase
        .from("ticket_analysis")
        .select("*", { count: 'exact' })
        .order("created_at", { ascending: false })
        .limit(10000); // Set a higher limit to fetch all tickets

      if (error) {
        toast({
          title: "Error fetching tickets",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }
      
      return { tickets: (data as Ticket[]) || [], totalCount: count || 0 };
    },
  });

  const allTickets = ticketsData?.tickets || [];
  const totalTickets = ticketsData?.totalCount || 0;

  const handleRefresh = async () => {
    toast({
      title: "Refreshing tickets",
      description: "Fetching latest ticket data...",
    });
    await refetch();
    toast({
      title: "Tickets refreshed",
      description: "Latest ticket data has been loaded",
    });
  };

  if (isLoading) return <LoadingState />;

  const reportPeriods = [...new Set(allTickets?.map(ticket => ticket.report_period))];
  const filteredTickets = getFilteredTickets(
    allTickets,
    selectedPeriod,
    selectedCategory,
    selectedTheme,
    selectedDepartment
  );
  
  const categories = getCategoriesWithCounts(filteredTickets);
  const themes = getThemesWithCounts(filteredTickets, selectedCategory, sortAscending);
  const departments = ["All", ...new Set(filteredTickets?.map(ticket => ticket.responsible_department))];
  
  const groupedByIssue = groupTicketsByIssue(filteredTickets);
  const sortedIssues = Object.entries(groupedByIssue || {})
    .sort(([, a], [, b]) => sortAscending ? a.count - b.count : b.count - a.count);

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto">
      <Card className="overflow-hidden">
        <TicketFilters
          totalTickets={totalTickets}
          filteredCount={filteredTickets?.length || 0}
          selectedPeriod={selectedPeriod}
          setSelectedPeriod={setSelectedPeriod}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          selectedTheme={selectedTheme}
          setSelectedTheme={setSelectedTheme}
          selectedDepartment={selectedDepartment}
          setSelectedDepartment={setSelectedDepartment}
          sortAscending={sortAscending}
          setSortAscending={setSortAscending}
          reportPeriods={reportPeriods}
          categories={categories}
          themes={themes}
          departments={departments}
          onRefresh={handleRefresh}
        />
      </Card>

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
    </div>
  );
};