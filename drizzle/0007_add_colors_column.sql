-- Add colors column to menuitem table
ALTER TABLE menuitem ADD COLUMN colors JSON DEFAULT '[]';
