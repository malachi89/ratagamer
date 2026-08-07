import { db } from "./lib/db";
import { hashPassword, newId } from "./lib/auth";

const users = [
  { username: process.env.SEED_USERNAME_1 || "malachi", name: "Malachi", password: process.env.SEED_PASSWORD_1 || "cambiar123" },
  { username: process.env.SEED_USERNAME_2 || "esposa", name: "Esposa", password: process.env.SEED_PASSWORD_2 || "cambiar123" },
];

const upsert = db.prepare(`
  INSERT INTO users (id, username, name, password_hash) VALUES (?, ?, ?, ?)
  ON CONFLICT(username) DO UPDATE SET password_hash = excluded.password_hash
`);

const insertMany = db.transaction(() => {
  for (const u of users) {
    upsert.run(newId(), u.username, u.name, hashPassword(u.password));
  }
});

insertMany();
console.log("Usuarios creados:");
for (const u of users) console.log(`  - ${u.username} / ${u.password}`);
console.log("Cambia las contraseñas con SEED_PASSWORD_1 y SEED_PASSWORD_2 o en la base de datos.");
