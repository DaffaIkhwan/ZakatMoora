const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Generating NIKs for existing Mustahik...');
    const mustahiks = await prisma.mustahik.findMany({
        where: { nik: null }
    });

    for (const m of mustahiks) {
        const nik = `3201${Math.floor(100000000000 + Math.random() * 900000000000)}`;
        await prisma.mustahik.update({
            where: { id: m.id },
            data: { nik }
        });
        console.log(`Updated Mustahik ${m.name} with NIK ${nik}`);
    }

    console.log('Generating NIKs for existing Muzakki...');
    const muzakkis = await prisma.muzakki.findMany({
        where: { nik: null }
    });

    for (const mz of muzakkis) {
        const nik = `3201${Math.floor(100000000000 + Math.random() * 900000000000)}`;
        await prisma.muzakki.update({
            where: { id: mz.id },
            data: { nik }
        });
        console.log(`Updated Muzakki ${mz.name} with NIK ${nik}`);
    }

    console.log('Finished updating NIKs.');
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
