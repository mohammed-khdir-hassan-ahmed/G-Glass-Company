import { integer, pgTable, varchar, index, text, json, boolean, timestamp } from 'drizzle-orm/pg-core';
import { InferSelectModel, sql } from 'drizzle-orm';

export const menuitem = pgTable('menuitem', {
  id: integer().primaryKey().generatedByDefaultAsIdentity(),
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

export const carousel = pgTable('carousel', {
  id: integer().primaryKey().generatedByDefaultAsIdentity(),
  image_url: varchar('image_url', { length: 255 }).notNull(),
  order_index: integer('order_index').default(0).notNull(),
  is_active: boolean('is_active').default(true).notNull(),
  created_at: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`),
  updated_at: timestamp('updated_at').default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
  index('idx_carousel_order').on(table.order_index),
  index('idx_carousel_active').on(table.is_active),
]);

export type Carousel = InferSelectModel<typeof carousel>;
