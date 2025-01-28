import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Filter, RefreshCw } from "lucide-react";

interface TicketFiltersProps {
  totalTickets: number;
  filteredCount: number;
  selectedPeriod: string;
  setSelectedPeriod: (period: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  selectedTheme: string;
  setSelectedTheme: (theme: string) => void;
  selectedDepartment: string;
  setSelectedDepartment: (department: string) => void;
  sortAscending: boolean;
  setSortAscending: (ascending: boolean) => void;
  reportPeriods: string[];
  categories: { name: string; count: number; display: string }[];
  themes: { name: string; count: number; display: string }[];
  departments: string[];
  onRefresh: () => void;
}

export const TicketFilters = ({
  totalTickets,
  filteredCount,
  selectedPeriod,
  setSelectedPeriod,
  selectedCategory,
  setSelectedCategory,
  selectedTheme,
  setSelectedTheme,
  selectedDepartment,
  setSelectedDepartment,
  sortAscending,
  setSortAscending,
  reportPeriods,
  categories,
  themes,
  departments,
  onRefresh,
}: TicketFiltersProps) => {
  return (
    <div className="p-6 bg-gradient-to-br from-purple-50 to-white">
      <div className="flex items-center justify-between mb-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-purple-500" />
            <h2 className="text-lg font-semibold text-gray-900">Filter Tickets</h2>
          </div>
          <p className="text-sm text-gray-600">
            Total tickets: {totalTickets} | Filtered: {filteredCount}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh Data
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-medium block text-gray-700">Report Period</label>
          <Select 
            value={selectedPeriod} 
            onValueChange={setSelectedPeriod}
          >
            <SelectTrigger className="w-full bg-white border-gray-200 hover:border-purple-200 transition-colors">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="_all" className="hover:bg-purple-50">
                All periods
              </SelectItem>
              {reportPeriods.map(period => (
                <SelectItem key={period} value={period} className="hover:bg-purple-50">
                  {period}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium block text-gray-700">Category</label>
          <Select 
            value={selectedCategory}
            onValueChange={(value) => {
              setSelectedCategory(value);
              setSelectedTheme("");
            }}
          >
            <SelectTrigger className="w-full bg-white border-gray-200 hover:border-purple-200 transition-colors">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="_all" className="hover:bg-purple-50">
                All categories
              </SelectItem>
              {categories.map(({ name, display }) => (
                <SelectItem key={name} value={name} className="hover:bg-purple-50">
                  {display}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium block text-gray-700">Theme</label>
          <Select 
            value={selectedTheme} 
            onValueChange={setSelectedTheme}
            disabled={!selectedCategory || selectedCategory === "_all"}
          >
            <SelectTrigger className={`w-full bg-white border-gray-200 transition-colors ${
              !selectedCategory || selectedCategory === "_all" ? 'opacity-50 cursor-not-allowed' : 'hover:border-purple-200'
            }`}>
              <SelectValue placeholder={!selectedCategory || selectedCategory === "_all" ? "Select a category first" : "Select theme"} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="_all" className="hover:bg-purple-50">
                All themes
              </SelectItem>
              {themes.map(({ name, display }) => (
                <SelectItem key={name} value={name} className="hover:bg-purple-50">
                  {display}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium block text-gray-700">Department</label>
          <Select 
            value={selectedDepartment} 
            onValueChange={setSelectedDepartment}
          >
            <SelectTrigger className="w-full bg-white border-gray-200 hover:border-purple-200 transition-colors">
              <SelectValue placeholder="Select department" />
            </SelectTrigger>
            <SelectContent>
              {departments.map(dept => (
                <SelectItem key={dept} value={dept} className="hover:bg-purple-50">
                  {dept}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

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
    </div>
  );
};