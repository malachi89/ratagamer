"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db, type Character, type Entry } from "@/lib/db";
import { getCurrentUser, newId } from "@/lib/auth";
import { saveUpload, deleteUpload, saveSteamCover } from "@/lib/files";

async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

/* ---------- Juegos ---------- */

export async function createGame(formData: FormData) {
  const user = await requireAuth();

  const coverFile = formData.get("cover") as File | null;
  const steamAppId = String(formData.get("steam_appid") || "").trim();
  let cover = "";
  if (coverFile && coverFile.size > 0) {
    const res = await saveUpload(coverFile);
    if (!res.ok) return { error: res.error };
    cover = res.url;
  } else if (steamAppId) {
    const res = await saveSteamCover(steamAppId);
    if (!res.ok) return { error: res.error };
    cover = res.url;
  }

  db.prepare(
    `INSERT INTO games (id, title, platform, status, cover, rating, started_at, finished_at, notes, created_by)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    newId(),
    String(formData.get("title") || "").trim(),
    String(formData.get("platform") || "").trim(),
    String(formData.get("status") || "jugando"),
    cover,
    Number(formData.get("rating") || 0),
    String(formData.get("started_at") || ""),
    String(formData.get("finished_at") || ""),
    String(formData.get("notes") || ""),
    user.id
  );

  revalidatePath("/games");
  revalidatePath("/dashboard");
  redirect("/games");
}

export async function updateGame(id: string, formData: FormData) {
  await requireAuth();

  const existing = db.prepare("SELECT * FROM games WHERE id = ?").get(id) as
    | { cover: string }
    | undefined;
  if (!existing) return { error: "Juego no encontrado" };

  const coverFile = formData.get("cover") as File | null;
  const steamAppId = String(formData.get("steam_appid") || "").trim();
  let cover = existing.cover;
  if (coverFile && coverFile.size > 0) {
    const res = await saveUpload(coverFile);
    if (!res.ok) return { error: res.error };
    deleteUpload(cover);
    cover = res.url;
  } else if (steamAppId) {
    const res = await saveSteamCover(steamAppId);
    if (!res.ok) return { error: res.error };
    deleteUpload(cover);
    cover = res.url;
  }

  db.prepare(
    `UPDATE games SET title=?, platform=?, status=?, cover=?, rating=?, started_at=?, finished_at=?, notes=?
     WHERE id = ?`
  ).run(
    String(formData.get("title") || "").trim(),
    String(formData.get("platform") || "").trim(),
    String(formData.get("status") || "jugando"),
    cover,
    Number(formData.get("rating") || 0),
    String(formData.get("started_at") || ""),
    String(formData.get("finished_at") || ""),
    String(formData.get("notes") || ""),
    id
  );

  revalidatePath(`/games/${id}`);
  revalidatePath("/games");
  revalidatePath("/dashboard");
  redirect(`/games/${id}`);
}

export async function deleteGame(id: string) {
  await requireAuth();
  const game = db.prepare("SELECT cover FROM games WHERE id = ?").get(id) as
    | { cover: string }
    | undefined;
  if (!game) return { error: "Juego no encontrado" };

  const chars = db
    .prepare("SELECT avatar FROM characters WHERE game_id = ?")
    .all(id) as { avatar: string }[];
  deleteUpload(game.cover);
  for (const c of chars) deleteUpload(c.avatar);

  db.prepare("DELETE FROM games WHERE id = ?").run(id);
  revalidatePath("/games");
  revalidatePath("/dashboard");
  redirect("/games");
}

/* ---------- Personajes ---------- */

export async function createCharacter(formData: FormData) {
  await requireAuth();
  const gameId = String(formData.get("game_id") || "");

  const avatarFile = formData.get("avatar") as File | null;
  let avatar = "";
  if (avatarFile && avatarFile.size > 0) {
    const res = await saveUpload(avatarFile);
    if (!res.ok) return { error: res.error };
    avatar = res.url;
  }

  db.prepare(
    `INSERT INTO characters (id, game_id, name, farm_name, avatar, description)
     VALUES (?, ?, ?, ?, ?, ?)`
  ).run(
    newId(),
    gameId,
    String(formData.get("name") || "").trim(),
    String(formData.get("farm_name") || "").trim(),
    avatar,
    String(formData.get("description") || "")
  );

  revalidatePath(`/games/${gameId}`);
  return { ok: true };
}

export async function deleteCharacter(id: string, gameId: string) {
  await requireAuth();
  const ch = db
    .prepare("SELECT avatar FROM characters WHERE id = ?")
    .get(id) as { avatar: string } | undefined;
  if (ch) {
    deleteUpload(ch.avatar);
    db.prepare("DELETE FROM characters WHERE id = ?").run(id);
  }
  revalidatePath(`/games/${gameId}`);
  return { ok: true };
}

/* ---------- Entradas ---------- */

export async function createEntry(formData: FormData) {
  const user = await requireAuth();
  const gameId = String(formData.get("game_id") || "");

  db.prepare(
    `INSERT INTO entries (id, game_id, author_id, date, hours, title, content)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  ).run(
    newId(),
    gameId,
    user.id,
    String(formData.get("date") || ""),
    Number(formData.get("hours") || 0),
    String(formData.get("title") || "").trim(),
    String(formData.get("content") || "")
  );

  revalidatePath(`/games/${gameId}`);
  return { ok: true };
}

export async function deleteEntry(id: string, gameId: string) {
  await requireAuth();
  db.prepare("DELETE FROM entries WHERE id = ?").run(id);
  revalidatePath(`/games/${gameId}`);
  return { ok: true };
}
