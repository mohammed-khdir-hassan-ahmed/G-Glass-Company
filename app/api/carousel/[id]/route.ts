import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { carousel } from '@/src/db/schema';
import { eq } from 'drizzle-orm';

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const item = await db
      .select()
      .from(carousel)
      .where(eq(carousel.id, parseInt(id)))
      .limit(1);

    if (!item.length) {
      return Response.json({ error: 'Item not found' }, { status: 404 });
    }

    return Response.json(item[0]);
  } catch (error) {
    console.error('Error fetching carousel item:', error);
    return Response.json({ error: 'Failed to fetch carousel item' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { image_url, order_index, is_active } = body;

    const result = await db
      .update(carousel)
      .set({
        image_url,
        order_index,
        is_active,
        updated_at: new Date(),
      })
      .where(eq(carousel.id, parseInt(id)))
      .returning();

    return Response.json(result[0]);
  } catch (error) {
    console.error('Error updating carousel item:', error);
    return Response.json({ error: 'Failed to update carousel item' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = await db
      .delete(carousel)
      .where(eq(carousel.id, parseInt(id)))
      .returning();

    return Response.json(result[0]);
  } catch (error) {
    console.error('Error deleting carousel item:', error);
    return Response.json({ error: 'Failed to delete carousel item' }, { status: 500 });
  }
}
