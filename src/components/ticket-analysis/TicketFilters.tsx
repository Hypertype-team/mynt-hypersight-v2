import { Button } from "@/components/ui/button";
import { Filter, RefreshCw } from "lucide-react";
import { PeriodFilter } from "./filters/PeriodFilter";
import { CategoryFilter } from "./filters/CategoryFilter";
import { ThemeFilter } from "./filters/ThemeFilter";
import { DepartmentFilter } from "./filters/DepartmentFilter";
import { SortToggle } from "./filters/SortToggle";

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
        <PeriodFilter
          selectedPeriod={selectedPeriod}
          setSelectedPeriod={setSelectedPeriod}
          reportPeriods={reportPeriods}
        />
        <CategoryFilter
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          setSelectedTheme={setSelectedTheme}
          categories={categories}
        />
        <ThemeFilter
          selectedCategory={selectedCategory}
          selectedTheme={selectedTheme}
          setSelectedTheme={setSelectedTheme}
          themes={themes}
        />
        <DepartmentFilter
          selectedDepartment={selectedDepartment}
          setSelectedDepartment={setSelectedDepartment}
          departments={departments}
        />
      </div>

      <SortToggle
        sortAscending={sortAscending}
        setSortAscending={setSortAscending}
      />
    </div>
  );
};