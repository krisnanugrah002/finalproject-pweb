const db = require('../config/db');

// 1. GET ACTIVITY (READ)
exports.getActivities = async (req, res) => {
    const { date } = req.query;
    try {
        if (!date) return res.status(400).json({ message: 'Tanggal diperlukan' });

        const [activities] = await db.query(
            'SELECT * FROM activity_logs WHERE user_id = ? AND date = ? ORDER BY id DESC', 
            [req.user.id, date]
        );
        
        const totalBurned = activities.reduce((sum, item) => sum + item.calories_burned, 0);

        res.json({ data: activities, total: totalBurned });
    } catch (err) {
        console.error("Error getActivities:", err);
        res.status(500).json({ message: err.message });
    }
};

// 2. ADD ACTIVITY (CREATE)
exports.addActivity = async (req, res) => {
    const { activity_name, calories_burned, date } = req.body;
    try {
        await db.query(
            'INSERT INTO activity_logs (user_id, activity_name, calories_burned, date, duration_minutes) VALUES (?, ?, ?, ?, ?)',
            [req.user.id, activity_name, calories_burned, date, 30] 
        );
        res.status(201).json({ message: 'Aktivitas dicatat!' });
    } catch (err) {
        console.error("Error addActivity:", err);
        res.status(500).json({ message: err.message });
    }
};

// 3. DELETE ACTIVITY
exports.deleteActivity = async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('DELETE FROM activity_logs WHERE id = ? AND user_id = ?', [id, req.user.id]);
        res.json({ message: 'Aktivitas dihapus.' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// 4. UPDATE ACTIVITY (BARU - Tambahkan ini!)
exports.updateActivity = async (req, res) => {
    const { id } = req.params;
    const { activity_name, calories_burned } = req.body;
    try {
        await db.query(
            'UPDATE activity_logs SET activity_name = ?, calories_burned = ? WHERE id = ? AND user_id = ?',
            [activity_name, calories_burned, id, req.user.id]
        );
        res.json({ message: 'Aktivitas berhasil diperbarui.' });
    } catch (err) {
        console.error("Error updateActivity:", err);
        res.status(500).json({ message: err.message });
    }
};