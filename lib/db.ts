import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";
import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";

const dataDir = process.env.DATA_DIR || path.join(process.cwd(), "data");
if (!fs.existsSync(/*turbopackIgnore: true*/ dataDir)) fs.mkdirSync(/*turbopackIgnore: true*/ dataDir, { recursive: true });

const dbPath = path.join(dataDir, "diario.db");
export const db = new Database(dbPath);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS games (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  platform TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'jugando',
  cover TEXT DEFAULT '',
  rating INTEGER DEFAULT 0,
  started_at TEXT DEFAULT '',
  finished_at TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  created_by TEXT NOT NULL REFERENCES users(id),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS characters (
  id TEXT PRIMARY KEY,
  game_id TEXT NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  farm_name TEXT DEFAULT '',
  avatar TEXT DEFAULT '',
  description TEXT DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS entries (
  id TEXT PRIMARY KEY,
  game_id TEXT NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  author_id TEXT NOT NULL REFERENCES users(id),
  date TEXT NOT NULL DEFAULT (date('now')),
  hours REAL DEFAULT 0,
  title TEXT DEFAULT '',
  content TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
`);

const userCount = (
  db.prepare("SELECT COUNT(*) as c FROM users").get() as { c: number }
).c;

if (userCount === 0) {
  const insert = db.prepare(
    "INSERT INTO users (id, username, name, password_hash) VALUES (?, ?, ?, ?)"
  );
  const defaults = [
    {
      username: process.env.SEED_USERNAME_1 || "malachi",
      name: process.env.SEED_NAME_1 || "Malachi",
      password: process.env.SEED_PASSWORD_1 || "cambiar123",
    },
    {
      username: process.env.SEED_USERNAME_2 || "esposa",
      name: process.env.SEED_NAME_2 || "Esposa",
      password: process.env.SEED_PASSWORD_2 || "cambiar123",
    },
  ];
  for (const u of defaults) {
    insert.run(nanoid(16), u.username, u.name, bcrypt.hashSync(u.password, 10));
  }
}

export type User = {
  id: string;
  username: string;
  name: string;
  password_hash: string;
  created_at: string;
};

export type PublicUser = Omit<User, "password_hash">;

export type Game = {
  id: string;
  title: string;
  platform: string;
  status: string;
  cover: string;
  rating: number;
  started_at: string;
  finished_at: string;
  notes: string;
  created_by: string;
  created_at: string;
};

export type Character = {
  id: string;
  game_id: string;
  name: string;
  farm_name: string;
  avatar: string;
  description: string;
  created_at: string;
};

export type Entry = {
  id: string;
  game_id: string;
  author_id: string;
  date: string;
  hours: number;
  title: string;
  content: string;
  created_at: string;
};
