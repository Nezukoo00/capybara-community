const { db } = require('../../db');
const { posts, postComments } = require('../../db/schema.ts');
const { eq } = require('drizzle-orm');

exports.handler = async (req) => {
    if (req.httpMethod === 'GET') {
        try {
            const allPosts = await db
                .select()
                .from(posts)
                .orderBy(posts.createdAt);

            return {
                statusCode: 200,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ success: true, data: allPosts })
            };
        } catch (error) {
            console.error('Get posts error:', error);
            return {
                statusCode: 500,
                body: JSON.stringify({ error: 'Failed to fetch posts' })
            };
        }
    }

    if (req.httpMethod === 'POST') {
        try {
            const { authorId, title, content, isAdmin } = JSON.parse(req.body);

            if (!isAdmin) {
                return {
                    statusCode: 403,
                    body: JSON.stringify({ error: 'Only admins can create posts' })
                };
            }

            if (!title || !content || !authorId) {
                return {
                    statusCode: 400,
                    body: JSON.stringify({ error: 'Missing required fields' })
                };
            }

            const newPost = await db
                .insert(posts)
                .values({
                    authorId,
                    title,
                    content,
                    commentsCount: 0
                })
                .returning();

            return {
                statusCode: 201,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ success: true, data: newPost[0] })
            };
        } catch (error) {
            console.error('Create post error:', error);
            return {
                statusCode: 500,
                body: JSON.stringify({ error: 'Failed to create post' })
            };
        }
    }

    return {
        statusCode: 405,
        body: JSON.stringify({ error: 'Method not allowed' })
    };
};
