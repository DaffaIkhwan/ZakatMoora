
const prisma = require('../prisma');

const getCriteria = async (req, res) => {
    try {
        const criteriaList = await prisma.criterion.findMany({
            include: {
                subCriteria: true
            },
            orderBy: { code: 'asc' }
        });

        const formatted = criteriaList.map(c => {
            const aspectMap = new Map();

            c.subCriteria.forEach(sc => {
                if (!aspectMap.has(sc.aspect)) {
                    aspectMap.set(sc.aspect, {
                        code: sc.aspect,
                        name: sc.name,
                        options: []
                    });
                }
                aspectMap.get(sc.aspect).options.push({
                    label: sc.label,
                    value: sc.value
                });
            });

            const aspects = Array.from(aspectMap.values()).sort((a, b) => a.code.localeCompare(b.code));
            aspects.forEach(a => a.options.sort((o1, o2) => o1.value - o2.value));

            return {
                id: c.id,
                code: c.code,
                name: c.name,
                weight: c.weight,
                type: c.type, // Ensure type is returned
                icon: c.icon,
                color: c.color,
                description: c.description,
                aspects: aspects
            };
        });

        res.json(formatted);
    } catch (error) {
        console.error('getCriteria error:', error);
        res.status(500).json({ error: error.message });
    }
};

const updateCriteria = async (req, res) => {
    const list = req.body;
    if (!Array.isArray(list)) {
        return res.status(400).json({ error: 'Invalid data format. Expected array of criteria.' });
    }

    try {
        // Use transaction to ensure atomicity
        const results = await prisma.$transaction(
            list.map(c =>
                prisma.criterion.update({
                    where: { code: c.code },
                    data: {
                        name: c.name,
                        weight: parseFloat(c.weight), // Ensure float
                        type: c.type, // Update Type Cost/Benefit
                        icon: c.icon,
                        color: c.color,
                        description: c.description
                        // Note: Not updating Aspects deeply to avoid complexity with existing scores. Assuming minimal changes.
                    }
                })
            )
        );

        res.json({ success: true, count: results.length });
    } catch (error) {
        console.error('Update Criteria Error:', error);
        res.status(500).json({ error: 'Failed to update criteria: ' + error.message });
    }
};

module.exports = { getCriteria, updateCriteria };
