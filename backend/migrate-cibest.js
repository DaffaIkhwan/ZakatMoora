/**
 * Migration Script: Update existing monitoring data with CIBEST spiritual indicators
 * 
 * This script:
 * 1. Reads all existing MonitoringData records
 * 2. Extracts spiritual values from socialEconomicCondition JSON (if stored there previously)
 * 3. Calculates cibestQuadrant using Beik & Arsyianti (2016) formula
 * 4. Updates the new dedicated columns
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function migrateMonitoringData() {
    console.log('🔄 Starting CIBEST spiritual indicator migration...\n');

    const allMonitoring = await prisma.monitoringData.findMany({
        include: {
            mustahik: { select: { name: true } },
            program: { select: { name: true } }
        }
    });

    console.log(`📊 Found ${allMonitoring.length} monitoring records to process.\n`);

    let updated = 0;
    let skipped = 0;

    for (const record of allMonitoring) {
        // Try to extract spiritual values from socialEconomicCondition JSON (old storage)
        let sec = record.socialEconomicCondition || {};
        if (typeof sec === 'string') {
            try { sec = JSON.parse(sec); } catch { sec = {}; }
        }

        // Priority: existing column value > socialEconomicCondition nested > default 3
        const sholat5Waktu = record.sholat5Waktu || sec.sholat5Waktu || 3;
        const puasaRamadhan = record.puasaRamadhan || sec.puasaRamadhan || 3;
        const zakatInfaq = record.zakatInfaq || sec.zakatInfaq || 3;
        const lingkunganKeluarga = record.lingkunganKeluarga || sec.lingkunganKeluarga || 3;
        const kebijakanPemerintah = record.kebijakanPemerintah || sec.kebijakanPemerintah || 3;

        // Calculate CIBEST Quadrant (Beik & Arsyianti, 2016, Table 2, p.153)
        const income = Number(record.pendapatanBulanan) || Number(sec.monthlyIncome) || 0;
        const expenditure = Number(record.kebutuhanPokokBulanan) || Number(sec.monthlyExpenditure) || 0;
        const isMaterialCukup = expenditure > 0 ? (income / expenditure) >= 1.0 : false;

        const averageSpiritual = (sholat5Waktu + puasaRamadhan + zakatInfaq + lingkunganKeluarga + kebijakanPemerintah) / 5;
        const isSpiritualCukup = averageSpiritual > 3; // SV = 3

        let cibestQuadrant = 'Miskin Absolut'; // Q-IV
        if (isMaterialCukup && isSpiritualCukup) cibestQuadrant = 'Sejahtera';           // Q-I
        else if (!isMaterialCukup && isSpiritualCukup) cibestQuadrant = 'Miskin Material';  // Q-II
        else if (isMaterialCukup && !isSpiritualCukup) cibestQuadrant = 'Miskin Spiritual'; // Q-III

        try {
            await prisma.monitoringData.update({
                where: { id: record.id },
                data: {
                    sholat5Waktu,
                    puasaRamadhan,
                    zakatInfaq,
                    lingkunganKeluarga,
                    kebijakanPemerintah,
                    cibestQuadrant
                }
            });

            const mustahikName = record.mustahik?.name || record.mustahikId;
            console.log(`✅ ${mustahikName}`);
            console.log(`   📅 ${new Date(record.monitoringDate).toLocaleDateString('id-ID')}`);
            console.log(`   💰 Income: Rp ${income.toLocaleString('id-ID')} | Expenditure: Rp ${expenditure.toLocaleString('id-ID')} | Rasio: ${expenditure > 0 ? (income / expenditure).toFixed(2) : '0'}`);
            console.log(`   🕌 Sholat=${sholat5Waktu} Puasa=${puasaRamadhan} ZIS=${zakatInfaq} Keluarga=${lingkunganKeluarga} Kebijakan=${kebijakanPemerintah}`);
            console.log(`   📊 Avg Spiritual: ${averageSpiritual.toFixed(2)} (SV>3: ${isSpiritualCukup}) | Material: ${isMaterialCukup}`);
            console.log(`   🏷️  Kuadran: ${cibestQuadrant}\n`);
            updated++;
        } catch (err) {
            console.error(`❌ Failed to update record ${record.id}:`, err.message);
            skipped++;
        }
    }

    console.log('═══════════════════════════════════════════');
    console.log(`✅ Migration complete!`);
    console.log(`   Updated: ${updated}`);
    console.log(`   Skipped: ${skipped}`);
    console.log(`   Total:   ${allMonitoring.length}`);
    console.log('═══════════════════════════════════════════');
}

migrateMonitoringData()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
