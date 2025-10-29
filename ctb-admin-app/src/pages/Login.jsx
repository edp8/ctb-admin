import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthProvider";

export default function Login() {
  const [email, setEmail] = useState("admin@centrebienetre.ca");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const from = location.state?.from?.pathname || "/";

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");
    try {
      await login(email.trim(), password);
      navigate(from, { replace: true });
    } catch (e) {
      setErr(e?.response?.data?.error || "Erreur de connexion");
    }
  }

  return (
    <main style={{ display: "grid", placeItems: "center", minHeight: "70vh", padding: 24, fontFamily: "system-ui" }}>
      <div style={{ width: 360, display: "grid", gap: 12 }}>
        <h1>Connexion admin</h1>
        <form onSubmit={onSubmit} style={{ display: "grid", gap: 8 }}>
          <input value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="Email" />
          <input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} placeholder="Mot de passe" />
          {err && <p style={{ color: "crimson" }}>{err}</p>}
          <button>Se connecter</button>
        </form>
      </div>
    </main>
  );
}