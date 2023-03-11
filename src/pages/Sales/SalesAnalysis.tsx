
import { useState } from "react";
import { useData } from "@/contexts/DataContext";
import { DateRangeFilter } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { Calendar as CalendarIcon, CheckCircle2, FilterX } from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from "recharts";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#3D50B8"];

const SalesAnalysis = () => {
  const { filteredSalesData } = useData();
  const [chartType, setChartType] = useState("daily");
  const [dateRange, setDateRange] = useState<DateRangeFilter>({
    startDate: null,
    endDate: null
  });

  const handleStartDateSelect = (date: Date | undefined) => {
    if (date) {
      setDateRange(prev => ({ ...prev, startDate: date }));
    }
  };

  const handleEndDateSelect = (date: Date | undefined) => {
    if (date) {
      setDateRange(prev => ({ ...prev, endDate: date }));
    }
  };

  const clearDateFilter = () => {
    setDateRange({ startDate: null, endDate: null });
  };

  const filterApplied = dateRange.startDate !== null || dateRange.endDate !== null;
  
  const salesData = filteredSalesData(dateRange);
  
  // Prepare data for different chart types
  const prepareDailyData = () => {
    const dateMap = new Map<string, { revenue: number; profit: number }>();
    
    salesData.forEach(item => {
      const date = item.date;
      const revenue = item.revenue || 0;
      const profit = item.profit || 0;
      
      if (dateMap.has(date)) {
        const current = dateMap.get(date)!;
        dateMap.set(date, {
          revenue: current.revenue + revenue,
          profit: current.profit + profit
        });
      } else {
        dateMap.set(date, { revenue, profit });
      }
    });
    
    return Array.from(dateMap.entries())
      .map(([date, data]) => ({
        date,
        revenue: data.revenue,
        profit: data.profit
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };
  
  const prepareItemData = () => {
    const itemMap = new Map<string, { revenue: number; profit: number; quantity: number }>();
    
    salesData.forEach(item => {
      const itemName = item.itemName;
      const revenue = Number(item.revenue) || 0;
      const profit = Number(item.profit) || 0;
      const quantity = Number(item.quantity) || 0;
      
      if (itemMap.has(itemName)) {
        const current = itemMap.get(itemName)!;
        itemMap.set(itemName, {
          revenue: current.revenue + revenue,
          profit: current.profit + profit,
          quantity: current.quantity + quantity
        });
      } else {
        itemMap.set(itemName, { revenue, profit, quantity });
      }
    });
    
    return Array.from(itemMap.entries())
      .map(([name, data]) => ({
        name,
        revenue: data.revenue,
        profit: data.profit,
        quantity: data.quantity
      }))
      .sort((a, b) => b.revenue - a.revenue);
  };
  
  const preparePaymentData = () => {
    const paymentMap = new Map<string, number>();
    
    salesData.forEach(item => {
      const paymentMode = item.paymentMode;
      const count = paymentMap.get(paymentMode) || 0;
      paymentMap.set(paymentMode, count + 1);
    });
    
    return Array.from(paymentMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  };
  
  const dailyData = prepareDailyData();
  const itemData = prepareItemData();
  const paymentData = preparePaymentData();
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Sales Analysis</h1>
          <p className="text-muted-foreground">Analyze and visualize your sales data</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4" />
                {dateRange.startDate ? format(dateRange.startDate, "PPP") : "Start Date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="single"
                selected={dateRange.startDate || undefined}
                onSelect={handleStartDateSelect}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4" />
                {dateRange.endDate ? format(dateRange.endDate, "PPP") : "End Date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="single"
                selected={dateRange.endDate || undefined}
                onSelect={handleEndDateSelect}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          
          {filterApplied && (
            <Button variant="ghost" size="icon" onClick={clearDateFilter}>
              <FilterX className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
      
      {filterApplied && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted px-4 py-2 rounded-md">
          <CheckCircle2 className="h-4 w-4 text-green-500" />
          <p>
            Filtered data from 
            {dateRange.startDate ? ` ${format(dateRange.startDate, "PP")}` : " the beginning"} 
            to 
            {dateRange.endDate ? ` ${format(dateRange.endDate, "PP")}` : " the end"}
          </p>
        </div>
      )}
      
      <Tabs defaultValue="timeline" className="space-y-4">
        <div className="flex justify-between items-center">
          <TabsList>
            <TabsTrigger value="timeline">Timeline Analysis</TabsTrigger>
            <TabsTrigger value="products">Product Analysis</TabsTrigger>
            <TabsTrigger value="payment">Payment Methods</TabsTrigger>
          </TabsList>
          
          <div className="hidden sm:block">
            <Select value={chartType} onValueChange={setChartType}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Chart Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily Revenue</SelectItem>
                <SelectItem value="profit">Profit Margin</SelectItem>
                <SelectItem value="comparison">Revenue vs Profit</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <TabsContent value="timeline" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Over Time</CardTitle>
              <CardDescription>
                {chartType === "daily" && "Daily revenue from sales"}
                {chartType === "profit" && "Profit margin over time"}
                {chartType === "comparison" && "Revenue vs profit comparison"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                {dailyData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    {chartType === "comparison" ? (
                      <BarChart
                        data={dailyData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                        <XAxis 
                          dataKey="date" 
                          angle={-45} 
                          textAnchor="end" 
                          height={70}
                          tickFormatter={(value) => new Date(value).toLocaleDateString()}
                        />
                        <YAxis />
                        <Tooltip 
                          formatter={(value: number) => [`Ksh ${value.toFixed(2)}`, ""]}
                          labelFormatter={(label) => new Date(label).toLocaleDateString()}
                        />
                        <Legend />
                        <Bar dataKey="revenue" name="Revenue" fill="#0c99ff" />
                        <Bar dataKey="profit" name="Profit" fill="#17b884" />
                      </BarChart>
                    ) : (
                      <LineChart
                        data={dailyData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                        <XAxis 
                          dataKey="date" 
                          angle={-45} 
                          textAnchor="end" 
                          height={70}
                          tickFormatter={(value) => new Date(value).toLocaleDateString()}
                        />
                        <YAxis />
                        <Tooltip 
                          formatter={(value: number) => [`Ksh ${value.toFixed(2)}`, ""]}
                          labelFormatter={(label) => new Date(label).toLocaleDateString()}
                        />
                        <Legend />
                        {chartType === "daily" && (
                          <Line 
                            type="monotone" 
                            dataKey="revenue" 
                            name="Revenue" 
                            stroke="#0c99ff" 
                            activeDot={{ r: 8 }} 
                          />
                        )}
                        {chartType === "profit" && (
                          <Line 
                            type="monotone" 
                            dataKey="profit" 
                            name="Profit" 
                            stroke="#17b884" 
                            activeDot={{ r: 8 }} 
                          />
                        )}
                      </LineChart>
                    )}
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <p className="text-muted-foreground">No data available for the selected period</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="products" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Product Performance</CardTitle>
              <CardDescription>
                Analysis of sales by product
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                {itemData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={itemData.slice(0, 10)}
                      layout="vertical"
                      margin={{ top: 20, right: 30, left: 100, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} opacity={0.2} />
                      <XAxis type="number" />
                      <YAxis 
                        type="category" 
                        dataKey="name" 
                        width={100}
                        tickFormatter={(value) => 
                          value.length > 15 ? `${value.substring(0, 15)}...` : value
                        }
                      />
                      <Tooltip formatter={(value: number) => [`Ksh ${value.toFixed(2)}`, ""]} />
                      <Legend />
                      <Bar dataKey="revenue" name="Revenue" fill="#0c99ff" />
                      <Bar dataKey="profit" name="Profit" fill="#17b884" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <p className="text-muted-foreground">No product data available</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Top Products by Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {itemData.slice(0, 5).map((item, index) => (
                    <div key={index} className="flex items-center">
                      <span className="font-medium text-muted-foreground w-8">{index + 1}.</span>
                      <div className="flex-1">
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Sold: {item.quantity} units
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">Ksh {item.revenue.toFixed(2)}</p>
                        <p className="text-sm text-success-600">
                          Ksh {item.profit.toFixed(2)} profit
                        </p>
                      </div>
                    </div>
                  ))}
                  
                  {itemData.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">No data available</p>
                  )}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Top Products by Quantity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[...itemData]
                    .sort((a, b) => b.quantity - a.quantity)
                    .slice(0, 5)
                    .map((item, index) => (
                      <div key={index} className="flex items-center">
                        <span className="font-medium text-muted-foreground w-8">{index + 1}.</span>
                        <div className="flex-1">
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-muted-foreground">
                            Revenue: <span>Ksh {item.revenue.toFixed(2)}</span>
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{item.quantity} units</p>
                          <p className="text-sm text-success-600">
                            Ksh <span>{(item.profit / item.quantity).toFixed(2)}</span>/unit
                          </p>
                        </div>
                      </div>
                    ))}
                  
                  {itemData.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">No data available</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="payment" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Payment Method Distribution</CardTitle>
              <CardDescription>
                Analysis of sales by payment method
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                {paymentData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={paymentData}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        outerRadius={150}
                        fill="#8884d8"
                        dataKey="value"
                        nameKey="name"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {paymentData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => [value, "Transactions"]} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <p className="text-muted-foreground">No payment data available</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Payment Methods Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {paymentData.map((method, index) => (
                  <div 
                    key={index} 
                    className="bg-white p-4 rounded-lg border border-border flex items-center justify-between"
                    style={{ borderLeftColor: COLORS[index % COLORS.length], borderLeftWidth: '4px' }}
                  >
                    <div>
                      <p className="font-medium">{method.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {((method.value / salesData.length) * 100).toFixed(1)}% of transactions
                      </p>
                    </div>
                    <div className="text-2xl font-bold">{method.value}</div>
                  </div>
                ))}
                
                {paymentData.length === 0 && (
                  <div className="col-span-3 text-center text-muted-foreground py-8">
                    No payment data available
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SalesAnalysis;
