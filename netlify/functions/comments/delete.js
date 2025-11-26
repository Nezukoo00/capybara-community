const { db } = require('../../db');
const { comments } = require('../../db/schema.ts');
const { eq } = require('drizzle-orm');

exports.handler = async (req) => {
    if (req.httpMethod !== 'DELETE') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    try {
        const { id } = JSON.parse(req.body);

        if (!id) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Comment ID required' })
            };
        }

        await db
            .delete(comments)
            .where(eq(comments.id, id));

        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ success: true, message: 'Comment deleted' })
        };
    } catch (error) {
        console.error('Delete comment error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to delete comment' })
        };
    }
};
