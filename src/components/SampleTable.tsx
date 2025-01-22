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
    <Card>
      <div className="p-6 pb-0">
        <h3 className="text-lg font-semibold">Product Performance</h3>
        <p className="text-sm text-muted-foreground">Latest sales data</p>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Product</TableHead>
            <TableHead className="text-right">Sales</TableHead>
            <TableHead className="text-right">Revenue</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row) => (
            <TableRow key={row.id}>
              <TableCell>{row.name}</TableCell>
              <TableCell className="text-right">{row.sales}</TableCell>
              <TableCell className="text-right">${row.revenue}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
};