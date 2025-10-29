import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL
});

// Intercepteur pour ajouter le Bearer token
export function attachAuthInterceptor(getToken, onUnauthorized) {
  api.interceptors.request.use((config) => {
    const t = getToken?.();
    if (t) config.headers.Authorization = `Bearer ${t}`;
    return config;
  });

  api.interceptors.response.use(
    (res) => res,
    (err) => {
      const status = err?.response?.status;
      if (status === 401 || status === 403) {
        onUnauthorized?.();
      }
      return Promise.reject(err);
    }
  );
}