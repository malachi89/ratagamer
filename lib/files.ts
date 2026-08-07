import fs from "node:fs";
import path from "node:path";
import { nanoid } from "nanoid";

const dataDir = process.env.DATA_DIR || path.join(process.cwd(), "data");
export const uploadsDir = path.join(dataDir, "uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const MAX_SIZE = 15 * 1024 * 1024;
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

export type UploadResult = { ok: true; url: string } | { ok: false; error: string };

export async function saveUpload(file: File): Promise<UploadResult> {
  if (!ALLOWED.has(file.type)) {
    return { ok: false, error: "Formato no permitido. Usa JPG, PNG, WEBP o GIF." };
  }
  if (file.size > MAX_SIZE) {
    return { ok: false, error: "La imagen es muy grande (máx 15 MB)." };
  }

  const ext = (file.name.split(".").pop() || "jpg")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
  const filename = `${Date.now()}-${nanoid(8)}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  fs.writeFileSync(path.join(uploadsDir, filename), buffer);

  return { ok: true, url: `/api/files/${filename}` };
}

export async function saveSteamCover(appId: string): Promise<UploadResult> {
  if (!/^\d+$/.test(appId)) {
    return { ok: false, error: "ID de juego de Steam inválido." };
  }

  const url = `https://cdn.akamai.steamstatic.com/steam/apps/${appId}/capsule_616x353.jpg`;
  let res: Response;
  try {
    res = await fetch(url);
  } catch {
    return { ok: false, error: "No se pudo descargar la portada de Steam." };
  }
  if (!res.ok) return { ok: false, error: "No se pudo descargar la portada de Steam." };

  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length === 0) return { ok: false, error: "La portada de Steam llegó vacía." };

  const filename = `${Date.now()}-${nanoid(8)}.jpg`;
  fs.writeFileSync(path.join(uploadsDir, filename), buf);
  return { ok: true, url: `/api/files/${filename}` };
}

export function readUpload(filename: string): { data: Buffer; ext: string } | null {
  const safe = path.basename(filename);
  if (safe !== filename || !/^[a-zA-Z0-9._-]+$/.test(safe)) return null;
  const full = path.join(uploadsDir, safe);
  if (!fs.existsSync(full)) return null;
  return {
    data: fs.readFileSync(full),
    ext: path.extname(safe).slice(1),
  };
}

export function deleteUpload(url: string | null) {
  if (!url) return;
  const filename = path.basename(url);
  if (!/^[a-zA-Z0-9._-]+$/.test(filename)) return;
  try {
    fs.unlinkSync(path.join(uploadsDir, filename));
  } catch {
    // ignorar si no existe
  }
}
