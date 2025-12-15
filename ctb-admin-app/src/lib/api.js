// src/lib/api.js
import axios from "axios";

const BASE_URL =
  import.meta.env.VITE_API_URL?.replace(/\/$/, "") ||
  "https://api.centrebienetre.ca";

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000, // 15s pour éviter les requêtes bloquées
  headers: { "Content-Type": "application/json" },
});

// 🔒 Ajout de l’intercepteur global
export function attachAuthInterceptor(getToken, onUnauthorized) {
  // --- REQUEST INTERCEPTOR ---
  api.interceptors.request.use(
    (config) => {
      const token =
        localStorage.getItem("ctb_token") || getToken?.();

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      // (Debug temporaire)
      // console.log("[REQ]", config.method?.toUpperCase(), config.url, "Auth:", !!token);
      return config;
    },
    (error) => Promise.reject(error)
  );

  // --- RESPONSE INTERCEPTOR ---
  api.interceptors.response.use(
    (res) => res,
    (err) => {
      const status = err?.response?.status;
      const url = err?.config?.url || "";
      const isLogin = url.includes("/auth/login");
      const isNetwork = !err.response;

      // ✅ Ne déconnecte pas si c’est une erreur réseau ou login
      if (!isLogin && !isNetwork && (status === 401 || status === 403)) {
        console.warn("[AUTH] Token expiré ou invalide → logout");
        onUnauthorized?.();
      }

      return Promise.reject(err);
    }
  );
}