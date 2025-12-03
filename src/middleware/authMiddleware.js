const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Format: "Bearer TOKEN"

    if (!token) {
        return res.status(401).json({ message: 'Akses ditolak. Silakan login.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'rahasia_fitmate_123');
        req.user = decoded; // Simpan data user ke request
        next();
    } catch (error) {
        return res.status(403).json({ message: 'Sesi berakhir, login ulang.' });
    }
};

module.exports = verifyToken;