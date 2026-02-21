
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Corrections: { mustahikName, aspect, correctValue }
// Derived by comparing system output vs reference document
const CORRECTIONS = [
    // A17 - Sri Molna Yerti: C5A=6 (was 12), C5B=0 (was 4)
    { name: 'Sri Molna Yerti', aspect: 'C5A', correctValue: 6 },
    { name: 'Sri Molna Yerti', aspect: 'C5B', correctValue: 0 },

    // A18 - Sri Wahyuni (Marpoyan): C5A=12 (was 12 ok), C5B=4 (was 4 ok)
    // But C6A: doc shows A18=6, DB=6 ok. Let's check C5 avg more carefully.
    // Doc A18 C5 avg = (0.2245+0.1811+0.1925)/3 = 0.1994. System = 0.1961 → different denominator
    // The denominator difference is caused by Suriati C5C=4 (should be 2)
    // So fixing Suriati C5C will fix A18 automatically.

    // A19 - Sri Wahyuni (Tenayan): C5B=4 (was 6), C6A=12 (was 6), C6B=6 (was 9), C6C=12 (was 6)
    { name: 'Sri Wahyuni (Tenayan)', aspect: 'C5B', correctValue: 4 },
    { name: 'Sri Wahyuni (Tenayan)', aspect: 'C6A', correctValue: 12 },
    { name: 'Sri Wahyuni (Tenayan)', aspect: 'C6B', correctValue: 6 },
    { name: 'Sri Wahyuni (Tenayan)', aspect: 'C6C', correctValue: 12 },

    // A20 - Sri handini: C4B=0 (was 1), C4C=0 (was 2), C5A=12 (was 6), C5B=6 (was 0)
    { name: 'Sri handini', aspect: 'C4B', correctValue: 0 },
    { name: 'Sri handini', aspect: 'C4C', correctValue: 0 },
    { name: 'Sri handini', aspect: 'C5A', correctValue: 12 },
    // C5B was already fixed to 6 in previous run

    // A22 - Suriati: C5C=2 (was 4)
    { name: 'Suriati', aspect: 'C5C', correctValue: 2 },
];

async function main() {
    console.log('🔧 Fixing incorrect data values based on reference document...\n');

    for (const fix of CORRECTIONS) {
        // Find mustahik
        const mustahik = await prisma.mustahik.findFirst({ where: { name: fix.name } });
        if (!mustahik) {
            console.log(`❌ Mustahik not found: ${fix.name}`);
            continue;
        }

        // Find the correct target SubCriterion (the option with the right value for this aspect)
        const correctSubCriterion = await prisma.subCriterion.findFirst({
            where: { aspect: fix.aspect, value: fix.correctValue }
        });
        if (!correctSubCriterion) {
            console.log(`❌ No SubCriterion option with aspect=${fix.aspect} and value=${fix.correctValue}`);
            continue;
        }

        // Find existing MustahikScore for this mustahik and this aspect
        // We need to find any SubCriterion with this aspect first, then find the score
        const anySubCriterionForAspect = await prisma.subCriterion.findMany({ where: { aspect: fix.aspect } });
        const subCriterionIds = anySubCriterionForAspect.map(s => s.id);

        const existingScore = await prisma.mustahikScore.findFirst({
            where: { mustahikId: mustahik.id, subCriterionId: { in: subCriterionIds } },
            include: { subCriterion: true }
        });

        if (!existingScore) {
            // Create new score
            await prisma.mustahikScore.create({
                data: { mustahikId: mustahik.id, subCriterionId: correctSubCriterion.id }
            });
            console.log(`✅ Created ${fix.name} / ${fix.aspect}: value=${fix.correctValue}`);
        } else {
            const oldValue = existingScore.subCriterion.value;
            if (oldValue === fix.correctValue) {
                console.log(`⏭️  Skip ${fix.name} / ${fix.aspect}: already correct (${oldValue})`);
                continue;
            }
            // Update to point to correct SubCriterion option
            await prisma.mustahikScore.update({
                where: { id: existingScore.id },
                data: { subCriterionId: correctSubCriterion.id }
            });
            console.log(`✅ Fixed ${fix.name} / ${fix.aspect}: ${oldValue} → ${fix.correctValue}`);
        }
    }

    console.log('\n✅ Done! Running verification...\n');
}

main().catch(console.error).finally(() => prisma.$disconnect());
