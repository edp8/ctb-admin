import { useEffect, useState } from "react";
import { api } from "../lib/api";

export default function Newsletter(){
  const [items, setItems] = useState([]);
  const [err, setErr] = useState("");

  useEffect(() => {
    // Quand tu seras prête à brancher /admin/newsletter :
    // api.get("/admin/newsletter").then(r => setItems(r.data.items || [])).catch(e => setErr("Erreur de chargement"));
  }, []);

  return (
    <main style={{ padding: 24, fontFamily: "system-ui" }}>
      <h2>Infolettre</h2>
      {err && <p style={{ color:"crimson" }}>{err}</p>}
      <p>(En cours — brancher la route quand tu voudras)</p>
      <button onClick={() => window.location.href = `${import.meta.env.VITE_API_URL}/admin/newsletter/export` }>
        Exporter CSV
      </button>
      <ul>
        {items.map(s => (
          <li key={s.id}>{s.email}</li>
        ))}
      </ul>
    </main>
  );
}