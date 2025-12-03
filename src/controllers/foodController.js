const db = require('../config/db');

// 1. GET FOODS (READ) - Ambil daftar makanan berdasarkan tanggal
exports.getFoods = async (req, res) => {
    const { date } = req.query;
    try {
        if (!date) return res.status(400).json({ message: 'Tanggal diperlukan' });

        const [foods] = await db.query(
            'SELECT * FROM food_logs WHERE user_id = ? AND date = ? ORDER BY created_at DESC', 
            [req.user.id, date]
        );
        
        // Hitung total kalori 
        const totalCalories = foods.reduce((sum, item) => sum + item.calories, 0);

        res.json({ data: foods, total: totalCalories });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// 2. ADD FOOD (CREATE)
exports.addFood = async (req, res) => {
    const { food_name, calories, date } = req.body;
    try {
        await db.query(
            'INSERT INTO food_logs (user_id, food_name, calories, date) VALUES (?, ?, ?, ?)',
            [req.user.id, food_name, calories, date]
        );
        res.status(201).json({ message: 'Makanan berhasil dicatat!' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// 3. DELETE FOOD (DELETE)
exports.deleteFood = async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('DELETE FROM food_logs WHERE id = ? AND user_id = ?', [id, req.user.id]);
        res.json({ message: 'Makanan dihapus.' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// 4. UPDATE FOOD (UPDATE)
exports.updateFood = async (req, res) => {
    const { id } = req.params;
    const { food_name, calories } = req.body;
    try {
        await db.query(
            'UPDATE food_logs SET food_name = ?, calories = ? WHERE id = ? AND user_id = ?',
            [food_name, calories, id, req.user.id]
        );
        res.json({ message: 'Data makanan diupdate.' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};