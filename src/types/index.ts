
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatarUrl?: string;
}

export type UserRole = 'admin' | 'manager' | 'user';

export interface SalesItem {
  id: string;
  date: string;
  orderNumber: string;
  itemName: string;
  sellingPrice: number;
  quantity: string;
  buyingPrice: number;
  paymentMode: string;
  profit: number;
  revenue: number;
}

export interface SalesSummary {
  totalRevenue: number;
  totalProfit: number;
  totalSales: number;
  averageOrderValue: number;
  topSellingItems: { name: string; quantity: number }[];
  paymentMethods: { method: string; count: number }[];
}

export interface DateRangeFilter {
  startDate: Date | null;
  endDate: Date | null;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: Date;
  isSystemMessage?: boolean;
}
