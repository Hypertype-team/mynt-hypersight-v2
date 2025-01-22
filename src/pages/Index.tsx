import { Layout } from "@/components/Layout";
import { TicketAnalysisTable } from "@/components/TicketAnalysisTable";
import { CategoryDistributionChart } from "@/components/CategoryDistributionChart";
import { SentimentTrendChart } from "@/components/SentimentTrendChart";

const Index = () => {
  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-black">Dashboard</h1>
          <p className="text-gray-600">
            View and analyze ticket data
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <CategoryDistributionChart />
          <SentimentTrendChart />
        </div>
        <TicketAnalysisTable />
      </div>
    </Layout>
  );
};

export default Index;