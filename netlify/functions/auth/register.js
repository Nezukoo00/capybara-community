const { db } = require('../../db/index.ts');
const { users } = require('../../db/schema.ts');
const { eq } = require('drizzle-orm');

exports.handler = async (req) => {
    if (req.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    try {
        const { username, email, password } = JSON.parse(req.body);

        // Валидация
        if (!username || username.length < 3) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Username must be at least 3 characters' })
            };
        }

        if (!email || !email.includes('@')) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Invalid email' })
            };
        }

        if (!password || password.length < 6) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Password must be at least 6 characters' })
            };
        }

        // Проверка существования пользователя
        const existingUser = await db
            .select()
            .from(users)
            .where(eq(users.email, email))
            .limit(1);

        if (existingUser.length > 0) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'User already exists' })
            };
        }

        // Создание пользователя
        const newUser = await db
            .insert(users)
            .values({
                username,
                email,
                password,
                isAdmin: false
            })
            .returning();

        return {
            statusCode: 201,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                success: true,
                user: {
                    id: newUser[0].id,
                    username: newUser[0].username,
                    email: newUser[0].email,
                    isAdmin: newUser[0].isAdmin
                }
            })
        };
    } catch (error) {
        console.error('Register error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Registration failed' })
        };
    }
};
