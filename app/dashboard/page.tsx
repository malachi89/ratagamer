import Link from "next/link";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import GameCard from "@/components/GameCard";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const games = db
    .prepare("SELECT * FROM games ORDER BY created_at DESC")
    .all() as {
    id: string;
    title: string;
    cover: string;
    status: string;
    platform: string;
    rating: number;
    created_at: string;
  }[];

  const lastEntry = db
    .prepare(
      `SELECT e.*, g.title as game_title FROM entries e
       JOIN games g ON g.id = e.game_id
       ORDER BY e.date DESC, e.created_at DESC LIMIT 5`
    )
    .all() as {
    id: string;
    game_id: string;
    date: string;
    title: string;
    content: string;
    game_title: string;
    author_id: string;
    hours: number;
  }[];

  const authors = db.prepare("SELECT id, name FROM users").all() as {
    id: string;
    name: string;
  }[];
  const authorMap = new Map(authors.map((a) => [a.id, a.name]));

  const counts = {
    total: games.length,
    jugando: games.filter((g) => g.status === "jugando").length,
    terminados: games.filter((g) => g.status === "terminado").length,
  };

  return (
    <main className="container page">
      <div className="page-header">
        <div>
          <h1>Hola, {user.name} 👋</h1>
          <p className="sub">Tu diario de gaming</p>
        </div>
        <Link href="/games/new" className="btn">
          + Nuevo juego
        </Link>
      </div>

      <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", marginBottom: 32 }}>
        <div className="game-card">
          <div className="game-card-body">
            <div className="game-card-meta" style={{ fontSize: "1.8rem", fontWeight: 700, color: "var(--text)" }}>
              {counts.total}
            </div>
            <div className="game-card-meta">Juegos en total</div>
          </div>
        </div>
        <div className="game-card">
          <div className="game-card-body">
            <div className="game-card-meta" style={{ fontSize: "1.8rem", fontWeight: 700, color: "var(--accent-2)" }}>
              {counts.jugando}
            </div>
            <div className="game-card-meta">Jugando ahora</div>
          </div>
        </div>
        <div className="game-card">
          <div className="game-card-body">
            <div className="game-card-meta" style={{ fontSize: "1.8rem", fontWeight: 700, color: "var(--ok)" }}>
              {counts.terminados}
            </div>
            <div className="game-card-meta">Terminados</div>
          </div>
        </div>
      </div>

      <div className="section">
        <div className="section-header">
          <h2>Recientes</h2>
          <Link href="/games" className="btn btn-secondary btn-sm">
            Ver todos
          </Link>
        </div>
        {games.length === 0 ? (
          <div className="empty">
            Aún no hay juegos. <Link href="/games/new" style={{ color: "var(--accent)" }}>Agrega el primero</Link> 🎮
          </div>
        ) : (
          <div className="grid">
            {games.slice(0, 6).map((g) => (
              <GameCard key={g.id} game={g} />
            ))}
          </div>
        )}
      </div>

      <div className="section">
        <div className="section-header">
          <h2>Últimas entradas</h2>
        </div>
        {lastEntry.length === 0 ? (
          <div className="empty">Todavía no hay entradas en el diario.</div>
        ) : (
          <div className="entry-list">
            {lastEntry.map((e) => (
              <div className="entry" key={e.id}>
                <div className="entry-header">
                  <span className="date">{e.date}</span>
                  <h3>{e.title || e.content.slice(0, 40)}{!e.title && e.content.length > 40 ? "..." : ""}</h3>
                  <span className="entry-author">
                    {authorMap.get(e.author_id) || "?"}
                    {e.hours > 0 ? ` · ${e.hours}h` : ""}
                  </span>
                </div>
                <div className="entry-content dim">
                  {e.title ? e.content.slice(0, 140) : ""}
                  {e.title && e.content.length > 140 ? "..." : ""}
                </div>
                <Link href={`/games/${e.game_id}`} className="btn btn-secondary btn-sm">
                  Ver juego
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
