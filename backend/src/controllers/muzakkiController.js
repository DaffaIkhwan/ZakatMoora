const prisma = require('../prisma');

const getMuzakkis = async (req, res) => {
    try {
        const muzakkis = await prisma.muzakki.findMany({
            include: {
                user: {
                    select: {
                        email: true,
                        isActive: true
                    }
                },
                _count: {
                    select: { 
                        donations: {
                            where: { 
                                OR: [
                                    { status: 'success' },
                                    { status: null }
                                ]
                            }
                        }
                    }
                }
            }
        });
        res.json(muzakkis);
    } catch (error) {
        console.error('getMuzakkis error:', error);
        res.status(500).json({ error: error.message });
    }
};

const createDonation = async (req, res) => {
    const { muzakkiId, amount, notes, date, paymentMethod, isAnonymous } = req.body;
    try {
        const donation = await prisma.donation.create({
            data: {
                muzakkiId,
                programId: null, // Dana Terkumpul (Pool)
                amount: parseFloat(amount),
                notes: notes || 'Zakat - Dana Terkumpul',
                donationDate: date ? new Date(date) : new Date(),
                paymentMethod: paymentMethod || 'Cash',
                isAnonymous: isAnonymous === true,
                isAllocation: false,
                status: 'success'
            }
        });
        res.status(201).json(donation);
    } catch (error) {
        console.error('createDonation error:', error);
        res.status(500).json({ error: error.message });
    }
};

const getMuzakkiDashboard = async (req, res) => {
    const { user } = req;
    if (!user || user.role !== 'muzakki') {
        return res.status(403).json({ error: 'Access denied' });
    }

    try {
        const muzakki = await prisma.muzakki.findUnique({
            where: { userId: user.id },
            include: {
                donations: {
                    where: {
                        OR: [{ status: 'success' }, { status: null }]
                    },
                    orderBy: { donationDate: 'desc' }
                }
            }
        });

        if (!muzakki) {
            return res.status(404).json({ error: 'Muzakki profile not found' });
        }

        // === Pool Balance: Total successful donations (non-allocation) minus total allocations ===
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

        // === ALL programs with recipients (not just Muzakki's) ===
        const allPrograms = await prisma.aidProgram.findMany({
            include: {
                recipientHistory: {
                    include: { mustahik: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        // Get allocated donations per program
        const allocatedPerProgram = await prisma.donation.groupBy({
            by: ['programId'],
            where: {
                programId: { not: null },
                isAllocation: true,
                OR: [{ status: 'success' }, { status: null }]
            },
            _sum: { amount: true }
        });
        const allocMap = new Map();
        allocatedPerProgram.forEach(g => {
            allocMap.set(g.programId, Number(g._sum.amount) || 0);
        });

        const programList = allPrograms.map(p => ({
            id: p.id,
            name: p.name,
            description: p.description,
            totalBudget: Number(p.totalBudget) || 0,
            budgetPerRecipient: Number(p.budgetPerRecipient) || 0,
            quota: p.quota,
            startDate: p.startDate,
            endDate: p.endDate,
            status: p.status,
            allocatedFunds: allocMap.get(p.id) || 0,
            mustahiks: p.recipientHistory.map(h => ({
                id: h.mustahik.id,
                name: h.mustahik.name,
                amountReceived: Number(h.amount) || 0,
                receivedDate: h.receivedDate,
                businessStatus: h.mustahik.businessStatus
            }))
        }));

        // Global stats
        const globalStats = {
            totalPrograms: allPrograms.length,
            totalRecipients: allPrograms.reduce((sum, p) => sum + p.recipientHistory.length, 0),
            totalDistributed: allPrograms.reduce((sum, p) => sum + p.recipientHistory.reduce((s, h) => s + parseFloat(h.amount), 0), 0)
        };

        // Personal stats from this Muzakki's donations
        const myDonations = muzakki.donations.filter(d => !d.isAllocation);
        const hasDonations = myDonations.length > 0;
        const personalStats = hasDonations ? {
            totalDonated: myDonations.reduce((sum, d) => sum + Number(d.amount), 0),
            donationCount: myDonations.length
        } : null;

        res.json({
            muzakkiInfo: {
                name: muzakki.name,
                address: muzakki.address,
                phone: muzakki.phone,
                job: muzakki.job,
                institution: muzakki.institution,
                registeredDate: muzakki.registeredDate
            },
            hasDonations,
            poolBalance,
            totalDonations,
            globalStats,
            personalStats,
            allPrograms: programList
        });

    } catch (error) {
        console.error('getMuzakkiDashboard error:', error);
        res.status(500).json({ error: error.message });
    }
};

const bcrypt = require('bcryptjs');

const createMuzakki = async (req, res) => {
    const { name, email, password, address, phone, job, institution, nik } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const result = await prisma.$transaction(async (tx) => {
            const newUser = await tx.user.create({
                data: {
                    name,
                    email,
                    username: email,
                    password: hashedPassword,
                    role: 'muzakki',
                    isActive: true
                }
            });

            const newMuzakki = await tx.muzakki.create({
                data: {
                    name,
                    address: address || '',
                    phone: phone || '',
                    job: job || '',
                    institution: institution || '',
                    nik: nik?.trim() || null,
                    userId: newUser.id
                }
            });

            return newMuzakki;
        });
        res.status(201).json(result);
    } catch (error) {
        console.error('createMuzakki error:', error);
        res.status(500).json({ error: error.message });
    }
};

const updateMuzakki = async (req, res) => {
    const { id } = req.params;
    const { name, address, phone, job, institution, nik, email, password } = req.body;
    try {
        const muzakki = await prisma.muzakki.findUnique({
            where: { id: id }
        });

        if (!muzakki) {
            return res.status(404).json({ error: 'Muzakki not found' });
        }

        const updatedMuzakki = await prisma.$transaction(async (tx) => {
            const m = await tx.muzakki.update({
                where: { id: id },
                data: { 
                    name, 
                    address: address || '', 
                    phone: phone || '', 
                    job: job || '', 
                    institution: institution || '', 
                    nik: nik?.trim() || null 
                }
            });

            if (muzakki.userId) {
                const userUpdateData = { name };
                if (email) {
                    userUpdateData.email = email;
                    userUpdateData.username = email;
                }
                if (password) {
                    userUpdateData.password = await bcrypt.hash(password, 10);
                }
                await tx.user.update({
                    where: { id: muzakki.userId },
                    data: userUpdateData
                });
            }
            return m;
        });

        res.json(updatedMuzakki);
    } catch (error) {
        console.error('updateMuzakki error:', error);
        res.status(500).json({ error: error.message });
    }
};

const deleteMuzakki = async (req, res) => {
    const { id } = req.params;
    try {
        const muzakki = await prisma.muzakki.findUnique({ where: { id } });
        if (muzakki) {
            await prisma.$transaction(async (tx) => {
                await tx.donation.deleteMany({ where: { muzakkiId: id } });
                await tx.muzakki.delete({ where: { id: id } });
                if (muzakki.userId) {
                    await tx.user.delete({ where: { id: muzakki.userId } });
                }
            });
        }
        res.sendStatus(204);
    } catch (error) {
        console.error('deleteMuzakki error:', error);
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getMuzakkis,
    createMuzakki,
    updateMuzakki,
    deleteMuzakki,
    createDonation,
    getMuzakkiDashboard
};
