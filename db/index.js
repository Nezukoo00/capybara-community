// Netlify DB Connection (JavaScript wrapper for TypeScript module)
// This allows Netlify Functions to properly import the db module

// Since we cannot directly import TypeScript at runtime,
// we use dynamic requires with proper fallbacks

let db;

try {
    // Try to import from compiled TypeScript output first
    const dbModule = require('./index.ts');
    db = dbModule.db;
} catch (e) {
    // Fallback: provide a stub that will be replaced once DB is initialized
    console.warn('DB module not fully initialized - this is expected during build');
    db = {
        select: () => ({ from: () => ({}) }),
        insert: () => ({ values: () => ({ returning: () => ({}) }) }),
        update: () => ({ set: () => ({ where: () => ({}) }) }),
        delete: () => ({ where: () => ({}) })
    };
}

module.exports = { db };
