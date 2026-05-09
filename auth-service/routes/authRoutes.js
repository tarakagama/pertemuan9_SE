const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { validateRegister, validateLogin } = require('../middleware/validate');

const router = express.Router();
const SECRET_KEY = 'taraka_secret_key';

router.post('/register', validateRegister, async (req, res) => {
    try {
        const { username, email, password, role } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const userRole = role === 'admin' ? 'admin' : 'user';

        await User.create({ username, email, password: hashedPassword, role: userRole });
        res.status(201).json({ success: true, message: 'Registrasi berhasil' });
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ success: false, message: 'Email atau username sudah digunakan' });
        }
        res.status(500).json({ success: false, message: 'Registrasi gagal', error: err.message });
    }
});

router.post('/login', validateLogin, async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findByEmail(email);

        if (!user) return res.status(401).json({ success: false, message: 'Email atau password salah' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ success: false, message: 'Email atau password salah' });

        const token = jwt.sign(
            { id: user.id, username: user.username, role: user.role },
            SECRET_KEY,
            { expiresIn: '2h' }
        );

        res.json({
            success: true, message: 'Login berhasil', token,
            user: { id: user.id, username: user.username, email: user.email, role: user.role }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Login gagal', error: err.message });
    }
});

module.exports = router;