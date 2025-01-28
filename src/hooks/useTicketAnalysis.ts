import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useTicketAnalysis = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedTheme, setSelectedTheme] = useState<string>("");
  const [selectedDepartment, setSelectedDepartment] = useState<string>("All");
  const [sortAscending, setSortAscending] = useState(false);
  const [expandedTickets, setExpandedTickets] = useState<string[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);

  const { data: allTickets, isLoading } = useQuery({
    queryKey: ["tickets"],
    queryFn: async () => {
      console.log("Fetching tickets...");
      const { data, error, count } = await supabase
        .from("ticket_analysis")
        .select("*", { count: 'exact', head: false })
        .limit(10000);

      if (error) {
        console.error("Error fetching tickets:", error);
        throw error;
      }
      
      console.log("Total tickets fetched:", count);
      if (count !== null) {
        setTotalCount(count);
      }
      return data;
    },
  });

  // Filter tickets based on selected filters
  const filteredTickets = allTickets?.filter(ticket => {
    if (selectedPeriod && ticket.report_period !== selectedPeriod) return false;
    if (selectedCategory && ticket.category !== selectedCategory) return false;
    if (selectedTheme && ticket.subcategory !== selectedTheme) return false;
    if (selectedDepartment !== "All" && ticket.responsible_department !== selectedDepartment) return false;
    return true;
  });

  const toggleTickets = (issueId: string) => {
    setExpandedTickets(prev => 
      prev.includes(issueId) 
        ? prev.filter(id => id !== issueId)
        : [...prev, issueId]
    );
  };

  return {
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
  };
};