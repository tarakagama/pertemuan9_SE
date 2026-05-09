const db = require('../config/db');

const Order = {
    findAll: async () => {
        const [rows] = await db.query(
            'SELECT o.*, t.event_name FROM orders o JOIN tickets t ON o.ticket_id = t.id ORDER BY o.created_at DESC'
        );
        return rows;
    },

    findByUserId: async (userId) => {
        const [rows] = await db.query(
            'SELECT o.*, t.event_name FROM orders o JOIN tickets t ON o.ticket_id = t.id WHERE o.user_id = ? ORDER BY o.created_at DESC',
            [userId]
        );
        return rows;
    },

    create: async (conn, { user_id, ticket_id, quantity, total_price }) => {
        const [result] = await conn.query(
            'INSERT INTO orders (user_id, ticket_id, quantity, total_price) VALUES (?, ?, ?, ?)',
            [user_id, ticket_id, quantity, total_price]
        );
        return result;
    },

    updateStatus: async (id, status) => {
        const [result] = await db.query('UPDATE orders SET status = ? WHERE id = ?', [status, id]);
        return result;
    },

    delete: async (id) => {
        const [result] = await db.query('DELETE FROM orders WHERE id = ?', [id]);
        return result;
    }
};

module.exports = Order;