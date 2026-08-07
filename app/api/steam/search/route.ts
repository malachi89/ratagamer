import { NextRequest, NextResponse } from "next/server";

type SteamItem = {
  id: string;
  name: string;
  tinyImage: string;
  cover: string;
};

export async function GET(request: NextRequest) {
  const term = request.nextUrl.searchParams.get("term")?.trim();
  if (!term || term.length < 2) {
    return NextResponse.json({ items: [] as SteamItem[] });
  }

  const url = `https://store.steampowered.com/api/storesearch/?term=${encodeURIComponent(term)}&cc=US&l=spanish`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    return NextResponse.json({ items: [] as SteamItem[] }, { status: 502 });
  }

  const data = await res.json();
  const items: SteamItem[] = (Array.isArray(data.items) ? data.items : [])
    .filter(
      (i: { type?: string; name?: string; id?: number; tiny_image?: string }) =>
        i.type === "app" && i.name && i.id
    )
    .slice(0, 8)
    .map((i: { id?: number; name?: string; tiny_image?: string }) => ({
      id: String(i.id),
      name: i.name!,
      tinyImage: i.tiny_image || "",
      cover: `https://cdn.akamai.steamstatic.com/steam/apps/${i.id}/library_600x900.jpg`,
    }));

  return NextResponse.json({ items });
}
