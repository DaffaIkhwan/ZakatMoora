import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Data Lengkap 27 Mustahik (Nama & Nilai) dari User
const rawData = [
    { name: "Anis mayanti", scores: { C1A: 6, C2A: 10, C2B: 0, C3A: 0, C3B: 0, C3C: 0, C4A: 2, C4B: 0, C4C: 0, C5A: 0, C5B: 0, C5C: 2, C6A: 12, C6B: 9, C6C: 12, C6D: 10, C7A: 3, C7B: 2, C7C: 3 } },
    { name: "Delvi Efriwarty", scores: { C1A: 6, C2A: 10, C2B: 0, C3A: 4, C3B: 4, C3C: 0, C4A: 2, C4B: 0, C4C: 0, C5A: 12, C5B: 6, C5C: 2, C6A: 6, C6B: 9, C6C: 6, C6D: 10, C7A: 0, C7B: 2, C7C: 3 } },
    { name: "Desi Safitri", scores: { C1A: 6, C2A: 8, C2B: 1, C3A: 0, C3B: 0, C3C: 0, C4A: 1, C4B: 0, C4C: 0, C5A: 20, C5B: 6, C5C: 2, C6A: 6, C6B: 6, C6C: 6, C6D: 10, C7A: 0, C7B: 2, C7C: 3 } },
    { name: "Desi Yuliani", scores: { C1A: 6, C2A: 10, C2B: 0, C3A: 4, C3B: 4, C3C: 0, C4A: 2, C4B: 0, C4C: 0, C5A: 6, C5B: 4, C5C: 2, C6A: 12, C6B: 9, C6C: 6, C6D: 10, C7A: 0, C7B: 2, C7C: 3 } },
    { name: "Harni Yanti", scores: { C1A: 4, C2A: 10, C2B: 0, C3A: 0, C3B: 0, C3C: 0, C4A: 2, C4B: 2, C4C: 2, C5A: 0, C5B: 4, C5C: 2, C6A: 12, C6B: 9, C6C: 12, C6D: 10, C7A: 0, C7B: 2, C7C: 3 } },
    { name: "Henti Anti", scores: { C1A: 6, C2A: 10, C2B: 0, C3A: 4, C3B: 0, C3C: 0, C4A: 2, C4B: 0, C4C: 0, C5A: 12, C5B: 4, C5C: 2, C6A: 0, C6B: 9, C6C: 6, C6D: 10, C7A: 0, C7B: 2, C7C: 3 } },
    { name: "Hidayathul Asni", scores: { C1A: 6, C2A: 10, C2B: 0, C3A: 0, C3B: 0, C3C: 0, C4A: 2, C4B: 0, C4C: 0, C5A: 20, C5B: 6, C5C: 2, C6A: 0, C6B: 9, C6C: 6, C6D: 10, C7A: 3, C7B: 4, C7C: 6 } },
    { name: "Liza Yeni", scores: { C1A: 6, C2A: 8, C2B: 0, C3A: 4, C3B: 4, C3C: 0, C4A: 2, C4B: 0, C4C: 0, C5A: 6, C5B: 4, C5C: 2, C6A: 12, C6B: 9, C6C: 6, C6D: 10, C7A: 0, C7B: 2, C7C: 3 } },
    { name: "Maijesti", scores: { C1A: 6, C2A: 10, C2B: 1, C3A: 4, C3B: 0, C3C: 0, C4A: 2, C4B: 0, C4C: 0, C5A: 6, C5B: 4, C5C: 2, C6A: 12, C6B: 9, C6C: 6, C6D: 10, C7A: 0, C7B: 2, C7C: 3 } },
    { name: "Mega Gustiana", scores: { C1A: 2, C2A: 10, C2B: 0, C3A: 9, C3B: 4, C3C: 5, C4A: 1, C4B: 0, C4C: 0, C5A: 6, C5B: 6, C5C: 2, C6A: 6, C6B: 9, C6C: 6, C6D: 10, C7A: 0, C7B: 4, C7C: 6 } },
    { name: "Nelda Wati", scores: { C1A: 6, C2A: 8, C2B: 0, C3A: 0, C3B: 0, C3C: 0, C4A: 2, C4B: 2, C4C: 2, C5A: 12, C5B: 4, C5C: 2, C6A: 6, C6B: 6, C6C: 6, C6D: 10, C7A: 0, C7B: 2, C7C: 3 } },
    { name: "Nuri Syamsi", scores: { C1A: 6, C2A: 10, C2B: 0, C3A: 4, C3B: 0, C3C: 0, C4A: 2, C4B: 0, C4C: 0, C5A: 0, C5B: 4, C5C: 2, C6A: 12, C6B: 9, C6C: 12, C6D: 10, C7A: 0, C7B: 2, C7C: 3 } },
    { name: "Nurmaya", scores: { C1A: 6, C2A: 10, C2B: 0, C3A: 0, C3B: 0, C3C: 0, C4A: 2, C4B: 0, C4C: 0, C5A: 0, C5B: 0, C5C: 2, C6A: 12, C6B: 9, C6C: 12, C6D: 10, C7A: 0, C7B: 0, C7C: 3 } },
    { name: "Ramadhan Saputra", scores: { C1A: 6, C2A: 10, C2B: 1, C3A: 4, C3B: 0, C3C: 0, C4A: 2, C4B: 0, C4C: 0, C5A: 6, C5B: 4, C5C: 2, C6A: 12, C6B: 9, C6C: 12, C6D: 10, C7A: 3, C7B: 2, C7C: 3 } },
    { name: "Roza Nelita", scores: { C1A: 6, C2A: 10, C2B: 0, C3A: 0, C3B: 0, C3C: 0, C4A: 2, C4B: 0, C4C: 0, C5A: 6, C5B: 4, C5C: 2, C6A: 6, C6B: 9, C6C: 6, C6D: 10, C7A: 0, C7B: 2, C7C: 3 } },
    { name: "Sofia Wartini", scores: { C1A: 6, C2A: 10, C2B: 0, C3A: 4, C3B: 0, C3C: 0, C4A: 2, C4B: 0, C4C: 0, C5A: 0, C5B: 0, C5C: 2, C6A: 12, C6B: 9, C6C: 12, C6D: 10, C7A: 0, C7B: 2, C7C: 3 } },
    { name: "Sri handini", scores: { C1A: 6, C2A: 10, C2B: 0, C3A: 0, C3B: 0, C3C: 0, C4A: 2, C4B: 1, C4C: 2, C5A: 6, C5B: 0, C5C: 2, C6A: 12, C6B: 9, C6C: 6, C6D: 10, C7A: 0, C7B: 2, C7C: 3 } },
    { name: "Sri Molna Yerti", scores: { C1A: 6, C2A: 8, C2B: 0, C3A: 0, C3B: 0, C3C: 0, C4A: 2, C4B: 0, C4C: 0, C5A: 12, C5B: 4, C5C: 2, C6A: 6, C6B: 9, C6C: 12, C6D: 10, C7A: 3, C7B: 2, C7C: 3 } },
    { name: "Sri Wahyuni (Marpoyan)", scores: { C1A: 6, C2A: 10, C2B: 0, C3A: 4, C3B: 4, C3C: 0, C4A: 2, C4B: 0, C4C: 0, C5A: 12, C5B: 4, C5C: 2, C6A: 12, C6B: 6, C6C: 12, C6D: 10, C7A: 0, C7B: 2, C7C: 3 } },
    { name: "Sri Wahyuni (Tenayan)", scores: { C1A: 4, C2A: 10, C2B: 0, C3A: 0, C3B: 0, C3C: 0, C4A: 2, C4B: 0, C4C: 0, C5A: 12, C5B: 6, C5C: 2, C6A: 6, C6B: 9, C6C: 6, C6D: 10, C7A: 0, C7B: 2, C7C: 3 } },
    { name: "Sulistiawati", scores: { C1A: 6, C2A: 10, C2B: 0, C3A: 4, C3B: 0, C3C: 0, C4A: 2, C4B: 0, C4C: 0, C5A: 6, C5B: 4, C5C: 2, C6A: 6, C6B: 9, C6C: 12, C6D: 10, C7A: 0, C7B: 2, C7C: 3 } },
    { name: "Suriati", scores: { C1A: 6, C2A: 10, C2B: 2, C3A: 4, C3B: 0, C3C: 0, C4A: 2, C4B: 1, C4C: 2, C5A: 20, C5B: 4, C5C: 4, C6A: 6, C6B: 9, C6C: 6, C6D: 10, C7A: 3, C7B: 4, C7C: 3 } },
    { name: "Susi Anita", scores: { C1A: 6, C2A: 10, C2B: 0, C3A: 0, C3B: 0, C3C: 0, C4A: 2, C4B: 0, C4C: 0, C5A: 12, C5B: 4, C5C: 2, C6A: 6, C6B: 9, C6C: 6, C6D: 10, C7A: 3, C7B: 2, C7C: 3 } },
    { name: "Veni Rahmayani", scores: { C1A: 6, C2A: 10, C2B: 0, C3A: 0, C3B: 0, C3C: 0, C4A: 2, C4B: 0, C4C: 0, C5A: 6, C5B: 4, C5C: 2, C6A: 12, C6B: 9, C6C: 6, C6D: 10, C7A: 0, C7B: 2, C7C: 3 } },
    { name: "Wanda Febrian Hendri", scores: { C1A: 6, C2A: 10, C2B: 0, C3A: 4, C3B: 4, C3C: 0, C4A: 2, C4B: 0, C4C: 0, C5A: 12, C5B: 4, C5C: 2, C6A: 12, C6B: 9, C6C: 6, C6D: 10, C7A: 0, C7B: 2, C7C: 3 } },
    { name: "Yuliana", scores: { C1A: 4, C2A: 10, C2B: 0, C3A: 0, C3B: 0, C3C: 0, C4A: 2, C4B: 0, C4C: 0, C5A: 12, C5B: 6, C5C: 2, C6A: 6, C6B: 6, C6C: 6, C6D: 10, C7A: 3, C7B: 2, C7C: 3 } },
    { name: "Yusniar", scores: { C1A: 6, C2A: 10, C2B: 0, C3A: 0, C3B: 0, C3C: 0, C4A: 2, C4B: 0, C4C: 0, C5A: 6, C5B: 4, C5C: 2, C6A: 6, C6B: 9, C6C: 12, C6D: 10, C7A: 3, C7B: 2, C7C: 3 } }
];

