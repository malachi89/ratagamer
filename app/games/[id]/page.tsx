import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { getCurrentUser, ensureWhitelistedUsers } from "@/lib/auth";
import CharacterForm from "@/components/CharacterForm";
import EntryForm from "@/components/EntryForm";
import CharacterList from "@/components/CharacterList";
import EntryList from "@/components/EntryList";

const statusLabels: Record<string, string> = {
  jugando: "Jugando",
  terminado: "Terminado",
  backlog: "Backlog",
  abandonado: "Abandonado",
};

export const metadata = { title: "Juego - RataGamer" };

export default async function GameDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { id } = await params;

  const game = db.prepare("SELECT * FROM games WHERE id = ?").get(id) as
    | {
        id: string;
        title: string;
        platform: string;
        status: string;
        cover: string;
        rating: number;
        started_at: string;
        finished_at: string;
        notes: string;
        created_by: string;
      }
    | undefined;

  if (!game) notFound();

  const characters = db
    .prepare(
      `SELECT c.*, u.name as author_name FROM characters c
       LEFT JOIN users u ON u.id = c.created_by
       WHERE c.game_id = ? ORDER BY c.created_at ASC`
    )
    .all(id) as {
    id: string;
    game_id: string;
    name: string;
    farm_name: string;
    avatar: string;
    description: string;
    created_by: string;
    author_name: string;
    created_at: string;
  }[];

  const members = ensureWhitelistedUsers();

  const entries = db
    .prepare(
      `SELECT e.*, u.name as author_name FROM entries e
       JOIN users u ON u.id = e.author_id
       WHERE e.game_id = ? ORDER BY e.date DESC, e.created_at DESC`
    )
    .all(id) as {
    id: string;
    game_id: string;
    author_id: string;
    author_name: string;
    date: string;
    hours: number;
    title: string;
    content: string;
    created_at: string;
  }[];

  return (
    <main className="container page">
      <div className="page-header">
        <Link href="/games" className="btn btn-secondary btn-sm">← Volver</Link>
        <div style={{ display: "flex", gap: 10 }}>
          <Link href={`/games/${game.id}/edit`} className="btn btn-secondary btn-sm">Editar</Link>
          <CharacterForm gameId={game.id} users={members} currentUserId={user.id} />
        </div>
      </div>

      <div className="game-hero">
        {game.cover ? (
          <img className="game-hero-cover" src={game.cover} alt={game.title} />
        ) : (
          <div className="game-hero-cover" style={{ display: "flex", alignItems: "center", justifyContent: "center", fontSize: "4rem" }}>
            🎮
          </div>
        )}
        <div className="game-hero-info">
          <h1>{game.title}</h1>
          <div className="meta-list">
            <span>
              <b>Estado:</b> {statusLabels[game.status] || game.status}
            </span>
            {game.platform && (
              <span>
                <b>Plataforma:</b> {game.platform}
              </span>
            )}
            {game.rating > 0 && (
              <span>
                <b>Calificación:</b> {"⭐".repeat(game.rating)}
              </span>
            )}
            {game.started_at && (
              <span>
                <b>Iniciado:</b> {game.started_at}
              </span>
            )}
            {game.finished_at && (
              <span>
                <b>Terminado:</b> {game.finished_at}
              </span>
            )}
          </div>
          {game.notes && <p style={{ color: "var(--text-dim)", whiteSpace: "pre-wrap" }}>{game.notes}</p>}
        </div>
      </div>

      <div className="section">
        <div className="section-header">
          <h2>Personajes</h2>
        </div>
        {characters.length === 0 ? (
          <div className="empty">Aún no hay personajes registrados.</div>
        ) : (
          <CharacterList
            characters={characters}
            gameId={game.id}
            users={members}
            currentUserId={user.id}
          />
        )}
      </div>

      <div className="section">
        <div className="section-header">
          <h2>Diario de juego</h2>
          <EntryForm gameId={game.id} />
        </div>
        {entries.length === 0 ? (
          <div className="empty">Escribe tu primera entrada del diario 📝</div>
        ) : (
          <EntryList entries={entries} gameId={game.id} currentUserId={user.id} />
        )}
      </div>
    </main>
  );
}
