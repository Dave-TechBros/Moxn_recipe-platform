import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { requireUser } from "@/lib/apiAuth";

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

export async function POST(request: Request) {
  const auth = await requireUser();
  if ("response" in auth) return auth.response;

  const form = await request.formData();
  const file = form.get("file");
  const folder = (form.get("folder") as string) === "recipes" ? "recipes" : "avatars";

  if (!(file instanceof File))
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  if (!ALLOWED.includes(file.type))
    return NextResponse.json({ error: "Unsupported file type" }, { status: 400 });
  if (file.size > MAX_BYTES)
    return NextResponse.json({ error: "File must be under 5 MB" }, { status: 400 });

  const bytes = Buffer.from(await file.arrayBuffer());
  const filename = `${auth.userId}-${Date.now()}.${EXT[file.type]}`;
  const path = `${folder}/${filename}`;

  // Use Vercel Blob in production when a token is configured; otherwise
  // fall back to the local public/ folder (dev only — ephemeral on Vercel).
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const blob = await put(path, bytes, {
      access: "public",
      contentType: file.type,
      addRandomSuffix: false,
    });
    return NextResponse.json({ url: blob.url });
  }

  const { writeFile, mkdir } = await import("fs/promises");
  const pathMod = await import("path");
  const dir = pathMod.join(process.cwd(), "public", "uploads", folder);
  await mkdir(dir, { recursive: true });
  await writeFile(pathMod.join(dir, filename), bytes);
  return NextResponse.json({ url: `/uploads/${folder}/${filename}` });
}
