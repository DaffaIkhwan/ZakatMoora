require('dotenv').config();
const prisma = require('./src/prisma');
async function test() {
    try {
        console.log('Testing Mustahik Status Breakdown...');
        const statuses = ['belum_usaha', 'rintisan', 'berkembang', 'maju'];
        for (const s of statuses) {
            const count = await prisma.mustahik.count({ where: { businessStatus: s } });
            console.log(`${s}: ${count}`);
        }

        console.log('Testing AidProgram...');
        const p = await prisma.aidProgram.findMany({ take: 1 });
        console.log('AidProgram OK:', p.length);

        console.log('Testing RecipientHistory...');
        const h = await prisma.recipientHistory.findMany({ take: 1 });
        console.log('History OK:', h.length);
    } catch (e) {
        console.error('TEST FAILED:', e);
    } finally {
        await prisma.$disconnect();
    }
}
test();
