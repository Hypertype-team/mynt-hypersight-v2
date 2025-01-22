import { Layout } from "@/components/Layout";
import { TicketAnalysisTable } from "@/components/TicketAnalysisTable";
import { CategoryBreakdownChart } from "@/components/CategoryBreakdownChart";
import { PriorityDistributionChart } from "@/components/PriorityDistributionChart";
import { SentimentTrendChart } from "@/components/SentimentTrendChart";
import { DepartmentWorkloadChart } from "@/components/DepartmentWorkloadChart";

const Index = () => {
  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            View and analyze ticket data
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <CategoryBreakdownChart />
          <PriorityDistributionChart />
          <SentimentTrendChart />
          <DepartmentWorkloadChart />
        </div>
        <TicketAnalysisTable />
      </div>
    </Layout>
  );
};

export default Index;