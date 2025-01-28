import { Ticket, TicketGroups } from "@/types/ticket";

export const getFilteredTickets = (
  tickets: Ticket[],
  selectedPeriod: string,
  selectedCategory: string,
  selectedTheme: string,
  selectedDepartment: string
): Ticket[] => {
  return tickets?.filter(ticket => {
    if (selectedPeriod && ticket.report_period !== selectedPeriod) return false;
    if (selectedCategory && ticket.category !== selectedCategory) return false;
    if (selectedTheme && ticket.subcategory !== selectedTheme) return false;
    if (selectedDepartment !== "All" && ticket.responsible_department !== selectedDepartment) return false;
    return true;
  });
};

export const getCategoriesWithCounts = (filteredTickets: Ticket[]) => {
  return [...new Set(filteredTickets?.map(ticket => ticket.category))]
    .map(category => ({
      name: category || "",
      count: filteredTickets?.filter(t => t.category === category).length || 0,
      display: `${category} (${filteredTickets?.filter(t => t.category === category).length || 0} tickets)`
    }))
    .sort((a, b) => {
      if (a.name === "Batterier") return -1;
      if (b.name === "Batterier") return 1;
      if (a.name === "Andra") return 1;
      if (b.name === "Andra") return -1;
      return a.name.localeCompare(b.name);
    });
};

export const getThemesWithCounts = (
  filteredTickets: Ticket[],
  selectedCategory: string,
  sortAscending: boolean
) => {
  if (!selectedCategory) return [];
  
  return [...new Set(filteredTickets?.filter(t => t.category === selectedCategory)
    .map(ticket => ticket.subcategory))]
    .map(theme => ({
      name: theme || "",
      count: filteredTickets?.filter(t => t.subcategory === theme).length || 0,
      display: `${theme} (${filteredTickets?.filter(t => t.subcategory === theme).length || 0} tickets)`
    }))
    .sort((a, b) => sortAscending ? a.count - b.count : b.count - a.count);
};

export const groupTicketsByIssue = (filteredTickets: Ticket[]): TicketGroups => {
  return filteredTickets?.reduce((acc, ticket) => {
    const issue = ticket.common_issue || "Uncategorized";
    if (!acc[issue]) {
      acc[issue] = {
        tickets: [],
        count: 0,
        summary: ticket.issue_summary || "",
        department: ticket.responsible_department || ""
      };
    }
    acc[issue].tickets.push(ticket);
    acc[issue].count += 1;
    return acc;
  }, {} as TicketGroups);
};