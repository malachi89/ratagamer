export const SESSION_COOKIE = "ratagamer_session";

export function getAuthSecret(): Uint8Array {
  return new TextEncoder().encode(
    process.env.AUTH_SECRET || "dev-secret-cambiar-en-produccion"
  );
}
