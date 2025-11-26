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
        const { email, password } = JSON.parse(req.body);

        if (!email || !password) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Email and password required' })
            };
        }

        const user = await db
            .select()
            .from(users)
            .where(eq(users.email, email))
            .limit(1);

        if (user.length === 0 || user[0].password !== password) {
            return {
                statusCode: 401,
                body: JSON.stringify({ error: 'Invalid email or password' })
            };
        }

        const currentUser = user[0];

        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                success: true,
                user: {
                    id: currentUser.id,
                    username: currentUser.username,
                    email: currentUser.email,
                    isAdmin: currentUser.isAdmin
                }
            })
        };
    } catch (error) {
        console.error('Login error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Login failed' })
        };
    }
};
