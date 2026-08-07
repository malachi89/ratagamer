"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createEntry } from "@/app/actions/data";

export default function EntryForm({ gameId }: { gameId: string }) {
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
    const res = await createEntry(formData);
    if (res && !res.ok) {
      setError("No se pudo guardar la entrada.");
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
      <button className="btn btn-sm" onClick={() => setOpen(true)}>
        + Entrada
      </button>
      {open && (
        <div className="modal-backdrop" onClick={() => setOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Nueva entrada del diario</h2>
            <form className="form" onSubmit={onSubmit}>
              {error && <div className="error">{error}</div>}
              <div className="row">
                <div className="field">
                  <label htmlFor="entry-date">Fecha</label>
                  <input id="entry-date" name="date" type="date" defaultValue={new Date().toISOString().slice(0, 10)} />
                </div>
                <div className="field">
                  <label htmlFor="entry-hours">Horas jugadas</label>
                  <input id="entry-hours" name="hours" type="number" min="0" step="0.5" defaultValue={0} />
                </div>
              </div>
              <div className="field">
                <label htmlFor="entry-title">Título (opcional)</label>
                <input id="entry-title" name="title" placeholder="Ej. Día 1 - Empezando la granja" />
              </div>
              <div className="field">
                <label htmlFor="entry-content">Notas *</label>
                <textarea id="entry-content" name="content" required placeholder="¿Qué hiciste hoy en el juego?" />
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
