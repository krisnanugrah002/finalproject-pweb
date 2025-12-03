const db = require('../config/db');

// 1. GET ACTIVITY (READ)
exports.getActivities = async (req, res) => {
    const { date } = req.query;
    try {
        if (!date) return res.status(400).json({ message: 'Tanggal diperlukan' });

        const [activities] = await db.query(
            'SELECT * FROM activity_logs WHERE user_id = ? AND date = ? ORDER BY created_at DESC', 
            [req.user.id, date]
        );
        
        const totalBurned = activities.reduce((sum, item) => sum + item.calories_burned, 0);

        res.json({ data: activities, total: totalBurned });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// 2. ADD ACTIVITY (CREATE)
exports.addActivity = async (req, res) => {
    const { activity_name, calories_burned, date } = req.body;
    try {
        await db.query(
            'INSERT INTO activity_logs (user_id, activity_name, calories_burned, date) VALUES (?, ?, ?, ?)',
            [req.user.id, activity_name, calories_burned, date]
        );
        res.status(201).json({ message: 'Aktivitas dicatat!' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// 3. DELETE ACTIVITY (DELETE)
exports.deleteActivity = async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('DELETE FROM activity_logs WHERE id = ? AND user_id = ?', [id, req.user.id]);
        res.json({ message: 'Aktivitas dihapus.' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};