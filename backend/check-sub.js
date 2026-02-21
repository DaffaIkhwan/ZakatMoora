
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const subs = await prisma.subCriterion.findMany({
        select: { aspect: true, value: true, label: true, id: true },
        orderBy: { aspect: 'asc' }
    });

    // Group by aspect
    const grouped = {};
    subs.forEach(s => {
        if (!grouped[s.aspect]) grouped[s.aspect] = [];
        grouped[s.aspect].push(s);
    });

    for (const aspect in grouped) {
        console.log(`Aspect ${aspect}: [${grouped[aspect].map(s => s.value).sort((a, b) => a - b).join(', ')}]`);
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
