const db = require('../config/db');

const Notification = {
    create: async ({ user_id, order_id, message, status }) => {
        const [result] = await db.query(
            'INSERT INTO notifications (user_id, order_id, message, status) VALUES (?, ?, ?, ?)',
            [user_id, order_id, message, status]
        );
        return result;
    }
};

module.exports = Notification;