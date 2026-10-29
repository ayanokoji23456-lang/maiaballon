import type { Config, Context } from "@netlify/functions";
import { getStore } from "@netlify/blobs";

const MAX_SIZE = 5 * 1024 * 1024;
const EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

export default async (req: Request, context: Context) => {
  const store = getStore("uploads");

  if (req.method === "POST") {
    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) return Response.json({ error: "Nenhuma imagem enviada." }, { status: 400 });
    const ext = EXTENSIONS[file.type];
    if (!ext) return Response.json({ error: "Use imagens JPG, PNG, WEBP ou GIF." }, { status: 400 });
    if (file.size > MAX_SIZE) return Response.json({ error: "A imagem deve ter no máximo 5 MB." }, { status: 400 });
    const key = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`;
    await store.set(key, await file.arrayBuffer(), { metadata: { contentType: file.type } });
    return Response.json({ image: `uploads/${key}` }, { status: 201 });
  }

  if (req.method === "GET") {
    const key = context.params.key;
    if (!key) return new Response("Not found", { status: 404 });
    const entry = await store.getWithMetadata(key, { type: "arrayBuffer" });
    if (!entry) return new Response("Not found", { status: 404 });
    return new Response(entry.data, {
      headers: {
        "Content-Type": String(entry.metadata.contentType || "application/octet-stream"),
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  }

  return new Response("Method not allowed", { status: 405 });
};

export const config: Config = {
  path: ["/api/uploads", "/site/uploads/:key"],
};
