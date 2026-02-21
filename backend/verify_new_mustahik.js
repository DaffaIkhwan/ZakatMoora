const prisma = require('./src/prisma');
const fs = require('fs');

async function main() {
    let output = '';

    const count = await prisma.mustahik.count();
    output += `Total Mustahik: ${count}\n\n`;

    const mustahikList = await prisma.mustahik.findMany({
        include: {
            criteriaScores: {
                include: { subCriterion: true }
            }
        },
        orderBy: { name: 'asc' }
    });

    mustahikList.forEach(m => {
        output += `${m.nik} | ${m.name} | ${m.address} | ${m.phone} | ${m.businessStatus}\n`;
        output += `  Scores (${m.criteriaScores.length}):\n`;
        m.criteriaScores.forEach(cs => {
            output += `    ${cs.subCriterion.aspect}: ${cs.subCriterion.label} (value: ${cs.subCriterion.value})\n`;
        });
        output += '\n';
    });

    fs.writeFileSync('verify_mustahik.txt', output, 'utf8');
    console.log('Output written to verify_mustahik.txt');
    console.log(`Total: ${count} mustahik`);

    await prisma.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
