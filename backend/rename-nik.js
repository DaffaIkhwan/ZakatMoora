
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Renaming nik to id in database (app schema)...');
    try {
        // Execute raw SQL to rename the column
        // Postgres automatically updates indexes and constraints pointing to this column
        await prisma.$executeRawUnsafe(`ALTER TABLE "app"."Mustahik" RENAME COLUMN "nik" TO "id";`);
        console.log('✅ Success: Renamed "nik" to "id".');
    } catch (e) {
        console.error('❌ Error renaming column:', e.message);
    }
}

main().finally(() => prisma.$disconnect());
