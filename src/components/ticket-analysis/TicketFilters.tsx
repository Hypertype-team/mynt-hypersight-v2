import { Search, Layers, FolderTree, MessageSquare } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface TicketFiltersProps {
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  subcategoryFilter: string;
  setSubcategoryFilter: (filter: string) => void;
  commonIssueFilter: string;
  setCommonIssueFilter: (filter: string) => void;
}

export const TicketFilters = ({
  selectedCategory,
  setSelectedCategory,
  subcategoryFilter,
  setSubcategoryFilter,
  commonIssueFilter,
  setCommonIssueFilter,
}: TicketFiltersProps) => {
  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ticket_analysis")
        .select("category")
        .not("category", "is", null);

      if (error) throw error;

      // Count tickets per category
      const categoryCounts = data.reduce((acc: Record<string, number>, item) => {
        const category = item.category || "Uncategorized";
        acc[category] = (acc[category] || 0) + 1;
        return acc;
      }, {});

      return Object.entries(categoryCounts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count); // Sort by count in descending order
    },
  });

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Theme</h2>
      <div className="space-y-2">
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full border border-pink-500 rounded-xl bg-white text-base h-12">
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent className="bg-white">
            <SelectItem value="all">All Categories</SelectItem>
            {categories?.map(({ name, count }) => (
              <SelectItem key={name} value={name} className="py-3 px-4">
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