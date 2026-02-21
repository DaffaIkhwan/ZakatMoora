const { Client } = require('pg');
const bcrypt = require('bcrypt');
require('dotenv').config();

// Ensure we handle SSL correctly
// Usually filess.io needs rejectUnauthorized: false
const sslConfig = { rejectUnauthorized: false };
const connectionString = process.env.DATABASE_URL;

const ddl = `
-- Enums (using DO block to avoid errors if they exist)
DO $$ BEGIN CREATE TYPE "UserRole" AS ENUM ('super_admin', 'manajer', 'surveyor', 'mustahik'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE "BusinessStatus" AS ENUM ('belum_usaha', 'berkembang', 'stabil', 'menurun', 'tutup'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE "ProgramStatus" AS ENUM ('draft', 'active', 'completed'); EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Tables
CREATE TABLE IF NOT EXISTS "User" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "User_username_key" ON "User"("username");

CREATE TABLE IF NOT EXISTS "Mustahik" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "c1" INTEGER NOT NULL,
    "c2" INTEGER NOT NULL,
    "c3" INTEGER NOT NULL,
    "c4" INTEGER NOT NULL,
    "c5" INTEGER NOT NULL,
    "c6" INTEGER NOT NULL,
    "c7" INTEGER NOT NULL,
    "businessStatus" "BusinessStatus" NOT NULL DEFAULT 'belum_usaha',
    "registeredDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Mustahik_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "AidProgram" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "totalBudget" DECIMAL(65,30) NOT NULL,
    "budgetPerRecipient" DECIMAL(65,30) NOT NULL,
    "quota" INTEGER NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "status" "ProgramStatus" NOT NULL DEFAULT 'draft',
    "selectedCandidates" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AidProgram_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "RecipientHistory" (
    "id" TEXT NOT NULL,
    "mustahikId" TEXT NOT NULL,
    "programId" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "receivedDate" TIMESTAMP(3) NOT NULL,
    "mooraScore" DOUBLE PRECISION NOT NULL,
    "rank" INTEGER NOT NULL,
    "notes" TEXT,
    CONSTRAINT "RecipientHistory_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "MonitoringData" (
    "id" TEXT NOT NULL,
    "mustahikId" TEXT NOT NULL,
    "programId" TEXT NOT NULL,
    "monitoringDate" TIMESTAMP(3) NOT NULL,
    "businessProgress" JSONB NOT NULL,
    "socialEconomicCondition" JSONB NOT NULL,
    "challenges" TEXT NOT NULL,
    "achievements" TEXT NOT NULL,
    "nextPlan" TEXT NOT NULL,
    "surveyor" TEXT NOT NULL,
    "notes" TEXT NOT NULL,
    CONSTRAINT "MonitoringData_pkey" PRIMARY KEY ("id")
);

-- Foreign Key Checks/Additions
DO $$ BEGIN ALTER TABLE "RecipientHistory" ADD CONSTRAINT "RecipientHistory_mustahikId_fkey" FOREIGN KEY ("mustahikId") REFERENCES "Mustahik"("id") ON DELETE RESTRICT ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN ALTER TABLE "RecipientHistory" ADD CONSTRAINT "RecipientHistory_programId_fkey" FOREIGN KEY ("programId") REFERENCES "AidProgram"("id") ON DELETE RESTRICT ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN ALTER TABLE "MonitoringData" ADD CONSTRAINT "MonitoringData_mustahikId_fkey" FOREIGN KEY ("mustahikId") REFERENCES "Mustahik"("id") ON DELETE RESTRICT ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN ALTER TABLE "MonitoringData" ADD CONSTRAINT "MonitoringData_programId_fkey" FOREIGN KEY ("programId") REFERENCES "AidProgram"("id") ON DELETE RESTRICT ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN null; END $$;
`;

