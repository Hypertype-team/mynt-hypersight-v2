import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronDown, ChevronUp, ExternalLink } from "lucide-react";

export const TicketAnalysisTable = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedTheme, setSelectedTheme] = useState<string>("");
  const [selectedDepartment, setSelectedDepartment] = useState<string>("All");
  const [sortAscending, setSortAscending] = useState(false);

  const { data: allTickets, isLoading } = useQuery({
    queryKey: ["tickets"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ticket_analysis")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

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
  
  // Filter tickets based on selected filters
  const filteredTickets = allTickets?.filter(ticket => {
    if (selectedPeriod && ticket.report_period !== selectedPeriod) return false;
    if (selectedCategory && ticket.category !== selectedCategory) return false;
    if (selectedTheme && ticket.subcategory !== selectedTheme) return false;
    if (selectedDepartment !== "All" && ticket.responsible_department !== selectedDepartment) return false;
    return true;
  });

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
    <div className="space-y-6">
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Report Period</label>
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger>
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                {reportPeriods.map(period => (
                  <SelectItem key={period} value={period}>
                    {period}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Category</label>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(({ name, count }) => (
                  <SelectItem key={name} value={name}>
                    {name} ({count} tickets)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Theme</label>
            <Select value={selectedTheme} onValueChange={setSelectedTheme}>
              <SelectTrigger>
                <SelectValue placeholder="Select theme" />
              </SelectTrigger>
              <SelectContent>
                {themes.map(({ name, count }) => (
                  <SelectItem key={name} value={name}>
                    {name} ({count} tickets)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Department</label>
            <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
              <SelectTrigger>
                <SelectValue placeholder="Select department" />
              </SelectTrigger>
              <SelectContent>
                {departments.map(dept => (
                  <SelectItem key={dept} value={dept}>
                    {dept}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2">
          <Checkbox
            id="sortOrder"
            checked={sortAscending}
            onCheckedChange={(checked) => setSortAscending(checked as boolean)}
          />
          <label htmlFor="sortOrder" className="text-sm">
            Sort by Ticket Volume (Ascending)
          </label>
        </div>
      </Card>

      <Card className="p-6">
        <div className="space-y-6">
          {selectedTheme && (
            <h3 className="text-xl font-semibold">
              {selectedTheme} ({filteredTickets?.length || 0} total tickets)
            </h3>
          )}
          
          {sortedIssues.map(([issue, { tickets, count, summary, department }], index) => (
            <div key={issue} className="space-y-4">
              <div className="border-b pb-2">
                <h2 className="text-lg font-semibold">
                  {index + 1}. {issue} ({count} tickets)
                </h2>
                <p className="text-muted-foreground mt-1">
                  <span className="font-medium">Summary:</span> {summary}
                </p>
                <p className="text-muted-foreground">
                  <span className="font-medium">Department:</span> {department}
                </p>
              </div>
              
              {tickets.map((ticket, ticketIndex) => (
                <div key={ticket.id} className="pl-4 border-l-2 border-gray-200">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium">Ticket {ticketIndex + 1}:</h3>
                    {ticket.link && (
                      <Button variant="link" size="sm" className="text-blue-600" asChild>
                        <a href={ticket.link} target="_blank" rel="noopener noreferrer">
                          View Issue <ExternalLink className="ml-1 h-4 w-4" />
                        </a>
                      </Button>
                    )}
                  </div>
                  <div className="space-y-2">
                    <div>
                      <p className="font-medium">Ticket Issue:</p>
                      <p className="text-muted-foreground">{ticket.issue}</p>
                    </div>
                    <div>
                      <p className="font-medium">Ticket Summary:</p>
                      <p className="text-muted-foreground">{ticket.summary}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};