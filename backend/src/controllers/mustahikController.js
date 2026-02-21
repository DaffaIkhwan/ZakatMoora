const prisma = require('../prisma');

const getMustahik = async (req, res) => {
    try {
        const { user } = req;
        let where = {};

        // If user is Mustahik, restrict to their own data
        if (user && user.role === 'mustahik') {
            where = { userId: user.id };
        }

        const mustahikList = await prisma.mustahik.findMany({
            where,
            include: {
                criteriaScores: {
                    include: {
                        subCriterion: true
                    }
                }
            },
            orderBy: { registeredDate: 'desc' }
        });

        const mapped = mustahikList.map(m => {
            const criteria = {};
            const subCriteria = {};

            m.criteriaScores.forEach(cs => {
                if (cs.subCriterion) {
                    subCriteria[cs.subCriterion.aspect] = cs.subCriterion.value;
                }
            });

            return {
                ...m,
                // id: m.id, // Included in spread
                criteria: criteria,
                subCriteria: subCriteria
            };
        });

        res.json(mapped);
    } catch (error) {
        console.error('getMustahik error:', error);

        // Mock Data Disabled to ensure Real Data usage
        console.error('CRITICAL: Database Query Failed. Returning 500.');
        res.status(500).json({ error: error.message });

        /*
        // RECOVERY: Mock Mustahik Data
        console.log('RECOVERY MODE: Returning mock Mustahik data');
        const mockMustahik = [
            // ... (mock data hidden)
        ];
        res.json(mockMustahik);
        // res.status(500).json({ error: error.message });
        */
    }
};

const createMustahik = async (req, res) => {
    const { name, address, phone, subCriteria, businessStatus, nik } = req.body;

    const finalNik = nik || `3201${Date.now()}`;

    try {
        const scoresToCreate = [];

        if (subCriteria) {
            for (const [aspect, value] of Object.entries(subCriteria)) {
                const subCrit = await prisma.subCriterion.findFirst({
                    where: {
                        aspect: aspect,
                        value: Number(value)
                    }
                });

                if (subCrit) {
                    scoresToCreate.push({
                        subCriterionId: subCrit.id
                    });
                }
            }
        }

        const newMustahik = await prisma.mustahik.create({
            data: {
                id: finalNik,
                name,
                address,
                phone,
                businessStatus: businessStatus || 'belum_usaha',
                registeredDate: new Date(),
                criteriaScores: {
                    create: scoresToCreate
                }
            },
            include: {
                criteriaScores: { include: { subCriterion: true } }
            }
        });

        const respSubCriteria = {};
        newMustahik.criteriaScores.forEach(cs => {
            respSubCriteria[cs.subCriterion.aspect] = cs.subCriterion.value;
        });

        res.json({ ...newMustahik, subCriteria: respSubCriteria });
    } catch (error) {
        console.error('createMustahik error:', error);
        res.status(500).json({ error: error.message });
    }
};

const updateMustahik = async (req, res) => {
    const { id } = req.params;
    const { name, address, phone, subCriteria, businessStatus, nik } = req.body;

    try {
        console.log('updateMustahik - ID:', id);
        console.log('updateMustahik - Request body:', JSON.stringify({ name, address, phone, businessStatus, nik, subCriteria }, null, 2));

        // Handle subCriteria updates
        if (subCriteria) {
            console.log('Deleting existing scores for mustahikId:', id);
            await prisma.mustahikScore.deleteMany({
                where: { mustahikId: id }
            });

            const scoresToCreate = [];
            console.log('Processing subCriteria entries:', Object.keys(subCriteria).length);

            for (const [aspect, value] of Object.entries(subCriteria)) {
                const numValue = Number(value);
                console.log(`Looking for subCriterion: aspect=${aspect}, value=${numValue}`);

                const subCrit = await prisma.subCriterion.findFirst({
                    where: {
                        aspect: aspect,
                        value: numValue
                    }
                });

                if (subCrit) {
                    console.log(`Found subCriterion: id=${subCrit.id}, aspect=${subCrit.aspect}, value=${subCrit.value}`);
                    scoresToCreate.push({
                        subCriterionId: subCrit.id
                    });
                } else {
                    console.warn(`*** WARNING: No subCriterion found for aspect=${aspect}, value=${numValue}`);
                    // Try to find any subCriterion with this aspect to see what values exist
                    const allForAspect = await prisma.subCriterion.findMany({
                        where: { aspect: aspect },
                        select: { value: true, label: true }
                    });
                    console.warn(`Available values for aspect ${aspect}:`, allForAspect);
                }
            }

            console.log(`Creating ${scoresToCreate.length} scores`);
            if (scoresToCreate.length > 0) {
                await prisma.mustahikScore.createMany({
                    data: scoresToCreate.map(s => ({ ...s, mustahikId: id }))
                });
                console.log('Scores created successfully');
            }
        }

        // Update mustahik record
        console.log('Updating mustahik record with nik:', id);
        const updatedMustahik = await prisma.mustahik.update({
            where: { id: id },
            data: {
                name,
                address,
                phone,
                businessStatus: businessStatus || 'belum_usaha',
                ...(nik && nik !== id ? { id: nik } : {})
            },
            include: {
                criteriaScores: { include: { subCriterion: true } }
            }
        });

        console.log('Mustahik updated successfully, building response');
        const respSubCriteria = {};
        updatedMustahik.criteriaScores.forEach(cs => {
            respSubCriteria[cs.subCriterion.aspect] = cs.subCriterion.value;
        });

        console.log('Update complete, returning response');
        res.json({ ...updatedMustahik, subCriteria: respSubCriteria });
    } catch (error) {
        console.error('updateMustahik error:', error);
        console.error('Error stack:', error.stack);
        if (error.code === 'P2025') {
            return res.status(404).json({ error: 'Mustahik not found' });
        }
        res.status(500).json({ error: error.message });
    }
};

const deleteMustahik = async (req, res) => {
    const { id } = req.params;
    try {
        await prisma.mustahik.delete({
            where: { id: id }
        });
        res.sendStatus(204);
    } catch (error) {
        console.error('deleteMustahik error:', error);
        res.status(500).json({ error: error.message });
    }
};

module.exports = { getMustahik, createMustahik, updateMustahik, deleteMustahik };
