const { db } = require('../../db/index.ts');
const { likes } = require('../../db/schema.ts');
const { eq } = require('drizzle-orm');

exports.handler = async (req) => {
    if (req.httpMethod === 'GET') {
        try {
            const url = new URL(req.rawUrl, `https://${req.headers.host}`);
            const itemId = url.searchParams.get('itemId');

            if (!itemId) {
                return {
                    statusCode: 400,
                    body: JSON.stringify({ error: 'Item ID required' })
                };
            }

            const itemLikes = await db
                .select()
                .from(likes)
                .where(eq(likes.itemId, itemId));

            return {
                statusCode: 200,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ success: true, count: itemLikes.length, data: itemLikes })
            };
        } catch (error) {
            console.error('Get likes error:', error);
            return {
                statusCode: 500,
                body: JSON.stringify({ error: 'Failed to fetch likes' })
            };
        }
    }

    return {
        statusCode: 405,
        body: JSON.stringify({ error: 'Method not allowed' })
    };
};
