import Link from "next/link";

const statusLabels: Record<string, string> = {
  jugando: "Jugando",
  terminado: "Terminado",
  backlog: "Backlog",
  abandonado: "Abandonado",
};

export default function GameCard({ game }: { game: { id: string; title: string; cover: string; status: string; platform: string } }) {
  const label = statusLabels[game.status] || game.status;
  return (
    <Link href={`/games/${game.id}`} className="game-card">
      {game.cover ? (
        <img className="game-cover" src={game.cover} alt={game.title} />
      ) : (
        <div className="game-cover placeholder">🎮</div>
      )}
      <div className="game-card-body">
        <div className="game-card-title">{game.title}</div>
        <div className="game-card-meta">
          <span className={`badge ${game.status === "terminado" ? "ok" : game.status === "jugando" ? "" : "dim"}`}>
            {label}
          </span>
          {game.platform && <span>{game.platform}</span>}
        </div>
      </div>
    </Link>
  );
}
