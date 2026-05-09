const db = require('../config/db');

const Ticket = {
    findById: async (id) => {
        const [rows] = await db.query('SELECT * FROM tickets WHERE id = ? FOR UPDATE', [id]);
        return rows[0];
    },

    decreaseStock: async (conn, ticket_id, quantity) => {
        await conn.query('UPDATE tickets SET stock = stock - ? WHERE id = ?', [quantity, ticket_id]);
    }
};

module.exports = Ticket;