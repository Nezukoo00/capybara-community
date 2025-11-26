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
        const { userId } = JSON.parse(req.body);

        if (!userId) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'User ID required' })
            };
        }

        // Удаление пользователя
        await db
            .delete(users)
            .where(eq(users.id, userId));

        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ success: true, message: 'Account deleted' })
        };
    } catch (error) {
        console.error('Delete account error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Delete failed' })
        };
    }
};
