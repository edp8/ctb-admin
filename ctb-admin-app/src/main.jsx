import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthProvider";
import RequireAuth from "./components/RequireAuth";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Newsletter from "./pages/Newsletter";

const router = createBrowserRouter([
  // Par défaut, on redirige vers /login
  { path: "/", element: <Navigate to="/login" replace /> },

  // Public
  { path: "/login", element: <Login /> },

  // Protégées (ADMIN uniquement si tu veux durcir)
  { path: "/dashboard", element: <RequireAuth><Dashboard /></RequireAuth> },
  { path: "/newsletter", element: <RequireAuth requireAdmin><Newsletter /></RequireAuth> },

  // 404 simple
  { path: "*", element: <Navigate to="/login" replace /> },
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </StrictMode>
);