import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('Clearing old monitoring data...');
  await prisma.monitoringData.deleteMany();

  // Find users who have RiwayatMenerima
  const recipients = await prisma.recipientHistory.findMany({
    take: 3,
    include: { mustahik: true, program: true }
  });

  if (recipients.length < 3) {
    console.error('Not enough recipients found. Please ensure at least 3 mustahiks have received programs.');
    process.exit(1);
  }

  console.log(`Seeding Monitoring Data for 3 Mustahiks...`);

  // Mustahik 1: Ekonomi Membaik
  await prisma.monitoringData.create({
    data: {
      mustahikId: recipients[0].mustahikId,
      programId: recipients[0].programId,
      monitoringDate: new Date(),
        surveyor: 'Sistem',
      businessProgress: {
        revenue: 2500000,
        profit: 1000000,
        businessStatus: "Ekonomi Membaik",
        businessType: "Perdagangan"
      },
      socialEconomicCondition: {
        monthlyExpenditure: 1500000,
        healthStatus: "Sehat"
      },
      notes: 'Usaha berkembang pesat, pendapatan melebihi konsumsi.',
        pendapatanBulanan: 2500000,
        kebutuhanPokokBulanan: 1500000
    }
  });

  // Mustahik 2: Stagnan
  await prisma.monitoringData.create({
    data: {
      mustahikId: recipients[1].mustahikId,
      programId: recipients[1].programId,
      monitoringDate: new Date(),
        surveyor: 'Sistem',
      businessProgress: {
        revenue: 2000000,
        profit: 500000,
        businessStatus: "Stagnan",
        businessType: "Jasa"
      },
      socialEconomicCondition: {
        monthlyExpenditure: 2000000,
        healthStatus: "Sehat"
      },
      notes: 'Pendapatan dan pengeluaran seimbang, tidak ada pertumbuhan signifikan.',
        pendapatanBulanan: 2000000,
        kebutuhanPokokBulanan: 2000000
    }
  });

  // Mustahik 3: Memburuk
  await prisma.monitoringData.create({
    data: {
      mustahikId: recipients[2].mustahikId,
      programId: recipients[2].programId,
      monitoringDate: new Date(),
        surveyor: 'Sistem',
      businessProgress: {
        revenue: 1000000,
        profit: 100000,
        businessStatus: "Memburuk",
        businessType: "Produksi"
      },
      socialEconomicCondition: {
        monthlyExpenditure: 2000000,
        healthStatus: "Biasa"
      },
      notes: 'Pengeluaran esensial lebih besar dari pendapatan usaha bulanan terakhir.',
        pendapatanBulanan: 1000000,
        kebutuhanPokokBulanan: 2000000
    }
  });

  console.log('Seeding successful. Inserted 3 Monitoring records.');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
