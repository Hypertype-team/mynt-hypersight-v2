import { SampleChart } from "@/components/SampleChart";
import { Layout } from "@/components/Layout";

const Index = () => {
  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            View and analyze your data through interactive charts
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <SampleChart />
          <SampleChart />
        </div>
      </div>
    </Layout>
  );
};

export default Index;