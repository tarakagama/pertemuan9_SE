const db = require('../config/db');



const Ticket = {
    findById: async (id) => {
        const [rows] = await db.query('SELECT * FROM tickets WHERE id = ? FOR UPDATE', [id]);
        return rows[0];
    },

    decreaseStock: async (conn, ticket_id, quantity) => {
        await conn.query('UPDATE tickets SET stock = stock - ? WHERE id = ?', [quantity, ticket_id]);
    },

    findAll: async () => {
        const [rows] = await db.query('SELECT * FROM tickets ORDER BY created_at DESC');
        return rows;
    },

    create: async ({ event_name, price, stock }) => {
        const [result] = await db.query(
            'INSERT INTO tickets (event_name, price, stock) VALUES (?, ?, ?)',
            [event_name, price, stock]
        );
        return result;
    },

    update: async (id, { event_name, price, stock }) => {
        const [result] = await db.query(
            'UPDATE tickets SET event_name = ?, price = ?, stock = ? WHERE id = ?',
            [event_name, price, stock, id]
        );
        return result;
    },

    delete: async (id) => {
        const [result] = await db.query('DELETE FROM tickets WHERE id = ?', [id]);
        return result;
    }
};



module.exports = Ticket;