import { Navigate } from "react-router-dom";
import { useAuth } from "../AuthContext.jsx";

export default function ProtectedRoute({ children }) {
  const { adminToken } = useAuth();

  if (!adminToken) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
}
