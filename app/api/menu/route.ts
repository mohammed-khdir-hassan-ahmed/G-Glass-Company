import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { menuitem } from '@/src/db/schema';
import { eq } from 'drizzle-orm';
import { revalidatePath, revalidateTag } from 'next/cache';
import { locales } from '@/i18n/request';

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

function normalizeSizes(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .map((size) => String(size).trim())
      .filter(Boolean);
  }

  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        return parsed
          .map((size) => String(size).trim())
          .filter(Boolean);
      }
    } catch {
      return value
        .split(',')
        .map((size) => size.trim())
        .filter(Boolean);
    }
  }

  return [];
}

function normalizeColors(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter(color => typeof color === 'string' && color.match(/^#[0-9A-F]{6}$/i));
  }
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        return parsed.filter(color => typeof color === 'string' && color.match(/^#[0-9A-F]{6}$/i));
      }
    } catch {
      return [];
    }
  }
  return [];
}

export async function GET() {
  try {
    const items = await db.select().from(menuitem);
    return Response.json(items);
  } catch (error) {
    console.error('Error fetching menu items:', error);
    return Response.json({ error: 'Failed to fetch menu items' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    let { name_en, name_ckb, name_arb, image_url, category, is_sold_out } = body;
    const price = typeof body.price === 'string' ? body.price : '';
    const sizes = normalizeSizes(body.sizes);
    const colors = normalizeColors(body.colors);

    console.log('📥 POST /api/menu received:', {
      name_en,
      name_ckb,
      name_arb,
      sizesCount: sizes.length,
      colorsCount: colors.length,
      image_url: image_url?.substring(0, 50) + '...',
      category,
      is_sold_out,
    });

    // Auto-fill missing language if only one is provided
    if (!name_en && name_ckb) {
      name_en = name_ckb;
    }
    if (!name_ckb && name_en) {
      name_ckb = name_en;
    }

    // Validate input
    if (!name_en || !name_ckb || !name_arb || !image_url) {
      console.error('❌ Missing required fields');
      return Response.json(
        {
          error: `Missing required fields. Received: ${JSON.stringify({
            name_en: !!name_en,
            name_ckb: !!name_ckb,
            name_arb: !!name_arb,
            image_url: !!image_url,
          })}`,
        },
        { status: 400 }
      );
    }

    // Insert new item into database
    console.log('🔄 Inserting to database...');
    const newItem = await db
      .insert(menuitem)
      .values({
        name_en,
        name_ckb,
        name_arb,
        description_en: body.description_en || null,
        description_ckb: body.description_ckb || null,
        description_arb: body.description_arb || null,
        sizes,
        colors,
        price,
        image_url,
        category: category || 'main',
        is_sold_out: is_sold_out || false,
      })
      .returning();

    console.log('✅ Item inserted successfully:', newItem[0]);
    
    // Revalidate the home page cache
    // Invalidate all locale home pages so new items show up immediately
    for (const locale of locales) {
      revalidatePath(`/${locale}`, 'page');
    }
    revalidatePath('/', 'page');
    revalidateTag('menu-items', 'max');
    
    return Response.json(newItem[0], { status: 201 });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error('❌ Error adding menu item:', errorMsg);
    return Response.json({ error: `Failed to add menu item: ${errorMsg}` }, { status: 500 });
  }
}
