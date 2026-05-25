import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { menuitem } from '@/src/db/schema';
import { eq } from 'drizzle-orm';
import { revalidatePath, revalidateTag } from 'next/cache';

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

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: paramId } = await params;
    const id = parseInt(paramId);
    const body = await request.json();
    const { name_en, name_ckb, name_arb, image_url, category, is_sold_out } = body;
    const price = typeof body.price === 'string' ? body.price : '';
    const sizes = normalizeSizes(body.sizes);
    const colors = normalizeColors(body.colors);

    // Validate input
    if (!name_en || !name_ckb || !name_arb) {
      return Response.json(
        { error: 'Missing required fields: name_en, name_ckb, name_arb' },
        { status: 400 }
      );
    }

    // Get current item to preserve image if not updating
    const currentItem = await db.select().from(menuitem).where(eq(menuitem.id, id));
    
    if (currentItem.length === 0) {
      return Response.json({ error: 'Item not found' }, { status: 404 });
    }

    // Update item in database
    const updatedItem = await db
      .update(menuitem)
      .set({
        name_en,
        name_ckb,
        name_arb,
        description_en: body.description_en,
        description_ckb: body.description_ckb,
        description_arb: body.description_arb,
        sizes,
        colors,
        price,
        image_url: image_url || currentItem[0].image_url, // Use new image or keep old one
        category: category || currentItem[0].category, // Use new category or keep old one
        is_sold_out: is_sold_out !== undefined ? is_sold_out : currentItem[0].is_sold_out,
      })
      .where(eq(menuitem.id, id))
      .returning();

    // Revalidate the home page cache
    revalidatePath('/');
    revalidateTag('menu-items', 'max');

    return Response.json(updatedItem[0], { status: 200 });
  } catch (error) {
    console.error('Error updating menu item:', error);
    return Response.json({ error: 'Failed to update menu item' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: paramId } = await params;
    const id = parseInt(paramId);

    // Delete item from database
    const deletedItem = await db
      .delete(menuitem)
      .where(eq(menuitem.id, id))
      .returning();

    if (deletedItem.length === 0) {
      return Response.json({ error: 'Item not found' }, { status: 404 });
    }

    // Revalidate the home page cache
    revalidatePath('/');
    revalidateTag('menu-items', 'max');

    return Response.json({ message: 'Item deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting menu item:', error);
    return Response.json({ error: 'Failed to delete menu item' }, { status: 500 });
  }
}
