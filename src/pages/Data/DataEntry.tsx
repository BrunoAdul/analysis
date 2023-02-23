
import { useState } from "react";
import { useData } from "@/contexts/DataContext";
import { SalesItem } from "@/types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/sonner";
import { useDropzone } from "react-dropzone";
import { FileSpreadsheet, Upload, PlusCircle, FileText } from "lucide-react";
import PermissionGuard from "@/components/auth/PermissionGuard";

const DataEntry = () => {
  const { uploadExcelFile, addSalesItem, isLoading } = useData();
  const [tab, setTab] = useState("upload");
  
  const [formData, setFormData] = useState<Omit<SalesItem, "id" | "profit" | "revenue">>({
    date: new Date().toISOString().split('T')[0],
    orderNumber: "",
    itemName: "",
    sellingPrice: 0,
    quantity: "",
    buyingPrice: 0,
    paymentMode: ""
  });
  
  const handleFormChange = (field: keyof typeof formData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  
  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.orderNumber || !formData.itemName || !formData.paymentMode) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    if (formData.sellingPrice <= 0) {
      toast.error("Selling price must be greater than zero");
      return;
    }
    
    // Add the item
    addSalesItem(formData);
    
    // Reset form
    setFormData({
      date: new Date().toISOString().split('T')[0],
      orderNumber: "",
      itemName: "",
      sellingPrice: 0,
      quantity: "",
      buyingPrice: 0,
      paymentMode: ""
    });
  };
  
  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls']
    },
    multiple: false,
    onDrop: (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (file) {
        uploadExcelFile(file);
      }
    }
  });
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Data Entry</h1>
        <p className="text-muted-foreground">Upload Excel files or add sales items manually</p>
      </div>
      
      <Tabs value={tab} onValueChange={setTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="upload" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            <span>Upload File</span>
          </TabsTrigger>
          <TabsTrigger value="manual" className="flex items-center gap-2">
            <PlusCircle className="h-4 w-4" />
            <span>Add Item</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="upload">
          <Card>
            <CardHeader>
              <CardTitle>Upload Excel File</CardTitle>
              <CardDescription>
                Upload your Excel files containing sales data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div 
                {...getRootProps()} 
                className="file-drop-area cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors"
              >
                <input {...getInputProps()} />
                <div className="flex flex-col items-center justify-center py-10">
                  <FileSpreadsheet className="h-16 w-16 text-muted-foreground mb-4" />
                  <p className="text-lg font-medium">Drag and drop your Excel file here</p>
                  <p className="text-sm text-muted-foreground mt-2">or click to browse files</p>
                  <Button variant="outline" className="mt-4">Select File</Button>
                </div>
              </div>
              
              <div className="mt-6">
                <div className="rounded-md bg-muted p-4">
                  <div className="flex items-start">
                    <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div className="ml-3">
                      <h3 className="text-sm font-medium">Expected File Format</h3>
                      <div className="mt-2 text-sm text-muted-foreground">
                        <p>Your Excel file should have the following columns:</p>
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                          <li>date - Date of sale (YYYY-MM-DD)</li>
                          <li>no - Order number</li>
                          <li>item - Item name</li>
                          <li>price - Selling price</li>
                          <li>quantity - Number of items sold</li>
                          <li>buying price - Cost of items</li>
                          <li>payment mode - Method of payment</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="manual">
          <Card>
            <form onSubmit={handleAddItem}>
              <CardHeader>
                <CardTitle>Add Sales Item</CardTitle>
                <CardDescription>
                  Manually add a new sales record
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date">Date</Label>
                    <Input 
                      id="date" 
                      type="date" 
                      value={formData.date}
                      onChange={(e) => handleFormChange("date", e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="orderNumber">Order Number</Label>
                    <Input 
                      id="orderNumber" 
                      placeholder="E.g., ORD-001" 
                      value={formData.orderNumber}
                      onChange={(e) => handleFormChange("orderNumber", e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="itemName">Item Name</Label>
                  <Input 
                    id="itemName" 
                    placeholder="E.g., Laptop" 
                    value={formData.itemName}
                    onChange={(e) => handleFormChange("itemName", e.target.value)}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="sellingPrice">Selling Price</Label>
                    <Input 
                      id="sellingPrice" 
                      type="number" 
                      placeholder="0.00" 
                      value={formData.sellingPrice || ""}
                      onChange={(e) => handleFormChange("sellingPrice", Number(e.target.value))}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="quantity">Quantity</Label>
                    <Input 
                      id="quantity" 
                      type="text" 
                      placeholder="e.g., 0.25 kg, 1 L" 
                      value={formData.quantity || ""} 
                      onChange={(e) => handleFormChange("quantity", e.target.value)} 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="buyingPrice">Buying Price</Label>
                    <Input 
                      id="buyingPrice" 
                      type="number" 
                      placeholder="0.00" 
                      value={formData.buyingPrice || ""}
                      onChange={(e) => handleFormChange("buyingPrice", Number(e.target.value))}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="paymentMode">Payment Mode</Label>
                  <Input 
                    id="paymentMode" 
                    placeholder="E.g., Credit Card" 
                    value={formData.paymentMode}
                    onChange={(e) => handleFormChange("paymentMode", e.target.value)}
                  />
                </div>
              </CardContent>
              <CardFooter>
                <PermissionGuard 
                  requiredRole="manager"
                  fallback={
                    <div className="text-sm text-amber-600 bg-amber-50 p-2 rounded-md w-full">
                      You need manager permission to add items. Contact your admin.
                    </div>
                  }
                >
                  <Button type="submit" className="w-full">Add Item</Button>
                </PermissionGuard>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DataEntry;
