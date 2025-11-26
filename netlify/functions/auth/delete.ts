import { db } from '../../db';
import { users } from '../../db/schema';
import { eq } from 'drizzle-orm';

export default async (req: Request) => {
    if (req.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
    }

    try {
        const { userId } = await req.json();

        if (!userId) {
            return new Response(
                JSON.stringify({ error: 'User ID required' }),
                { status: 400 }
            );
        }

        // Удаление пользователя
        await db
            .delete(users)
            .where(eq(users.id, userId));

        return new Response(
            JSON.stringify({ success: true, message: 'Account deleted' }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
    } catch (error) {
        console.error('Delete account error:', error);
        return new Response(
            JSON.stringify({ error: 'Delete failed' }),
            { status: 500 }
        );
    }
};
