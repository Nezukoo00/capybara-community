// Database Schema (JavaScript wrapper for TypeScript module)
// This allows Netlify Functions to properly import the schema

let schema = {};

try {
    // Try to import from compiled TypeScript
    const schemaModule = require('./schema.ts');
    schema = schemaModule;
} catch (e) {
    // Build-time fallback for schema exports
    console.warn('Schema module not fully initialized - this is expected during build');
    // These will be replaced with actual schema once TypeScript is compiled
    schema = {
        users: {},
        posts: {},
        comments: {},
        postComments: {},
        likes: {}
    };
}

// Export all schema tables
module.exports = schema;
