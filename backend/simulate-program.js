
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('🚀 Starting Program Simulation with Sub-Criteria MOORA Logic...');

    // 1. Fetch Data
    const criteriaList = await prisma.criterion.findMany({
        include: { subCriteria: true }
    });

    // Determine Aspects and Weights
    // We need consistent Aspect Codes (Columns)
    const ASPECT_CODES = ['C1A', 'C2A', 'C2B', 'C3A', 'C3B', 'C3C', 'C4A', 'C4B', 'C4C', 'C5A', 'C5B', 'C5C', 'C6A', 'C6B', 'C6C', 'C6D', 'C7A', 'C7B', 'C7C'];

    // Map Criteria to Weights/Types
    const criteriaMap = {};
    for (const c of criteriaList) {
        criteriaMap[c.code] = {
            weight: c.weight,
            type: c.type || 'benefit',
            aspects: ASPECT_CODES.filter(a => a.startsWith(c.code))
        };
    }

    const mustahiks = await prisma.mustahik.findMany({
        include: {
            criteriaScores: {
                include: { subCriterion: true }
            }
        }
    });

    if (mustahiks.length === 0) {
        console.log('❌ No Mustahik found. Run seeds first.');
        return;
    }

    // 2. Build Decision Matrix [Mustahik][Aspect]
    console.log(`📊 Processing ${mustahiks.length} candidates...`);

    const matrix = mustahiks.map(m => {
        return ASPECT_CODES.map(aspect => {
            const score = m.criteriaScores.find(cs => cs.subCriterion.aspect === aspect);
            return score ? score.subCriterion.value : 0;
        });
    });

    // 3. Vector Normalization Denominators
    const denoms = ASPECT_CODES.map((_, colIndex) => {
        let sumSq = 0;
        for (let i = 0; i < matrix.length; i++) {
            const val = matrix[i][colIndex];
            sumSq += val * val;
        }
        return Math.sqrt(sumSq);
    });

    // 4. Calculate Yi Scores
    const results = mustahiks.map((m, idx) => {
        let score = 0;
        const row = matrix[idx];

        row.forEach((val, c) => {
            const aspect = ASPECT_CODES[c];
            const code = aspect.substring(0, 2); // C1, C2...
            const crit = criteriaMap[code];

            if (crit) {
                // Weight per Aspect = CriteriaWeight / NumAspects
                const subWeight = crit.weight / crit.aspects.length;

                // Normalize
                const norm = denoms[c] !== 0 ? val / denoms[c] : 0;

                // Weighted
                const weighted = norm * subWeight;

                // Optimization
                if (crit.type === 'cost') {
                    score -= weighted; // Cost criteria
                } else {
                    score += weighted; // Benefit criteria
                }
            }
        });

        return {
            id: m.id,
            name: m.name,
            score: score
        };
    });

    // Sort by Score Descending
    results.sort((a, b) => b.score - a.score);

    // 5. Create/Update Program
    console.log('📝 Updating Aid Program...');
    const programName = `Bantuan Modal Usaha Tahap ${Math.floor(Math.random() * 10) + 1} (2025)`;

    // Find latest active program or create new
    let program = await prisma.aidProgram.findFirst({
        where: { status: 'active' },
        orderBy: { createdAt: 'desc' }
    });

    if (!program) {
        program = await prisma.aidProgram.create({
            data: {
                name: programName,
                description: 'Program bantuan modal usaha mikro.',
                totalBudget: 25000000,
                budgetPerRecipient: 5000000,
                quota: 5,
                startDate: new Date(),
                endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
                status: 'active',
                selectedCandidates: mustahiks.map(m => m.id)
            }
        });
    }

    // 6. Update Tracking (RecipientHistory) for Top 5
    console.log('🏆 Updating Top 5 Recipients...');
    const top5 = results.slice(0, 5);

    await prisma.recipientHistory.deleteMany({
        where: { programId: program.id }
    });

    for (let i = 0; i < top5.length; i++) {
        const winner = top5[i];
        await prisma.recipientHistory.create({
            data: {
                mustahikId: winner.id,
                programId: program.id,
                amount: 5000000,
                receivedDate: new Date(),
                mooraScore: winner.score,
                rank: i + 1,
                notes: 'Lolos Seleksi'
            }
        });
        console.log(`   ${i + 1}. ${winner.name} (Score: ${winner.score.toFixed(4)})`);
    }

    console.log(`\n✅ Simulation Complete! Logic consistent with Frontend (SubCriteria Vector Norm).`);
}

main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
