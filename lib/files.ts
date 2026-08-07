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
