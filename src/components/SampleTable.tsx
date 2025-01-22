import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";

const data = [
  { id: 1, name: "Product A", sales: 100, revenue: 5000 },
  { id: 2, name: "Product B", sales: 150, revenue: 7500 },
  { id: 3, name: "Product C", sales: 80, revenue: 4000 },
  { id: 4, name: "Product D", sales: 200, revenue: 10000 },
];

export const SampleTable = () => {
  return (
    <Card className="bg-card border-border">
      <div className="p-6 pb-0">
        <h3 className="text-lg font-semibold text-black">Product Performance</h3>
        <p className="text-gray-600">Latest sales data</p>
      </div>
      <Table>
        <TableHeader>
          <TableRow className="border-border">
            <TableHead className="text-black">Product</TableHead>
            <TableHead className="text-right text-black">Sales</TableHead>
            <TableHead className="text-right text-black">Revenue</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row) => (
            <TableRow key={row.id} className="border-border">
              <TableCell className="text-black">{row.name}</TableCell>
              <TableCell className="text-right text-black">{row.sales}</TableCell>
              <TableCell className="text-right text-black">${row.revenue}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
};