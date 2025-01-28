import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PeriodFilterProps {
  selectedPeriod: string;
  setSelectedPeriod: (period: string) => void;
  reportPeriods: string[];
}

export const PeriodFilter = ({
  selectedPeriod,
  setSelectedPeriod,
  reportPeriods,
}: PeriodFilterProps) => {
  return (
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
  );
};