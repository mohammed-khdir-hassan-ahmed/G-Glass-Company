-- Drop legacy columns that are no longer needed
ALTER TABLE "menuitem" DROP COLUMN IF EXISTS "name";
ALTER TABLE "menuitem" DROP COLUMN IF EXISTS "image_file_name";
