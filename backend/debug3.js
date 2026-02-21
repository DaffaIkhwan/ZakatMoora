
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Expected values from document for specific aspects
// Format: altCode -> { aspect: value }
const DOC_VALUES = {
    // C4B: A5=2, A11=2, A17=1, A22=1 (denominator=3.1623=sqrt(10))
    // C4C: A5=2, A11=2, A17=2, A22=2 (denominator=4.0=sqrt(16))
    // So A17 C4B=1, A17 C4C=2 in doc
    // Current DB: A17 C4B=0, A17 C4C=0 (I changed these - need to revert C4C to 2, keep C4B=1)

    // A5 (Harni Yanti): C4B=2, C4C=2 (doc shows A5 C4B=2, C4C=2)
    // A11 (Nelda Wati): C4B=2, C4C=2 (doc shows A11 C4B=2, C4C=2)
    // A17 (Sri Molna Yerti): C4B=1, C4C=2 (doc shows A17 C4B=1, C4C=2) - I set both to 0, wrong!
    // A22 (Suriati): C4B=1, C4C=2 (doc shows A22 C4B=1, C4C=2)

    // A18 (Sri Wahyuni Marpoyan): C6A=6 (doc), DB=12 - need to fix
    // A19 (Sri Wahyuni Tenayan): C6A=12 (doc), C6B=6 (doc), C6C=12 (doc) - already fixed
    // A20 (Sri handini): C5A=12 (doc), C5B=6 (doc) - already fixed
    //   But C6A=12 (doc), C6B=9 (doc), C6C=6 (doc) - check if correct
};

async function main() {
    // Print current values for problem candidates
    const names = ['Sri Molna Yerti', 'Sri Wahyuni (Marpoyan)', 'Sri Wahyuni (Tenayan)', 'Sri handini', 'Suriati', 'Harni Yanti', 'Nelda Wati'];

    for (const name of names) {
        const m = await prisma.mustahik.findFirst({
            where: { name },
            include: { criteriaScores: { include: { subCriterion: true } } }
        });
        if (!m) { console.log(`Not found: ${name}`); continue; }

        const scores = {};
        m.criteriaScores.forEach(s => scores[s.subCriterion.aspect] = s.subCriterion.value);

        console.log(`\n${name}:`);
        ['C4A', 'C4B', 'C4C', 'C5A', 'C5B', 'C5C', 'C6A', 'C6B', 'C6C', 'C6D'].forEach(asp => {
            console.log(`  ${asp}: ${scores[asp] ?? 'N/A'}`);
        });
    }

    // Also check denominators
    console.log('\n--- Current Denominators for C4B, C4C ---');
    const allM = await prisma.mustahik.findMany({ include: { criteriaScores: { include: { subCriterion: true } } } });

    ['C4B', 'C4C'].forEach(asp => {
        let sumSq = 0;
        allM.forEach(m => {
            const s = m.criteriaScores.find(cs => cs.subCriterion.aspect === asp);
            const v = s ? s.subCriterion.value : 0;
            sumSq += v * v;
        });
        console.log(`  ${asp}: sqrt(${sumSq}) = ${Math.sqrt(sumSq).toFixed(4)}`);
    });

    console.log('\nDoc denominators: C4B=3.1623, C4C=4.0000');
}

main().catch(console.error).finally(() => prisma.$disconnect());
