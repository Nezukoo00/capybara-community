import { db } from '../../db';
import { comments } from '../../db/schema';
import { eq } from 'drizzle-orm';

export default async (req: Request) => {
    if (req.method !== 'DELETE') {
        return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
    }

    try {
        const url = new URL(req.url);
        const id = url.pathname.split('/').pop();

        if (!id) {
            return new Response(
                JSON.stringify({ error: 'Comment ID required' }),
                { status: 400 }
            );
        }

        await db
            .delete(comments)
            .where(eq(comments.id, id));

        return new Response(
            JSON.stringify({ success: true, message: 'Comment deleted' }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
    } catch (error) {
        console.error('Delete comment error:', error);
        return new Response(
            JSON.stringify({ error: 'Failed to delete comment' }),
            { status: 500 }
        );
    }
};
