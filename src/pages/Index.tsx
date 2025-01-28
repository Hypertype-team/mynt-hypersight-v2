import { Layout } from "@/components/Layout";
import { TicketAnalysisTable } from "@/components/TicketAnalysisTable";
import { CategoryBreakdownChart } from "@/components/CategoryBreakdownChart";
import { EVChargingLocationsChart } from "@/components/EVChargingLocationsChart";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const Index = () => {
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState("Dec 01 - Dec 15");

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

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setShowAnalysis(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left Panel - Dashboard Information */}
          <Card className="p-6 space-y-6">
            <div>
              <h3 className="font-semibold mb-2">Dashboard Information</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Company Name</p>
                  <p className="font-medium">Demo</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Report Period</p>
                  <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                    <SelectTrigger>
                      <SelectValue>{selectedPeriod}</SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Dec 01 - Dec 15">Dec 01 - Dec 15</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Tickets</p>
                  <p className="font-medium">{totalTickets}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold">Filters</h3>
              
              <div>
                <p className="text-sm text-muted-foreground mb-2">Category</p>
                <Select defaultValue="batteries">
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="batteries">Batterier (290 tickets)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-2">Theme</p>
                <Select defaultValue="battery-connection">
                  <SelectTrigger>
                    <SelectValue placeholder="Select theme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="battery-connection">
                      Batterifunktion och Anslutningsproblem (80 tickets)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-2">Responsible Department</p>
                <Select defaultValue="all">
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>

          {/* Main Content Area */}
          <div className="col-span-2 space-y-6">
            <div className="relative">
              <div className={`transition-all duration-300 ${showAnalysis ? 'md:w-1/2' : 'w-full'}`}>
                <EVChargingLocationsChart />
              </div>
              <Button
                variant="outline"
                className={`absolute top-4 right-4 transition-opacity duration-300 ${showAnalysis ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
                onClick={() => setShowAnalysis(true)}
              >
                Want more charts?
              </Button>
              {showAnalysis && (
                <>
                  <div 
                    className="fixed inset-0 bg-black/20 z-40"
                    onClick={handleOverlayClick}
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
            <TicketAnalysisTable />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Index;