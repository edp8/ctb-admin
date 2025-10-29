import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthProvider";

export default function RequireAuth({ children, requireAdmin = false }) {
  const { user, loading, isAdmin } = useAuth();
  const location = useLocation();

  if (loading) return <p style={{ padding: 24 }}>Chargement…</p>;
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;
  if (requireAdmin && !isAdmin) return <Navigate to="/login" replace />;
  return children;
}