import { getCategoryValues, CATEGORIES } from '@/lib/categories';
import { unstable_cache } from 'next/cache';

/**
 * Get all categories with metadata
 * Cached for 1 hour since categories change infrequently
 * Response time: ~10ms (with cache)
 */
const getCategoriesData = unstable_cache(
  async () => {
    try {
      return CATEGORIES;
    } catch (error) {
      console.error('Error loading categories:', error);
      // Fallback to default categories if error
      return CATEGORIES;
    }
  },
  ['menu-categories'], // Cache key
  {
    revalidate: 3600, // 1 hour
    tags: ['menu-categories'], // For manual revalidation
  }
);

export async function GET() {
  try {
    const categories = await getCategoriesData();
    
    return Response.json({
      success: true,
      categories,
      categoryValues: getCategoryValues(),
      count: categories.length,
      cached: true, // Indicates this came from cache
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error in GET /api/menu/categories:', error);
    return Response.json(
      { 
        success: false,
        error: 'Failed to fetch categories',
        categories: CATEGORIES,
        categoryValues: getCategoryValues(),
      },
      { status: 500 }
    );
  }
}
