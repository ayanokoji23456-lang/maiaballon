import { pgTable, text, integer, boolean, doublePrecision, timestamp } from "drizzle-orm/pg-core";

export const products = pgTable("products", {
  id: text().primaryKey(),
  cat: text().notNull(),
  name: text().notNull(),
  price: doublePrecision().notNull().default(0),
  image: text().notNull().default(""),
  desc: text("description").notNull().default(""),
  best: boolean().notNull().default(false),
  position: integer().notNull().default(0),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const settings = pgTable("settings", {
  key: text().primaryKey(),
  value: text().notNull(),
});
