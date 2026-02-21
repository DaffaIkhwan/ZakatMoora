const express = require('express');
const router = express.Router();
const { login, register } = require('../controllers/authController');
const { getUsers, createUser, updateUser, deleteUser } = require('../controllers/userController');
const { getMustahik, createMustahik, updateMustahik, deleteMustahik } = require('../controllers/mustahikController');
const { getCriteria, updateCriteria } = require('../controllers/criteriaController');
const { getPrograms, createProgram, updateProgram, deleteProgram } = require('../controllers/programController');
const { getHistory, createHistory } = require('../controllers/historyController');
const { getMonitoring, createMonitoring } = require('../controllers/monitoringController');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

// Auth
router.post('/login', login);
router.post('/register', register);

// Users (Super Admin only)
router.get('/users', authenticateToken, authorizeRole(['super_admin', 'manajer']), getUsers);
router.post('/users', authenticateToken, authorizeRole(['super_admin', 'manajer']), createUser);
router.put('/users/:id', authenticateToken, authorizeRole(['super_admin', 'manajer']), updateUser);
router.delete('/users/:id', authenticateToken, authorizeRole(['super_admin', 'manajer']), deleteUser);

// Criteria
router.get('/criteria', authenticateToken, getCriteria);
router.put('/criteria', authenticateToken, authorizeRole(['super_admin', 'manajer']), updateCriteria);

// Mustahik
router.get('/mustahik', authenticateToken, getMustahik);
router.post('/mustahik', authenticateToken, createMustahik);
router.put('/mustahik/:id', authenticateToken, updateMustahik);
router.delete('/mustahik/:id', authenticateToken, deleteMustahik);

// Programs
router.get('/programs', authenticateToken, getPrograms);
router.post('/programs', authenticateToken, createProgram);
router.put('/programs/:id', authenticateToken, updateProgram);
router.delete('/programs/:id', authenticateToken, deleteProgram);

// History
router.get('/history', authenticateToken, getHistory);
router.post('/history', authenticateToken, createHistory);

// Monitoring
router.get('/monitoring', authenticateToken, getMonitoring);
router.post('/monitoring', authenticateToken, createMonitoring);

module.exports = router;
