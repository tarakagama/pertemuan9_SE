const express = require('express');
const mysql = require('mysql2');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs'); // Library untuk enkripsi password
const app = express();
const port = 4169;

const SECRET_KEY = 'taraka_secret_key';

app.use(express.json());

// Koneksi Database
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'taraka_ticketing_db'
});

// REGISTRASI (Kriteria Tugas)
app.post('/register', async (req, res) => {
    const { username, password, role } = req.body;
    
    // Validasi Input
    if (!username || !password) {
        return res.status(400).json({ message: 'Username dan password wajib diisi' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userRole = role || 'user'; // Default jadi user biasa

    const query = 'INSERT INTO users (username, password, role) VALUES (?, ?, ?)';
    db.query(query, [username, hashedPassword, userRole], (err, result) => {
        if (err) return res.status(500).json({ message: 'Registrasi Gagal', error: err.message });
        res.status(201).json({ message: 'User berhasil didaftarkan' });
    });
});

// LOGIN (Kriteria Tugas: Menerbitkan Access Token)
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    db.query('SELECT * FROM users WHERE username = ?', [username], async (err, results) => {
        if (err || results.length === 0) return res.status(401).json({ message: 'User tidak ditemukan' });

        const user = results[0];
        const isPasswordMatch = await bcrypt.compare(password, user.password);

        if (!isPasswordMatch) return res.status(401).json({ message: 'Password salah' });

        // Generate JWT (Termasuk Role untuk Otorisasi)
        const token = jwt.sign(
            { id: user.id, username: user.username, role: user.role },
            SECRET_KEY,
            { expiresIn: '1h' }
        );

        res.json({ message: 'Login Berhasil', token });
    });
});

app.listen(port, () => console.log(`Auth Service running on port ${port}`));