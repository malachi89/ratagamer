"use client";

import { useState, useRef, useEffect } from "react";
import { MAX_UPLOAD_SIZE } from "@/lib/constants";

type GameInput = {
  title?: string;
  platform?: string;
  status?: string;
  rating?: number;
  started_at?: string;
  finished_at?: string;
  farm_name?: string;
  notes?: string;
  cover?: string;
};

type SteamSuggestion = {
  id: string;
  name: string;
  tinyImage: string;
  cover: string;
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
  const [title, setTitle] = useState(game?.title || "");
  const [steamAppId, setSteamAppId] = useState("");
  const [suggestions, setSuggestions] = useState<SteamSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searching, setSearching] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  async function onTitleChange(value: string) {
    setTitle(value);
    setSteamAppId("");

    if (timer.current) clearTimeout(timer.current);
    const q = value.trim();
    if (q.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      setSearching(false);
      return;
    }

    setSearching(true);
    timer.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/steam/search?term=${encodeURIComponent(q)}`);
        const data = await res.json();
        setSuggestions(data.items || []);
        setShowSuggestions(true);
      } catch {
        setSuggestions([]);
      } finally {
        setSearching(false);
      }
    }, 350);
  }

  function selectGame(s: SteamSuggestion) {
    setTitle(s.name);
    setSteamAppId(s.id);
    setPreview(s.cover);
    setSuggestions([]);
    setShowSuggestions(false);
    setSearching(false);
    if (timer.current) clearTimeout(timer.current);
    inputRef.current?.blur();
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);
    const formData = new FormData(e.currentTarget);
    formData.set("title", title);
    if (steamAppId) formData.set("steam_appid", steamAppId);
    const coverFile = formData.get("cover") as File | null;
    if (coverFile && coverFile.size > MAX_UPLOAD_SIZE) {
      setError("La imagen es demasiado grande. Intenta subir una más pequeña (máx 15 MB).");
      setPending(false);
      return;
    }
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
        <div className="autocomplete">
          <input
            ref={inputRef}
            id="title"
            name="title"
            required
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
            autoComplete="off"
          />
          {searching && <div className="suggest-hint">Buscando en Steam…</div>}
          {showSuggestions && suggestions.length > 0 && (
            <ul className="suggest-list">
              {suggestions.map((s) => (
                <li key={s.id}>
                  <button type="button" className="suggest-item" onClick={() => selectGame(s)}>
                    {s.tinyImage ? (
                      <img className="suggest-img" src={s.tinyImage} alt="" />
                    ) : (
                      <span className="suggest-img placeholder">🎮</span>
                    )}
                    <span className="suggest-name">{s.name}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
          {showSuggestions && !searching && suggestions.length === 0 && (
            <div className="suggest-empty">
              Sin resultados en Steam. Escribe el nombre a mano y sube la portada tú mismo.
            </div>
          )}
        </div>
        <input type="hidden" name="steam_appid" value={steamAppId} />
        {steamAppId && <p className="hint">✓ Portada encontrada en Steam</p>}
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
        <label htmlFor="farm_name">Nombre de granja/mundo</label>
        <input id="farm_name" name="farm_name" defaultValue={game?.farm_name} placeholder="Ej. Granja Rata, Mundo Helado..." />
      </div>
      <div className="field">
        <label htmlFor="cover">Portada (opcional si ya elegiste de Steam)</label>
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
