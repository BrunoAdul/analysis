import { useState, useEffect } from "react";
import { useData } from "@/contexts/DataContext";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, DollarSign, ShoppingCart, ArrowUpRight } from "lucide-react";
import SalesChat from "@/components/sales/SalesChat";
import SalesOverTimeChart from "@/components/sales/SalesOverTimeChart";
import { SalesSummary } from "@/types";

// Define COLORS for pie chart
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

const Dashboard = () => {
  const { getSalesSummary, salesData } = useData();
  const { user } = useAuth();
  const [period, setPeriod] = useState("weekly");
  
  const [summary, setSummary] = useState<SalesSummary | null>(null);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const salesSummary = await getSalesSummary();
        setSummary(salesSummary);
      } catch (error) {
        console.error("Error fetching sales summary:", error);
        // Create a default summary with zero values to prevent errors
        setSummary({
          totalRevenue: 0,
          totalProfit: 0,
          totalSales: 0,
          averageOrderValue: 0,
          topSellingItems: [],
          paymentMethods: []
        });
      }
    };

    fetchSummary();
  }, [getSalesSummary]);
  
  // Generate time-based sales data for the charts based on actual salesData
  const getTimeBasedData = () => {
    if (!salesData || salesData.length === 0) {
      return [];
    }

    const data: { name: string; revenue: number; profit: number }[] = [];

    // Helper function to get week number of a date (ISO week)
    const getWeekNumber = (date: Date) => {
      const tempDate = new Date(date.getTime());
      tempDate.setHours(0, 0, 0, 0);
      // Thursday in current week decides the year
      tempDate.setDate(tempDate.getDate() + 3 - ((tempDate.getDay() + 6) % 7));
      const week1 = new Date(tempDate.getFullYear(), 0, 4);
      return (
        1 +
        Math.round(
          ((tempDate.getTime() - week1.getTime()) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7
        )
      );
    };

    const now = new Date();

    if (period === "daily") {
      // Show sales for today only
      const todayStr = now.toISOString().substring(0, 10);
      const todaySales = salesData.filter(item => item.date === todayStr);
      const totalRevenue = todaySales.reduce((sum, item) => sum + (item.revenue || 0), 0);
      const totalProfit = todaySales.reduce((sum, item) => sum + (item.profit || 0), 0);
      data.push({
        name: "Today",
        revenue: totalRevenue,
        profit: totalProfit
      });
    } else if (period === "weekly") {
      // Aggregate weekly sales starting from first sale week
      // Find earliest sale date
      const dates = salesData.map(item => new Date(item.date));
      const minDate = new Date(Math.min(...dates.map(d => d.getTime())));
      const startYear = minDate.getFullYear();
      const startWeek = getWeekNumber(minDate);

      // Group sales by year-week
      const salesByWeek: Record<string, { revenue: number; profit: number }> = {};

      salesData.forEach(item => {
        const date = new Date(item.date);
        const year = date.getFullYear();
        const week = getWeekNumber(date);
        const key = `${year}-W${week}`;
        if (!salesByWeek[key]) {
          salesByWeek[key] = { revenue: 0, profit: 0 };
        }
        salesByWeek[key].revenue += item.revenue || 0;
        salesByWeek[key].profit += item.profit || 0;
      });

      // Sort keys by actual week start date and prepare data array
      const sortedKeys = Object.keys(salesByWeek).sort((a, b) => {
        // a and b are strings like "2023-W15"
        const [aYear, aWeek] = a.split("-W").map(Number);
        const [bYear, bWeek] = b.split("-W").map(Number);

        // Get date of Monday of the week
        const getDateOfISOWeek = (week: number, year: number) => {
          const simple = new Date(year, 0, 1 + (week - 1) * 7);
          const dow = simple.getDay();
          const ISOweekStart = simple;
          if (dow <= 4) {
            ISOweekStart.setDate(simple.getDate() - simple.getDay() + 1);
          } else {
            ISOweekStart.setDate(simple.getDate() + 8 - simple.getDay());
          }
          return ISOweekStart;
        };

        const aDate = getDateOfISOWeek(aWeek, aYear);
        const bDate = getDateOfISOWeek(bWeek, bYear);

        return aDate.getTime() - bDate.getTime();
      });

      sortedKeys.forEach(key => {
        // Format label as "YYYY-Www"
        data.push({
          name: key,
          revenue: salesByWeek[key].revenue,
          profit: salesByWeek[key].profit
        });
      });
    } else if (period === "monthly") {
      // Aggregate sales by actual months present in salesData
      const salesByMonth: Record<string, { revenue: number; profit: number }> = {};

      salesData.forEach(item => {
        const date = new Date(item.date);
        const monthKey = date.toLocaleString("default", { year: "numeric", month: "short" }); // e.g. "2023 Apr"
        if (!salesByMonth[monthKey]) {
          salesByMonth[monthKey] = { revenue: 0, profit: 0 };
        }
        salesByMonth[monthKey].revenue += item.revenue || 0;
        salesByMonth[monthKey].profit += item.profit || 0;
      });

      // Sort months chronologically by date
      const sortedMonths = Object.keys(salesByMonth).sort((a, b) => {
        const [aYear, aMonth] = a.split(" ");
        const [bYear, bMonth] = b.split(" ");
        const monthNameToNumber = (monthName: string) => {
          return new Date(Date.parse(monthName + " 1, 2000")).getMonth();
        };
        const aDate = new Date(Number(aYear), monthNameToNumber(aMonth), 1);
        const bDate = new Date(Number(bYear), monthNameToNumber(bMonth), 1);
        return aDate.getTime() - bDate.getTime();
      });

      sortedMonths.forEach(monthKey => {
        data.push({
          name: monthKey,
          revenue: salesByMonth[monthKey].revenue,
          profit: salesByMonth[monthKey].profit
        });
      });
    }

    return data;
  };
  
  const timeData = getTimeBasedData();
  
  // Safely format currency values
  const formatCurrency = (value: number | undefined | null): string => {
    if (typeof value !== 'number') return '0.00';
    return value.toFixed(2);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Welcome back, {user?.name}</h1>
          <p className="text-muted-foreground">Here's an overview of your Cereaslplace sales data</p>
        </div>
        <div className="mt-4 md:mt-0">
          <Badge variant="outline" className="text-sm font-medium">
            Role: <span className="ml-1 capitalize">{user?.role}</span>
          </Badge>
        </div>
      </div>
      
      {/* Dashboard Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="transition-all hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Ksh {formatCurrency(summary?.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-success-500 inline-flex items-center gap-1">
                <ArrowUpRight className="h-3 w-3" /> +2.5%
              </span>{" "}
              from last month
            </p>
          </CardContent>
        </Card>
        
        <Card className="transition-all hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Profit</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Ksh {formatCurrency(summary?.totalProfit)}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-success-500 inline-flex items-center gap-1">
                <ArrowUpRight className="h-3 w-3" /> +1.8%
              </span>{" "}
              from last month
            </p>
          </CardContent>
        </Card>
        
        <Card className="transition-all hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary?.totalSales || 0} items</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-success-500 inline-flex items-center gap-1">
                <ArrowUpRight className="h-3 w-3" /> +3.2%
              </span>{" "}
              from last month
            </p>
          </CardContent>
        </Card>
        
        <Card className="transition-all hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Order</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Ksh {formatCurrency(summary?.averageOrderValue)}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-success-500 inline-flex items-center gap-1">
                <ArrowUpRight className="h-3 w-3" /> +0.5%
              </span>{" "}
              from last month
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Time-based data visualization */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Sales Over Time</CardTitle>
            <Tabs defaultValue="weekly" className="w-full">
              <TabsList className="grid w-full max-w-xs grid-cols-3">
                <TabsTrigger value="daily" onClick={() => setPeriod("daily")}>Daily</TabsTrigger>
                <TabsTrigger value="weekly" onClick={() => setPeriod("weekly")}>Weekly</TabsTrigger>
                <TabsTrigger value="monthly" onClick={() => setPeriod("monthly")}>Monthly</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={timeData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`Ksh ${Number(value).toFixed(2)}`, undefined]} />
                  <Area type="monotone" dataKey="revenue" stroke="#8884d8" fill="#8884d8" />
                  <Area type="monotone" dataKey="profit" stroke="#82ca9d" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
