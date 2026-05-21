import { integer, pgTable, varchar, index, text, json, boolean } from 'drizzle-orm/pg-core';
import { InferSelectModel } from 'drizzle-orm';

export const menuitem = pgTable('menuitem', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name_en: varchar('name_en', { length: 255 }).notNull(),
  name_ckb: varchar('name_ckb', { length: 255 }).notNull(),
  name_arb: varchar('name_arb', { length: 255 }),
  description_en: text('description_en'),
  description_ckb: text('description_ckb'),
  description_arb: text('description_arb'),
  sizes: json('sizes').default('[]'),
  colors: json('colors').default('[]'),
  price: varchar({ length: 255 }).notNull(),
  image_url: varchar({ length: 255 }).notNull(),
  category: varchar({ length: 50 }).notNull().default('main'),
  is_sold_out: boolean('is_sold_out').default(false),
}, (table) => [
  // Index for category filtering - CRITICAL for performance
  index('idx_menuitem_category').on(table.category),
  // Composite index for category + id lookups
  index('idx_menuitem_category_id').on(table.category, table.id),
  // Index for price sorting
  index('idx_menuitem_price').on(table.price),
]);

export type MenuItem = InferSelectModel<typeof menuitem>;
