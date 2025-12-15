// src/context/AuthProvider.jsx
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api, attachAuthInterceptor } from "../lib/api";

const AuthContext = createContext(null);

function safeParse(json) {
  try {
    if (!json || json === "undefined" || json === "null") return null;
    return JSON.parse(json);
  } catch { return null; }
}

export function AuthProvider({ children }) {
  const tokenInit = (() => {
    const t = localStorage.getItem("ctb_token");
    return t && t !== "undefined" && t !== "null" ? t : "";
  })();

  const [token, setToken] = useState(tokenInit);
  const [user, setUser] = useState(() => safeParse(localStorage.getItem("ctb_user")));
  const [loading, setLoading] = useState(!!tokenInit);

  const logout = () => {
    localStorage.removeItem("ctb_token");
    localStorage.removeItem("ctb_user");
    setToken("");
    setUser(null);
    // Laisse le guard router gérer la redirection, pas besoin de forcer ici
  };

  // Attacher les intercepteurs axios une seule fois
  useEffect(() => {
    attachAuthInterceptor(
      () => token,
      () => logout()
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Valider le token au démarrage / quand il change
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!token) { setLoading(false); return; }
      try {
        const { data } = await api.get("/auth/me");
        if (cancelled) return;
        setUser(data.user);
        localStorage.setItem("ctb_user", JSON.stringify(data.user));
      } catch {
        if (!cancelled) logout();
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [token]);

  async function login(email, password) {
    const { data } = await api.post("/auth/login", { email, password });
    localStorage.setItem("ctb_token", data.token ?? "");
    localStorage.setItem("ctb_user", JSON.stringify(data.user ?? null));
    setToken(data.token);
    setUser(data.user);
    return data.user;
  }

  const value = useMemo(() => ({
    token, user, loading, login, logout, isAdmin: user?.role === "ADMIN"
  }), [token, user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() { return useContext(AuthContext); }