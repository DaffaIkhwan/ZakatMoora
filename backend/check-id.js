
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const mustahiq = await prisma.mustahik.findMany({
            select: { id: true, name: true }
        });

        console.log('✅ Success! Found Mustahik records with "id" field:');
        console.log('Total:', mustahiq.length);
        if (mustahiq.length > 0) {
            console.log('First 3 entries:');
            mustahiq.slice(0, 3).forEach(m => console.log(`[${m.id}] ${m.name}`));
        }
    } catch (e) {
        console.error('❌ Error fetching data:', e.message);
    }
}

main().finally(() => prisma.$disconnect());
