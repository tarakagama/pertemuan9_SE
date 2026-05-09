const express = require('express');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const app = express();
const port = 4069;

const SECRET_KEY = 'taraka_secret_key';

app.use(express.json());

// --- MIDDLEWARE OTORISASI (Kriteria Tugas) ---
const protect = (roles = []) => {
    return (req, res, next) => {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) return res.status(401).json({ message: 'Akses ditolak, token tidak ada' });

        try {
            const decoded = jwt.verify(token, SECRET_KEY);
            req.user = decoded;

            // Cek apakah role user ada di daftar role yang diizinkan
            if (roles.length && !roles.includes(decoded.role)) {
                return res.status(403).json({ message: 'Forbidden: Anda tidak punya akses ke fitur ini' });
            }
            next();
        } catch (error) {
            res.status(401).json({ message: 'Token tidak valid' });
        }
    };
};

// Routing ke Auth Service
app.post('/auth/login', async (req, res) => {
    const response = await axios.post('http://localhost:4169/login', req.body);
    res.json(response.data);
});

// Routing ke Order Service
app.post('/order/buy', async (req, res) => {
    try {
        const response = await axios.post('http://localhost:4269/buy-ticket', req.body);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ message: 'Service Order Down' });
    }
});

// GET All Orders
app.get('/order', async (req, res) => {
    try {
        const response = await axios.get('http://localhost:4269/orders');
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ message: 'Order Service Unreachable' });
    }
});

// UPDATE Order
app.put('/order/:id', async (req, res) => {
    try {
        const response = await axios.put(`http://localhost:4269/order/${req.params.id}`, req.body);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ message: 'Update Failed' });
    }
});

// DELETE Order
app.delete('/order/:id', async (req, res) => {
    try {
        const response = await axios.delete(`http://localhost:4269/order/${req.params.id}`);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ message: 'Delete Failed' });
    }
});

app.post('/auth/login', async (req, res) => {
    try {
        const response = await axios.post('http://localhost:4169/login', req.body);
        res.json(response.data);
    } catch (err) { res.status(401).json({ message: 'Login Gagal' }); }
});

// Protected: User & Admin bisa beli tiket (POST)
app.post('/order', protect(['user', 'admin']), async (req, res) => {
    const response = await axios.post('http://localhost:4269/order', req.body);
    res.json(response.data);
});

// Restricted: HANYA Admin yang bisa hapus order (DELETE)
app.delete('/order/:id', protect(['admin']), async (req, res) => {
    const response = await axios.delete(`http://localhost:4269/order/${req.params.id}`);
    res.json(response.data);
});

app.post('/auth/register', async (req, res) => {
    try {
        const response = await axios.post('http://localhost:4169/register', req.body);
        res.status(201).json(response.data);
    } catch (err) {
        res.status(500).json({ message: 'Gagal Registrasi' });
    }
});

app.listen(port, () => console.log(`API Gateway running on port ${port}`));