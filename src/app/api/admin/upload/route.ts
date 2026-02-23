import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

const UPLOAD_DIR = "public/uploads";
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(req: Request) {
  const { authorized } = await requireAdmin();
  if (!authorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: "Invalid file type. Use JPEG, PNG, GIF, or WebP." }, { status: 400 });
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "File too large. Max 5MB." }, { status: 400 });
    }
    const ext = path.extname(file.name) || ".jpg";
    const base = path.basename(file.name, ext).replace(/[^a-zA-Z0-9-_]/g, "_").slice(0, 50);
    const filename = `${base}-${Date.now()}${ext}`;
    const dir = path.join(process.cwd(), UPLOAD_DIR);
    await mkdir(dir, { recursive: true });
    const filepath = path.join(dir, filename);
    const bytes = await file.arrayBuffer();
    await writeFile(filepath, Buffer.from(bytes));
    const url = `/uploads/${filename}`;
    return NextResponse.json({ url });
  } catch (e) {
    console.error("[Admin] Upload error:", e);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
