const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function showCleanEmails() {
    const users = await prisma.user.findMany({
        where: { role: 'mustahik' },
        select: { name: true, email: true }
    });

    console.log('--- USER CREDENTIALS ---');
    users.forEach(u => console.log(`${u.name}: ${u.email}`));
}

showCleanEmails();
