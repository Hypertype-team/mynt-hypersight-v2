import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText } from "lucide-react";
import { CommonIssueGroup } from "./CommonIssueGroup";

interface Ticket {
  id: string;
  priority?: string;
  sentiment?: string;
  issue_summary?: string;
}

interface SubcategoryCardProps {
  subcategory: string;
  count: number;
  commonIssues: Record<
    string,
    {
      tickets: Ticket[];
      count: number;
    }
  >;
}

export const SubcategoryCard = ({
  subcategory,
  count,
  commonIssues,
}: SubcategoryCardProps) => {
  return (
    <div
      className="overflow-hidden transition-all duration-200 hover:shadow-lg border-2 rounded-lg"
      style={{ backgroundColor: "#F1F0FB" }}
    >
      <Accordion type="single" collapsible>
        <AccordionItem value={subcategory} className="border-none">
          <AccordionTrigger className="px-4 py-3 hover:no-underline group">
            <div className="flex flex-col items-start text-left space-y-1">
              <div className="font-medium text-primary flex items-center gap-2">
                {subcategory}
              </div>
              <div className="text-sm text-muted-foreground flex items-center gap-1">
                <FileText className="h-4 w-4" />
                {count} {count === 1 ? "ticket" : "tickets"}
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <ScrollArea className="h-[300px]">
              <div className="px-4 pb-4 space-y-3">
                {Object.entries(commonIssues).map(([commonIssue, { tickets }]) => (
                  <CommonIssueGroup
                    key={commonIssue}
                    commonIssue={commonIssue}
                    tickets={tickets}
                  />
                ))}
              </div>
            </ScrollArea>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};