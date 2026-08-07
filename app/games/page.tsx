import Link from "next/link";
import { db } from "@/lib/db";
import GameCard from "@/components/GameCard";

export const metadata = { title: "Juegos - RataGamer" };

export default function GamesPage() {
  const games = db
    .prepare("SELECT * FROM games ORDER BY created_at DESC")
    .all() as {
    id: string;
    title: string;
    cover: string;
    status: string;
    platform: string;
    rating: number;
  }[];

  return (
    <main className="container page">
      <div className="page-header">
        <div>
          <h1>Mis juegos</h1>
          <p className="sub">{games.length} {games.length === 1 ? "juego registrado" : "juegos registrados"}</p>
        </div>
        <Link href="/games/new" className="btn">+ Nuevo juego</Link>
      </div>

      {games.length === 0 ? (
        <div className="empty">
          No hay juegos todavía. <Link href="/games/new" style={{ color: "var(--accent)" }}>Agrega el primero</Link> 🎮
        </div>
      ) : (
        <div className="grid">
          {games.map((g) => (
            <GameCard key={g.id} game={g} />
          ))}
        </div>
      )}
    </main>
  );
}
