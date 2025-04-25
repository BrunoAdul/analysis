import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, UserRole } from "@/types";
import { API_ENDPOINTS } from "@/config/api";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  signup: (email: string, password: string, name: string) => Promise<void>;
  hasPermission: (requiredRole: UserRole) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check session status on component mount
  useEffect(() => {
    const verifySession = async () => {
      try {
        // Check if we have a user ID in sessionStorage (not localStorage)
        const userId = sessionStorage.getItem("userId");
        
        if (!userId) {
          setUser(null);
          setIsLoading(false);
          return;
        }
        
        // Verify with the server that this user still exists
        const response = await fetch(API_ENDPOINTS.AUTH.VERIFY_SESSION, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${userId}`
          }
        });

        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        } else {
          // If verification fails, clear session storage
          sessionStorage.removeItem("userId");
          setUser(null);
        }
      } catch (error) {
        console.error('Session verification failed:', error);
        sessionStorage.removeItem("userId");
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    verifySession();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(API_ENDPOINTS.AUTH.LOGIN, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      const userData = await response.json();
      
      // Store only the user ID in sessionStorage (not localStorage)
      // This will be cleared when the browser tab is closed
      sessionStorage.setItem("userId", userData.id.toString());
      
      setUser(userData);
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (email: string, password: string, name: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(API_ENDPOINTS.AUTH.REGISTER, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, name }),
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      const userData = await response.json();
      
      // Store only the user ID in sessionStorage (not localStorage)
      sessionStorage.setItem("userId", userData.id.toString());
      
      setUser(userData);
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      // Call logout endpoint (mostly for logging purposes)
      await fetch(API_ENDPOINTS.AUTH.LOGOUT, {
        method: 'POST',
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear session storage and user state
      sessionStorage.removeItem("userId");
      setUser(null);
    }
  };

  const hasPermission = (requiredRole: UserRole): boolean => {
    if (!user) return false;

    const roles: Record<UserRole, number> = {
      admin: 3,
      manager: 2,
      user: 1
    };

    return roles[user.role] >= roles[requiredRole];
  };

  const value = {
    user,
    isLoading,
    login,
    logout,
    signup,
    hasPermission
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
