export const SESSION_COOKIE = "ratagamer_session";
export const MAX_UPLOAD_SIZE = 15 * 1024 * 1024;

export function getBaseUrl(fallbackUrl?: string): string {
  const explicit = (process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || "").replace(/\/+$/, "");
  if (explicit) return explicit;
  const production = "https://ratagamer.pokaface.win";
  if (process.env.NODE_ENV === "production") return production;
  if (fallbackUrl) {
    try {
      return new URL(fallbackUrl).origin;
    } catch {
      return "";
    }
  }
  return "";
}

export function getAuthSecret(): Uint8Array {
  return new TextEncoder().encode(
    process.env.AUTH_SECRET || "dev-secret-cambiar-en-produccion"
  );
}
