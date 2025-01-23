import { Search, Layers, FolderTree, MessageSquare } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TicketFiltersProps {
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  subcategoryFilter: string;
  setSubcategoryFilter: (filter: string) => void;
  commonIssueFilter: string;
  setCommonIssueFilter: (filter: string) => void;
  categories: string[];
}

export const TicketFilters = ({
  selectedCategory,
  setSelectedCategory,
  subcategoryFilter,
  setSubcategoryFilter,
  commonIssueFilter,
  setCommonIssueFilter,
  categories,
}: TicketFiltersProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="relative">
        <Layers className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="pl-8">
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="relative">
        <FolderTree className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Filter by subcategory..."
          value={subcategoryFilter}
          onChange={(e) => setSubcategoryFilter(e.target.value)}
          className="pl-8"
        />
      </div>
      <div className="relative">
        <MessageSquare className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Filter by common issue..."
          value={commonIssueFilter}
          onChange={(e) => setCommonIssueFilter(e.target.value)}
          className="pl-8"
        />
      </div>
    </div>
  );
};