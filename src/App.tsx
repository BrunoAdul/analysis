import { Toaster } from "./components/ui/toaster";
import { Toaster as Sonner } from "./components/ui/sonner";
import { TooltipProvider } from "./components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { DataProvider } from "./contexts/DataContext";
import DashboardLayout from "./components/layout/DashboardLayout";
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import Dashboard from "./pages/Dashboard/Dashboard";
import SalesAnalysis from "./pages/Sales/SalesAnalysis";
import SalesList from "./pages/Sales/SalesList";
import DataEntry from "./pages/Data/DataEntry";
import UserManagement from "./pages/Admin/UserManagement";
import Settings from "./pages/Admin/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

const AppRoutes = () => {
  const { user } = useAuth();
  
  return (
    <Routes>
      <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" replace />} />
      <Route path="/register" element={!user ? <Register /> : <Navigate to="/dashboard" replace />} />
      
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <Dashboard />
            </DashboardLayout>
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/sales" 
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <SalesAnalysis />
            </DashboardLayout>
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/sales-list" 
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <SalesList />
            </DashboardLayout>
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/data-entry" 
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <DataEntry />
            </DashboardLayout>
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/user-management" 
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <UserManagement />
            </DashboardLayout>
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/settings" 
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <Settings />
            </DashboardLayout>
          </ProtectedRoute>
        } 
      />
      
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <DataProvider>
            <AppRoutes />
          </DataProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
