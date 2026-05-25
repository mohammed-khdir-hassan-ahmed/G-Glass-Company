import { integer, pgTable, varchar, text, json } from "drizzle-orm/pg-core";


export const menuitem = pgTable("menuitem", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name_en: varchar({ length: 255 }).notNull(),
  name_ckb: varchar({ length: 255 }).notNull(),
  name_arb: varchar({ length: 255 }),
  description_en: text("description_en"),
  description_ckb: text("description_ckb"),
  description_arb: text("description_arb"),
  sizes: json("sizes").default('[]'),
  price: varchar({ length: 255 }).notNull(),
  image_url: varchar({ length: 255 }).notNull(),
  category: varchar({ length: 50 }).notNull().default('main'),
});
