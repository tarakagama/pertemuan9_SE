const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./routes/authRoutes');
const orderRoutes = require('./routes/orderRoutes');

const app = express();
const PORT = 4069;

app.use(express.json());

// Logging setiap request
app.use(morgan('combined'));

// Rate Limiting — maks 100 request per 15 menit per IP
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: { success: false, message: 'Terlalu banyak request, coba lagi nanti.' }
});
app.use(limiter);

// Routes
app.use('/auth', authRoutes);
app.use('/order', orderRoutes);

// Health check
app.get('/health', (req, res) => res.json({ success: true, message: 'API Gateway aktif' }));

// 404 handler
app.use((req, res) => res.status(404).json({ success: false, message: 'Endpoint tidak ditemukan' }));

app.listen(PORT, () => console.log(` API Gateway berjalan di port ${PORT}`));