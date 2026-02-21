
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Remaining corrections based on document analysis
const CORRECTIONS = [
    // A17 (Sri Molna Yerti): C4B should be 1 (was set to 0 incorrectly), C4C should be 2 (was set to 0 incorrectly)
    { name: 'Sri Molna Yerti', aspect: 'C4B', correctValue: 1 },
    { name: 'Sri Molna Yerti', aspect: 'C4C', correctValue: 2 },

    // A18 (Sri Wahyuni Marpoyan): C6A should be 6 (DB has 12)
    { name: 'Sri Wahyuni (Marpoyan)', aspect: 'C6A', correctValue: 6 },

    // A20 (Sri handini): Doc shows C5 avg = (0.2245+0.2716+0.1925)/3 = 0.2295
    // C5A=12 ✓, C5B=6 ✓, C5C=2 ✓ → C5 avg = (0.2245+0.2716+0.1925)/3 = 0.2295 ✓
    // But system shows 0.2295 and doc shows 0.2295 → they match now!
    // Wait, system A20 C5=0.2295 but doc A20 C5=0.2295 ✓
    // System A20 Yi=0.1336, Doc=0.1224 → difference is in C6
    // System C6=0.1923, Doc C6=0.1627 → doc A20 C6A=6 (line 2195-2199), C6B=9 (line 2367-2371), C6C=6 (line 2539-2543), C6D=10
    // avg = (0.1250+0.2009+0.1325+0.1925)/4 = 0.1627 ✓
    // DB has C6A=12, C6B=9, C6C=6, C6D=10 → C6A should be 6!
    { name: 'Sri handini', aspect: 'C6A', correctValue: 6 },
];

async function main() {
    console.log('🔧 Applying remaining corrections...\n');

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
            console.log(`✅ Fixed ${fix.name} / ${fix.aspect}: ${oldValue} → ${fix.correctValue}`);
        }
    }

    console.log('\n✅ Done!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
