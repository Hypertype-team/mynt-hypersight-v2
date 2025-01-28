import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DepartmentFilterProps {
  selectedDepartment: string;
  setSelectedDepartment: (department: string) => void;
  departments: string[];
}

export const DepartmentFilter = ({
  selectedDepartment,
  setSelectedDepartment,
  departments,
}: DepartmentFilterProps) => {
  return (
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
  );
};