
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Expected Yi values from the Word document (A1..A27)
const EXPECTED_YI = {
    A1: 0.1234, A2: 0.1616, A3: 0.1587, A4: 0.1528, A5: 0.1488,
    A6: 0.1305, A7: 0.1693, A8: 0.1498, A9: 0.1607, A10: 0.2197,
    A11: 0.1554, A12: 0.1299, A13: 0.0973, A14: 0.1834, A15: 0.1156,
    A16: 0.1178, A17: 0.1354, A18: 0.1428, A19: 0.1628, A20: 0.1224,
    A21: 0.1327, A22: 0.2552, A23: 0.1408, A24: 0.1203, A25: 0.1603,
    A26: 0.1376, A27: 0.1383
};

// Sub-criteria grouping per main criterion
const CRITERIA_ASPECTS = {
    C1: ['C1A'],
    C2: ['C2A', 'C2B'],
    C3: ['C3A', 'C3B', 'C3C'],
    C4: ['C4A', 'C4B', 'C4C'],
    C5: ['C5A', 'C5B', 'C5C'],
    C6: ['C6A', 'C6B', 'C6C', 'C6D'],
    C7: ['C7A', 'C7B', 'C7C'],
};

const WEIGHTS = { C1: 0.10, C2: 0.15, C3: 0.15, C4: 0.10, C5: 0.20, C6: 0.15, C7: 0.15 };

async function main() {
    const criteriaList = await prisma.criterion.findMany({ include: { subCriteria: true }, orderBy: { code: 'asc' } });
    const mustahiks = await prisma.mustahik.findMany({
        include: { criteriaScores: { include: { subCriterion: true } } },
        orderBy: { name: 'asc' }
    });

    console.log(`\nTotal mustahik in DB: ${mustahiks.length}`);
    console.log('Names (alphabetical order = A1..A27):');
    mustahiks.forEach((m, i) => console.log(`  A${i + 1}: ${m.name}`));

    // All aspect codes in order
    const ALL_ASPECTS = Object.values(CRITERIA_ASPECTS).flat();

    // Build raw value matrix [mustahik][aspect]
    const matrix = mustahiks.map(m => {
        const row = {};
        ALL_ASPECTS.forEach(asp => {
            const score = m.criteriaScores.find(cs => cs.subCriterion.aspect === asp);
            row[asp] = score ? score.subCriterion.value : 0;
        });
        return row;
    });

    // Compute denominators per aspect (sqrt of sum of squares)
    const denoms = {};
    ALL_ASPECTS.forEach(asp => {
        const sumSq = matrix.reduce((s, row) => s + row[asp] ** 2, 0);
        denoms[asp] = Math.sqrt(sumSq);
    });

    console.log('\n--- Denominators ---');
    ALL_ASPECTS.forEach(asp => console.log(`  ${asp}: ${denoms[asp].toFixed(4)}`));

    // Compute normalized values per mustahik per aspect
    const normMatrix = matrix.map(row => {
        const norm = {};
        ALL_ASPECTS.forEach(asp => {
            norm[asp] = denoms[asp] > 0 ? row[asp] / denoms[asp] : 0;
        });
        return norm;
    });

    // Compute aggregated (avg of sub-criteria norm) per criterion, then * weight
    const results = mustahiks.map((m, i) => {
        const norm = normMatrix[i];
        let yi = 0;
        const critScores = {};

        Object.entries(CRITERIA_ASPECTS).forEach(([crit, aspects]) => {
            const avgNorm = aspects.reduce((s, asp) => s + norm[asp], 0) / aspects.length;
            const weighted = avgNorm * WEIGHTS[crit];
            critScores[crit] = { avgNorm: avgNorm.toFixed(4), weighted: weighted.toFixed(4) };
            yi += weighted;
        });

        const altCode = `A${i + 1}`;
        const expected = EXPECTED_YI[altCode];
        const diff = Math.abs(yi - expected);
        const match = diff < 0.001 ? '✅' : diff < 0.005 ? '⚠️ ' : '❌';

        return { altCode, name: m.name, yi: yi.toFixed(4), expected: expected?.toFixed(4), diff: diff.toFixed(4), match, critScores };
    });

    console.log('\n--- Yi Comparison (System vs Document) ---');
    console.log('Alt  | System | Doc    | Diff   | Match | Name');
    console.log('-----|--------|--------|--------|-------|-----');
    results.forEach(r => {
        console.log(`${r.altCode.padEnd(4)} | ${r.yi} | ${r.expected} | ${r.diff} | ${r.match}    | ${r.name}`);
    });

    // Show detail for mismatches
    const mismatches = results.filter(r => parseFloat(r.diff) >= 0.001);
    if (mismatches.length > 0) {
        console.log(`\n--- Detail for Mismatches (${mismatches.length} found) ---`);
        mismatches.forEach(r => {
            console.log(`\n${r.altCode} (${r.name}): System=${r.yi}, Doc=${r.expected}, Diff=${r.diff}`);
            Object.entries(r.critScores).forEach(([c, s]) => {
                console.log(`  ${c}: avgNorm=${s.avgNorm}, weighted=${s.weighted}`);
            });
            // Also show raw values
            const m = mustahiks[parseInt(r.altCode.slice(1)) - 1];
            const rawVals = {};
            ALL_ASPECTS.forEach(asp => {
                const sc = m.criteriaScores.find(cs => cs.subCriterion.aspect === asp);
                rawVals[asp] = sc ? sc.subCriterion.value : 0;
            });
            console.log(`  Raw values: ${JSON.stringify(rawVals)}`);
        });
    } else {
        console.log('\n✅ All values match the document!');
    }

    // Summary
    const matchCount = results.filter(r => parseFloat(r.diff) < 0.001).length;
    console.log(`\nSummary: ${matchCount}/${results.length} match within 0.001 tolerance`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
