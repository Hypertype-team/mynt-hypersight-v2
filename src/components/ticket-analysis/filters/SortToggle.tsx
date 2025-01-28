import { Checkbox } from "@/components/ui/checkbox";

interface SortToggleProps {
  sortAscending: boolean;
  setSortAscending: (ascending: boolean) => void;
}

export const SortToggle = ({
  sortAscending,
  setSortAscending,
}: SortToggleProps) => {
  return (
    <div className="mt-6 flex items-center gap-2 border-t pt-4 border-gray-100">
      <Checkbox
        id="sortOrder"
        checked={sortAscending}
        onCheckedChange={(checked) => setSortAscending(checked as boolean)}
        className="border-gray-300 data-[state=checked]:bg-purple-500 data-[state=checked]:border-purple-500"
      />
      <label htmlFor="sortOrder" className="text-sm text-gray-600 select-none cursor-pointer">
        Sort by Ticket Volume (Ascending)
      </label>
    </div>
  );
};