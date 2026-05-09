const express = require('express');
const mysql = require('mysql2');
const amqp = require('amqplib');
const app = express();
const port = 4269;

app.use(express.json());

// Koneksi Database
const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'taraka_ticketing_db'
});

// HELPER: KIRIM KE RABBITMQ
async function sendToRabbitMQ(data) {
    const conn = await amqp.connect('amqp://localhost');
    const channel = await conn.createChannel();
    const queue = 'ticket_orders';
    await channel.assertQueue(queue, { durable: false });
    channel.sendToQueue(queue, Buffer.from(JSON.stringify(data)));
    setTimeout(() => conn.close(), 500);
}

// CRUD: CREATE (POST)
app.post('/order', (req, res) => {
    const { user_id, ticket_id, quantity, price } = req.body;

    // VALIDASI INPUT
    if (!user_id || !ticket_id || !quantity || quantity <= 0) {
        return res.status(400).json({ 
            status: 'Error', 
            message: 'Data tidak lengkap atau quantity harus lebih dari 0' 
        });
    }

    const total_price = quantity * price;
    const query = 'INSERT INTO orders (user_id, ticket_id, quantity, total_price) VALUES (?, ?, ?, ?)';

    db.query(query, [user_id, ticket_id, quantity, total_price], (err, result) => {
        if (err) {
            return res.status(500).json({ status: 'Error', message: 'Gagal simpan database', error: err.message });
        }

        const orderData = { order_id: result.insertId, user_id, ticket_id, quantity };
        
        // KIRIM KE BROKER
        sendToRabbitMQ(orderData);

        res.status(201).json({ status: 'Success', message: 'Order created', data: orderData });
    });
});

// CRUD: READ (GET ALL)
app.get('/order', (req, res) => {
    db.query('SELECT * FROM orders', (err, results) => {
        if (err) return res.status(500).json({ message: err.message });
        res.json({ status: 'Success', data: results });
    });
});

// CRUD: UPDATE (PUT)
app.put('/order/:id', (req, res) => {
    const { quantity } = req.body;
    if (!quantity || quantity <= 0) return res.status(400).json({ message: 'Quantity invalid' });

    db.query('UPDATE orders SET quantity = ? WHERE id = ?', [quantity, req.params.id], (err, result) => {
        if (err) return res.status(500).json({ message: err.message });
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Order not found' });
        res.json({ status: 'Success', message: 'Order updated' });
    });
});

// CRUD: DELETE
app.delete('/order/:id', (req, res) => {
    db.query('DELETE FROM orders WHERE id = ?', [req.params.id], (err, result) => {
        if (err) return res.status(500).json({ message: err.message });
        res.json({ status: 'Success', message: 'Order deleted' });
    });
});

app.listen(port, () => console.log(`Order Service on port ${port}`));