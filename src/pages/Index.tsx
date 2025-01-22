import { Layout } from "@/components/Layout";
import { TicketAnalysisTable } from "@/components/TicketAnalysisTable";
import { CategoryBreakdownChart } from "@/components/CategoryBreakdownChart";
import { ChatPanel } from "@/components/ChatPanel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageCircle, LayoutDashboard } from "lucide-react";

const Index = () => {
  return (
    <Layout>
      <Tabs defaultValue="dashboard" className="h-full">
        <TabsList>
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="chat" className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4" />
            Chat Assistant
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="dashboard" className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">
              View and analyze ticket data
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <CategoryBreakdownChart />
          </div>
          <TicketAnalysisTable />
        </TabsContent>
        
        <TabsContent value="chat" className="h-[calc(100vh-10rem)]">
          <ChatPanel isOpen={true} onClose={() => {}} />
        </TabsContent>
      </Tabs>
    </Layout>
  );
};

export default Index;