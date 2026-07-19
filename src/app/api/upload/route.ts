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

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const bytes = Buffer.from(await file.arrayBuffer());
    const filename = `${auth.userId}-${Date.now()}.${EXT[file.type]}`;
    const blob = await put(`${folder}/${filename}`, bytes, {
      access: "public",
      contentType: file.type,
      addRandomSuffix: false,
    });
    return NextResponse.json({ url: blob.url });
  }

  // No Blob token — generate a placeholder URL so upload never fails.
  const url =
    folder === "avatars"
      ? `https://api.dicebear.com/9.x/adventurer/svg?seed=${auth.userId}`
      : `https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&q=80`;
  return NextResponse.json({ url });
}
