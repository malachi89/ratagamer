"use client";

import { useState } from "react";

type GameInput = {
  title?: string;
  platform?: string;
  status?: string;
  rating?: number;
  started_at?: string;
  finished_at?: string;
  notes?: string;
  cover?: string;
};

export default function GameForm({
  action,
  submitLabel,
  game,
}: {
  action: (formData: FormData) => void | Promise<void | { error?: string }>;
  submitLabel: string;
  game?: GameInput;
}) {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [preview, setPreview] = useState<string | null>(game?.cover || null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);
    const formData = new FormData(e.currentTarget);
    const res = await action(formData);
    if (res && "error" in res && res.error) {
      setError(res.error);
      setPending(false);
    }
  }

  return (
    <form className="form" onSubmit={onSubmit}>
      {error && <div className="error">{error}</div>}
      <div className="field">
        <label htmlFor="title">Título *</label>
        <input id="title" name="title" required defaultValue={game?.title} />
      </div>
      <div className="row">
        <div className="field">
          <label htmlFor="platform">Plataforma</label>
          <input id="platform" name="platform" defaultValue={game?.platform} placeholder="PC, Switch, PS5..." />
        </div>
        <div className="field">
          <label htmlFor="status">Estado</label>
          <select id="status" name="status" defaultValue={game?.status || "jugando"}>
            <option value="jugando">Jugando</option>
            <option value="terminado">Terminado</option>
            <option value="backlog">Backlog</option>
            <option value="abandonado">Abandonado</option>
          </select>
        </div>
      </div>
      <div className="row">
        <div className="field">
          <label htmlFor="rating">Calificación (0-5)</label>
          <select id="rating" name="rating" defaultValue={game?.rating || 0}>
            <option value="0">—</option>
            <option value="1">⭐</option>
            <option value="2">⭐⭐</option>
            <option value="3">⭐⭐⭐</option>
            <option value="4">⭐⭐⭐⭐</option>
            <option value="5">⭐⭐⭐⭐⭐</option>
          </select>
        </div>
      </div>
      <div className="row">
        <div className="field">
          <label htmlFor="started_at">Fecha de inicio</label>
          <input id="started_at" name="started_at" type="date" defaultValue={game?.started_at} />
        </div>
        <div className="field">
          <label htmlFor="finished_at">Fecha de fin</label>
          <input id="finished_at" name="finished_at" type="date" defaultValue={game?.finished_at} />
        </div>
      </div>
      <div className="field">
        <label htmlFor="cover">Portada del juego</label>
        <input
          id="cover"
          name="cover"
          type="file"
          accept="image/*"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) setPreview(URL.createObjectURL(f));
          }}
        />
        {preview && <img className="img-preview" src={preview} alt="Vista previa" />}
      </div>
      <div className="field">
        <label htmlFor="notes">Notas</label>
        <textarea id="notes" name="notes" defaultValue={game?.notes} />
      </div>
      <button className="btn" type="submit" disabled={pending}>
        {pending ? "Guardando..." : submitLabel}
      </button>
    </form>
  );
}
