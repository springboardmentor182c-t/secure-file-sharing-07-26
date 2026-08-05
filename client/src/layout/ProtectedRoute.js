import { Navigate, Outlet } from "react-router-dom";

function ProtectedRoute() {
  // Replace this with Context API or JWT later
  const token = localStorage.getItem("token");

  return token ? <Outlet /> : <Navigate to="/login" replace />;
}

export default ProtectedRoute;