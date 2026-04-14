const prisma = require('../prisma');

const getMonitoring = async (req, res) => {
    try {
        const { user } = req;
        let where = {};

        // If user is Mustahik, restrict to their own data
        if (user && user.role === 'mustahik') {
            const mustahikRecord = await prisma.mustahik.findUnique({
                where: { userId: user.id }
            });

            if (!mustahikRecord) {
                // If no linked mustahik record found, return empty
                return res.json([]);
            }
            where = { mustahikId: mustahikRecord.id };
        }

        const monitoring = await prisma.monitoringData.findMany({
            where,
            include: {
                mustahik: { select: { name: true } },
                program: { select: { name: true } }
            },
            orderBy: { monitoringDate: 'desc' }
        });

        const mapped = monitoring.map(d => ({
            id: d.id,
            mustahikId: d.mustahikId,
            programId: d.programId,
            monitoringDate: d.monitoringDate,
            businessProgress: d.businessProgress, // JSON object via Prisma
            socialEconomicCondition: d.socialEconomicCondition, // JSON object via Prisma
            challenges: d.challenges,
            achievements: d.achievements,
            surveyor: d.surveyor,
            notes: d.notes,
            pendapatanBulanan: d.pendapatanBulanan,
            kebutuhanPokokBulanan: d.kebutuhanPokokBulanan,
            hutangBaru: d.hutangBaru,
            tabunganBaru: d.tabunganBaru,
            statusKesejahteraan: d.statusKesejahteraan,            
            mustahikName: d.mustahik?.name,
            programName: d.program?.name
        }));
        res.json(mapped);
    } catch (error) {
        console.error('getMonitoring error:', error);
        res.status(500).json({ error: error.message });
    }
};

const createMonitoring = async (req, res) => {
    const { mustahikId, programId, monitoringDate, businessProgress, socialEconomicCondition, challenges, achievements, nextPlan, surveyor, notes, pendapatanBulanan, kebutuhanPokokBulanan, hutangBaru, tabunganBaru } = req.body;
    
    // CIBEST & IKB MONEV Logic
    let statusKesejahteraan = 'Menurun';
    const rasio = (pendapatanBulanan && kebutuhanPokokBulanan) ? (parseFloat(pendapatanBulanan) / parseFloat(kebutuhanPokokBulanan)) : 0;
    
    if (rasio < 1.0 || hutangBaru) {
        statusKesejahteraan = 'Menurun';
    } else if (rasio >= 1.0 && !hutangBaru && !tabunganBaru) {
        statusKesejahteraan = 'Stabil';
    } else if (rasio >= 1.0 && !hutangBaru && tabunganBaru) {
        statusKesejahteraan = 'Berkembang';
    }
    try {
        const newData = await prisma.monitoringData.create({
            data: {
                mustahikId,
                programId,
                monitoringDate: new Date(monitoringDate),
                businessProgress: businessProgress || {},
                socialEconomicCondition: socialEconomicCondition || {},
                challenges,
                achievements,
                nextPlan,
                surveyor,
                notes,
                pendapatanBulanan: pendapatanBulanan ? parseFloat(pendapatanBulanan) : null,
                kebutuhanPokokBulanan: kebutuhanPokokBulanan ? parseFloat(kebutuhanPokokBulanan) : null,
                hutangBaru: hutangBaru || false,
                tabunganBaru: tabunganBaru || false,
                statusKesejahteraan
            },
            include: {
                mustahik: { select: { name: true } },
                program: { select: { name: true } }
            }
        });

        res.json({
            id: newData.id,
            mustahikId: newData.mustahikId,
            programId: newData.programId,
            monitoringDate: newData.monitoringDate,
            businessProgress: newData.businessProgress,
            socialEconomicCondition: newData.socialEconomicCondition,
            challenges: newData.challenges,
            achievements: newData.achievements,
            nextPlan: newData.nextPlan,
            surveyor: newData.surveyor,
            notes: newData.notes,
            pendapatanBulanan: newData.pendapatanBulanan,
            kebutuhanPokokBulanan: newData.kebutuhanPokokBulanan,
            hutangBaru: newData.hutangBaru,
            tabunganBaru: newData.tabunganBaru,
            statusKesejahteraan: newData.statusKesejahteraan,            
            mustahikName: newData.mustahik?.name,
            programName: newData.program?.name
        });
    } catch (error) {
        console.error('createMonitoring error:', error);
        res.status(500).json({ error: error.message });
    }
};

module.exports = { getMonitoring, createMonitoring };
