
import { ReactNode } from "react";
import { UserRole } from "@/types";
import { useAuth } from "@/contexts/AuthContext";

interface PermissionGuardProps {
  requiredRole: UserRole;
  children: ReactNode;
  fallback?: ReactNode;
}

const PermissionGuard = ({ 
  requiredRole, 
  children, 
  fallback = <div className="p-4 text-muted-foreground">You don't have permission to view this content.</div> 
}: PermissionGuardProps) => {
  const { hasPermission } = useAuth();
  
  if (!hasPermission(requiredRole)) {
    return <>{fallback}</>;
  }
  
  return <>{children}</>;
};

export default PermissionGuard;
