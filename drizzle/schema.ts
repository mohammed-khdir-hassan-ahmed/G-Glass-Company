import { pgTable, index, integer, varchar, text, json } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const menuitem = pgTable("menuitem", {
	id: integer().primaryKey().generatedAlwaysAsIdentity({ name: "menuitem_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647, cache: 1 }),
	price: varchar({ length: 255 }).notNull(),
	imageUrl: varchar("image_url", { length: 255 }).notNull(),
	category: varchar({ length: 50 }).default('main').notNull(),
	nameEn: varchar("name_en", { length: 255 }).notNull(),
	nameCkb: varchar("name_ckb", { length: 255 }).notNull(),
	nameArb: varchar("name_arb", { length: 255 }),
	descriptionEn: text("description_en"),
	descriptionCkb: text("description_ckb"),
	descriptionArb: text("description_arb"),
	sizes: json("sizes").default('[]'),
	colors: json("colors").default('[]'),
}, (table) => [
	index("idx_menuitem_category").using("btree", table.category.asc().nullsLast().op("text_ops")),
	index("idx_menuitem_category_id").using("btree", table.category.asc().nullsLast().op("int4_ops"), table.id.asc().nullsLast().op("int4_ops")),
	index("idx_menuitem_price").using("btree", table.price.asc().nullsLast().op("text_ops")),
]);
