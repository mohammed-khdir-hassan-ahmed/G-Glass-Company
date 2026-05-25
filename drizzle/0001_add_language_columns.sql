ALTER TABLE "menuitem" ADD COLUMN "name_en" varchar(255) DEFAULT NULL;--> statement-breakpoint
ALTER TABLE "menuitem" ADD COLUMN "name_ckb" varchar(255) DEFAULT NULL;--> statement-breakpoint
UPDATE "menuitem" SET "name_en" = "name";