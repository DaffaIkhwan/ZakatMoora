const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const fs = require('fs');

async function debug() {
    const users = await prisma.user.findMany({
        where: {
            OR: [
                { name: { contains: 'Sri', mode: 'insensitive' } },
                { email: { contains: 'sri', mode: 'insensitive' } }
            ]
        }
    });

    const mustahiks = await prisma.mustahik.findMany({
        where: {
            name: { contains: 'Sri', mode: 'insensitive' }
        }
    });

    const output = {
        users,
        mustahiks
    };

    fs.writeFileSync('debug-sri.json', JSON.stringify(output, null, 2));
}

debug()
    .catch(console.error)
    .finally(async () => await prisma.$disconnect());
