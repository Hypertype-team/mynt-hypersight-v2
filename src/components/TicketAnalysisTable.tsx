import { Card } from "@/components/ui/card";
import { useTicketAnalysis } from "@/hooks/useTicketAnalysis";
import { TicketFilters } from "./ticket-analysis/TicketFilters";
import { TicketGroup } from "./ticket-analysis/TicketGroup";

export const TicketAnalysisTable = () => {
  const {
    selectedPeriod,
    setSelectedPeriod,
    selectedCategory,
    setSelectedCategory,
    selectedTheme,
    setSelectedTheme,
    selectedDepartment,
    setSelectedDepartment,
    sortAscending,
    setSortAscending,
    expandedTickets,
    toggleTickets,
    allTickets,
    filteredTickets,
    isLoading,
    totalCount
  } = useTicketAnalysis();

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center h-64 text-muted-foreground">
          <p>Loading ticket analysis data...</p>
        </div>
      </Card>
    );
  }

  // Get unique values for filters
  const reportPeriods = [...new Set(allTickets?.map(ticket => ticket.report_period))];
  
  // Get categories with counts
  const categories = [...new Set(filteredTickets?.map(ticket => ticket.category))]
    .map(category => ({
      name: category,
      count: filteredTickets?.filter(t => t.category === category).length || 0
    }))
    .sort((a, b) => {
      if (a.name === "Batterier") return -1;
      if (b.name === "Batterier") return 1;
      if (a.name === "Andra") return 1;
      if (b.name === "Andra") return -1;
      return a.name.localeCompare(b.name);
    });

  // Get themes with counts for selected category
  const themes = selectedCategory ? 
    [...new Set(filteredTickets?.filter(t => t.category === selectedCategory)
      .map(ticket => ticket.subcategory))]
      .map(theme => ({
        name: theme,
        count: filteredTickets?.filter(t => t.subcategory === theme).length || 0
      }))
      .sort((a, b) => sortAscending ? a.count - b.count : b.count - a.count)
    : [];

  // Get departments
  const departments = ["All", ...new Set(filteredTickets?.map(ticket => ticket.responsible_department))];

  // Group tickets by common issue
  const groupedByIssue = filteredTickets?.reduce((acc, ticket) => {
    const issue = ticket.common_issue || "Uncategorized";
    if (!acc[issue]) {
      acc[issue] = {
        tickets: [],
        count: 0,
        summary: ticket.issue_summary,
        department: ticket.responsible_department
      };
    }
    acc[issue].tickets.push(ticket);
    acc[issue].count += 1;
    return acc;
  }, {} as Record<string, { tickets: any[]; count: number; summary: string; department: string }>);

  const sortedIssues = Object.entries(groupedByIssue || {})
    .sort(([, a], [, b]) => sortAscending ? a.count - b.count : b.count - a.count);

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto">
      <Card className="overflow-hidden">
        <TicketFilters
          totalCount={totalCount}
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
        />
      </Card>

      <div className="space-y-6">
        {selectedTheme && (
          <h3 className="text-xl font-semibold text-gray-900">
            {selectedTheme} ({filteredTickets?.length || 0} total tickets)
          </h3>
        )}
        
        {sortedIssues.map(([issue, { tickets, count, summary, department }], index) => (
          <Card key={issue}>
            <TicketGroup
              issue={issue}
              tickets={tickets}
              count={count}
              summary={summary}
              department={department}
              isExpanded={expandedTickets.includes(issue)}
              onToggle={() => toggleTickets(issue)}
              index={index}
            />
          </Card>
        ))}
      </div>
    </div>
  );
};