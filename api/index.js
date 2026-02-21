const express = require('express');
const cors = require('cors');
const path = require('path');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Load .env
require('dotenv').config({ path: path.join(__dirname, '..', 'backend', '.env') });

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// ── Prisma Client (Singleton) ───────────────────────────────
const { PrismaClient } = require('@prisma/client');
const globalForPrisma = global;
const prisma = globalForPrisma.__prisma || new PrismaClient({
    datasources: { db: { url: process.env.DATABASE_URL } },
    log: ['error', 'warn'],
});
if (process.env.NODE_ENV !== 'production') globalForPrisma.__prisma = prisma;

// ── Middleware ───────────────────────────────────────────────
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.sendStatus(401);
    jwt.verify(token, process.env.JWT_SECRET || 'supersecretkey123', (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

const authorizeRole = (roles) => (req, res, next) => {
    if (!roles.includes(req.user.role)) return res.sendStatus(403);
    next();
};

// ── Import Controllers from Backend ────────────────────────
// Karena file controller aslimu menggunakan require('../prisma'), 
// kita perlu sedikit trik atau mendefinisikan logic di sini untuk reliabilitas.

// REUSE LOGIC FROM CONTROLLERS
const { login, register } = require('../backend/src/controllers/authController');
const { getUsers, createUser, updateUser, deleteUser } = require('../backend/src/controllers/userController');
const { getMustahik, createMustahik, updateMustahik, deleteMustahik } = require('../backend/src/controllers/mustahikController');
const { getCriteria, updateCriteria } = require('../backend/src/controllers/criteriaController');
const { getPrograms, createProgram, updateProgram, deleteProgram } = require('../backend/src/controllers/programController');
const { getHistory, createHistory } = require('../backend/src/controllers/historyController');
const { getMonitoring, createMonitoring } = require('../backend/src/controllers/monitoringController');

// ── Routes ──────────────────────────────────────────────────
app.post('/api/login', login);
app.post('/api/register', register);

app.get('/api/users', authenticateToken, authorizeRole(['super_admin', 'manajer']), getUsers);
app.post('/api/users', authenticateToken, authorizeRole(['super_admin', 'manajer']), createUser);
app.put('/api/users/:id', authenticateToken, authorizeRole(['super_admin', 'manajer']), updateUser);
app.delete('/api/users/:id', authenticateToken, authorizeRole(['super_admin', 'manajer']), deleteUser);

app.get('/api/criteria', authenticateToken, getCriteria);
app.put('/api/criteria', authenticateToken, authorizeRole(['super_admin', 'manajer']), updateCriteria);

app.get('/api/mustahik', authenticateToken, getMustahik);
app.post('/api/mustahik', authenticateToken, createMustahik);
app.put('/api/mustahik/:id', authenticateToken, updateMustahik);
app.delete('/api/mustahik/:id', authenticateToken, deleteMustahik);

app.get('/api/programs', authenticateToken, getPrograms);
app.post('/api/programs', authenticateToken, createProgram);
app.put('/api/programs/:id', authenticateToken, updateProgram);
app.delete('/api/programs/:id', authenticateToken, deleteProgram);

app.get('/api/history', authenticateToken, getHistory);
app.post('/api/history', authenticateToken, createHistory);

app.get('/api/monitoring', authenticateToken, getMonitoring);
app.post('/api/monitoring', authenticateToken, createMonitoring);

app.get('/api/health', (req, res) => res.json({ status: 'ok', database: 'connected' }));

module.exports = app;
