
const fs = require('fs');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const logs = [];
    const log = (msg) => { console.log(msg); logs.push(msg); };

    const criteriaList = await prisma.criterion.findMany({ include: { subCriteria: true } });

    // Log Weights
    criteriaList.forEach(c => log(`${c.code}: Weight=${c.weight}, Type=${c.type}`));

    const allMustahiks = await prisma.mustahik.findMany({
        orderBy: { name: 'asc' },
        include: { criteriaScores: { include: { subCriterion: true } } }
    });

    const ASPECT_CODES = ['C1A', 'C2A', 'C2B', 'C3A', 'C3B', 'C3C', 'C4A', 'C4B', 'C4C', 'C5A', 'C5B', 'C5C', 'C6A', 'C6B', 'C6C', 'C6D', 'C7A', 'C7B', 'C7C'];

    const criteriaMap = {};
    for (const c of criteriaList) {
        criteriaMap[c.code] = { weight: c.weight, type: c.type, aspects: ASPECT_CODES.filter(a => a.startsWith(c.code)) };
    }

    const matrix = allMustahiks.map(m => {
        return ASPECT_CODES.map(aspect => {
            const score = m.criteriaScores.find(cs => cs.subCriterion.aspect === aspect);
            return score ? score.subCriterion.value : 0;
        });
    });

    const denoms = ASPECT_CODES.map((_, colIndex) => {
        let sumSq = 0;
        for (let i = 0; i < matrix.length; i++) {
            const val = matrix[i][colIndex];
            sumSq += val * val;
        }
        return Math.sqrt(sumSq);
    });

    // Calculate Anis (A1) Detailed
    const anis = allMustahiks[0];
    const row = matrix[0];
    let calcLog = `Calculation for ${anis.name}:\n`;
    let totalScore = 0;

    row.forEach((val, c) => {
        const aspect = ASPECT_CODES[c];
        const code = aspect.substring(0, 2);
        const crit = criteriaMap[code];
        if (crit) {
            const denom = denoms[c];
            const norm = val / denom;
            const subWeight = crit.weight / crit.aspects.length;
            const weighted = norm * subWeight;
            totalScore += weighted;
            calcLog += `  ${aspect}: Val=${val}, Denom=${denom.toFixed(2)}, Norm=${norm.toFixed(4)}, W=${subWeight.toFixed(4)}, Res=${weighted.toFixed(4)}\n`;
        }
    });
    calcLog += `TOTAL: ${totalScore.toFixed(4)}`;
    log(calcLog);

    fs.writeFileSync('debug-output.txt', logs.join('\n'));
}

main().finally(() => prisma.$disconnect());
