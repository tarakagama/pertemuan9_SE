const express = require('express');
const amqp = require('amqplib');
const orderRoutes = require('./routes/orderRoutes');

const app = express();
const PORT = 4269;
let channel;

// Koneksi ke RabbitMQ
async function connectRabbitMQ() {
    try {
        const conn = await amqp.connect('amqp://localhost');
        channel = await conn.createChannel();
        await channel.assertQueue('order_created', { durable: true });
        console.log('Terhubung ke RabbitMQ');
    } catch (err) {
        console.error('RabbitMQ gagal konek:', err.message);
        setTimeout(connectRabbitMQ, 5000);
    }
}

const publishToQueue = (queue, message) => {
    if (channel) {
        channel.sendToQueue(queue, Buffer.from(message), { persistent: true });
        console.log(`Event dikirim ke queue "${queue}":`, message);
    } else {
        console.warn('Channel RabbitMQ belum siap');
    }
};

module.exports = { publishToQueue };

app.use(express.json());
app.use(orderRoutes);

app.get('/health', (req, res) => res.json({ success: true, message: 'Order Service aktif' }));

connectRabbitMQ().then(() => {
    app.listen(PORT, () => console.log(`Order Service berjalan di port ${PORT}`));
});