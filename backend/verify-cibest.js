const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const fs = require('fs');

async function verify() {
    const records = await prisma.monitoringData.findMany({
        select: {
            sholat5Waktu: true,
            puasaRamadhan: true,
            zakatInfaq: true,
            lingkunganKeluarga: true,
            kebijakanPemerintah: true,
            cibestQuadrant: true,
            pendapatanBulanan: true,
            kebutuhanPokokBulanan: true,
            mustahik: { select: { name: true } }
        },
        orderBy: { monitoringDate: 'desc' }
    });

    const lines = ['Total: ' + records.length, ''];
    for (const r of records) {
        const n = r.mustahik?.name || '?';
        const avg = ((r.sholat5Waktu + r.puasaRamadhan + r.zakatInfaq + r.lingkunganKeluarga + r.kebijakanPemerintah) / 5).toFixed(2);
        lines.push(n);
        lines.push('  Spiritual: S=' + r.sholat5Waktu + ' P=' + r.puasaRamadhan + ' Z=' + r.zakatInfaq + ' K=' + r.lingkunganKeluarga + ' G=' + r.kebijakanPemerintah + ' avg=' + avg);
        lines.push('  Quadrant: ' + r.cibestQuadrant);
        lines.push('');
    }
    fs.writeFileSync('verify-result.txt', lines.join('\n'), 'utf8');
    console.log('Written to verify-result.txt');
}

verify().catch(console.error).finally(() => prisma.$disconnect());
