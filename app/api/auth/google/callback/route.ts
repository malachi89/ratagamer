import { NextRequest, NextResponse } from "next/server";
import { createRemoteJWKSet, jwtVerify } from "jose";
import {
  createSession,
  findOrCreateUserByEmail,
  getGoogleRedirectUri,
  isGoogleEmailAllowed,
} from "@/lib/auth";

export const runtime = "nodejs";

const googleKeys = createRemoteJWKSet(
  new URL("https://www.googleapis.com/oauth2/v3/certs")
);

function redirectToLogin(request: NextRequest, message: string) {
  const url = new URL("/login", request.url);
  url.searchParams.set("error", message);
  return NextResponse.redirect(url);
}

export async function GET(request: NextRequest) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    return redirectToLogin(request, "Google OAuth no configurado.");
  }

  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const savedState = request.cookies.get("google_oauth_state")?.value;

  if (!code || !state || !savedState || state !== savedState) {
    return redirectToLogin(request, "Solicitud de login inválida.");
  }

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: getGoogleRedirectUri(request.url),
      grant_type: "authorization_code",
    }),
  });

  if (!tokenRes.ok) {
    return redirectToLogin(request, "No se pudo completar el inicio de sesión.");
  }

  const tokens = (await tokenRes.json()) as { id_token?: string };
  if (!tokens.id_token) {
    return redirectToLogin(request, "Respuesta de Google inválida.");
  }

  let email = "";
  let emailVerified = false;
  let name = "";
  try {
    const { payload } = await jwtVerify(tokens.id_token, googleKeys, {
      issuer: ["https://accounts.google.com", "accounts.google.com"],
      audience: clientId,
    });
    email = typeof payload.email === "string" ? payload.email.toLowerCase() : "";
    emailVerified = payload.email_verified === true;
    name = typeof payload.name === "string" ? payload.name : "";
  } catch {
    return redirectToLogin(request, "Token de Google inválido.");
  }

  if (!email || !emailVerified) {
    return redirectToLogin(request, "No se pudo verificar el correo de Google.");
  }

  if (!isGoogleEmailAllowed(email)) {
    return redirectToLogin(
      request,
      "Tu correo no está autorizado para acceder."
    );
  }

  const user = findOrCreateUserByEmail(email, name || email.split("@")[0] || "Usuario");
  await createSession(user);

  const response = NextResponse.redirect(new URL("/dashboard", request.url));
  response.cookies.delete("google_oauth_state");
  return response;
}
