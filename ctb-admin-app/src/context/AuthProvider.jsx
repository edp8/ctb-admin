import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api, attachAuthInterceptor } from "../lib/api";

const AuthContext = createContext(null);

function safeParse(json) {
    try {
        if (!json) return null;
        if (json === 'undefined' || json === 'null') return null;
        return JSON.parse(json);
    } catch {
        return null;
    }
}

export function AuthProvider({ children }) {
    const [token, setToken] = useState(() => {
        const t = localStorage.getItem("ctb_token");
        return (t && t !== 'undefined' && t !== 'null') ? t : "";
    });
    const [user, setUser] = useState(() => safeParse(localStorage.getItem("ctb_user")));
    const [loading, setLoading] = useState(!!token);

    const logout = () => {
        setToken("");
        setUser(null);
        localStorage.removeItem("ctb_token");
        localStorage.removeItem("ctb_user");
        if (location.pathname !== "/login") location.replace("/login");
    };

    // Attacher les intercepteurs axios une seule fois
    useEffect(() => {
        attachAuthInterceptor(
            () => token,
            () => logout()
        );
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Si on a déjà un token au chargement, on valide avec /auth/me
    useEffect(() => {
        let cancelled = false;
        async function fetchMe() {
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
        }
        fetchMe();
        return () => { cancelled = true; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token]);

    async function login(email, password) {
        console.log("[Auth] login() start", email);
        const { data } = await api.post("/auth/login", { email, password });
        console.log("[Auth] backend response:", data);
        setToken(data.token);
        setUser(data.user);
        localStorage.setItem("ctb_token", data.token ?? "");
        localStorage.setItem("ctb_user", JSON.stringify(data.user ?? null));
        console.log("[Auth] user set, navigating soon");
        return data.user;
    }

    const value = useMemo(() => ({
        token, user, loading, login, logout, isAdmin: user?.role === "ADMIN"
    }), [token, user, loading]);

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    return useContext(AuthContext);
}