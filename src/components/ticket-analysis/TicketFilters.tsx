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
  categories: Array<{
    name: string;
    count: number;
  }>;
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
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Filters</h2>
      <div className="space-y-2">
        <label className="text-base font-medium">Category</label>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full border border-gray-200 bg-white text-base">
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent className="bg-white">
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map(({ name, count }) => (
              <SelectItem key={name} value={name} className="py-2">
                {name} ({count} tickets)
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
    </div>
  );
};