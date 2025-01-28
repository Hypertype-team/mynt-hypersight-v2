import { Filter } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

interface TicketFiltersProps {
  totalCount: number;
  selectedPeriod: string;
  setSelectedPeriod: (value: string) => void;
  selectedCategory: string;
  setSelectedCategory: (value: string) => void;
  selectedTheme: string;
  setSelectedTheme: (value: string) => void;
  selectedDepartment: string;
  setSelectedDepartment: (value: string) => void;
  sortAscending: boolean;
  setSortAscending: (value: boolean) => void;
  reportPeriods: string[];
  categories: { name: string; count: number }[];
  themes: { name: string; count: number }[];
  departments: string[];
}

export const TicketFilters = ({
  totalCount,
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
  departments
}: TicketFiltersProps) => {
  const handleSelectChange = (value: string, setter: (value: string) => void) => {
    setter(value);
    setTimeout(() => {
      const event = new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
        view: window
      });
      document.querySelector('[role="combobox"]')?.dispatchEvent(event);
    }, 0);
  };

  return (
    <div className="p-6 bg-gradient-to-br from-purple-50 to-white">
      <div className="flex items-center gap-2 mb-6">
        <Filter className="w-5 h-5 text-purple-500" />
        <h2 className="text-lg font-semibold text-gray-900">Filter Tickets</h2>
        <span className="ml-auto text-sm text-muted-foreground">
          Total Tickets: {totalCount}
        </span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-medium block text-gray-700">Report Period</label>
          <Select 
            value={selectedPeriod} 
            onValueChange={(value) => handleSelectChange(value, setSelectedPeriod)}
          >
            <SelectTrigger className="w-full bg-white border-gray-200 hover:border-purple-200 transition-colors">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
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
            onValueChange={(value) => handleSelectChange(value, setSelectedCategory)}
          >
            <SelectTrigger className="w-full bg-white border-gray-200 hover:border-purple-200 transition-colors">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map(({ name, count }) => (
                <SelectItem key={name} value={name} className="hover:bg-purple-50">
                  {name} ({count} tickets)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium block text-gray-700">Subcategory</label>
          <Select 
            value={selectedTheme} 
            onValueChange={(value) => handleSelectChange(value, setSelectedTheme)}
          >
            <SelectTrigger className="w-full bg-white border-gray-200 hover:border-purple-200 transition-colors">
              <SelectValue placeholder="Select subcategory" />
            </SelectTrigger>
            <SelectContent>
              {themes.map(({ name, count }) => (
                <SelectItem key={name} value={name} className="hover:bg-purple-50">
                  {name} ({count} tickets)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium block text-gray-700">Department</label>
          <Select 
            value={selectedDepartment} 
            onValueChange={(value) => handleSelectChange(value, setSelectedDepartment)}
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