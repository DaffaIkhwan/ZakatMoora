const prisma = require('../prisma');

const getPrograms = async (req, res) => {
    try {
        const programs = await prisma.aidProgram.findMany({
            orderBy: { createdAt: 'desc' }
        });

        // Aggregate successful donations per program
        const donationSums = await prisma.donation.groupBy({
            by: ['programId'],
            where: {
                OR: [
                    { status: 'success' },
                    { status: null }
                ]
            },
            _sum: { amount: true }
        });

        const donationSumMap = new Map();
        donationSums.forEach(g => {
            donationSumMap.set(g.programId, Number(g._sum.amount) || 0);
        });

        const mapped = programs.map(p => ({
            ...p,
            totalBudget: Number(p.totalBudget),
            budgetPerRecipient: Number(p.budgetPerRecipient),
            collectedDonations: donationSumMap.get(p.id) || 0,
        }));
        res.json(mapped);
    } catch (error) {
        console.error('getPrograms error:', error);
        res.status(500).json({ error: error.message });
    }
};

const createProgram = async (req, res) => {
    const { name, description, totalBudget, quota, startDate, endDate, status, selectedCandidates } = req.body;
    try {
        const tb = parseFloat(totalBudget);
        const q = parseInt(quota);

        if (q <= 0) return res.status(400).json({ error: 'Kuota harus lebih besar dari 0' });

        // Hitung ketersediaan dana terkumpul (Pool Balance)
        const totalDonationsResult = await prisma.donation.aggregate({
            where: {
                OR: [{ status: 'success' }, { status: null }],
                isAllocation: { not: true }
            },
            _sum: { amount: true }
        });
        const totalDonations = Number(totalDonationsResult._sum.amount) || 0;

        const totalAllocationsResult = await prisma.donation.aggregate({
            where: {
                isAllocation: true,
                OR: [{ status: 'success' }, { status: null }]
            },
            _sum: { amount: true }
        });
        const totalAllocations = Number(totalAllocationsResult._sum.amount) || 0;
        const poolBalance = totalDonations - totalAllocations;

        // Gagalkan jika defisit
        if (tb > poolBalance) {
            return res.status(400).json({ 
                error: `Dana Terkumpul tidak mencukupi untuk membuat program ini. Saldo saat ini: Rp ${poolBalance.toLocaleString('id-ID')}` 
            });
        }

        const calculatedBudgetPerRecipient = tb / q;

        const newProgram = await prisma.aidProgram.create({
            data: {
                name,
                description,
                totalBudget: tb,
                budgetPerRecipient: calculatedBudgetPerRecipient,
                quota: q,
                startDate: new Date(startDate),
                endDate: new Date(endDate),
                status: status || 'planned'
            }
        });

        // Alokasi Otomatis via Mutasi Sistem
        let systemMuzakki = await prisma.muzakki.findFirst({ where: { name: 'SYSTEM_ALLOCATION' } });
        if (!systemMuzakki) {
            systemMuzakki = await prisma.muzakki.create({
                data: { name: 'SYSTEM_ALLOCATION', address: 'System', phone: '-', nik: 'SYSTEM' }
            });
        }

        await prisma.donation.create({
            data: {
                muzakkiId: systemMuzakki.id,
                programId: newProgram.id,
                amount: tb,
                notes: `Alokasi dana otomatis dari pembentukan awal program ${newProgram.name}`,
                paymentMethod: 'Alokasi Internal',
                status: 'success',
                isAllocation: true,
                isAnonymous: false,
                donationDate: new Date()
            }
        });

        res.json({
            ...newProgram,
            totalBudget: Number(newProgram.totalBudget),
            budgetPerRecipient: Number(newProgram.budgetPerRecipient)
        });
    } catch (error) {
        console.error('createProgram error:', error);
        res.status(500).json({ error: error.message });
    }
};

const updateProgram = async (req, res) => {
    const { id } = req.params;
    const { name, description, totalBudget, budgetPerRecipient, quota, startDate, endDate, status, selectedCandidates } = req.body;
    try {
        const updated = await prisma.aidProgram.update({
            where: { id },
            data: {
                name, 
                description, 
                totalBudget: parseFloat(totalBudget), 
                budgetPerRecipient: parseFloat(budgetPerRecipient),
                quota: parseInt(quota),
                startDate: new Date(startDate),
                endDate: new Date(endDate),
                status
            }
        });
        res.json({
            ...updated,
            totalBudget: Number(updated.totalBudget),
            budgetPerRecipient: Number(updated.budgetPerRecipient)
        });
    } catch (error) {
        console.error('updateProgram error:', error);
        if (error.code === 'P2025') return res.status(404).json({ error: 'Program not found' });
        res.status(500).json({ error: error.message });
    }
};

