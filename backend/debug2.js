
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    // Check Sri Molna Yerti scores
    const m = await prisma.mustahik.findFirst({
        where: { name: 'Sri Molna Yerti' },
        include: { criteriaScores: { include: { subCriterion: true } } }
    });
    console.log('Sri Molna Yerti scores:');
    m.criteriaScores.forEach(s => console.log(`  ${s.subCriterion.aspect}: value=${s.subCriterion.value}, label="${s.subCriterion.label}", subCriterionId=${s.subCriterionId}`));

    // Check what SubCriterion options exist for C5A
    const c5a = await prisma.subCriterion.findMany({ where: { aspect: 'C5A' }, orderBy: { value: 'asc' } });
    console.log('\nAll C5A SubCriterion options in DB:');
    c5a.forEach(s => console.log(`  id=${s.id}, value=${s.value}, label="${s.label}"`));
}

main().catch(console.error).finally(() => prisma.$disconnect());
