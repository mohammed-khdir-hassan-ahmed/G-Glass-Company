import 'dotenv/config';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

async function addSizesColumn() {
  try {
    console.log('🔄 Adding sizes column...');
    await sql`ALTER TABLE "menuitem" ADD COLUMN IF NOT EXISTS "sizes" json DEFAULT '[]'`;
    console.log('✅ Sizes column added successfully!');
  } catch (error) {
    console.error('❌ Error adding sizes column:', error);
  }
}

addSizesColumn();
