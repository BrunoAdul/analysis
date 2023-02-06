import { ReactNode, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "@/components/ui/sonner";
import {
  BarChart,
  FileSpreadsheet,
  Home,
  List,
  LogOut,
  Menu,
  Settings,
  Users,
  X,
} from "lucide-react";

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const { user, logout, hasPermission } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    navigate("/login");
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  // Helper function to normalize URLs by removing duplicate slashes in the path part
  const normalizeUrl = (url: string): string => {
    try {
      const urlObj = new URL(url);
      // Replace multiple slashes in pathname with a single slash
      urlObj.pathname = urlObj.pathname.replace(/\/{2,}/g, "/");
      return urlObj.toString();
    } catch {
      // If invalid URL, return as is
      return url;
    }
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Mobile sidebar toggle */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="rounded-full bg-background"
        >
          {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
        </Button>
      </div>

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 transform bg-sidebar text-sidebar-foreground w-64 z-40 transition-transform duration-300 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 lg:relative overflow-y-auto`}
      >
        <div className="flex flex-col h-full">
          <div className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <FileSpreadsheet className="h-6 w-6 text-sidebar-primary" />
              <span className="font-bold text-xl">Excel Flow</span>
            </div>

            <div className="space-y-1 mt-8">
              <NavLinkItem to="/dashboard" icon={<Home size={18} />} label="Dashboard" />
              <NavLinkItem
                to="/sales"
                icon={<BarChart size={18} />}
                label="Sales Analysis"
              />
              <NavLinkItem
                to="/data-entry"
                icon={<FileSpreadsheet size={18} />}
                label="Data Entry"
              />
              <NavLinkItem
                to="/sales-list"
                icon={<List size={18} />}
                label="Sales Records"
              />
              
              {hasPermission("admin") && (
                <NavLinkItem
                  to="/user-management"
                  icon={<Users size={18} />}
                  label="User Management"
                />
              )}
              
              {hasPermission("manager") && (
                <NavLinkItem
                  to="/settings"
                  icon={<Settings size={18} />}
                  label="Settings"
                />
              )}
            </div>
          </div>

          <div className="mt-auto p-4 border-t border-sidebar-border">
            {user && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={normalizeUrl(user.avatarUrl)} alt={user.name} />
                    <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{user.name}</p>
                    <p className="text-xs text-sidebar-foreground/70 capitalize">
                      {user.role}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleLogout}
                  className="text-sidebar-foreground hover:text-sidebar-foreground/80 hover:bg-sidebar-accent"
                >
                  <LogOut size={18} />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-y-auto">
        <main className="p-4 md:p-6 max-w-7xl mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

interface NavLinkItemProps {
  to: string;
  icon: ReactNode;
  label: string;
}

const NavLinkItem = ({ to, icon, label }: NavLinkItemProps) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
          isActive
            ? "bg-sidebar-accent text-sidebar-accent-foreground"
            : "text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
        }`
      }
    >
      {icon}
      <span>{label}</span>
    </NavLink>
  );
};

export default DashboardLayout;