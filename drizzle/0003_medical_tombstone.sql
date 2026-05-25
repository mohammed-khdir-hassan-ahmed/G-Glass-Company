ALTER TABLE "menuitem" ALTER COLUMN "name_en" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "menuitem" ALTER COLUMN "name_ckb" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "menuitem" ALTER COLUMN "price" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "menuitem" DROP COLUMN "name";--> statement-breakpoint
ALTER TABLE "menuitem" DROP COLUMN "image_file_name";