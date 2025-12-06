const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// 1. REGISTER (CREATE)
exports.register = async (req, res) => {
    const { full_name, email, password, height, weight } = req.body;
    try {
        const [existing] = await db.query('SELECT email FROM users WHERE email = ?', [email]);
        if (existing.length > 0) return res.status(400).json({ message: 'Email sudah terdaftar!' });

        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);

        await db.query(
            'INSERT INTO users (name, email, password, height, weight) VALUES (?, ?, ?, ?, ?)',
            [full_name, email, hash, height, weight]
        );
        res.status(201).json({ message: 'Registrasi berhasil!' });
    } catch (err) {
        res.status(500).json({ message: 'Server Error: ' + err.message });
    }
};

// 2. LOGIN (READ - Auth)
exports.login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) return res.status(400).json({ message: 'Email tidak ditemukan.' });

        const user = users[0];
        const validPass = await bcrypt.compare(password, user.password);
        if (!validPass) return res.status(400).json({ message: 'Password salah.' });

        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || 'rahasia_fitmate_123', { expiresIn: '1d' });
        
        res.json({ message: 'Login sukses', token, user: { name: user.name, email: user.email } });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getProfile = async (req, res) => {
    try {
        const query = 'SELECT id, name, email, height, weight FROM users WHERE id = ?';
        const [users] = await db.query(query, [req.user.id]);
        
        if (!users.length) return res.status(404).json({ message: 'User not found' });
        res.json(users[0]);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};


exports.updateProfile = async (req, res) => {
    const { full_name, height, weight } = req.body;
    
    try {
        const [currentUser] = await db.query('SELECT * FROM users WHERE id = ?', [req.user.id]);
        if (!currentUser.length) return res.status(404).json({ message: 'User not found' });
        
        const user = currentUser[0];
        const newName = full_name || user.name; 
        const newHeight = height !== undefined ? height : user.height; 
        const newWeight = weight !== undefined ? weight : user.weight;
        const query = 'UPDATE users SET name = ?, height = ?, weight = ? WHERE id = ?';
        
        await db.query(query, [newName, newHeight, newWeight, req.user.id]);
        
        res.json({ message: 'Profil berhasil diperbarui!' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
};

exports.deleteAccount = async (req, res) => {
    try {
        await db.query('DELETE FROM users WHERE id = ?', [req.user.id]);
        res.json({ message: 'Akun berhasil dihapus permanen.' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
