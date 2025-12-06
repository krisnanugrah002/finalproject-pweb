const db = require('../config/db');

// 1. GET LOGS (READ) - Mengambil history berat badan
exports.getLogs = async (req, res) => {
    try {
        const [logs] = await db.query(
            'SELECT * FROM weight_logs WHERE user_id = ? ORDER BY date ASC', 
            [req.user.id]
        );
        res.json(logs);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// 2. ADD LOG (CREATE) - Menambah berat badan hari ini/tertentu
exports.addLog = async (req, res) => {
    const { weight, date } = req.body;
    try {
        const [existing] = await db.query(
            'SELECT id FROM weight_logs WHERE user_id = ? AND date = ?',
            [req.user.id, date]
        );

        if (existing.length > 0) {
            await db.query(
                'UPDATE weight_logs SET weight = ? WHERE id = ?',
                [weight, existing[0].id]
            );
        } else {
            await db.query(
                'INSERT INTO weight_logs (user_id, weight, date) VALUES (?, ?, ?)',
                [req.user.id, weight, date]
            );
        }
        await db.query('UPDATE users SET weight = ? WHERE id = ?', [weight, req.user.id]);

        res.status(201).json({ message: 'Data berat badan tersimpan!' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// 3. UPDATE LOG (UPDATE)
exports.updateLog = async (req, res) => {
    const { id } = req.params;
    const { weight } = req.body;
    try {
        await db.query(
            'UPDATE weight_logs SET weight = ? WHERE id = ? AND user_id = ?',
            [weight, id, req.user.id]
        );
        res.json({ message: 'Data berhasil diperbarui.' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// 4. DELETE LOG (DELETE) - Hapus data
exports.deleteLog = async (req, res) => {
    const { id } = req.params;
    try {
        await db.query(
            'DELETE FROM weight_logs WHERE id = ? AND user_id = ?',
            [id, req.user.id]
        );
        res.json({ message: 'Data berhasil dihapus.' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};