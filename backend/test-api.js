require('dotenv').config();
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testApi() {
  const mustahik = await prisma.mustahik.findFirst();
  const program = await prisma.aidProgram.findFirst();

  if (!mustahik || !program) {
      console.log('No mustahik or program');
      return;
  }

  const token = jwt.sign({ id: '123', role: 'manajer', username: 'admin' }, process.env.JWT_SECRET || 'secret123');

  const data = {
    mustahikId: mustahik.id,
    programId: program.id,
    monitoringDate: "2026-04-01T00:00:00.000Z",
    businessProgress: { revenue: 0, profit: 0, businessStatus: "stabil", businessType: "Perdagangan", employeeCount: 0 },
    socialEconomicCondition: { monthlyIncome: 3000000, monthlyExpenditure: 2000000, housingCondition: "sedang", dependentCount: 0, healthCondition: "sehat", educationLevel: "tetap" },
    challenges: "test",
    achievements: "test",
    nextPlan: "test",
    notes: "test",
    pendapatanBulanan: 3000000,
    kebutuhanPokokBulanan: 2000000,
    sholat5Waktu: 5,
    puasaRamadhan: 5,
    zakatInfaq: 5,
    lingkunganKeluarga: 5,
    kebijakanPemerintah: 5
  };

  try {
    const res = await fetch('http://localhost:5000/api/monitoring', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });
    const text = await res.text();
    console.log('HTTP Status:', res.status);
    console.log('Response Body:', text);
  } catch (err) {
    console.error('Fetch error:', err);
  } finally {
    await prisma.$disconnect();
    process.exit(0);
  }
}

testApi();
