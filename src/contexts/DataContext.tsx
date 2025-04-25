
import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { SalesItem, SalesSummary, DateRangeFilter } from "@/types";
import { toast } from "@/components/ui/sonner";
import * as XLSX from 'xlsx';
import { API_ENDPOINTS } from "@/config/api";

interface DataContextType {
  salesData: SalesItem[];
  isLoading: boolean;
  uploadExcelFile: (file: File) => Promise<void>;
  addSalesItem: (item: Omit<SalesItem, "id" | "profit" | "revenue">) => Promise<void>;
  deleteSalesItem: (id: string) => Promise<void>;
  getSalesSummary: () => Promise<SalesSummary>;
  filteredSalesData: (filter?: DateRangeFilter) => SalesItem[];
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const INITIAL_SALES_DATA: SalesItem[] = [];

// Using API_ENDPOINTS from config/api.ts

export const DataProvider = ({ children }: { children: ReactNode }) => {
  const [salesData, setSalesData] = useState<SalesItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch data from MySQL database via API
  useEffect(() => {
    const fetchSalesData = async () => {
      setIsLoading(true);
      try {
        // Fetch data from MySQL via API
        const response = await fetch(API_ENDPOINTS.SALES.GET_ALL);
        
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Transform data to match our frontend model if needed
        const transformedData = data.map((item: any) => ({
          id: item.id.toString(),
          date: item.date.substring(0, 10), // Format YYYY-MM-DD
          orderNumber: item.order_number,
          itemName: item.item_name,
          sellingPrice: Number(item.selling_price) || 0,
          quantity: Number(item.quantity) || 0,
          buyingPrice: Number(item.buying_price) || 0,
          paymentMode: item.payment_mode,
          profit: Number(item.profit) || 0,
          revenue: Number(item.revenue) || 0
        }));
        
        setSalesData(transformedData);
      } catch (error) {
        console.error("Error fetching sales data from API:", error);
        toast.error("Failed to load sales data from server. Please ensure the server is running.");
        setSalesData(INITIAL_SALES_DATA);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSalesData();
  }, []);

  const calculateProfitAndRevenue = (item: Omit<SalesItem, "profit" | "revenue"> & { revenue?: number; profit?: number }) => {
    // Recalculate profit as (sellingPrice - buyingPrice) absolute per record, ignoring quantity
    const revenue = item.sellingPrice || 0; // revenue is selling price, not multiplied by quantity
    const profit = (item.sellingPrice || 0) - (item.buyingPrice || 0); // absolute profit per record
    return { ...item, revenue, profit };
  };

  const uploadExcelFile = async (file: File) => {
    setIsLoading(true);
    try {
      // Send Excel file to MySQL via API
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch(API_ENDPOINTS.SALES.UPLOAD, {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const newItems = await response.json();
      
      // Transform data to match our frontend model if needed
      const transformedItems = newItems.map((item: any) => ({
        id: item.id.toString(),
        date: item.date.substring(0, 10), // Format YYYY-MM-DD
        orderNumber: item.order_number,
        itemName: item.item_name,
        sellingPrice: item.selling_price,
        quantity: item.quantity,
        buyingPrice: item.buying_price,
        paymentMode: item.payment_mode,
        profit: item.profit,
        revenue: item.revenue
      }));
      
      setSalesData(prevData => [...prevData, ...transformedItems]);
      
      toast.success(`Successfully imported ${transformedItems.length} items`);
    } catch (error) {
      console.error("Error uploading file:", error);
      toast.error("Failed to process Excel file. Please ensure the server is running and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const addSalesItem = async (item: Omit<SalesItem, "id" | "profit" | "revenue">) => {
    setIsLoading(true);
    try {
      const newItem = {
        ...item
      };
      
      const itemWithCalculations = calculateProfitAndRevenue(newItem);
      
      // Prepare data for API (convert to snake_case for backend)
      const apiItem = {
        date: itemWithCalculations.date,
        order_number: itemWithCalculations.orderNumber,
        item_name: itemWithCalculations.itemName,
        selling_price: itemWithCalculations.sellingPrice,
        quantity: itemWithCalculations.quantity,
        buying_price: itemWithCalculations.buyingPrice,
        payment_mode: itemWithCalculations.paymentMode,
        profit: itemWithCalculations.profit,
        revenue: itemWithCalculations.revenue
      };
      
      // Send to MySQL via API
      const response = await fetch(API_ENDPOINTS.SALES.ADD, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(apiItem)
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const addedItem = await response.json();
      
      // Transform response to match frontend model
      const transformedItem: SalesItem = {
        id: addedItem.id.toString(),
        date: addedItem.date.substring(0, 10), // Format YYYY-MM-DD
        orderNumber: addedItem.order_number,
        itemName: addedItem.item_name,
        sellingPrice: addedItem.selling_price,
        quantity: addedItem.quantity,
        buyingPrice: addedItem.buying_price,
        paymentMode: addedItem.payment_mode,
        profit: addedItem.profit,
        revenue: addedItem.revenue
      };
      
      setSalesData(prevData => [...prevData, transformedItem]);
      
      toast.success("Item added successfully");
    } catch (error) {
      console.error("Error adding item:", error);
      toast.error("Failed to add item. Please ensure the server is running and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const deleteSalesItem = async (id: string) => {
    setIsLoading(true);
    try {
      console.log(`Deleting item with ID: ${id}`);
      
      // Delete from MySQL via API
      const response = await fetch(`${API_ENDPOINTS.SALES.DELETE}/${id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      // Update local state
      setSalesData(prevData => {
        const updatedData = prevData.filter(item => item.id !== id);
        console.log(`Filtered data: ${updatedData.length} items (removed ID: ${id})`);
        return updatedData;
      });
      
      toast.success("Item deleted successfully");
    } catch (error) {
      console.error("Error deleting item:", error);
      toast.error("Failed to delete item. Please ensure the server is running and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredSalesData = (filter?: DateRangeFilter) => {
    if (!filter || (!filter.startDate && !filter.endDate)) {
      return salesData;
    }

    return salesData.filter(item => {
      const itemDate = new Date(item.date);
      
      if (filter.startDate && filter.endDate) {
        return itemDate >= filter.startDate && itemDate <= filter.endDate;
      }
      
      if (filter.startDate) {
        return itemDate >= filter.startDate;
      }
      
      if (filter.endDate) {
        return itemDate <= filter.endDate;
      }
      
      return true;
    });
  };

  const getSalesSummary = async (): Promise<SalesSummary> => {
    try {
      // Aggregate summary from local salesData instead of fetching from backend
      // Calculate revenue as sum of sellingPrice (not multiplied by quantity)
      // Calculate profit as sum of (sellingPrice - buyingPrice) absolute per record
      const totalRevenue = salesData.reduce((sum, item) => sum + (item.sellingPrice || 0), 0);
      const totalProfit = salesData.reduce(
        (sum, item) => sum + ((item.sellingPrice || 0) - (item.buyingPrice || 0)),
        0
      );
      const totalSales = salesData.length; // absolute count of sales records
      const averageOrderValue = totalSales > 0 ? totalRevenue / totalSales : 0;

      // Sum quantity per product
      const quantityPerProduct: Record<string, number> = {};
      salesData.forEach(item => {
        if (!quantityPerProduct[item.itemName]) {
          quantityPerProduct[item.itemName] = 0;
        }
        quantityPerProduct[item.itemName] += Number(item.quantity) || 0;
      });

      // Prepare topSellingItems array from quantityPerProduct
      const topSellingItems = Object.entries(quantityPerProduct)
        .map(([itemName, quantity]) => ({ itemName, quantity }))
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 5); // top 5 items

      // Payment methods summary (optional, keep empty for now)
      const paymentMethods: { method: string; count: number }[] = [];

      return {
        totalRevenue,
        totalProfit,
        totalSales,
        averageOrderValue,
        topSellingItems,
        paymentMethods
      };
    } catch (error) {
      console.error("Error calculating sales summary:", error);
      toast.error("Failed to calculate sales summary.");

      // Return empty summary if error occurs
      return {
        totalRevenue: 0,
        totalProfit: 0,
        totalSales: 0,
        averageOrderValue: 0,
        topSellingItems: [],
        paymentMethods: []
      };
    }
  };

  const value = {
    salesData,
    isLoading,
    uploadExcelFile,
    addSalesItem,
    deleteSalesItem,
    getSalesSummary,
    filteredSalesData
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
};
