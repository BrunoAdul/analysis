
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { FileBarChart2 } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    } else {
      navigate("/login");
    }
  }, [user, navigate]);
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="flex items-center justify-center">
          <FileBarChart2 size={60} className="text-brand-600" />
        </div>
        <h1 className="text-4xl font-bold mt-6">Cereaslplace</h1>
        <p className="text-xl text-muted-foreground mt-4">Redirecting to application...</p>
      </div>
    </div>
  );
};

export default Index;
