import 'dotenv/config';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

async function addDescriptionColumns() {
  try {
    console.log('🔄 Adding description columns...');
    await sql`ALTER TABLE "menuitem" ADD COLUMN IF NOT EXISTS "description_en" text`;
    await sql`ALTER TABLE "menuitem" ADD COLUMN IF NOT EXISTS "description_ckb" text`;
    await sql`ALTER TABLE "menuitem" ADD COLUMN IF NOT EXISTS "description_arb" text`;
    console.log('✅ Description columns added successfully!');
  } catch (error) {
    console.error('❌ Error adding description columns:', error);
  }
}

addDescriptionColumns();
