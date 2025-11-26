import { db } from '../../db';
import { likes } from '../../db/schema';
import { eq } from 'drizzle-orm';

export default async (req: Request) => {
    if (req.method === 'GET') {
        try {
            const url = new URL(req.url);
            const itemId = url.searchParams.get('itemId');

            if (!itemId) {
                return new Response(
                    JSON.stringify({ error: 'Item ID required' }),
                    { status: 400 }
                );
            }

            const itemLikes = await db
                .select()
                .from(likes)
                .where(eq(likes.itemId, itemId));

            return new Response(
                JSON.stringify({ success: true, count: itemLikes.length, data: itemLikes }),
                { status: 200, headers: { 'Content-Type': 'application/json' } }
            );
        } catch (error) {
            console.error('Get likes error:', error);
            return new Response(
                JSON.stringify({ error: 'Failed to fetch likes' }),
                { status: 500 }
            );
        }
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
};
