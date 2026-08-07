"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createCharacter } from "@/app/actions/data";
import { MAX_UPLOAD_SIZE } from "@/lib/constants";

export default function CharacterForm({
  gameId,
  users,
  currentUserId,
}: {
  gameId: string;
  users: { id: string; name: string }[];
  currentUserId: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
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
    const res = await createCharacter(formData);
    if (res && res.error) {
      setError(res.error);
      setPending(false);
      return;
    }
    setOpen(false);
    setPending(false);
    e.currentTarget.reset();
    router.refresh();
  }

  return (
    <>
      <button className="btn btn-secondary btn-sm" onClick={() => setOpen(true)}>
        + Personaje
      </button>
      {open && (
        <div className="modal-backdrop" onClick={() => setOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Nuevo personaje</h2>
            <form className="form" onSubmit={onSubmit}>
              {error && <div className="error">{error}</div>}
              <div className="field">
                <label htmlFor="char-name">Nombre del personaje *</label>
                <input id="char-name" name="name" required autoFocus />
              </div>
              <div className="field">
                <label htmlFor="char-owner">Pertenece a</label>
                <select id="char-owner" name="created_by" defaultValue={currentUserId}>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label htmlFor="char-farm">Nombre de granja (si aplica)</label>
                <input id="char-farm" name="farm_name" placeholder="Ej. Granja Rata" />
              </div>
              <div className="field">
                <label htmlFor="char-avatar">Foto del personaje</label>
                <input id="char-avatar" name="avatar" type="file" accept="image/*" />
              </div>
              <div className="field">
                <label htmlFor="char-desc">Descripción</label>
                <textarea id="char-desc" name="description" placeholder="Nivel, rol, notas..." />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setOpen(false)}>
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
