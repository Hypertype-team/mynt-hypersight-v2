import { Layout } from "@/components/Layout";
import { TicketAnalysisTable } from "@/components/TicketAnalysisTable";
import { CategoryBreakdownChart } from "@/components/CategoryBreakdownChart";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [subcategoryFilter, setSubcategoryFilter] = useState("");
  const [commonIssueFilter, setCommonIssueFilter] = useState("");

  const { data: dashboardData } = useQuery({
    queryKey: ["dashboard-info"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ticket_analysis")
        .select("*");
      
      if (error) throw error;
      return data;
    },
  });

  const totalTickets = dashboardData?.length || 0;
  const categories = [...new Set(dashboardData?.map(ticket => ticket.category) || [])];

  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">HyperSight Dashboard</h1>
        
        <h2 className="font-medium">Total Tickets: {totalTickets}</h2>

        <TicketAnalysisTable />

        {showAnalysis && (
          <>
            <div 
              className="fixed inset-0 bg-black/20 z-40"
              onClick={() => setShowAnalysis(false)}
            />
            <div className="fixed top-0 right-0 w-full md:w-1/2 h-full bg-background p-6 shadow-lg animate-slideIn z-50">
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-4 top-4"
                onClick={() => setShowAnalysis(false)}
              >
                <X className="h-4 w-4" />
              </Button>
              <CategoryBreakdownChart showAnalysisPanel={true} />
            </div>
          </>
        )}
      </div>
    </Layout>
  );
};

export default Index;