import { db } from '../../db';
import { users } from '../../db/schema';
import { eq } from 'drizzle-orm';

export default async (req: Request) => {
    if (req.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
    }

    try {
        const { username, email, password } = await req.json();

        // Валидация
        if (!username || username.length < 3) {
            return new Response(
                JSON.stringify({ error: 'Username must be at least 3 characters' }),
                { status: 400 }
            );
        }

        if (!email || !email.includes('@')) {
            return new Response(
                JSON.stringify({ error: 'Invalid email' }),
                { status: 400 }
            );
        }

        if (!password || password.length < 6) {
            return new Response(
                JSON.stringify({ error: 'Password must be at least 6 characters' }),
                { status: 400 }
            );
        }

        // Проверка существования пользователя
        const existingUser = await db
            .select()
            .from(users)
            .where(eq(users.email, email))
            .limit(1);

        if (existingUser.length > 0) {
            return new Response(
                JSON.stringify({ error: 'User already exists' }),
                { status: 400 }
            );
        }

        // Создание пользователя
        const newUser = await db
            .insert(users)
            .values({
                username,
                email,
                password, // In production: use bcrypt or similar
                isAdmin: false
            })
            .returning();

        return new Response(
            JSON.stringify({
                success: true,
                user: {
                    id: newUser[0].id,
                    username: newUser[0].username,
                    email: newUser[0].email,
                    isAdmin: newUser[0].isAdmin
                }
            }),
            { status: 201, headers: { 'Content-Type': 'application/json' } }
        );
    } catch (error) {
        console.error('Register error:', error);
        return new Response(
            JSON.stringify({ error: 'Registration failed' }),
            { status: 500 }
        );
    }
};
