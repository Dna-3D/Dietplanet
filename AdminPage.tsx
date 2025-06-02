import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { AdminDashboard } from "@/components/AdminDashboard";

export function AdminPage() {
  const [, setLocation] = useLocation();
  const { userProfile, loading } = useAuth();

  useEffect(() => {
    if (!loading && (!userProfile || !userProfile.isAdmin)) {
      setLocation("/");
    }
  }, [userProfile, loading, setLocation]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!userProfile?.isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen pt-16">
      <AdminDashboard open={true} onOpenChange={() => setLocation("/")} />
    </div>
  );
}