const INITIAL_USERS = [
    { username: 'admin', password: 'admin123', name: 'Super Administrator', email: 'admin@lazswadayaummah.org', role: 'super_admin' },
    { username: 'manajer', password: 'manajer123', name: 'Ahmad Hidayat', email: 'manajer@lazswadayaummah.org', role: 'manajer' },
    { username: 'surveyor', password: 'surveyor123', name: 'Siti Rahmawati', email: 'surveyor@lazswadayaummah.org', role: 'surveyor' },
    { username: 'mustahik', password: 'mustahik123', name: 'Budi Santoso', email: 'budi@example.com', role: 'mustahik' }
];

const INITIAL_MUSTAHIK = [
    { name: 'Ahmad Fauzi', address: 'Jl. Mawar No. 12, RT 03/RW 05, Kelurahan Sukamaju, Kecamatan Ciputat', phone: '081234567890', criteria: { C1: 4, C2: 6, C3: 6, C4: 9, C5: 16, C6: 12, C7: 4 }, businessStatus: 'belum_usaha' },
    { name: 'Siti Nurhaliza', address: 'Jl. Anggrek No. 45, RT 02/RW 03, Kelurahan Pamulang, Kecamatan Pamulang', phone: '081298765432', criteria: { C1: 0, C2: 3, C3: 3, C4: 6, C5: 12, C6: 9, C7: 2 }, businessStatus: 'belum_usaha' },
    { name: 'Budi Santoso', address: 'Jl. Melati No. 78, RT 05/RW 02, Kelurahan Pondok Aren, Kecamatan Pondok Aren', phone: '081345678901', criteria: { C1: 1, C2: 9, C3: 9, C4: 3, C5: 20, C6: 6, C7: 6 }, businessStatus: 'belum_usaha' },
    { name: 'Fatimah Zahra', address: 'Jl. Kenanga No. 23, RT 01/RW 04, Kelurahan Serpong, Kecamatan Serpong', phone: '081456789012', criteria: { C1: 2, C2: 0, C3: 0, C4: 12, C5: 8, C6: 15, C7: 0 }, businessStatus: 'belum_usaha' },
    { name: 'Muhammad Rizki', address: 'Jl. Flamboyan No. 56, RT 04/RW 01, Kelurahan Bintaro, Kecamatan Pesanggrahan', phone: '081567890123', criteria: { C1: 3, C2: 12, C3: 12, C4: 15, C5: 4, C6: 3, C7: 9 }, businessStatus: 'belum_usaha' },
    { name: 'Aisyah Putri', address: 'Jl. Dahlia No. 89, RT 06/RW 06, Kelurahan Cilandak, Kecamatan Cilandak', phone: '081678901234', criteria: { C1: 4, C2: 3, C3: 6, C4: 6, C5: 12, C6: 9, C7: 2 }, businessStatus: 'belum_usaha' },
    { name: 'Yusuf Habibi', address: 'Jl. Cempaka No. 34, RT 02/RW 05, Kelurahan Lebak Bulus, Kecamatan Cilandak', phone: '081789012345', criteria: { C1: 1, C2: 6, C3: 3, C4: 9, C5: 16, C6: 12, C7: 4 }, businessStatus: 'belum_usaha' },
    { name: 'Khadijah Rahman', address: 'Jl. Teratai No. 67, RT 03/RW 02, Kelurahan Jagakarsa, Kecamatan Jagakarsa', phone: '081890123456', criteria: { C1: 0, C2: 9, C3: 9, C4: 3, C5: 20, C6: 6, C7: 6 }, businessStatus: 'belum_usaha' },
    { name: 'Abdul Malik', address: 'Jl. Bougenville No. 12, RT 05/RW 03, Kelurahan Lenteng Agung, Kecamatan Jagakarsa', phone: '081901234567', criteria: { C1: 2, C2: 0, C3: 0, C4: 12, C5: 8, C6: 15, C7: 0 }, businessStatus: 'belum_usaha' },
    { name: 'Maryam Amelia', address: 'Jl. Tulip No. 90, RT 01/RW 04, Kelurahan Cinere, Kecamatan Limo', phone: '082012345678', criteria: { C1: 3, C2: 12, C3: 12, C4: 15, C5: 4, C6: 3, C7: 9 }, businessStatus: 'belum_usaha' },
    { name: 'Umar Farouq', address: 'Jl. Sakura No. 45, RT 04/RW 01, Kelurahan Beji, Kecamatan Beji', phone: '082123456789', criteria: { C1: 4, C2: 6, C3: 6, C4: 9, C5: 12, C6: 9, C7: 2 }, businessStatus: 'belum_usaha' },
    { name: 'Zahra Aulia', address: 'Jl. Lavender No. 78, RT 02/RW 06, Kelurahan Tanah Baru, Kecamatan Beji', phone: '082234567890', criteria: { C1: 1, C2: 3, C3: 3, C4: 6, C5: 16, C6: 12, C7: 4 }, businessStatus: 'belum_usaha' },
    { name: 'Ibrahim Aziz', address: 'Jl. Orkid No. 23, RT 06/RW 05, Kelurahan Margonda, Kecamatan Pancoran Mas', phone: '082345678901', criteria: { C1: 0, C2: 9, C3: 9, C4: 3, C5: 20, C6: 6, C7: 6 }, businessStatus: 'belum_usaha' },
    { name: 'Hafshah Kamilah', address: 'Jl. Aster No. 56, RT 03/RW 02, Kelurahan Depok Jaya, Kecamatan Pancoran Mas', phone: '082456789012', criteria: { C1: 2, C2: 0, C3: 0, C4: 12, C5: 8, C6: 15, C7: 0 }, businessStatus: 'belum_usaha' },
    { name: 'Ali Akbar', address: 'Jl. Krisan No. 89, RT 05/RW 04, Kelurahan Kukusan, Kecamatan Beji', phone: '082567890123', criteria: { C1: 3, C2: 12, C3: 12, C4: 15, C5: 4, C6: 3, C7: 9 }, businessStatus: 'belum_usaha' },
];

