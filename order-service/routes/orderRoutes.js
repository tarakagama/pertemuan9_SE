const express = require('express');
const db = require('../config/db');
const Order = require('../models/Order');
const Ticket = require('../models/Ticket'); 
const { validateBuyTicket } = require('../middleware/validate');
const { publishToQueue } = require('../app');

const router = express.Router();

// CREATE ticket — admin only
router.post('/ticket', async (req, res) => {
    try {
        const { event_name, price, stock } = req.body;
        if (!event_name || !price || !stock) {
            return res.status(400).json({ success: false, message: 'event_name, price, stock wajib diisi' });
        }
        const ticket = await Ticket.create({ event_name, price, stock });
        res.status(201).json({ success: true, message: 'Tiket berhasil dibuat', data: { id: ticket.insertId } });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// READ all tickets — public
router.get('/tickets', async (req, res) => {
    try {
        const tickets = await Ticket.findAll();
        res.json({ success: true, data: tickets });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// UPDATE ticket — admin only
router.put('/ticket/:id', async (req, res) => {
    try {
        const { event_name, price, stock } = req.body;
        const result = await Ticket.update(req.params.id, { event_name, price, stock });
        if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Tiket tidak ditemukan' });
        res.json({ success: true, message: 'Tiket berhasil diupdate' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// DELETE ticket — admin only
router.delete('/ticket/:id', async (req, res) => {
    try {
        const result = await Ticket.delete(req.params.id);
        if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Tiket tidak ditemukan' });
        res.json({ success: true, message: 'Tiket berhasil dihapus' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.get('/orders', async (req, res) => {
    try {
        const orders = await Order.findAll();
        res.json({ success: true, data: orders });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.get('/orders/my', async (req, res) => {
    try {
        const orders = await Order.findByUserId(req.headers['x-user-id']);
        res.json({ success: true, data: orders });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.post('/buy-ticket', validateBuyTicket, async (req, res) => {
    const conn = await db.getConnection();
    try {
        await conn.beginTransaction();
        const userId = req.headers['x-user-id'];
        const { ticket_id, quantity } = req.body;

        const ticket = await Ticket.findById(ticket_id);
        if (!ticket) return res.status(404).json({ success: false, message: 'Tiket tidak ditemukan' });
        if (ticket.stock < quantity) return res.status(400).json({ success: false, message: 'Stok tidak mencukupi' });

        const total_price = ticket.price * quantity;
        const result = await Order.create(conn, { user_id: userId, ticket_id, quantity, total_price });
        await Ticket.decreaseStock(conn, ticket_id, quantity);
        await conn.commit();

        publishToQueue('order_created', JSON.stringify({
            order_id: result.insertId, user_id: userId,
            event_name: ticket.event_name, quantity, total_price
        }));

        res.status(201).json({ success: true, message: 'Tiket berhasil dibeli', data: { order_id: result.insertId, total_price } });
    } catch (err) {
        await conn.rollback();
        res.status(500).json({ success: false, message: err.message });
    } finally {
        conn.release();
    }
});

router.put('/order/:id', async (req, res) => {
    try {
        const { status } = req.body;
        if (!['pending', 'confirmed', 'cancelled'].includes(status)) {
            return res.status(400).json({ success: false, message: 'Status tidak valid' });
        }
        await Order.updateStatus(req.params.id, status);
        res.json({ success: true, message: 'Order berhasil diupdate' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.delete('/order/:id', async (req, res) => {
    try {
        const result = await Order.delete(req.params.id);
        if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Order tidak ditemukan' });
        res.json({ success: true, message: 'Order berhasil dihapus' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;