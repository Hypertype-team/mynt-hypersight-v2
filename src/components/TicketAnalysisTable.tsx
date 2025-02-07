import { Card } from "@/components/ui/card";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { TicketFilters } from "./ticket-analysis/TicketFilters";
import { LoadingState } from "./ticket-analysis/LoadingState";
import { TicketList } from "./ticket-analysis/TicketList";
import { useTicketData } from "@/hooks/useTicketData";
import { 
  getFilteredTickets, 
  getCategoriesWithCounts, 
  getThemesWithCounts,
  groupTicketsByIssue 
} from "./ticket-analysis/TicketFilterLogic";

export const TicketAnalysisTable = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedTheme, setSelectedTheme] = useState<string>("");
  const [selectedDepartment, setSelectedDepartment] = useState<string>("All");
  const [sortAscending, setSortAscending] = useState(false);
  const [expandedTickets, setExpandedTickets] = useState<string[]>([]);
  const { toast } = useToast();

  const { data: ticketsData, isLoading, refetch } = useTicketData();

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

  const allTickets = ticketsData?.tickets || [];
  const totalTickets = allTickets.length;

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
          filteredCount={filteredTickets.length}
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

      <TicketList
        selectedTheme={selectedTheme}
        filteredTickets={filteredTickets}
        groupedByIssue={groupedByIssue}
        sortedIssues={sortedIssues}
        expandedTickets={expandedTickets}
        setExpandedTickets={setExpandedTickets}
      />
    </div>
  );
};