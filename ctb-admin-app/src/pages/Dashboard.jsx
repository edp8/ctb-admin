import { useAuth } from "../context/AuthProvider";

export default function Dashboard() {
  const { user, logout } = useAuth();
  return (
    <main style={{ padding: 24, fontFamily: "system-ui" }}>
      <header style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
        <h2>Tableau de bord</h2>
        <div>
          <span style={{ marginRight: 12 }}>{user?.email} ({user?.role})</span>
          <button onClick={logout}>Déconnexion</button>
        </div>
      </header>

      <section style={{ display:"grid", gap:12 }}>
        <a href="/newsletter">Infolettre</a>
        {/* Ajoute ici tes autres entrées admin (Capsules, Utilisateurs, etc.) */}
      </section>
    </main>
  );
}