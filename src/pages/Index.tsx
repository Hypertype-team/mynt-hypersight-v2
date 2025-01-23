import { Layout } from "@/components/Layout";
import { TicketAnalysisTable } from "@/components/TicketAnalysisTable";
import { CategoryBreakdownChart } from "@/components/CategoryBreakdownChart";
import { EVChargingLocationsChart } from "@/components/EVChargingLocationsChart";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const Index = () => {
  const [showMoreCharts, setShowMoreCharts] = useState(false);

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            View and analyze ticket data
          </p>
        </div>
        <div className="relative">
          <div className={`transition-all duration-300 ${showMoreCharts ? 'md:w-1/2' : 'w-full'}`}>
            <EVChargingLocationsChart />
          </div>
          <Button
            variant="outline"
            className="absolute top-4 right-4"
            onClick={() => setShowMoreCharts(!showMoreCharts)}
          >
            Want more charts?
          </Button>
          {showMoreCharts && (
            <div className="fixed top-0 right-0 w-full md:w-1/2 h-full bg-background p-6 shadow-lg animate-slideIn">
              <CategoryBreakdownChart />
            </div>
          )}
        </div>
        <TicketAnalysisTable />
      </div>
    </Layout>
  );
};

export default Index;