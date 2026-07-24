import { Navigate, useLocation } from "react-router";
import type { ReactNode } from "react";
import { useAuth } from "../context/AuthContext";
import { Shield } from "lucide-react";

function AuthLoadingScreen() {
  return (
    <div className="min-h-screen bg-[#212531] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#4B3A70] flex items-center justify-center animate-pulse">
          <Shield size={18} className="text-white" />
        </div>
        <p className="text-[#C5C3C4]/50 text-xs">Loading…</p>
      </div>
    </div>
  );
}

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return <AuthLoadingScreen />;

  if (!isAuthenticated) {
    return <Navigate to="/signin" replace state={{ from: location }} />;
  }

  return <>{children}</>;
}

/** Redirects an already-authenticated user away from auth pages like /signin. */
export function GuestOnlyRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <AuthLoadingScreen />;

  if (isAuthenticated) {
    return <Navigate to="/app" replace />;
  }

  return <>{children}</>;
}
