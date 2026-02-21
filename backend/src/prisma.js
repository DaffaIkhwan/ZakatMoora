const { PrismaClient } = require('@prisma/client');

// Ensure single instance of PrismaClient (singleton pattern)
const globalForPrisma = global;

// CRITICAL: Use very small connection pool to avoid "too many connections" error
// The database role has a low connection limit, so we need to be conservative
const connectionUrl = process.env.DATABASE_URL + '&connection_limit=1&pool_timeout=45';

const prisma = globalForPrisma.prisma || new PrismaClient({
    datasources: {
        db: {
            url: connectionUrl
        }
    },
    log: ['error', 'warn'], // Only log errors and warnings
});

if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prisma;
}

// Graceful shutdown to close database connections properly
process.on('SIGTERM', async () => {
    console.log('SIGTERM received, closing database connections...');
    await prisma.$disconnect();
    process.exit(0);
});

process.on('SIGINT', async () => {
    console.log('SIGINT received, closing database connections...');
    await prisma.$disconnect();
    process.exit(0);
});

module.exports = prisma;
