const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function cleanEmails() {
    console.log('Starting email cleanup migration...');

    try {
        const users = await prisma.user.findMany({
            where: { role: 'mustahik' },
            include: { mustahik: true }
        });

        const hashedPassword = await bcrypt.hash('password123', 10);
        let updatedCount = 0;

        for (const user of users) {
            // Fallback to user.name if mustahik relation is missing (shouldn't happen based on previous steps but good to be safe)
            const nameSource = user.mustahik ? user.mustahik.name : user.name;

            // CLEANER LOGIC:
            // 1. Lowercase
            // 2. Replace non-alphanumeric chars with space
            // 3. Trim whitespace
            // 4. Replace consecutive spaces with single underscore
            let cleanName = nameSource.toLowerCase()
                .replace(/[^a-z0-9]/g, ' ')
                .trim()
                .replace(/\s+/g, '_');

            let email = `${cleanName}@gmail.com`;
            let username = email;

            // Check if this new email is different from current email
            // (We also need to check for uniqueness against OTHER users)

            if (email === user.email) {
                console.log(`Skipping ${user.name}, email already clean: ${email}`);
                continue;
            }

            // Uniqueness check
            let suffix = 0;
            let finalEmail = email;

            const isEmailTaken = async (e, currentUserId) => {
                const existing = await prisma.user.findFirst({
                    where: {
                        OR: [{ email: e }, { username: e }],
                        NOT: { id: currentUserId }
                    }
                });
                return !!existing;
            };

            while (await isEmailTaken(finalEmail, user.id)) {
                suffix++;
                finalEmail = `${cleanName}_${suffix}@gmail.com`;
            }

            if (finalEmail !== user.email) {
                console.log(`Updating ${user.name}: ${user.email} -> ${finalEmail}`);

                await prisma.user.update({
                    where: { id: user.id },
                    data: {
                        email: finalEmail,
                        username: finalEmail,
                        password: hashedPassword // Re-ensure password is correct
                    }
                });
                updatedCount++;
            }
        }

        console.log(`Cleanup complete. Updated ${updatedCount} users.`);

    } catch (error) {
        console.error('Error during cleanup:', error);
    } finally {
        await prisma.$disconnect();
    }
}

cleanEmails();
