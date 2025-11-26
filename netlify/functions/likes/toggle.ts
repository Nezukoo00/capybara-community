import { db } from '../../db';
import { likes } from '../../db/schema';
import { eq, and } from 'drizzle-orm';

export default async (req: Request) => {
    if (req.method === 'POST') {
        try {
            const { userId, itemId, itemType } = await req.json();

            if (!userId || !itemId || !itemType) {
                return new Response(
                    JSON.stringify({ error: 'Missing required fields' }),
                    { status: 400 }
                );
            }

            // Проверить, есть ли уже лайк
            const existingLike = await db
                .select()
                .from(likes)
                .where(
                    and(
                        eq(likes.userId, userId),
                        eq(likes.itemId, itemId),
                        eq(likes.itemType, itemType)
                    )
                )
                .limit(1);

            if (existingLike.length > 0) {
                // Удалить лайк
                await db
                    .delete(likes)
                    .where(
                        and(
                            eq(likes.userId, userId),
                            eq(likes.itemId, itemId),
                            eq(likes.itemType, itemType)
                        )
                    );

                return new Response(
                    JSON.stringify({ success: true, action: 'removed' }),
                    { status: 200, headers: { 'Content-Type': 'application/json' } }
                );
            } else {
                // Добавить лайк
                const newLike = await db
                    .insert(likes)
                    .values({
                        userId,
                        itemId,
                        itemType
                    })
                    .returning();

                return new Response(
                    JSON.stringify({ success: true, action: 'added', data: newLike[0] }),
                    { status: 201, headers: { 'Content-Type': 'application/json' } }
                );
            }
        } catch (error) {
            console.error('Toggle like error:', error);
            return new Response(
                JSON.stringify({ error: 'Failed to toggle like' }),
                { status: 500 }
            );
        }
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
};
