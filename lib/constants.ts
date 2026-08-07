export const SESSION_COOKIE = "ratagamer_session";
export const MAX_UPLOAD_SIZE = 15 * 1024 * 1024;

export function getAuthSecret(): Uint8Array {
  return new TextEncoder().encode(
    process.env.AUTH_SECRET || "dev-secret-cambiar-en-produccion"
  );
}
