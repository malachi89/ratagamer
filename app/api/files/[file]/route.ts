import { NextRequest, NextResponse } from "next/server";
import { readUpload } from "@/lib/files";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ file: string }> }
) {
  const { file } = await context.params;
  const result = readUpload(file);
  if (!result) return NextResponse.json({ error: "No encontrado" }, { status: 404 });

  const mime =
    { jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", webp: "image/webp", gif: "image/gif" }[
      result.ext
    ] || "application/octet-stream";

  return new NextResponse(new Uint8Array(result.data), {
    headers: {
      "Content-Type": mime,
      "Cache-Control": "public, max-age=86400",
    },
  });
}
