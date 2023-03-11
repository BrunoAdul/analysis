import { useMemo } from "react";
import { useData } from "@/contexts/DataContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent 
} from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { BarChart3 } from "lucide-react";

const SalesOverTimeChart = () => {
  const { salesData } = useData();
  
  const chartData = useMemo(() => {
    const dateMap = new Map<string, { revenue: number; profit: number; sales: number }>();
    
    // Sort data by date
    const sortedData = [...salesData].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    
    // Group data by date
    sortedData.forEach(item => {
      const date = item.date;
      const revenue = item.revenue || 0;
      const profit = item.profit || 0;
      
      if (dateMap.has(date)) {
        const current = dateMap.get(date)!;
        dateMap.set(date, {
          revenue: current.revenue + revenue,
          profit: current.profit + profit,
          sales: current.sales + item.quantity
        });
      } else {
        dateMap.set(date, { 
          revenue, 
          profit, 
          sales: item.quantity 
        });
      }
    });
    
    // Convert map to array
    return Array.from(dateMap.entries())
      .map(([date, data]) => ({
        date,
        formattedDate: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        revenue: data.revenue,
        profit: data.profit,
        sales: data.sales
      }));
  }, [salesData]);
  
  return (
    <Card className="h-[400px]">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <BarChart3 className="h-5 w-5 text-primary" />
          Sales Over Time
        </CardTitle>
      </CardHeader>
      <CardContent>
        {chartData.length > 0 ? (
          <ChartContainer 
            config={{ 
              revenue: { 
                color: "#0c99ff", 
                label: "Revenue" 
              }, 
              profit: { 
                color: "#17b884", 
                label: "Profit" 
              } 
            }} 
            className="h-[320px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis 
                  dataKey="formattedDate" 
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  tickFormatter={(value) => `$${value}`}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  wrapperStyle={{ fontSize: '12px', bottom: 0 }}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#0c99ff"
                  activeDot={{ r: 8 }}
                  strokeWidth={2}
                  dot={{ strokeWidth: 2 }}
                  name="Revenue"
                />
                <Line
                  type="monotone"
                  dataKey="profit"
                  stroke="#17b884"
                  activeDot={{ r: 8 }}
                  strokeWidth={2}
                  dot={{ strokeWidth: 2 }}
                  name="Profit"
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        ) : (
          <div className="h-[320px] flex items-center justify-center text-muted-foreground">
            No sales data available
          </div>
        )}
      </CardContent>
    </Card>
  );
};

interface TooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <ChartTooltipContent>
        <div className="bg-background border border-border rounded-md shadow-md p-2">
          <p className="font-medium mb-1">{label}</p>
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-1">
                <div
                  className="h-2 w-2 rounded-full" 
                  style={{ background: entry.color }}
                />
                <span>{entry.name}:</span>
              </div>
              <span className="font-medium">${entry.value.toFixed(2)}</span>
            </div>
          ))}
        </div>
      </ChartTooltipContent>
    );
  }
  return null;
};

export default SalesOverTimeChart;
