const { db } = require('../../db');
const { comments } = require('../../db/schema.ts');
const { eq } = require('drizzle-orm');

exports.handler = async (req) => {
    if (req.httpMethod === 'GET') {
        try {
            const url = new URL(req.rawUrl, `https://${req.headers.host}`);
            const page = url.searchParams.get('page') || 'home';

            const pageComments = await db
                .select()
                .from(comments)
                .where(eq(comments.page, page))
                .orderBy(comments.date);

            return {
                statusCode: 200,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ success: true, data: pageComments })
            };
        } catch (error) {
            console.error('Get comments error:', error);
            return {
                statusCode: 500,
                body: JSON.stringify({ error: 'Failed to fetch comments' })
            };
        }
    }

    if (req.httpMethod === 'POST') {
        try {
            const { userId, text, page } = JSON.parse(req.body);

            if (!userId || !text) {
                return {
                    statusCode: 400,
                    body: JSON.stringify({ error: 'Missing required fields' })
                };
            }

            const newComment = await db
                .insert(comments)
                .values({
                    userId,
                    text,
                    page: page || 'home'
                })
                .returning();

            return {
                statusCode: 201,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ success: true, data: newComment[0] })
            };
        } catch (error) {
            console.error('Create comment error:', error);
            return {
                statusCode: 500,
                body: JSON.stringify({ error: 'Failed to create comment' })
            };
        }
    }

    return {
        statusCode: 405,
        body: JSON.stringify({ error: 'Method not allowed' })
    };
};
