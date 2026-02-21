const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const app = express();

// CORS configuration
app.use(cors({
    origin: true,
    credentials: true
}));
app.use(express.json());

// ── Prisma Client Initialization ─────────────────────────────
// We use a singleton pattern to prevent multiple connections in serverless environment
const prisma = global.prisma || new PrismaClient({
    datasources: {
        db: {
            // Append connection pooling options for serverless stability
            url: process.env.DATABASE_URL ? (process.env.DATABASE_URL.includes('?') ? `${process.env.DATABASE_URL}&connection_limit=1` : `${process.env.DATABASE_URL}?connection_limit=1`) : undefined
        }
    }
});

if (process.env.NODE_ENV !== 'production') global.prisma = prisma;

// ── Shared Logic / Helpers ──────────────────────────────────
const secret = process.env.JWT_SECRET || 'supersecretkey123';

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

// ── Health Check ─────────────────────────────────────────────
app.get('/api/health', async (req, res) => {
    try {
        await prisma.$queryRaw`SELECT 1`;
        res.json({ status: 'ok', message: 'API and Database are connected' });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});

// ── Auth Handlers ────────────────────────────────────────────
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await prisma.user.findFirst({
            where: { OR: [{ email: email }, { username: email }] },
        });
        if (!user) return res.status(401).json({ error: 'User not found' });
        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) return res.status(401).json({ error: 'Invalid password' });
        if (!user.isActive) return res.status(403).json({ error: 'Account is inactive' });

        const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, secret, { expiresIn: '24h' });
        const { password: _, ...userWithoutPassword } = user;
        res.json({ token, user: userWithoutPassword });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ── User Handlers ────────────────────────────────────────────
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

// ── Mustahik Handlers ────────────────────────────────────────
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

        const mapped = mustahikList.map(m => {
            const subCriteria = {};
            m.criteriaScores.forEach(cs => {
                if (cs.subCriterion) subCriteria[cs.subCriterion.aspect] = cs.subCriterion.value;
            });
            return { ...m, subCriteria };
        });
        res.json(mapped);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ── Criteria Handlers ────────────────────────────────────────
app.get('/api/criteria', authenticateToken, async (req, res) => {
    try {
        const criteriaList = await prisma.criterion.findMany({
            include: { subCriteria: true },
            orderBy: { code: 'asc' }
        });

        const formatted = criteriaList.map(c => {
            const aspectMap = new Map();
            c.subCriteria.forEach(sc => {
                if (!aspectMap.has(sc.aspect)) {
                    aspectMap.set(sc.aspect, { code: sc.aspect, name: sc.name, options: [] });
                }
                aspectMap.get(sc.aspect).options.push({ label: sc.label, value: sc.value });
            });
            return { ...c, aspects: Array.from(aspectMap.values()) };
        });
        res.json(formatted);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ── Program Handlers ─────────────────────────────────────────
app.get('/api/programs', authenticateToken, async (req, res) => {
    try {
        const programs = await prisma.aidProgram.findMany({ orderBy: { createdAt: 'desc' } });
        res.json(programs.map(p => ({ ...p, totalBudget: Number(p.totalBudget), budgetPerRecipient: Number(p.budgetPerRecipient) })));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ── History & Monitoring Handlers (Simplified for production stability) ────
app.get('/api/history', authenticateToken, async (req, res) => {
    try {
        const history = await prisma.recipientHistory.findMany({
            include: { mustahik: { select: { name: true } }, program: { select: { name: true } } },
            orderBy: { receivedDate: 'desc' }
        });
        res.json(history.map(h => ({ ...h, amount: Number(h.amount), mustahikName: h.mustahik?.name, programName: h.program?.name })));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/monitoring', authenticateToken, async (req, res) => {
    try {
        const monitoring = await prisma.monitoringData.findMany({
            include: { mustahik: { select: { name: true } }, program: { select: { name: true } } },
            orderBy: { monitoringDate: 'desc' }
        });
        res.json(monitoring.map(d => ({ ...d, mustahikName: d.mustahik?.name, programName: d.program?.name })));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = app;
