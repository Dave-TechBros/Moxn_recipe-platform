import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
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
  const dir = path.join(process.cwd(), "public", "uploads", folder);
  await mkdir(dir, { recursive: true });
  const filename = `${auth.userId}-${Date.now()}.${EXT[file.type]}`;
  await writeFile(path.join(dir, filename), bytes);

  const url = `/uploads/${folder}/${filename}`;
  return NextResponse.json({ url });
}
