"use client";

import { useRouter } from "next/navigation";
import { deleteCharacter } from "@/app/actions/data";

export default function CharacterList({
  characters,
  gameId,
}: {
  characters: {
    id: string;
    name: string;
    farm_name: string;
    avatar: string;
    description: string;
    author_name: string;
  }[];
  gameId: string;
}) {
  const router = useRouter();

  async function onDelete(id: string) {
    if (!confirm("¿Eliminar este personaje?")) return;
    const res = await deleteCharacter(id, gameId);
    if (res?.ok) router.refresh();
  }

  return (
    <div className="char-grid">
      {characters.map((c) => (
        <div className="char-card" key={c.id}>
          {c.avatar ? (
            <img className="char-avatar" src={c.avatar} alt={c.name} />
          ) : (
            <div className="char-avatar placeholder">👤</div>
          )}
          <div className="char-body">
            <h3>{c.name}</h3>
            {c.farm_name && <div className="farm">🏡 {c.farm_name}</div>}
            {c.description && <p className="desc">{c.description}</p>}
            {c.author_name && <div className="char-owner">👤 {c.author_name}</div>}
            <div style={{ marginTop: 8 }}>
              <button className="btn btn-danger btn-sm" onClick={() => onDelete(c.id)}>
                Eliminar
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
