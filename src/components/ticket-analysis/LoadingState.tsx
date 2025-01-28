import { Card } from "@/components/ui/card";

export const LoadingState = () => {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        <p>Loading ticket analysis data...</p>
      </div>
    </Card>
  );
};