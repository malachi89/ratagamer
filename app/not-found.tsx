import Link from "next/link";

export default function NotFound() {
  return (
    <main className="container page">
      <div className="empty">
        <div style={{ fontSize: "3rem", marginBottom: 12 }}>👾</div>
        <h2>No encontrado</h2>
        <p>El juego no existe o fue eliminado.</p>
        <div style={{ marginTop: 16 }}>
          <Link href="/games" className="btn">Ver juegos</Link>
        </div>
      </div>
    </main>
  );
}
