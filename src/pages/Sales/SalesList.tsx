import { useState } from "react";
import { useData } from "@/contexts/DataContext";
import { useAuth } from "@/contexts/AuthContext";
import { SalesItem } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from "@/components/ui/pagination";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "@/components/ui/sonner";
import { Download, FileSpreadsheet, Search, Trash } from "lucide-react";
import PermissionGuard from "@/components/auth/PermissionGuard";
import * as XLSX from 'xlsx';

const SalesList = () => {
  const { salesData, deleteSalesItem } = useData();
  const { hasPermission } = useAuth();
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedItem, setSelectedItem] = useState<SalesItem | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  const itemsPerPage = 10;
  
  // Filter items by search term
  const filteredItems = (salesData || []).filter(item => {
    if (!item) return false;
    
    const searchLower = search.toLowerCase();
    return (
      (item.itemName?.toLowerCase() || '').includes(searchLower) ||
      (item.orderNumber?.toLowerCase() || '').includes(searchLower) ||
      (item.paymentMode?.toLowerCase() || '').includes(searchLower)
    );
  });
  
  // Paginate items
  const paginatedItems = filteredItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };
  
  const handleDeleteItem = () => {
    if (selectedItem) {
      deleteSalesItem(selectedItem.id);
      setIsDeleteDialogOpen(false);
      setSelectedItem(null);
    }
  };
  
  const confirmDelete = (item: SalesItem) => {
    setSelectedItem(item);
    setIsDeleteDialogOpen(true);
  };
  
  const exportToExcel = () => {
    if (!salesData || salesData.length === 0) {
      toast.error('No data to export');
      return;
    }
    
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(
      salesData.map(item => ({
        Date: item?.date || '',
        'Order Number': item?.orderNumber || '',
        'Item Name': item?.itemName || '',
        'Selling Price': item?.sellingPrice || 0,
        'Quantity': item?.quantity || 0,
        'Buying Price': item?.buyingPrice || 0,
        'Payment Mode': item?.paymentMode || '',
        'Revenue': item?.revenue || 0,
        'Profit': item?.profit || 0
      }))
    );
    
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sales Data');
    XLSX.writeFile(workbook, 'sales_data.xlsx');
    
    toast.success('Successfully exported data to Excel');
  };
  
  const formatCurrency = (amount: number | undefined | null) => {
    if (amount === undefined || amount === null || isNaN(Number(amount))) return 'Ksh 0.00';
    return `Ksh ${Number(amount).toFixed(2)}`;
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Sales Records</h1>
          <p className="text-muted-foreground">View and manage your sales data</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search records..."
              className="pl-8"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          <PermissionGuard requiredRole="manager">
            <Button variant="outline" onClick={exportToExcel} className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Export</span>
            </Button>
          </PermissionGuard>
        </div>
      </div>
      
      <div className="data-grid rounded-md border">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Order #</TableHead>
                <TableHead>Item</TableHead>
                <TableHead className="text-right">Selling Price</TableHead>
                <TableHead className="text-right">Qty</TableHead>
                <TableHead className="text-right">Buying Price</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead className="text-right">Revenue</TableHead>
                <TableHead className="text-right">Profit</TableHead>
                <TableHead className="w-[80px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedItems.length > 0 ? (
                paginatedItems.map(item => (
                  <TableRow key={item.id}>
                    <TableCell>{new Date(item.date).toLocaleDateString()}</TableCell>
                    <TableCell>{item.orderNumber}</TableCell>
                    <TableCell>{item.itemName}</TableCell>
                    <TableCell className="text-right">{formatCurrency(item.sellingPrice)}</TableCell>
                    <TableCell className="text-right">{item.quantity}</TableCell>
                    <TableCell className="text-right">{formatCurrency(item.buyingPrice)}</TableCell>
                    <TableCell>{item.paymentMode}</TableCell>
                    <TableCell className="text-right">{formatCurrency(item.revenue)}</TableCell>
                    <TableCell className="text-right">
                      <span className={item.profit && item.profit > 0 ? "text-success-600" : "text-destructive"}>
                        {formatCurrency(item.profit)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <PermissionGuard requiredRole="admin">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => confirmDelete(item)}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </PermissionGuard>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={10} className="h-24 text-center">
                    {salesData.length === 0 ? (
                      <div className="flex flex-col items-center justify-center text-muted-foreground">
                        <FileSpreadsheet className="h-8 w-8 mb-2" />
                        <p>No sales data available</p>
                        <p className="text-sm">Upload an Excel file or add items manually</p>
                      </div>
                    ) : (
                      <div className="text-muted-foreground">
                        No results found for "{search}"
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        
        {totalPages > 1 && (
          <div className="p-4 border-t">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    href="#" 
                    onClick={(e) => {
                      e.preventDefault();
                      if (currentPage > 1) handlePageChange(currentPage - 1);
                    }}
                    className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <PaginationItem key={page}>
                    <PaginationLink 
                      href="#" 
                      onClick={(e) => {
                        e.preventDefault();
                        handlePageChange(page);
                      }}
                      isActive={page === currentPage}
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                
                <PaginationItem>
                  <PaginationNext 
                    href="#" 
                    onClick={(e) => {
                      e.preventDefault();
                      if (currentPage < totalPages) handlePageChange(currentPage + 1);
                    }}
                    className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>
      
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Sales Record</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this sales record? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          {selectedItem && (
            <div className="bg-muted p-3 rounded-md text-sm">
              <div><strong>Item:</strong> {selectedItem.itemName}</div>
              <div><strong>Order:</strong> {selectedItem.orderNumber}</div>
              <div><strong>Date:</strong> {new Date(selectedItem.date).toLocaleDateString()}</div>
              <div><strong>Amount:</strong> {formatCurrency(selectedItem.revenue)}</div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteItem}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SalesList;
