"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteCharacter, updateCharacter } from "@/app/actions/data";
import { MAX_UPLOAD_SIZE } from "@/lib/constants";

type CharacterItem = {
  id: string;
  name: string;
  farm_name: string;
  avatar: string;
  description: string;
  author_name: string;
  created_by: string;
};

export default function CharacterList({
  characters,
  gameId,
  users,
  currentUserId,
}: {
  characters: CharacterItem[];
  gameId: string;
  users: { id: string; name: string }[];
  currentUserId: string;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState<CharacterItem | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onDelete(id: string) {
    if (!confirm("¿Eliminar este personaje?")) return;
    const res = await deleteCharacter(id, gameId);
    if (res?.ok) router.refresh();
  }

  async function onEditSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!editing) return;
    setPending(true);
    setError(null);
    const formData = new FormData(e.currentTarget);
    formData.set("game_id", gameId);
    const avatarFile = formData.get("avatar") as File | null;
    if (avatarFile && avatarFile.size > MAX_UPLOAD_SIZE) {
      setError("La imagen es demasiado grande. Intenta subir una más pequeña (máx 15 MB).");
      setPending(false);
      return;
    }
    const res = await updateCharacter(editing.id, formData);
    if (res && res.error) {
      setError(res.error);
      setPending(false);
      return;
    }
    setEditing(null);
    setPending(false);
    router.refresh();
  }

  return (
    <>
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
                <button className="btn btn-secondary btn-sm" onClick={() => setEditing(c)}>
                  Editar
                </button>
                <button className="btn btn-danger btn-sm" onClick={() => onDelete(c.id)}>
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <div className="modal-backdrop" onClick={() => setEditing(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Editar personaje</h2>
            <form className="form" onSubmit={onEditSubmit}>
              {error && <div className="error">{error}</div>}
              <div className="field">
                <label htmlFor="edit-char-name">Nombre del personaje *</label>
                <input id="edit-char-name" name="name" required autoFocus defaultValue={editing.name} />
              </div>
              <div className="field">
                <label htmlFor="edit-char-owner">Pertenece a</label>
                <select id="edit-char-owner" name="created_by" defaultValue={editing.created_by || currentUserId}>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label htmlFor="edit-char-farm">Nombre de granja (si aplica)</label>
                <input id="edit-char-farm" name="farm_name" defaultValue={editing.farm_name} placeholder="Ej. Granja Rata" />
              </div>
              <div className="field">
                <label htmlFor="edit-char-avatar">Foto del personaje</label>
                <input id="edit-char-avatar" name="avatar" type="file" accept="image/*" />
                {editing.avatar && <img className="img-preview" src={editing.avatar} alt="Foto actual" />}
              </div>
              <div className="field">
                <label htmlFor="edit-char-desc">Descripción</label>
                <textarea id="edit-char-desc" name="description" defaultValue={editing.description} placeholder="Nivel, rol, notas..." />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setEditing(null)}>
                  Cancelar
                </button>
                <button type="submit" className="btn" disabled={pending}>
                  {pending ? "Guardando..." : "Guardar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