async function initializeDatabase() {
    console.log('Initializing database connection...');
    const client = new Client({
        connectionString,
        ssl: sslConfig
    });

    try {
        await client.connect();
        console.log('Connected to database. Checking schema...');

        // Run DDL
        await client.query(ddl);
        console.log('Schema synchronized.');

        // Seed Users
        const { rows: existingUsers } = await client.query('SELECT count(*) FROM "User"');
        if (existingUsers[0].count === '0') {
            console.log('Seeding initial users...');
            for (const user of INITIAL_USERS) {
                const hashed = await bcrypt.hash(user.password, 10);
                await client.query(
                    'INSERT INTO "User" (id, username, password, name, email, role) VALUES ($1, $2, $3, $4, $5, $6)',
                    [require('crypto').randomUUID(), user.username, hashed, user.name, user.email, user.role]
                );
            }
        }

        // Seed Mustahik
        const { rows: existingMustahik } = await client.query('SELECT count(*) FROM "Mustahik"');
        if (existingMustahik[0].count === '0') {
            console.log('Seeding initial mustahik...');
            for (const m of INITIAL_MUSTAHIK) {
                const id = require('crypto').randomUUID();
                await client.query(
                    `INSERT INTO "Mustahik" (id, name, address, phone, c1, c2, c3, c4, c5, c6, c7, "businessStatus") 
                     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
                    [id, m.name, m.address, m.phone, m.criteria.C1, m.criteria.C2, m.criteria.C3, m.criteria.C4, m.criteria.C5, m.criteria.C6, m.criteria.C7, m.businessStatus]
                );
            }
        }

        console.log('Database initialization complete.');

    } catch (error) {
        console.error('Database initialization failed:', error);
    } finally {
        await client.end();
    }
}

module.exports = initializeDatabase;
