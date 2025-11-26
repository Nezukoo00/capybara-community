// Authentication - Login endpoint
// Full implementation with Netlify DB pending
// Site currently uses localStorage for authentication

exports.handler = async (req) => {
    return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            message: 'API endpoint is under development. Please use local authentication.',
            status: 'development'
        })
    };
};
