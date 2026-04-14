const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const mustahiks = await prisma.mustahik.findMany({
        include: { criteriaScores: { include: { subCriterion: true } } },
        orderBy: { name: 'asc' }
    });
    const s = mustahiks.find(m => m.name.includes('Mega Gustiana'));
    s.criteriaScores.sort((a,b) => a.subCriterion.aspect.localeCompare(b.subCriterion.aspect));
    s.criteriaScores.forEach(cs => {
        console.log(`${cs.subCriterion.aspect}: ${cs.subCriterion.value}`);
    });
}
main().catch(console.error).finally(() => prisma.$disconnect());
