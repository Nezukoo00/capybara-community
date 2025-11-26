const { db } = require('../../db/index.ts');
const { likes } = require('../../db/schema.ts');
const { eq, and } = require('drizzle-orm');

exports.handler = async (req) => {
    if (req.httpMethod === 'POST') {
        try {
            const { userId, itemId, itemType } = JSON.parse(req.body);

            if (!userId || !itemId || !itemType) {
                return {
                    statusCode: 400,
                    body: JSON.stringify({ error: 'Missing required fields' })
                };
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

                return {
                    statusCode: 200,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ success: true, action: 'removed' })
                };
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

                return {
                    statusCode: 201,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ success: true, action: 'added', data: newLike[0] })
                };
            }
        } catch (error) {
            console.error('Toggle like error:', error);
            return {
                statusCode: 500,
                body: JSON.stringify({ error: 'Failed to toggle like' })
            };
        }
    }

    return {
        statusCode: 405,
        body: JSON.stringify({ error: 'Method not allowed' })
    };
};
