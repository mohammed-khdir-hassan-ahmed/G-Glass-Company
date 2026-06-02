import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { carousel } from '@/src/db/schema';

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

export async function GET() {
  try {
    const items = await db.select().from(carousel).orderBy(carousel.order_index);
    return Response.json(items);
  } catch (error) {
    console.error('Error fetching carousel items:', error);
    return Response.json({ error: 'Failed to fetch carousel items' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { image_url, order_index } = body;

    if (!image_url) {
      return Response.json({ error: 'Image URL is required' }, { status: 400 });
    }

    const result = await db
      .insert(carousel)
      .values({
        image_url,
        order_index: order_index || 0,
        is_active: true,
      })
      .returning();

    return Response.json(result[0], { status: 201 });
  } catch (error) {
    console.error('Error creating carousel item:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return Response.json({ error: `Failed to create carousel item: ${errorMessage}` }, { status: 500 });
  }
}
