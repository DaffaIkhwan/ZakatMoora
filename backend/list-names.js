
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const mustahiks = await prisma.mustahik.findMany({ select: { name: true } });
    console.log(`Total: ${mustahiks.length}`);
    mustahiks.sort((a, b) => a.name.localeCompare(b.name));
    mustahiks.forEach(m => console.log(m.name));
}

main().finally(() => prisma.$disconnect());
