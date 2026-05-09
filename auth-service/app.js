const express = require('express');
const authRoutes = require('./routes/authRoutes');

const app = express();
const PORT = 4169;

app.use(express.json());
app.use(authRoutes);

app.get('/health', (req, res) => res.json({ success: true, message: 'Auth Service aktif' }));

app.listen(PORT, () => console.log(`Auth Service berjalan di port ${PORT}`));