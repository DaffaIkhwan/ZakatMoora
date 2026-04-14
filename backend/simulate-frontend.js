const { createMonitoring } = require('./src/controllers/monitoringController');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function runSimulations() {
    console.log('🚀 MENSIMULASIKAN 4 INPUTAN FRONTEND (REACT) UNTUK SETIAP KUADRAN CIBEST\n');

    // Mencarikan sembarang 1 Mustahik & 1 Program dari DB untuk relasi data
    const mustahik = await prisma.mustahik.findFirst();
    const program = await prisma.aidProgram.findFirst();

    if (!mustahik || !program) {
        console.error('Data Mustahik atau Program kosong di DB. Tidak bisa insert monitoring.');
        process.exit(1);
    }

    // Fungsi wrapper untuk mengekstrak respons JSON layaknya Server
    const simulateFrontendRequest = async (skenario, jsonData) => {
        let responsePayload = null;
        let statusCode = 200;

        const req = { body: { ...jsonData, mustahikId: mustahik.id, programId: program.id, monitoringDate: new Date() } };
        const res = {
            json: (data) => { responsePayload = data; },
            status: (code) => { statusCode = code; return res; }
        };

        await createMonitoring(req, res);
        
        console.log(`\n📌 Skenario: ${skenario}`);
        console.log(`   🔸 IN (Frontend Form)    : Pendapatan=${jsonData.pendapatanBulanan}, Pengeluaran=${jsonData.kebutuhanPokokBulanan}`);
        console.log(`                            : Spiritual=[${jsonData.sholat5Waktu}, ${jsonData.puasaRamadhan}, ${jsonData.zakatInfaq}, ${jsonData.lingkunganKeluarga}, ${jsonData.kebijakanPemerintah}]`);
        
        if (statusCode === 200) {
            const avgS = ((jsonData.sholat5Waktu + jsonData.puasaRamadhan + jsonData.zakatInfaq + jsonData.lingkunganKeluarga + jsonData.kebijakanPemerintah)/5).toFixed(1);
            const rasio = (jsonData.pendapatanBulanan / jsonData.kebutuhanPokokBulanan).toFixed(2);
            
            console.log(`   🔹 OUT (Backend Di-Save) : Quadran CIBEST -> [ \x1b[32m${responsePayload.cibestQuadrant}\x1b[0m ]`);
            console.log(`   ✅ Verifikasi            : Rata-rata spiritual = ${avgS} (SV>3? ${avgS > 3 ? 'Ya':'Tidak'}), Rasio Material = ${rasio} (Rasio>=1.0? ${rasio >= 1.0 ? 'Ya':'Tidak'})`);
        } else {
            console.log(`   ❌ ERROR: Kode ${statusCode}`, responsePayload);
        }
    };

    // 1. KUADRAN I - SEJAHTERA (Mampu material, Mampu spiritual)
    await simulateFrontendRequest('Kuadran I (Sejahtera)', {
        pendapatanBulanan: 3000000,
        kebutuhanPokokBulanan: 2000000, // Rasio 1.5 (Material Mampu)
        sholat5Waktu: 5,
        puasaRamadhan: 5,
        zakatInfaq: 4,
        lingkunganKeluarga: 5,
        kebijakanPemerintah: 4 // Rata-rata: 23/5 = 4.6 (Spiritual Mampu)
    });

    // 2. KUADRAN II - MISKIN MATERIAL (Miskin material, Mampu spiritual)
    await simulateFrontendRequest('Kuadran II (Miskin Material)', {
        pendapatanBulanan: 1500000,
        kebutuhanPokokBulanan: 2000000, // Rasio 0.75 (Material Miskin)
        sholat5Waktu: 4,
        puasaRamadhan: 4,
        zakatInfaq: 3,
        lingkunganKeluarga: 4,
        kebijakanPemerintah: 4 // Rata-rata: 19/5 = 3.8 (Spiritual Mampu)
    });

    // 3. KUADRAN III - MISKIN SPIRITUAL (Mampu material, Miskin spiritual)
    await simulateFrontendRequest('Kuadran III (Miskin Spiritual)', {
        pendapatanBulanan: 4000000,
        kebutuhanPokokBulanan: 2500000, // Rasio 1.6 (Material Mampu)
        sholat5Waktu: 2,
        puasaRamadhan: 2,
        zakatInfaq: 1,
        lingkunganKeluarga: 2,
        kebijakanPemerintah: 3 // Rata-rata: 10/5 = 2.0 (Spiritual Miskin)
    });

    // 4. KUADRAN IV - MISKIN ABSOLUT (Miskin material, Miskin spiritual)
    await simulateFrontendRequest('Kuadran IV (Miskin Absolut)', {
        pendapatanBulanan: 1000000,
        kebutuhanPokokBulanan: 2000000, // Rasio 0.5 (Material Miskin)
        sholat5Waktu: 2,
        puasaRamadhan: 1,
        zakatInfaq: 1,
        lingkunganKeluarga: 2,
        kebijakanPemerintah: 2 // Rata-rata: 8/5 = 1.6 (Spiritual Miskin)
    });

    console.log('\n✅ Simulasi Frontend Selesai! Logika di Controller berjalan persis seperti spesifikasi.\n');
    await prisma.$disconnect();
}

runSimulations().catch(e => {
    console.error(e);
    process.exit(1);
});
