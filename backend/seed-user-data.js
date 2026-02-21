
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Data from user prompt
const RAW_DATA = `
Anis mayanti	6	10	0	0	0	0	2	0	0	0	0	2	12	9	12	10	3	2	3
Delvi Efriwarty	6	10	0	4	4	0	2	0	0	12	6	2	6	9	6	10	0	2	3
Desi Safitri	6	8	1	0	0	0	1	0	0	20	6	2	6	6	6	10	0	2	3
Desi Yuliani	6	10	0	4	4	0	2	0	0	6	4	2	12	9	6	10	0	2	3
Harni Yanti	4	10	0	0	0	0	2	2	2	0	4	2	12	9	12	10	0	2	3
Henti Anti	6	10	0	4	0	0	2	0	0	12	4	2	0	9	6	10	0	2	3
Hidayathul Asni	6	10	0	0	0	0	2	0	0	20	6	2	0	9	6	10	3	4	6
Liza Yeni	6	8	0	4	4	0	2	0	0	6	4	2	12	9	6	10	0	2	3
Maijesti	6	10	1	4	0	0	2	0	0	6	4	2	12	9	6	10	0	2	3
Mega Gustiana	2	10	0	9	4	5	1	0	0	6	6	2	6	9	6	10	0	4	6
Nelda Wati	6	8	0	0	0	0	2	2	2	12	4	2	6	6	6	10	0	2	3
Nuri Syamsi	6	10	0	4	0	0	2	0	0	0	4	2	12	9	12	10	0	2	3
Nurmaya	6	10	0	0	0	0	2	0	0	0	0	2	12	9	12	10	0	0	3
Ramadhan Saputra	6	10	1	4	0	0	2	0	0	6	4	2	12	9	12	10	3	2	3
Roza Nelita	6	10	0	0	0	0	2	0	0	6	4	2	6	9	6	10	0	2	3
Sofia Wartini	6	10	0	4	0	0	2	0	0	0	0	2	12	9	12	10	0	2	3
Sri handini	6	10	0	0	0	0	2	1	2	6	0	2	12	9	6	10	0	2	3
Sri Molna Yerti	6	8	0	0	0	0	2	0	0	12	4	2	6	9	12	10	3	2	3
Sri Wahyuni (Marpoyan)	6	10	0	4	4	0	2	0	0	12	4	2	12	6	12	10	0	2	3
Sri Wahyuni (Tenayan)	4	10	0	0	0	0	2	0	0	12	6	2	6	9	6	10	0	2	3
Sulistiawati	6	10	0	4	0	0	2	0	0	6	4	2	6	9	12	10	0	2	3
Suriati	6	10	2	4	0	0	2	1	2	20	4	4	6	9	6	10	3	4	3
Susi Anita	6	10	0	0	0	0	2	0	0	12	4	2	6	9	6	10	3	2	3
Veni Rahmayani	6	10	0	0	0	0	2	0	0	6	4	2	12	9	6	10	0	2	3
Wanda Febrian Hendri	6	10	0	4	4	0	2	0	0	12	4	2	12	9	6	10	0	2	3
Yuliana	4	10	0	0	0	0	2	0	0	12	6	2	6	6	6	10	3	2	3
Yusniar	6	10	0	0	0	0	2	0	0	6	4	2	6	9	12	10	3	2	3
`;

const ASPECT_CODES = ['C1A', 'C2A', 'C2B', 'C3A', 'C3B', 'C3C', 'C4A', 'C4B', 'C4C', 'C5A', 'C5B', 'C5C', 'C6A', 'C6B', 'C6C', 'C6D', 'C7A', 'C7B', 'C7C'];

async function main() {
    console.log('Connecting to DB...');

    // 1. Map Aspect + Value -> SubCriterion ID
    const allSubCriteria = await prisma.subCriterion.findMany();
    const subMap = {};
    // Map structure: { "C1A": { "6": "uuid-123", "0": "uuid-456" }, ... }

    allSubCriteria.forEach(sub => {
        if (!subMap[sub.aspect]) subMap[sub.aspect] = {};
        subMap[sub.aspect][sub.value] = sub.id;
    });

    // 2. Parse Lines
    const lines = RAW_DATA.trim().split('\n');

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        // Split logic: Try tab first, if not enough parts, try space
        let parts = line.split('\t');
        let name, values;

        // Clean empty parts if any
        parts = parts.filter(p => p.trim() !== '');

        if (parts.length < 20) {
            // Try space split
            parts = line.split(/\s+/);
        }

        // Take last 19 as values
        const valueParts = parts.slice(parts.length - 19);
        values = valueParts.map(Number);

        // Everything before is Name
        const nameParts = parts.slice(0, parts.length - 19);
        name = nameParts.join(' ');

        console.log(`Processing: "${name}" with ${values.length} scores...`);

        // 3. Find or Create Mustahik
        // Search nicely
        let mustahik = await prisma.mustahik.findFirst({
            where: { name: { equals: name, mode: 'insensitive' } }
        });

        if (!mustahik) {
            console.log(`  > Not found. Creating new entry for "${name}"...`);
            // Generate pseudo-random ID
            const id = 'USER' + Date.now().toString().slice(-6) + Math.floor(Math.random() * 1000);
            mustahik = await prisma.mustahik.create({
                data: {
                    name: name,
                    id: id,
                    address: 'Data Baru',
                    businessStatus: 'belum_usaha'
                }
            });
        } else {
            console.log(`  > Found ID: ${mustahik.id}`);
        }

        // 4. Update Scores
        // Strategy: Delete all existing scores for these aspect codes, then insert new ones.
        // NOTE: If Mustahik has scores for OTHER aspects not in list, keep them? 
        // But this list covers ALL aspects (C1-C7).

        // First, find IDs of SubCriteria to Insert
        const scoresToCreate = [];

        for (let j = 0; j < ASPECT_CODES.length; j++) {
            const aspect = ASPECT_CODES[j];
            const val = values[j];

            const subId = subMap[aspect] ? subMap[aspect][val] : undefined;

            if (subId) {
                scoresToCreate.push({
                    mustahikId: mustahik.id,
                    subCriterionId: subId
                });
            } else {
                console.warn(`  ! Warning: No sub-criterion found for Aspect ${aspect} Value ${val}`);
            }
        }

        // Delete existing
        await prisma.mustahikScore.deleteMany({
            where: { mustahikId: mustahik.id }
        });

        // Insert new
        if (scoresToCreate.length > 0) {
            await prisma.mustahikScore.createMany({
                data: scoresToCreate
            });
            console.log(`  > Updated ${scoresToCreate.length} scores.`);
        }
    }
}

main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
