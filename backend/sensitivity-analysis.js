const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * STANDALONE SENSITIVITY ANALYSIS SCRIPT
 * 
 * Target: Perhitungan Analisis Sensitivitas untuk Skripsi.
 * Input: Data Kriteria, Bobot, dan Skor Mustahik dari Database aktif.
 * Output: Laporan Perubahan Keputusan (Siapa yang Menang) saat bobot diubah.
 */

async function main() {
    console.log("=== SENSITIVITY ANALYSIS (MOORA MODEL) ===");
    
    // 1. Ambil Kriteria dan Bobot dari Database
    const criteriaFromDb = await prisma.criterion.findMany({
        include: { subCriteria: true },
        orderBy: { code: 'asc' }
    });
    
    if (criteriaFromDb.length === 0) {
        console.error("Error: Tidak ada kriteria di database.");
        return;
    }

    // Map kriteria ke struktur yang mudah dihitung
    const criteriaMap = {};
    const criteriaAspects = {};
    const baseWeights = {};
    const criteriaTypes = {};

    criteriaFromDb.forEach(c => {
        criteriaMap[c.code] = c.name;
        baseWeights[c.code] = c.weight;
        criteriaTypes[c.code] = c.type === 'cost' ? 'cost' : 'benefit';
        
        // Ambil aspect codes unik dari sub-kriteria
        const aspects = [...new Set(c.subCriteria.map(sc => sc.aspect))];
        criteriaAspects[c.code] = aspects;
    });

    const allAspectCodes = Object.values(criteriaAspects).flat();
    const totalBaseWeight = Object.values(baseWeights).reduce((a, b) => a + b, 0);

    console.log(`\nFound ${criteriaFromDb.length} Criteria from DB.`);
    console.log(`Total Base Weight: ${totalBaseWeight.toFixed(4)}`);

    // 2. Ambil Mustahik dan Skor dari Database
    const mustahiks = await prisma.mustahik.findMany({
        where: {
            NOT: {
                name: {
                    contains: 'mustahik',
                    mode: 'insensitive'
                }
            }
        },
        include: { 
            criteriaScores: { 
                include: { subCriterion: true } 
            } 
        },
        orderBy: { name: 'asc' }
    });

    if (mustahiks.length === 0) {
        console.error("Error: Tidak ada data mustahik di database.");
        return;
    }

    console.log(`Found ${mustahiks.length} Mustahik from DB.\n`);

    // 3. Persiapkan Matriks Keputusan (X)
    const matrixX = mustahiks.map(m => {
        const row = { id: m.id, name: m.name };
        allAspectCodes.forEach(asp => {
            const scoreObj = m.criteriaScores.find(cs => cs.subCriterion.aspect === asp);
            row[asp] = scoreObj ? scoreObj.subCriterion.value : 0;
        });
        return row;
    });

    // 4. Hitung Pembagi (Denominators) untuk Normalisasi Vector
    const denominators = {};
    allAspectCodes.forEach(asp => {
        const sumSquares = matrixX.reduce((sum, row) => sum + Math.pow(row[asp], 2), 0);
        denominators[asp] = Math.sqrt(sumSquares);
    });

    // 5. Normalisasi Matriks (R)
    const normMatrix = matrixX.map(row => {
        const normRow = { id: row.id, name: row.name };
        allAspectCodes.forEach(asp => {
            normRow[asp] = denominators[asp] > 0 ? row[asp] / denominators[asp] : 0;
        });
        return normRow;
    });

    /**
     * Fungsi Helper untuk Hitung Skor MOORA (Yi)
     * Menggunakan Bobot Tertentu
     */
    function calculateMooraScores(weights) {
        return normMatrix.map(row => {
            let yi = 0;
            Object.keys(criteriaAspects).forEach(critCode => {
                const aspects = criteriaAspects[critCode];
                const type = criteriaTypes[critCode];
                const weight = weights[critCode] || 0;

                // Hitung Rata-rata Normalisasi Sub-Kriteria dalam Kriteria ini
                const avgNorm = aspects.reduce((sum, asp) => sum + row[asp], 0) / aspects.length;
                
                // Kalikan dengan bobot kriteria
                const weightedValue = avgNorm * weight;

                // Tipe Benefit (+) atau Cost (-)
                if (type === 'cost') {
                    yi -= weightedValue;
                } else {
                    yi += weightedValue;
                }
            });
            return { id: row.id, name: row.name, score: yi };
        }).sort((a, b) => b.score - a.score);
    }

    // 6. Jalankan BASELINE (Siapa pemenangnya saat ini?)
    console.log("--- BASELINE STEP-BY-STEP CALCULATION (Sampel Top 15) ---");
    
    // Step 1: Decision Matrix (X)
    console.log("\nStep 1: Matriks Keputusan (15 Sampel Pertama):");
    const top15MatrixX = matrixX.slice(0, 15);
    console.log("Mustahik | " + allAspectCodes.join(" | "));
    top15MatrixX.forEach(row => {
        const rowStr = allAspectCodes.map(asp => row[asp].toString().padStart(4)).join(" | ");
        console.log(`${row.name.padEnd(20)} | ${rowStr}`);
    });

    // Step 2: Denominators
    console.log("\nStep 2: Pembagi (Denominators):");
    allAspectCodes.forEach(asp => console.log(`${asp}: ${denominators[asp].toFixed(6)}`));

    // Step 3: Normalized Matrix (R)
    console.log("\nStep 3: Matriks Ternormalisasi (15 Sampel Pertama):");
    const top15NormMatrix = normMatrix.slice(0, 15);
    top15NormMatrix.forEach(row => {
        const rowStr = allAspectCodes.map(asp => row[asp].toFixed(6)).join(" | ");
        console.log(`${row.name.padEnd(20)} | ${rowStr}`);
    });

    const baselineResults = calculateMooraScores(baseWeights);
    
    // Step 4: Weighted Normalized Matrix (Y) per Criteria Aggregated
    console.log("\nStep 4: Matriks Terbobot (Baseline - Lengkap):");
    const fullWeighted = normMatrix.map(row => {
        const weightedRow = { name: row.name };
        Object.keys(criteriaAspects).forEach(critCode => {
            const aspects = criteriaAspects[critCode];
            const avgNorm = aspects.reduce((sum, asp) => sum + row[asp], 0) / aspects.length;
            weightedRow[critCode] = (avgNorm * baseWeights[critCode]).toFixed(6);
        });
        return weightedRow;
    });
    console.log("Mustahik | " + Object.keys(baseWeights).join(" | "));
    fullWeighted.forEach(row => {
        const rowStr = Object.keys(baseWeights).map(c => row[c]).join(" | ");
        console.log(`${row.name.padEnd(25)} | ${rowStr}`);
    });

    const baselineWinner = baselineResults[0];
    console.log("\n-------------------------------------------");
    console.log("Baseline Full Summary (27 Mustahik):");
    baselineResults.forEach((r, i) => {
        console.log(`${i + 1}. ${r.name.padEnd(30)} | Score: ${r.score.toFixed(6)}`);
    });
    console.log("-------------------------------------------\n");

    // 7. ANALISIS SENSITIVITAS (One-At-a-Time)
    console.log("--- STARTING SENSITIVITY TESTING ---\n");
    
    for (const targetCode of Object.keys(baseWeights)) {
        const targetName = criteriaMap[targetCode];
        console.log(`Testing Kriteria: ${targetName} (${targetCode})`);
        
        // Simulasikan kenaikan konsentrasi bobot ke kriteria ini (misal 50% dari total)
        // Dan penurunan (misal 10% dari total)
        const testFactors = [0.10, 0.50, 0.80]; // Mewakili 10%, 50%, 80% dari total bobot
        
        testFactors.forEach(factor => {
            const newTargetWeight = totalBaseWeight * factor;
            const remainingWeight = totalBaseWeight - newTargetWeight;
            const otherBaseWeightSum = totalBaseWeight - baseWeights[targetCode];

            const adjustedWeights = {};
            Object.keys(baseWeights).forEach(code => {
                if (code === targetCode) {
                    adjustedWeights[code] = newTargetWeight;
                } else {
                    const proportion = otherBaseWeightSum > 0 ? baseWeights[code] / otherBaseWeightSum : 0;
                    adjustedWeights[code] = remainingWeight * proportion;
                }
            });

            const results = calculateMooraScores(adjustedWeights);
            const winner = results[0];
            const isChanged = winner.id !== baselineWinner.id;

            console.log(`  > Jika Bobot ${(factor * 100).toFixed(0)}%: Winner = ${winner.name.padEnd(20)} | Score: ${winner.score.toFixed(6)} ${isChanged ? "[PERUBAHAN!]" : ""}`);
            
            // Print Full list for this specific scenario
            console.log(`    Peringkat Lengkap (27 Mustahik):`);
            results.forEach((r, idx) => {
                console.log(`    ${idx + 1}. ${r.name.padEnd(30)} | Yi: ${r.score.toFixed(6)}`);
            });
            console.log("");
        });
        console.log("");
    }

    console.log("=== ANALISIS SELESAI ===");
    console.log("Interpretasi untuk Skripsi:");
    console.log("1. Jika pemenang berubah saat bobot diubah (PERUBAHAN!), berarti kriteria tersebut SENSITIF.");
    console.log("2. Jika kriteria sensitif, pastikan nilai input untuk kriteria tersebut dikumpulkan dengan sangat akurat.");
    console.log("3. Kriteria yang tidak mengubah pemenang meskipun bobot diubah drastis disebut KOKOH/ROBUST.");

}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
