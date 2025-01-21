import { SampleTable } from "@/components/SampleTable";
import { Layout } from "@/components/Layout";

const Tables = () => {
  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tables</h1>
          <p className="text-muted-foreground">
            View and analyze your data in tabular format
          </p>
        </div>
        <div className="grid gap-6">
          <SampleTable />
          <SampleTable />
        </div>
      </div>
    </Layout>
  );
};

export default Tables;