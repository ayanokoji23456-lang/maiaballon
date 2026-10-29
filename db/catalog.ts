import { asc } from "drizzle-orm";
import { db } from "./index.js";
import { products, settings } from "./schema.js";
import defaultProducts from "./default-products.json" with { type: "json" };

export type Product = {
  id: string;
  cat: string;
  name: string;
  price: number;
  image: string;
  desc: string;
  best: boolean;
};

export const CATEGORIES = ["baloes", "cafe", "cestas", "casal", "kids"];

export const DEFAULT_SETTINGS: Record<string, string> = {
  whatsapp: "5511952909882",
  announcement: "Feito com carinho para transformar momentos em memórias ✦ Pedidos com 2 dias de antecedência",
  heroText:
    "Balões personalizados, cestas e surpresas pensadas para celebrar quem você ama — com um toque especial em cada detalhe.",
};

// Popula o banco com o catálogo original apenas na primeira utilização.
async function ensureSeeded() {
  const inserted = await db
    .insert(settings)
    .values({ key: "seeded", value: new Date().toISOString() })
    .onConflictDoNothing()
    .returning();
  if (inserted.length === 0) return;
  await db
    .insert(products)
    .values((defaultProducts as Product[]).map((p, i) => ({ ...p, position: i })))
    .onConflictDoNothing();
}

export async function getCatalog() {
  await ensureSeeded();
  const rows = await db.select().from(products).orderBy(asc(products.position), asc(products.name));
  const settingRows = await db.select().from(settings);
  const siteSettings = { ...DEFAULT_SETTINGS };
  for (const row of settingRows) {
    if (row.key in DEFAULT_SETTINGS) siteSettings[row.key] = row.value;
  }
  const list: Product[] = rows.map(({ id, cat, name, price, image, desc, best }) => ({
    id, cat, name, price, image, desc, best,
  }));
  return { products: list, settings: siteSettings };
}

function cleanProduct(raw: any, index: number) {
  const name = String(raw?.name ?? "").trim();
  if (!name) throw new Error(`O produto na posição ${index + 1} está sem nome.`);
  const cat = CATEGORIES.includes(raw?.cat) ? raw.cat : CATEGORIES[0];
  const price = Number(raw?.price);
  return {
    id: String(raw?.id || "").trim() || `produto-${Date.now()}-${index}`,
    cat,
    name,
    price: Number.isFinite(price) && price >= 0 ? Math.round(price * 100) / 100 : 0,
    image: String(raw?.image ?? "").trim(),
    desc: String(raw?.desc ?? "").trim(),
    best: Boolean(raw?.best),
    position: index,
    updatedAt: new Date(),
  };
}

export async function saveCatalog(input: { products?: unknown; settings?: unknown }) {
  await ensureSeeded();
  if (!Array.isArray(input.products)) throw new Error("Lista de produtos inválida.");
  const rows = input.products.map(cleanProduct);
  const ids = new Set(rows.map((r) => r.id));
  if (ids.size !== rows.length) throw new Error("Existem produtos com o mesmo identificador.");

  const settingValues = Object.entries((input.settings ?? {}) as Record<string, unknown>)
    .filter(([key]) => key in DEFAULT_SETTINGS)
    .map(([key, value]) => ({ key, value: String(value ?? "").trim() }));

  await db.transaction(async (tx) => {
    await tx.delete(products);
    if (rows.length) await tx.insert(products).values(rows);
    for (const s of settingValues) {
      await tx.insert(settings).values(s).onConflictDoUpdate({ target: settings.key, set: { value: s.value } });
    }
  });
  return getCatalog();
}
