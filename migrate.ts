import 'dotenv/config';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

async function runMigrations() {
  try {
    console.log('🔄 Applying migrations...\n');
    
    try {
      console.log('Applying migration: 0006_white_forge.sql');
      await sql`ALTER TABLE "menuitem" ADD COLUMN "is_sold_out" boolean DEFAULT false;`;
      console.log('✓ 0006_white_forge.sql applied');
    } catch (e) {
      if (e instanceof Error && e.message.includes('already exists')) {
        console.log('✓ Column "is_sold_out" already exists');
      } else {
        console.error('❌ Error applying 0006:', e);
        throw e;
      }
    }

    try {
      console.log('Applying migration: 0007_cuddly_adam_warlock.sql');
      await sql`ALTER TABLE "menuitem" ADD COLUMN "colors" json DEFAULT '[]'`;
      console.log('✓ 0007_cuddly_adam_warlock.sql applied');
    } catch (e) {
      if (e instanceof Error && e.message.includes('already exists')) {
        console.log('✓ Column "colors" already exists');
      } else {
        console.error('❌ Error applying 0007:', e);
        throw e;
      }
    }

    console.log('\n✅ All migrations completed successfully!');
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigrations();
