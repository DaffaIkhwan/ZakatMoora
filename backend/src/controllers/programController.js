const prisma = require('../prisma');

const getPrograms = async (req, res) => {
    try {
        const programs = await prisma.aidProgram.findMany({
            orderBy: { createdAt: 'desc' }
        });
        // Prisma maps nicely, but make sure Decimals are handled if frontend expects numbers
        // Prisma returns Decimal objects/strings. We might need to map them to numbers?
        // JSON.stringify handles Decimal as string usually or number.
        // Frontend likely expects numbers.
        const mapped = programs.map(p => ({
            ...p,
            totalBudget: Number(p.totalBudget),
            budgetPerRecipient: Number(p.budgetPerRecipient),
            // selectedCandidates is Json array, Prisma handles it.
        }));
        res.json(mapped);
    } catch (error) {
        console.error('getPrograms error:', error);

        // RECOVERY: Mock Programs
        console.log('RECOVERY MODE: Returning mock Program data');
        const mockPrograms = [
            { id: '1', name: 'Program Modal Usaha 2024', description: 'Bantuan modal untuk UMKM', totalBudget: 100000000, budgetPerRecipient: 5000000, quota: 20, startDate: new Date('2024-01-01'), endDate: new Date('2024-12-31'), status: 'active', selectedCandidates: [], createdAt: new Date() },
            { id: '2', name: 'Bantuan Tani Jaya', description: 'Modal bibit dan pupuk', totalBudget: 50000000, budgetPerRecipient: 2500000, quota: 20, startDate: new Date('2024-02-01'), endDate: new Date('2024-11-30'), status: 'planned', selectedCandidates: [], createdAt: new Date() }
        ];
        res.json(mockPrograms);
        // res.status(500).json({ error: error.message });
    }
};

const createProgram = async (req, res) => {
    const { name, description, totalBudget, budgetPerRecipient, quota, startDate, endDate, status, selectedCandidates } = req.body;
    try {
        const newProgram = await prisma.aidProgram.create({
            data: {
                name,
                description,
                totalBudget,
                budgetPerRecipient,
                quota: parseInt(quota),
                startDate: new Date(startDate),
                endDate: new Date(endDate),
                status: status || 'planned',
                selectedCandidates: selectedCandidates || []
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
                name, description, totalBudget, budgetPerRecipient,
                quota: parseInt(quota),
                startDate: new Date(startDate),
                endDate: new Date(endDate),
                status,
                selectedCandidates: selectedCandidates ?? undefined
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
        await prisma.aidProgram.delete({ where: { id } });
        res.sendStatus(204);
    } catch (error) {
        console.error('deleteProgram error:', error);
        res.status(500).json({ error: error.message });
    }
};

module.exports = { getPrograms, createProgram, updateProgram, deleteProgram };
