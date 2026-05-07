import { NextRequest, NextResponse } from "next/server";

// Serves vendor images by proxying from Supabase Storage public bucket.
// Production: images live in Supabase Storage "ananya-uploads" or a CDN URL.
// Set NEXT_PUBLIC_SUPABASE_URL in env — the public storage URL is derived from it.
// URL pattern: /api/vendor-images/<slug>/<filename>
// Rewrites to: <SUPABASE_URL>/storage/v1/object/public/vendor-images/<slug>/<filename>

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const STORAGE_BASE = `${SUPABASE_URL}/storage/v1/object/public/vendor-images`;

const EXT_TO_MIME: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
  avif: "image/avif",
};

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path: segments } = await params;

  // Reject path traversal attempts (including URL-encoded %2E%2E)
  if (segments.some((s) => decodeURIComponent(s).includes(".."))) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const joined = segments.join("/");
  const remoteUrl = `${STORAGE_BASE}/${joined}`;

  try {
    const upstream = await fetch(remoteUrl, { next: { revalidate: 86400 } });
    if (!upstream.ok) {
      return new NextResponse("Not found", { status: 404 });
    }

    const ext = joined.split(".").pop()?.toLowerCase() ?? "jpg";
    const mime = EXT_TO_MIME[ext] ?? upstream.headers.get("content-type") ?? "image/jpeg";
    const buffer = await upstream.arrayBuffer();

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": mime,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}
