"use server";

import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { createSession, destroySession, verifyPassword } from "@/lib/auth";

export async function loginAction(formData: FormData) {
  const username = String(formData.get("username") || "").trim();
  const password = String(formData.get("password") || "");

  const user = db
    .prepare("SELECT * FROM users WHERE username = ?")
    .get(username) as
    | { id: string; username: string; name: string; password_hash: string }
    | undefined;

  if (!user || !verifyPassword(password, user.password_hash)) {
    return { error: "Usuario o contraseña incorrectos." };
  }

  await createSession({
    id: user.id,
    username: user.username,
    name: user.name,
    created_at: "",
  });

  redirect("/dashboard");
}

export async function logoutAction() {
  await destroySession();
  redirect("/login");
}
