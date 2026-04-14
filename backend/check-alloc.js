const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function main() {
    const allocs = await p.donation.findMany({ where: { isAllocation: true } });
    console.log('Allocation donations:', allocs.length);
    allocs.forEach(x => console.log('  programId:', x.programId, 'amount:', Number(x.amount)));

    const progs = await p.aidProgram.findMany({ select: { id: true, name: true } });
    console.log('Programs:', progs);

    const allDonations = await p.donation.findMany({ where: { programId: { not: null } } });
    console.log('All donations with programId:', allDonations.length);
    allDonations.forEach(x => console.log('  programId:', x.programId, 'amount:', Number(x.amount), 'isAlloc:', x.isAllocation, 'status:', x.status));

    await p.$disconnect();
}
main();
