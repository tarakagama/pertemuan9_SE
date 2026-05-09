const express = require('express');
const axios = require('axios');
const { protect } = require('../middleware/auth');
const router = express.Router();

const ORDER_URL = 'http://localhost:4269';

// GET semua order — admin only
router.get('/', protect(['admin']), async (req, res) => {
    try {
        const response = await axios.get(`${ORDER_URL}/orders`, {
            headers: { 'x-user-id': req.user.id, 'x-user-role': req.user.role }
        });
        res.json(response.data);
    } catch (err) {
        res.status(err.response?.status || 500).json({ success: false, message: 'Order Service Unreachable' });
    }
});

// GET order milik user sendiri
router.get('/my', protect(['user', 'admin']), async (req, res) => {
    try {
        const response = await axios.get(`${ORDER_URL}/orders/my`, {
            headers: { 'x-user-id': req.user.id, 'x-user-role': req.user.role }
        });
        res.json(response.data);
    } catch (err) {
        res.status(err.response?.status || 500).json({ success: false, message: 'Gagal mengambil order' });
    }
});

// POST beli tiket — user & admin
router.post('/buy', protect(['user', 'admin']), async (req, res) => {
    try {
        const response = await axios.post(`${ORDER_URL}/buy-ticket`, req.body, {
            headers: { 'x-user-id': req.user.id, 'x-user-role': req.user.role }
        });
        res.status(201).json(response.data);
    } catch (err) {
        res.status(err.response?.status || 500).json({ success: false, message: 'Gagal membuat order' });
    }
});

// PUT update order — admin only
router.put('/:id', protect(['admin']), async (req, res) => {
    try {
        const response = await axios.put(`${ORDER_URL}/order/${req.params.id}`, req.body);
        res.json(response.data);
    } catch (err) {
        res.status(err.response?.status || 500).json({ success: false, message: 'Update Gagal' });
    }
});

// DELETE order — admin only
router.delete('/:id', protect(['admin']), async (req, res) => {
    try {
        const response = await axios.delete(`${ORDER_URL}/order/${req.params.id}`);
        res.json(response.data);
    } catch (err) {
        res.status(err.response?.status || 500).json({ success: false, message: 'Delete Gagal' });
    }
});

// GET semua tiket — public (tidak perlu token)
router.get('/tickets', async (req, res) => {
    try {
        const response = await axios.get(`${ORDER_URL}/tickets`);
        res.json(response.data);
    } catch (err) {
        res.status(500).json({ success: false, message: 'Gagal mengambil tiket' });
    }
});

// POST buat tiket — admin only
router.post('/ticket', protect(['admin']), async (req, res) => {
    try {
        const response = await axios.post(`${ORDER_URL}/ticket`, req.body);
        res.status(201).json(response.data);
    } catch (err) {
        res.status(err.response?.status || 500).json({ success: false, message: 'Gagal membuat tiket' });
    }
});

// PUT update tiket — admin only
router.put('/ticket/:id', protect(['admin']), async (req, res) => {
    try {
        const response = await axios.put(`${ORDER_URL}/ticket/${req.params.id}`, req.body);
        res.json(response.data);
    } catch (err) {
        res.status(err.response?.status || 500).json({ success: false, message: 'Gagal update tiket' });
    }
});

// DELETE tiket — admin only
router.delete('/ticket/:id', protect(['admin']), async (req, res) => {
    try {
        const response = await axios.delete(`${ORDER_URL}/ticket/${req.params.id}`);
        res.json(response.data);
    } catch (err) {
        res.status(err.response?.status || 500).json({ success: false, message: 'Gagal hapus tiket' });
    }
});

module.exports = router;