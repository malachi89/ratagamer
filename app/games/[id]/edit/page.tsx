import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { updateGame } from "@/app/actions/data";
import GameForm from "@/components/GameForm";
import DeleteGameButton from "@/components/DeleteGameButton";

export const metadata = { title: "Editar juego - RataGamer" };

export default async function EditGamePage({
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
      }
    | undefined;

  if (!game) notFound();

  return (
    <main className="container page">
      <div className="page-header">
        <div>
          <h1>Editar juego</h1>
          <p className="sub">{game.title}</p>
        </div>
        <Link href={`/games/${game.id}`} className="btn btn-secondary btn-sm">← Volver</Link>
      </div>
      <div style={{ maxWidth: 560 }}>
        <GameForm action={(fd) => updateGame(id, fd)} submitLabel="Guardar cambios" game={game} />
        <div style={{ marginTop: 24 }}>
          <DeleteGameButton gameId={game.id} />
        </div>
      </div>
    </main>
  );
}
