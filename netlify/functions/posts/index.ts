import { db } from '../../db';
import { posts, postComments } from '../../db/schema';
import { eq } from 'drizzle-orm';

export default async (req: Request) => {
    if (req.method === 'GET') {
        try {
            const allPosts = await db
                .select()
                .from(posts)
                .orderBy(posts.createdAt);

            return new Response(
                JSON.stringify({ success: true, data: allPosts }),
                { status: 200, headers: { 'Content-Type': 'application/json' } }
            );
        } catch (error) {
            console.error('Get posts error:', error);
            return new Response(
                JSON.stringify({ error: 'Failed to fetch posts' }),
                { status: 500 }
            );
        }
    }

    if (req.method === 'POST') {
        try {
            const { authorId, title, content, isAdmin } = await req.json();

            if (!isAdmin) {
                return new Response(
                    JSON.stringify({ error: 'Only admins can create posts' }),
                    { status: 403 }
                );
            }

            if (!title || !content || !authorId) {
                return new Response(
                    JSON.stringify({ error: 'Missing required fields' }),
                    { status: 400 }
                );
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

            return new Response(
                JSON.stringify({ success: true, data: newPost[0] }),
                { status: 201, headers: { 'Content-Type': 'application/json' } }
            );
        } catch (error) {
            console.error('Create post error:', error);
            return new Response(
                JSON.stringify({ error: 'Failed to create post' }),
                { status: 500 }
            );
        }
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
};
