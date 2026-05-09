const express = require('express');
const axios = require('axios');
const router = express.Router();

const AUTH_URL = 'http://localhost:4169';

router.post('/register', async (req, res) => {
    try {
        const response = await axios.post(`${AUTH_URL}/register`, req.body);
        res.status(201).json(response.data);
    } catch (err) {
        const status = err.response?.status || 500;
        const message = err.response?.data?.message || 'Gagal Registrasi';
        res.status(status).json({ success: false, message });
    }
});

router.post('/login', async (req, res) => {
    try {
        const response = await axios.post(`${AUTH_URL}/login`, req.body);
        res.json(response.data);
    } catch (err) {
        const status = err.response?.status || 500;
        const message = err.response?.data?.message || 'Login Gagal';
        res.status(status).json({ success: false, message });
    }
});

module.exports = router;