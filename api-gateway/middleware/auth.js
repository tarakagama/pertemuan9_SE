const jwt = require('jsonwebtoken');
const SECRET_KEY = 'taraka_secret_key';

const protect = (roles = []) => {
    return (req, res, next) => {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ success: false, message: 'Akses ditolak, token tidak ada' });
        }

        const token = authHeader.split(' ')[1];
        try {
            const decoded = jwt.verify(token, SECRET_KEY);
            req.user = decoded;

            if (roles.length && !roles.includes(decoded.role)) {
                return res.status(403).json({ success: false, message: 'Forbidden: Anda tidak punya akses ke fitur ini' });
            }
            next();
        } catch (error) {
            return res.status(401).json({ success: false, message: 'Token tidak valid atau sudah expired' });
        }
    };
};

module.exports = { protect };