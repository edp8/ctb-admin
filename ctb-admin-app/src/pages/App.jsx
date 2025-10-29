export default function App() {
  return (
    <main style={{padding:24,fontFamily:"system-ui"}}>
      <h1>CTB – Admin</h1>
      <p>Dashboard shell prêt ✅</p>
      <nav style={{display:"flex", gap:12}}>
        <a href="/login">Login</a>
        <a href="/newsletter">Infolettre</a>
      </nav>
    </main>
  );
}