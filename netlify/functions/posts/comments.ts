import { db } from '../../db';
import { postComments, posts } from '../../db/schema';
import { eq } from 'drizzle-orm';

export default async (req: Request) => {
    const url = new URL(req.url);
    const postId = url.pathname.split('/')[3]; // /posts/{postId}/comments

    if (req.method === 'GET') {
        try {
            if (!postId) {
                return new Response(
                    JSON.stringify({ error: 'Post ID required' }),
                    { status: 400 }
                );
            }

            const comments = await db
                .select()
                .from(postComments)
                .where(eq(postComments.postId, postId))
                .orderBy(postComments.createdAt);

            return new Response(
                JSON.stringify({ success: true, data: comments }),
                { status: 200, headers: { 'Content-Type': 'application/json' } }
            );
        } catch (error) {
            console.error('Get post comments error:', error);
            return new Response(
                JSON.stringify({ error: 'Failed to fetch comments' }),
                { status: 500 }
            );
        }
    }

    if (req.method === 'POST') {
        try {
            const { userId, text } = await req.json();

            if (!postId || !userId || !text) {
                return new Response(
                    JSON.stringify({ error: 'Missing required fields' }),
                    { status: 400 }
                );
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
                .set({ commentsCount: posts.commentsCount as any + 1 })
                .where(eq(posts.id, postId));

            return new Response(
                JSON.stringify({ success: true, data: newComment[0] }),
                { status: 201, headers: { 'Content-Type': 'application/json' } }
            );
        } catch (error) {
            console.error('Create post comment error:', error);
            return new Response(
                JSON.stringify({ error: 'Failed to create comment' }),
                { status: 500 }
            );
        }
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
};
