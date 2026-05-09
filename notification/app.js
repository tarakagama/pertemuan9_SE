const express = require('express');
const app = express();
const PORT = 4369;

app.use(express.json());

app.get('/health', (req, res) => res.json({ success: true, message: 'Notification Service aktif' }));

app.listen(PORT, () => console.log(`Notification Service berjalan di port ${PORT}`));