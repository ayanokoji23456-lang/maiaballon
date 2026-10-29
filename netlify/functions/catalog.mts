import type { Config } from "@netlify/functions";
import { getCatalog, saveCatalog } from "../../db/catalog.js";

export default async (req: Request) => {
  try {
    if (req.method === "GET") {
      return Response.json(await getCatalog(), { headers: { "Cache-Control": "no-store" } });
    }
    if (req.method === "PUT") {
      const body = await req.json();
      return Response.json(await saveCatalog(body));
    }
    return new Response("Method not allowed", { status: 405 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro ao salvar.";
    return Response.json({ error: message }, { status: 400 });
  }
};

export const config: Config = {
  path: "/api/catalog",
};
