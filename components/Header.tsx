"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/app/actions/auth";
import type { PublicUser } from "@/lib/db";

export default function Header({ user }: { user: PublicUser }) {
  const pathname = usePathname();

  const links = [
    { href: "/dashboard", label: "Inicio" },
    { href: "/games", label: "Juegos" },
  ];

  return (
    <header className="nav">
      <div className="nav-inner">
        <Link href="/dashboard" className="nav-brand">
          <span className="logo">🌸</span> RataGamer
        </Link>
        <nav className="nav-links">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={pathname.startsWith(l.href) ? "active" : ""}
            >
              {l.label}
            </Link>
          ))}
          <div className="nav-user">
            <span className="avatar">{user.name.charAt(0).toUpperCase()}</span>
            {user.name}
          </div>
          <button onClick={() => logoutAction()}>Salir</button>
        </nav>
      </div>
    </header>
  );
}