// Helper to generate consistent pseudo-random data
function generateNIK(index) {
    // Generate 16 digit NIK: 1607 + index padding + random suffix
    const base = "160791";
    const num = (index + 1).toString().padStart(2, '0');
    const rand = Math.floor(Math.random() * 89999999 + 10000000).toString();
    return `${base}${num}${rand}`.substring(0, 16);
}

function generatePhone(index) {
    const base = "0812";
    const num = (index + 1).toString().padStart(8, '0');
    return `${base}${num}`;
}

const businessStatuses = ['belum_usaha', 'rintisan', 'berkembang', 'maju'];
const addresses = [
    'Jl. Sudirman No. 12', 'Jl. Ahmad Yani No. 5', 'Jl. Merdeka No. 8', 'Jl. Diponegoro No. 3', 'Jl. Khatib Sulaiman No. 44',
    'Jl. M. Yamin No. 9', 'Jl. Pemuda No. 22', 'Jl. Veteran No. 15', 'Jl. Proklamasi No. 10', 'Jl. S. Parman No. 7'
];

async function seedFinal() {
    console.log('🔥 STARTING FRESH SEED FOR 27 MUSTAHIK 🔥\n');

    // 1. DELETE EXISTING DATA
    console.log('1. Cleaning database...');
    await prisma.monitoringData.deleteMany({});
    await prisma.recipientHistory.deleteMany({});
    await prisma.mustahikScore.deleteMany({});
    await prisma.mustahik.deleteMany({});
    console.log('   ✅ Database cleaned.');

    // 2. PREPARE SUB-CRITERIA MAP
    console.log('2. Loading criteria...');
    const allSubCriteria = await prisma.subCriterion.findMany();
    const subCriteriaMap = new Map();
    allSubCriteria.forEach(sc => subCriteriaMap.set(`${sc.aspect}_${sc.value}`, sc.id));

    // 3. INSERT MUSTAHIK & SCORES
    console.log(`3. Injecting ${rawData.length} Mustahik & Scores...`);

    for (let i = 0; i < rawData.length; i++) {
        const item = rawData[i];
        const nik = generateNIK(i);
        const phone = generatePhone(i);
        const address = addresses[i % addresses.length];
        const businessStatus = businessStatuses[i % businessStatuses.length];

        // Insert Mustahik
        await prisma.mustahik.create({
            data: {
                nik: nik,
                name: item.name,
                address: address,
                phone: phone,
                businessStatus: businessStatus,
                registeredDate: new Date()
            }
        });

        // Prepare Scores
        const scoresToInsert = [];
        for (const [aspect, value] of Object.entries(item.scores)) {
            const key = `${aspect}_${value}`;
            const scId = subCriteriaMap.get(key);
            if (scId) {
                scoresToInsert.push({
                    mustahikId: nik,
                    subCriterionId: scId
                });
            } else {
                console.warn(`   ⚠️ Missing SubCriteria: ${key} for ${item.name}`);
            }
        }

        // Insert Scores
        if (scoresToInsert.length > 0) {
            await prisma.mustahikScore.createMany({
                data: scoresToInsert
            });
        }
    }

    console.log('\n✅ SEEDING COMPLETE! 27 Mustahik added successfully.');

    const count = await prisma.mustahik.count();
    console.log(`📊 Final Count: ${count} Mustahik in database.`);
}

seedFinal()
    .catch((e) => {
        console.error('❌ Error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
