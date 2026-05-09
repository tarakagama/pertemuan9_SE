const amqp = require('amqplib');
const Notification = require('./models/Notification');

async function startConsumer() {
    try {
        const conn = await amqp.connect('amqp://localhost');
        const channel = await conn.createChannel();
        const QUEUE = 'order_created';

        await channel.assertQueue(QUEUE, { durable: true });
        channel.prefetch(1);
        console.log(`Notification Service menunggu pesan di queue "${QUEUE}"...`);

        channel.consume(QUEUE, async (msg) => {
            if (!msg) return;
            try {
                const payload = JSON.parse(msg.content.toString());
                const message = `Order #${payload.order_id} untuk "${payload.event_name}" (${payload.quantity} tiket) senilai Rp${payload.total_price} berhasil!`;

                await Notification.create({ user_id: payload.user_id, order_id: payload.order_id, message, status: 'sent' });
                console.log('Notifikasi tersimpan');
                channel.ack(msg);
            } catch (err) {
                console.error('Gagal proses pesan:', err.message);
                channel.nack(msg, false, true);
            }
        });
    } catch (err) {
        console.error('RabbitMQ gagal konek:', err.message);
        setTimeout(startConsumer, 5000);
    }
}

startConsumer();