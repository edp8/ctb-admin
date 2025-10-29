import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL
});

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
      const url = err?.config?.url || "";
      // ⬇️ NE PAS déloguer si c'est la route de login
      const isLoginRequest = url.includes("/auth/login");

      if (!isLoginRequest && (status === 401 || status === 403)) {
        onUnauthorized?.();
      }
      return Promise.reject(err);
    }
  );
}