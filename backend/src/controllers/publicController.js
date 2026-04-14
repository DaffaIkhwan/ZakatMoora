const prisma = require('../prisma');

const getPublicStats = async (req, res) => {
    try {
        const [
            programs,
            mustahiks,
            donations,
            histories,
            recentRecipientsRaw
        ] = await Promise.all([
            prisma.aidProgram.findMany({
                include: {
                    donations: {
                        where: { OR: [{ status: 'success' }, { status: null }] },
                        include: { muzakki: true }
                    },
                    recipientHistory: true
                }
            }),
            prisma.mustahik.findMany(),
            prisma.donation.aggregate({
                where: { OR: [{ status: 'success' }, { status: null }] },
                _sum: { amount: true }
            }),
            prisma.recipientHistory.aggregate({
                _sum: { amount: true }
            }),
            prisma.recipientHistory.findMany({
                take: 10,
                orderBy: { receivedDate: 'desc' },
                include: {
                    mustahik: true,
                    program: true
                }
            })
        ]);

        let totalMustahikStabil = 0;
        let totalMustahikBerkembang = 0;

        mustahiks.forEach(m => {
            if (m.businessStatus === 'Stabil') totalMustahikStabil++;
            if (m.businessStatus === 'Berkembang') totalMustahikBerkembang++;
        });

        const stats = {
            totalPrograms: programs.length,
            totalMustahik: mustahiks.length,
            totalZakat: Number(donations._sum.amount) || 0,
            totalDisalurkan: Number(histories._sum.amount) || 0,
            totalMustahikStabil,
            totalMustahikBerkembang,
            programs: programs.map(p => ({
                id: p.id,
                name: p.name,
                description: p.description,
                status: p.status,
                budget: Number(p.totalBudget) || 0,
                totalZakat: p.donations.reduce((s, d) => s + parseFloat(d.amount), 0),
                totalPenerima: p.recipientHistory.length,
                startDate: p.startDate,
                donations: p.donations.map(d => ({
                    muzakkiName: d.isAnonymous ? 'Hamba Allah' : (d.muzakki?.name || 'Hamba Allah'),
                    amount: Number(d.amount) || 0,
                    date: d.donationDate
                }))
            })),
            recentRecipients: recentRecipientsRaw.map(h => ({
                id: h.id,
                mustahikName: h.mustahik?.name || 'Unknown',
                mustahikAddress: h.mustahik?.address || '',
                programName: h.program?.name || 'Unknown Program',
                amount: Number(h.amount) || 0,
                receivedDate: h.receivedDate
            }))
        };

        res.json(stats);
    } catch (error) {
        console.error('getPublicStats error:', error);
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getPublicStats
};
