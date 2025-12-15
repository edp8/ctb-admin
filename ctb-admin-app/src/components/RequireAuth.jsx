// src/routes/RequireAuth.jsx
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthProvider";

export default function RequireAuth() {
  const { token, loading } = useAuth();
  if (loading) return <div style={{padding:24}}>Chargement…</div>;
  if (!token) return <Navigate to="/login" replace />;
  return <Outlet />;
}

