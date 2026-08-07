"use client";

import { useRouter } from "next/navigation";
import { deleteGame } from "@/app/actions/data";

export default function DeleteGameButton({ gameId }: { gameId: string }) {
  const router = useRouter();

  async function onDelete() {
    if (!confirm("¿Eliminar este juego y todos sus personajes y entradas?")) return;
    const res = await deleteGame(gameId);
    if (res && "error" in res && res.error) {
      alert(res.error);
      return;
    }
    router.push("/games");
    router.refresh();
  }

  return (
    <button className="btn btn-danger btn-sm" onClick={onDelete}>
      Eliminar juego
    </button>
  );
}
