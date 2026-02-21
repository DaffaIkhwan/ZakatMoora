const prisma = require('./src/prisma');
const fs = require('fs');

async function main() {
    let output = '';

    const criteria = await prisma.criterion.findMany({
        include: {
            subCriteria: {
                orderBy: { aspect: 'asc' }
            }
        },
        orderBy: { code: 'asc' }
    });

    criteria.forEach(c => {
        output += `\n=== ${c.code}: ${c.name} (weight: ${c.weight}, type: ${c.type}) ===\n`;
        c.subCriteria.forEach(sc => {
            output += `  ${sc.aspect} | ${sc.name} | label: '${sc.label}' | value: ${sc.value} | id: ${sc.id}\n`;
        });
    });

    const mustahikCount = await prisma.mustahik.count();
    output += `\n\nTotal Mustahik in DB: ${mustahikCount}\n`;

    const mustahikList = await prisma.mustahik.findMany({
        select: { nik: true, name: true }
    });
    mustahikList.forEach(m => {
        output += `  ${m.nik} - ${m.name}\n`;
    });

    fs.writeFileSync('criteria_output.txt', output, 'utf8');
    console.log('Output written to criteria_output.txt');

    await prisma.$disconnect();
}

main().catch(e => {
    console.error(e);
    process.exit(1);
});
