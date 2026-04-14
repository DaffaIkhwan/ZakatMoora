import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function dumpData() {
    try {
        const users = await prisma.user.findMany();
        const mustahik = await prisma.mustahik.findMany({ include: { criteriaScores: { include: { subCriterion: true } } } });
        const programs = await prisma.aidProgram.findMany();
        const criteria = await prisma.criterion.findMany({ include: { subCriteria: true } });
        const history = await prisma.recipientHistory.findMany({ include: { mustahik: true, program: true } });
        const monitoring = await prisma.monitoringData.findMany({ include: { mustahik: true, program: true } });

        const data = {
            users,
            mustahik,
            programs,
            criteria,
            history,
            monitoring
        };

        const targetPath = path.join(process.cwd(), 'mockup-version', 'src', 'services', 'db-dump.ts');

        // Convert Decimal and Date to something JSON friendly
        const serializedData = JSON.parse(JSON.stringify(data));

        const fileContent = `export const MOCK_DB = ${JSON.stringify(serializedData, null, 2)};`;

        fs.writeFileSync(targetPath, fileContent);
        console.log('Data dumped successfully to ' + targetPath);
    } catch (error) {
        console.error('Error dumping data:', error);
    } finally {
        await prisma.$disconnect();
    }
}

dumpData();
