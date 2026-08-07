import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { nanoid } from "nanoid";
import bcrypt from "bcryptjs";
import { db, type PublicUser } from "./db";
import { getAuthSecret, getBaseUrl, SESSION_COOKIE } from "./constants";

export { SESSION_COOKIE };

export async function createSession(user: PublicUser) {
  const token = await new SignJWT({ sub: user.id, name: user.name })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(getAuthSecret());

  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function destroySession() {
  (await cookies()).delete(SESSION_COOKIE);
}

export async function getSessionUserId(): Promise<string | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getAuthSecret());
    return typeof payload.sub === "string" ? payload.sub : null;
  } catch {
    return null;
  }
}

export async function getCurrentUser(): Promise<PublicUser | null> {
  const userId = await getSessionUserId();
  if (!userId) return null;
  const user = db
    .prepare("SELECT id, username, name, created_at FROM users WHERE id = ?")
    .get(userId) as PublicUser | undefined;
  return user ?? null;
}

export function hashPassword(password: string): string {
  return bcrypt.hashSync(password, 10);
}

export function newId(): string {
  return nanoid(16);
}

export function getGoogleRedirectUri(requestUrl: string): string {
  return (
    process.env.GOOGLE_REDIRECT_URI ||
    `${getBaseUrl(requestUrl)}/api/auth/google/callback`
  );
}

export function getGoogleAllowedEmails(): string[] {
  return (process.env.GOOGLE_ALLOWED_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export function isGoogleEmailAllowed(email: string): boolean {
  const allowed = getGoogleAllowedEmails();
  if (allowed.length === 0) return false;
  return allowed.includes(email.toLowerCase());
}

export function findOrCreateUserByEmail(
  email: string,
  name: string
): PublicUser {
  const username = email.toLowerCase();
  const existing = db
    .prepare("SELECT id, username, name, created_at FROM users WHERE username = ?")
    .get(username) as PublicUser | undefined;
  if (existing) return existing;

  const id = newId();
  db.prepare(
    "INSERT INTO users (id, username, name, password_hash) VALUES (?, ?, ?, ?)"
  ).run(id, username, name, hashPassword(newId()));
  return { id, username, name, created_at: "" };
}

const WHITELIST_NAMES: Record<string, string> = {
  "saicasvn@gmail.com": "Emmanuel",
  "du.krolita@gmail.com": "Carolina",
};

export function ensureWhitelistedUsers(): PublicUser[] {
  const allowed = getGoogleAllowedEmails();
  if (allowed.length === 0) {
    return db.prepare("SELECT id, username, name, created_at FROM users").all() as PublicUser[];
  }
  for (const email of allowed) {
    const name = WHITELIST_NAMES[email] || email.split("@")[0] || "Usuario";
    const existing = db
      .prepare("SELECT id, username, name, created_at FROM users WHERE username = ?")
      .get(email) as PublicUser | undefined;
    if (existing) {
      if (existing.name !== name) {
        db.prepare("UPDATE users SET name = ? WHERE id = ?").run(name, existing.id);
        existing.name = name;
      }
    } else {
      findOrCreateUserByEmail(email, name);
    }
  }

  const allUsers = db.prepare("SELECT id, username, name, created_at FROM users").all() as PublicUser[];
  for (const u of allUsers) {
    if (!allowed.includes(u.username.toLowerCase())) {
      const entryCount = db
        .prepare("SELECT COUNT(*) AS n FROM entries WHERE author_id = ?")
        .get(u.id) as { n: number };
      const gameCount = db
        .prepare("SELECT COUNT(*) AS n FROM games WHERE created_by = ?")
        .get(u.id) as { n: number };
      if (entryCount.n === 0 && gameCount.n === 0) {
        db.prepare("DELETE FROM users WHERE id = ?").run(u.id);
      }
    }
  }

  return db
    .prepare(
      `SELECT id, username, name, created_at FROM users
       WHERE username IN (${allowed.map(() => "?").join(",")})`
    )
    .all(...allowed) as PublicUser[];
}
