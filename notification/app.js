const amqp = require('amqplib');

async function receiveOrder() {
    try {
        // Membuka koneksi
        const connection = await amqp.connect('amqp://localhost');
        const channel = await connection.createChannel();
        const queue = 'ticket_orders';

        await channel.assertQueue(queue, { durable: false });
        console.log(" [*] Menunggu pesanan tiket di queue %s...", queue);

        // Mendengarkan pesan dari queue
        channel.consume(queue, (msg) => {
            if (msg !== null) {
                const order = JSON.parse(msg.content.toString());
                console.log(" [v] Notifikasi: Pesanan Tiket Diterima!", order);
            }
        }, { noAck: true });
    } catch (error) {
        console.error('Error receiving message:', error);
    }
}

receiveOrder();