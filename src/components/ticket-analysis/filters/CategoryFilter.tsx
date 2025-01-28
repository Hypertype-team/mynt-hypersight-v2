import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CategoryFilterProps {
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  setSelectedTheme: (theme: string) => void;
  categories: { name: string; count: number; display: string }[];
}

export const CategoryFilter = ({
  selectedCategory,
  setSelectedCategory,
  setSelectedTheme,
  categories,
}: CategoryFilterProps) => {
  return (
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
        <SelectContent className="bg-white">
          {categories.map(({ name, display }) => (
            <SelectItem 
              key={name} 
              value={name} 
              className="hover:bg-purple-50 cursor-pointer"
            >
              {display}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};