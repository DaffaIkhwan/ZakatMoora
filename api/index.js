const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// ── Prisma Client Initialization ─────────────────────────────
const prisma = global.prisma || new PrismaClient({
    datasources: {
        db: {
            // Kita gunakan DATABASE_URL mentah tanpa modifikasi string agar tidak error
            url: process.env.DATABASE_URL
        }
    }
});
if (process.env.NODE_ENV !== 'production') global.prisma = prisma;

const secret = process.env.JWT_SECRET || 'supersecretkey123';

// ── Middleware ───────────────────────────────────────────────
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.sendStatus(401);
    jwt.verify(token, secret, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

const authorizeRole = (roles) => (req, res, next) => {
    if (!roles.includes(req.user.role)) return res.sendStatus(403);
    next();
};

// ── Login Handler (With Recovery Mode) ───────────────────────
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await prisma.user.findFirst({
            where: { OR: [{ email: email }, { username: email }] },
        });

        if (!user) {
            // RECOVERY MODE: Jika user tidak ada di DB, izinkan admin default
            if ((email === 'admin' || email === 'super_admin') && password === 'password123') {
                const mockUser = { id: 'mock-admin', username: 'admin', name: 'Super Admin (Recovery)', role: 'super_admin' };
                const token = jwt.sign(mockUser, secret, { expiresIn: '24h' });
                return res.json({ token, user: mockUser });
            }
            return res.status(401).json({ error: 'User not found' });
        }

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) return res.status(401).json({ error: 'Invalid password' });
        if (!user.isActive) return res.status(403).json({ error: 'Account is inactive' });

        const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, secret, { expiresIn: '24h' });
        const { password: _, ...userWithoutPassword } = user;
        res.json({ token, user: userWithoutPassword });
    } catch (error) {
        // RECOVERY MODE: Jika Database Error (Misal: Too many connections)
        if ((email === 'admin' || email === 'super_admin') && password === 'password123') {
            const mockUser = { id: 'mock-admin', username: 'admin', name: 'Super Admin (Recovery)', role: 'super_admin' };
            const token = jwt.sign(mockUser, secret, { expiresIn: '24h' });
            return res.json({ token, user: mockUser });
        }
        res.status(500).json({ error: error.message });
    }
});

// ── Other Handlers ───────────────────────────────────────────
app.get('/api/users', authenticateToken, authorizeRole(['super_admin', 'manajer']), async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            orderBy: { createdAt: 'desc' },
            select: { id: true, username: true, name: true, email: true, role: true, isActive: true, createdAt: true }
        });
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/mustahik', authenticateToken, async (req, res) => {
    try {
        const { user } = req;
        let where = {};
        if (user && user.role === 'mustahik') where = { userId: user.id };
        const mustahikList = await prisma.mustahik.findMany({
            where,
            include: { criteriaScores: { include: { subCriterion: true } } },
            orderBy: { registeredDate: 'desc' }
        });
        res.json(mustahikList.map(m => {
            const subCriteria = {};
            m.criteriaScores.forEach(cs => { if (cs.subCriterion) subCriteria[cs.subCriterion.aspect] = cs.subCriterion.value; });
            return { ...m, subCriteria };
        }));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/criteria', authenticateToken, async (req, res) => {
    try {
        const criteriaList = await prisma.criterion.findMany({ include: { subCriteria: true }, orderBy: { code: 'asc' } });
        res.json(criteriaList.map(c => {
            const aspectMap = new Map();
            c.subCriteria.forEach(sc => {
                if (!aspectMap.has(sc.aspect)) aspectMap.set(sc.aspect, { code: sc.aspect, name: sc.name, options: [] });
                aspectMap.get(sc.aspect).options.push({ label: sc.label, value: sc.value });
            });
            return { ...c, aspects: Array.from(aspectMap.values()) };
        }));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/programs', authenticateToken, async (req, res) => {
    try {
        const programs = await prisma.aidProgram.findMany({ orderBy: { createdAt: 'desc' } });
        res.json(programs.map(p => ({ ...p, totalBudget: Number(p.totalBudget), budgetPerRecipient: Number(p.budgetPerRecipient) })));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

module.exports = app;
