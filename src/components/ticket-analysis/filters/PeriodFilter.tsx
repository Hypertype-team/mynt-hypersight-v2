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
          {/* <SelectItem value="_all" className="hover:bg-purple-50">
            All periods
          </SelectItem> */}
          {/* TODO-DEMO: Hardcoded for DEMO purposes. (7Feb25) */}
          <SelectItem key={'Jan 01 - Jan 31'} value={'Jan 01 - Jan 31'} className="hover:bg-purple-50">
            {'Jan 01 - Jan 31'}
          </SelectItem>
          {/* {reportPeriods.map(period => (
            <SelectItem key={period} value={period} className="hover:bg-purple-50">
              {period}
            </SelectItem>
          ))} */}
        </SelectContent>
      </Select>
    </div>
  );
};