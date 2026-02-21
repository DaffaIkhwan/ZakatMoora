
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const mustahiq = await prisma.mustahik.findMany({
        select: { name: true }
    });

    console.log('Total in DB:', mustahiq.length);
    console.log('Names in DB:');
    mustahiq.forEach(m => console.log(m.name));
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
