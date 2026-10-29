import type { Config } from "@netlify/functions";
import { getCatalog } from "../../db/catalog.js";

// Gera products.js e config.js do site a partir do que foi salvo no painel.
export default async (req: Request) => {
  const { products, settings } = await getCatalog();
  const isConfig = new URL(req.url).pathname.endsWith("/config.js");
  const body = isConfig
    ? `window.SITE_CONFIG = ${JSON.stringify(settings, null, 2)};\n`
    : `window.PRODUCTS = ${JSON.stringify(products, null, 2)};\n`;
  return new Response(body, {
    headers: { "Content-Type": "application/javascript; charset=utf-8", "Cache-Control": "no-store" },
  });
};

export const config: Config = {
  path: ["/site/products.js", "/site/config.js"],
};
