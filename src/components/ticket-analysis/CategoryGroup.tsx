import { Folder } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SubcategoryCard } from "./SubcategoryCard";

interface Ticket {
  id: string;
  priority?: string;
  sentiment?: string;
  issue_summary?: string;
}

interface CategoryGroupProps {
  category: string;
  count: number;
  subcategories: Record<
    string,
    {
      commonIssues: Record<
        string,
        {
          tickets: Ticket[];
          count: number;
        }
      >;
      count: number;
    }
  >;
}

export const CategoryGroup = ({
  category,
  count,
  subcategories,
}: CategoryGroupProps) => {
  return (
    <div className="space-y-4">
      <div className="font-semibold text-lg flex items-center gap-2 text-primary">
        <Folder className="h-5 w-5" />
        {category}
        <Badge variant="outline" className="ml-2">
          {count} {count === 1 ? "ticket" : "tickets"}
        </Badge>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(subcategories).map(([subcategory, { commonIssues, count }]) => (
          <SubcategoryCard
            key={subcategory}
            subcategory={subcategory}
            count={count}
            commonIssues={commonIssues}
          />
        ))}
      </div>
    </div>
  );
};