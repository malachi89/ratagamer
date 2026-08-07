import type { Metadata } from "next";
import "./globals.css";
import { getCurrentUser } from "@/lib/auth";
import Header from "@/components/Header";

export const metadata: Metadata = {
  title: "RataGamer - Diario de Gaming",
  description: "Diario de gaming compartido",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  const isAuthed = user !== null;

  return (
    <html lang="es">
      <body>
        {isAuthed && <Header user={user} />}
        {children}
      </body>
    </html>
  );
}
