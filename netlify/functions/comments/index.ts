import { db } from '../../db';
import { comments } from '../../db/schema';
import { eq } from 'drizzle-orm';

export default async (req: Request) => {
    if (req.method === 'GET') {
        try {
            const url = new URL(req.url);
            const page = url.searchParams.get('page') || 'home';

            const pageComments = await db
                .select()
                .from(comments)
                .where(eq(comments.page, page))
                .orderBy(comments.date);

            return new Response(
                JSON.stringify({ success: true, data: pageComments }),
                { status: 200, headers: { 'Content-Type': 'application/json' } }
            );
        } catch (error) {
            console.error('Get comments error:', error);
            return new Response(
                JSON.stringify({ error: 'Failed to fetch comments' }),
                { status: 500 }
            );
        }
    }

    if (req.method === 'POST') {
        try {
            const { userId, text, page } = await req.json();

            if (!userId || !text) {
                return new Response(
                    JSON.stringify({ error: 'Missing required fields' }),
                    { status: 400 }
                );
            }

            const newComment = await db
                .insert(comments)
                .values({
                    userId,
                    text,
                    page: page || 'home'
                })
                .returning();

            return new Response(
                JSON.stringify({ success: true, data: newComment[0] }),
                { status: 201, headers: { 'Content-Type': 'application/json' } }
            );
        } catch (error) {
            console.error('Create comment error:', error);
            return new Response(
                JSON.stringify({ error: 'Failed to create comment' }),
                { status: 500 }
            );
        }
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
};
