const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkSri() {
    const users = await prisma.user.findMany({
        where: { name: { contains: 'Sri', mode: 'insensitive' } }
    });

    users.forEach(u => {
        console.log(`Name: '${u.name}'`);
        console.log(`Email: '${u.email}'`);
        console.log(`Username: '${u.username}'`);
        console.log('---');
    });
}

checkSri();
