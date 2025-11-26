const { db } = require('../../db/index.ts');
const { postComments, posts } = require('../../db/schema.ts');
const { eq } = require('drizzle-orm');

exports.handler = async (req) => {
    const path = req.path;
    const postId = path.split('/')[3]; // /posts/{postId}/comments

    if (req.httpMethod === 'GET') {
        try {
            if (!postId) {
                return {
                    statusCode: 400,
                    body: JSON.stringify({ error: 'Post ID required' })
                };
            }

            const comments = await db
                .select()
                .from(postComments)
                .where(eq(postComments.postId, postId))
                .orderBy(postComments.createdAt);

            return {
                statusCode: 200,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ success: true, data: comments })
            };
        } catch (error) {
            console.error('Get post comments error:', error);
            return {
                statusCode: 500,
                body: JSON.stringify({ error: 'Failed to fetch comments' })
            };
        }
    }

    if (req.httpMethod === 'POST') {
        try {
            const { userId, text } = JSON.parse(req.body);

            if (!postId || !userId || !text) {
                return {
                    statusCode: 400,
                    body: JSON.stringify({ error: 'Missing required fields' })
                };
            }

            const newComment = await db
                .insert(postComments)
                .values({
                    postId,
                    userId,
                    text
                })
                .returning();

            // Update comments count
            await db
                .update(posts)
                .set({ commentsCount: posts.commentsCount + 1 })
                .where(eq(posts.id, postId));

            return {
                statusCode: 201,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ success: true, data: newComment[0] })
            };
        } catch (error) {
            console.error('Create post comment error:', error);
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
