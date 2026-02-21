import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function deleteAllMustahik() {
    console.log('🔥 STARTING FULL DATA WIPE: MUSTAHIK 🔥\n');

    try {
        // 1. Hapus data terkait dulu (Foreign Keys)
        console.log('1. Deleting Monitoring Data...');
        const deletedMonitoring = await prisma.monitoringData.deleteMany({});
        console.log(`   - Deleted ${deletedMonitoring.count} monitoring records.`);

        console.log('2. Deleting Recipient History...');
        const deletedHistory = await prisma.recipientHistory.deleteMany({});
        console.log(`   - Deleted ${deletedHistory.count} history records.`);

        // 3. Hapus Mustahik (akan trigger cascade delete untuk MustahikScore jika dikonfigurasi, tapi kita hapus manual untuk aman)
        console.log('3. Deleting Mustahik Scores...');
        const deletedScores = await prisma.mustahikScore.deleteMany({});
        console.log(`   - Deleted ${deletedScores.count} score records.`);

        console.log('4. Deleting ALL Mustahik...');
        const deletedMustahik = await prisma.mustahik.deleteMany({});
        console.log(`   - 🗑️ DELETED ${deletedMustahik.count} MUSTAHIK RECORDS.`);

        console.log('\n✅ Database cleaned successfully! Mustahik table is now EMPTY.');

    } catch (error) {
        console.error('❌ Error deleting data:', error);
    }
}

deleteAllMustahik()
    .catch((e) => {
        console.error('❌ Script Error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
