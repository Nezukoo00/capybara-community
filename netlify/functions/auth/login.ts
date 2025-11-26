import { db } from '../../db';
import { users } from '../../db/schema';
import { eq } from 'drizzle-orm';

export default async (req: Request) => {
    if (req.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
    }

    try {
        const { email, password } = await req.json();

        if (!email || !password) {
            return new Response(
                JSON.stringify({ error: 'Email and password required' }),
                { status: 400 }
            );
        }

        const user = await db
            .select()
            .from(users)
            .where(eq(users.email, email))
            .limit(1);

        if (user.length === 0 || user[0].password !== password) {
            return new Response(
                JSON.stringify({ error: 'Invalid email or password' }),
                { status: 401 }
            );
        }

        const currentUser = user[0];

        return new Response(
            JSON.stringify({
                success: true,
                user: {
                    id: currentUser.id,
                    username: currentUser.username,
                    email: currentUser.email,
                    isAdmin: currentUser.isAdmin
                }
            }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
    } catch (error) {
        console.error('Login error:', error);
        return new Response(
            JSON.stringify({ error: 'Login failed' }),
            { status: 500 }
        );
    }
};
