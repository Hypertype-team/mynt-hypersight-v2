import { PieChart, Pie, Cell, ResponsiveContainer, Label } from "recharts";
import { Card } from "@/components/ui/card";

const data = [
  { name: "Residential areas", value: 38, color: "#E88D7D" },
  { name: "Public parking lots and garages", value: 10.9, color: "#FDE1D3" },
  { name: "Public transportation hubs", value: 7.4, color: "#FFDEE2" },
  { name: "Commercial and retail locations", value: 4.1, color: "#E5DEFF" },
  { name: "Workplace", value: 2.7, color: "#D8E1FF" },
];

const TOTAL = "64 M";

export const EVChargingLocationsChart = () => {
  return (
    <Card className="p-8 rounded-3xl">
      <div className="space-y-6">
        <div className="space-y-2">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <h3 className="text-xl font-medium text-black">
                The most popular locations for EV charging station
              </h3>
              <p className="text-base text-gray-600">Total residential areas</p>
            </div>
            <span className="text-sm text-gray-500">M, areas</span>
          </div>
          <p className="text-4xl font-semibold text-black">{TOTAL}</p>
        </div>

        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius="70%"
                outerRadius="100%"
                paddingAngle={2}
                dataKey="value"
                startAngle={180}
                endAngle={-180}
              >
                {data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.color} 
                    stroke="none"
                  />
                ))}
                <Label
                  content={({ viewBox }: { viewBox: { cx: number; cy: number } }) => {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        className="fill-black font-medium text-2xl"
                      >
                        {data[0].value}
                      </text>
                    );
                  }}
                />
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {data.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-sm text-gray-600">{item.name}</span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};