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

// --- Quotes ---
export const getQuotes = () => api.get("/admin/quotes");

export const updateQuote = (key, text) =>
  api.put(`/admin/quotes/${key}`, { text });

// --- Capsules ---
export const getAdminCapsules = () => api.get("/admin/capsules");

// ✅ CREATE (JSON) : payload = { title, description, category, type, duration, price, thumbnail, s3Key, date }
export const createAdminCapsule = (payload) =>
  api.post("/admin/capsules", payload);

// ✅ UPDATE (JSON)
export const updateAdminCapsule = (id, payload) =>
  api.put(`/admin/capsules/${id}`, payload);

// ✅ DELETE
export const deleteAdminCapsule = (id) =>
  api.delete(`/admin/capsules/${id}`);

// --- S3 upload (Admin) ---
export const getCapsuleUploadUrl = ({ filename, contentType }) =>
  api.post("/admin/capsules/upload-url", { filename, contentType });

export const getThumbnailUploadUrl = ({ filename, contentType }) =>
  api.post("/admin/capsules/thumbnail-upload-url", { filename, contentType });