const deleteProgram = async (req, res) => {
    const { id } = req.params;
    try {
        await prisma.$transaction(async (tx) => {
            await tx.monitoringData.deleteMany({ where: { programId: id } });
            await tx.recipientHistory.deleteMany({ where: { programId: id } });
            await tx.donation.deleteMany({ where: { programId: id } });
            await tx.aidProgram.delete({ where: { id } });
        });
        res.sendStatus(204);
    } catch (error) {
        console.error('deleteProgram error:', error);
        res.status(500).json({ error: error.message });
    }
};

// Allocate funds from Dana Terkumpul (Pool) to a specific Program
const allocateFunds = async (req, res) => {
    const { id } = req.params; // programId
    const { amount, notes } = req.body;

    try {
        if (!amount || parseFloat(amount) <= 0) {
            return res.status(400).json({ error: 'Amount must be greater than 0' });
        }

        const program = await prisma.aidProgram.findUnique({ where: { id } });
        if (!program) {
            return res.status(404).json({ error: 'Program not found' });
        }

        // Check pool balance
        const totalDonationsResult = await prisma.donation.aggregate({
            where: {
                OR: [{ status: 'success' }, { status: null }],
                isAllocation: { not: true }
            },
            _sum: { amount: true }
        });
        const totalDonations = Number(totalDonationsResult._sum.amount) || 0;

        const totalAllocationsResult = await prisma.donation.aggregate({
            where: {
                isAllocation: true,
                OR: [{ status: 'success' }, { status: null }]
            },
            _sum: { amount: true }
        });
        const totalAllocations = Number(totalAllocationsResult._sum.amount) || 0;
        const poolBalance = totalDonations - totalAllocations;
        const allocAmount = parseFloat(amount);

        if (allocAmount > poolBalance) {
            return res.status(400).json({ 
                error: `Dana tidak mencukupi. Saldo: Rp ${poolBalance.toLocaleString('id-ID')}` 
            });
        }

        // System muzakki for internal allocations
        let systemMuzakki = await prisma.muzakki.findFirst({ where: { name: 'SYSTEM_ALLOCATION' } });
        if (!systemMuzakki) {
            systemMuzakki = await prisma.muzakki.create({
                data: { name: 'SYSTEM_ALLOCATION', address: 'System', phone: '-', nik: 'SYSTEM' }
            });
        }

        const allocation = await prisma.donation.create({
            data: {
                muzakkiId: systemMuzakki.id,
                programId: id,
                amount: allocAmount,
                notes: notes || `Penyaluran dana ke ${program.name}`,
                paymentMethod: 'Alokasi Internal',
                status: 'success',
                isAllocation: true,
                isAnonymous: false,
                donationDate: new Date()
            }
        });

        res.json({ success: true, allocation, newPoolBalance: poolBalance - allocAmount });
    } catch (error) {
        console.error('allocateFunds error:', error);
        res.status(500).json({ error: error.message });
    }
};

// Get Dana Terkumpul (Pool) balance
const getPoolBalance = async (req, res) => {
    try {
        const totalDonationsResult = await prisma.donation.aggregate({
            where: {
                OR: [{ status: 'success' }, { status: null }],
                isAllocation: { not: true }
            },
            _sum: { amount: true }
        });
        const totalDonations = Number(totalDonationsResult._sum.amount) || 0;

        const totalAllocationsResult = await prisma.donation.aggregate({
            where: {
                isAllocation: true,
                OR: [{ status: 'success' }, { status: null }]
            },
            _sum: { amount: true }
        });
        const totalAllocations = Number(totalAllocationsResult._sum.amount) || 0;

        res.json({ totalDonations, totalAllocations, poolBalance: totalDonations - totalAllocations });
    } catch (error) {
        console.error('getPoolBalance error:', error);
        res.status(500).json({ error: error.message });
    }
};

module.exports = { getPrograms, createProgram, updateProgram, deleteProgram, allocateFunds, getPoolBalance };

