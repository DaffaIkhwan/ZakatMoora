
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Revert the incorrect changes to A19 (Sri Wahyuni Tenayan)
const CORRECTIONS = [
    // Revert A19 C1A back to 4 (original)
    { name: 'Sri Wahyuni (Tenayan)', aspect: 'C1A', correctValue: 4 },
    // Revert A19 C3A back to 0 (original)
    { name: 'Sri Wahyuni (Tenayan)', aspect: 'C3A', correctValue: 0 },
    // Revert A19 C3B back to 0 (original)
    { name: 'Sri Wahyuni (Tenayan)', aspect: 'C3B', correctValue: 0 },
];

async function main() {
    console.log('🔄 Reverting incorrect A19 changes...\n');

    for (const fix of CORRECTIONS) {
        const mustahik = await prisma.mustahik.findFirst({ where: { name: fix.name } });
        if (!mustahik) { console.log(`❌ Not found: ${fix.name}`); continue; }

        const correctSubCriterion = await prisma.subCriterion.findFirst({
            where: { aspect: fix.aspect, value: fix.correctValue }
        });
        if (!correctSubCriterion) { console.log(`❌ No option: ${fix.aspect}=${fix.correctValue}`); continue; }

        const anySubCriterionForAspect = await prisma.subCriterion.findMany({ where: { aspect: fix.aspect } });
        const subCriterionIds = anySubCriterionForAspect.map(s => s.id);

        const existingScore = await prisma.mustahikScore.findFirst({
            where: { mustahikId: mustahik.id, subCriterionId: { in: subCriterionIds } },
            include: { subCriterion: true }
        });

        if (!existingScore) {
            await prisma.mustahikScore.create({ data: { mustahikId: mustahik.id, subCriterionId: correctSubCriterion.id } });
            console.log(`✅ Created ${fix.name} / ${fix.aspect}: value=${fix.correctValue}`);
        } else {
            const oldValue = existingScore.subCriterion.value;
            if (oldValue === fix.correctValue) { console.log(`⏭️  Skip ${fix.name} / ${fix.aspect}: already ${oldValue}`); continue; }
            await prisma.mustahikScore.update({ where: { id: existingScore.id }, data: { subCriterionId: correctSubCriterion.id } });
            console.log(`✅ Reverted ${fix.name} / ${fix.aspect}: ${oldValue} → ${fix.correctValue}`);
        }
    }

    console.log('\n✅ Done!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
