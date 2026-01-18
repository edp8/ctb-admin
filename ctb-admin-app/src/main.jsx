// src/main.jsx
import { StrictMode, Suspense, lazy } from "react";
import { createRoot } from "react-dom/client";
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./context/AuthProvider";
import RequireAuth from "./components/RequireAuth";
import QuotesPage from "./pages/Quotes";
import CapsulesPage from "./pages/Capsules";
import AdminTherapiesCatalogPage from "./pages/Therapies";
import AdminMartialArtsCatalogPage from "./pages/ArtsMartiaux";

// 💡 Lazy loading des pages pour perf
const Login = lazy(() => import("./pages/Login"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Newsletter = lazy(() => import("./pages/Newsletter"));

// ✅ Définition claire et future-proof des routes
const router = createBrowserRouter([
  { path: "/", element: <Navigate to="/login" replace /> },
  { path: "/login", element: <Login /> },
  {
    element: <RequireAuth />, // tout ce qui est protégé
    children: [
      { path: "/dashboard", element: <Dashboard /> },
      { path: "/newsletter", element: <Newsletter /> },
      { path: "/quotes", element: <QuotesPage /> },
      { path: "/capsules", element: <CapsulesPage /> },
      { path: "/therapies", element: <AdminTherapiesCatalogPage /> },
      { path: "/arts-martiaux", element: <AdminMartialArtsCatalogPage /> },
    ],
  },
  { path: "*", element: <Navigate to="/login" replace /> },
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <Suspense fallback={<div style={{ padding: 24 }}>Chargement...</div>}>
        <RouterProvider router={router} />
      </Suspense>
    </AuthProvider>
  </StrictMode>
);