const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function main() {
    // Find all programs that don't have an allocation donation
    const programs = await p.aidProgram.findMany();
    
    for (const prog of programs) {
        const existingAlloc = await p.donation.findFirst({
            where: { programId: prog.id, isAllocation: true }
        });
        
        if (!existingAlloc) {
            // Find or create system muzakki
            let systemMuzakki = await p.muzakki.findFirst({ where: { name: 'SYSTEM_ALLOCATION' } });
            if (!systemMuzakki) {
                systemMuzakki = await p.muzakki.create({
                    data: { name: 'SYSTEM_ALLOCATION', address: 'System', phone: '-', nik: 'SYSTEM' }
                });
            }
            
            const amount = Number(prog.totalBudget);
            await p.donation.create({
                data: {
                    muzakkiId: systemMuzakki.id,
                    programId: prog.id,
                    amount: amount,
                    notes: `Alokasi dana otomatis untuk program ${prog.name}`,
                    paymentMethod: 'Alokasi Internal',
                    status: 'success',
                    isAllocation: true,
                    isAnonymous: false,
                    donationDate: prog.createdAt || new Date()
                }
            });
            console.log(`Created allocation for "${prog.name}": Rp ${amount.toLocaleString('id-ID')}`);
        } else {
            console.log(`"${prog.name}" already has allocation: Rp ${Number(existingAlloc.amount).toLocaleString('id-ID')}`);
        }
    }
    
    console.log('Done.');
    await p.$disconnect();
}
main();
