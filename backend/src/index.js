const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const apiRoutes = require('./routes/api');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
// Use singleton to share connection pool
const prisma = require('./prisma');
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api', apiRoutes);

// Test endpoint
app.get('/', (req, res) => {
    res.send('Backend is running and connected to ' + process.env.DATABASE_URL);
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
