const db = require('../config/db');

// 1. GET FOODS (READ)
exports.getFoods = async (req, res) => {
    const { date } = req.query;
    try {
        if (!date) return res.status(400).json({ message: 'Tanggal diperlukan' });

        // FIX: Ganti 'ORDER BY created_at' (kolom ga ada) jadi 'ORDER BY id'
        const [foods] = await db.query(
            'SELECT * FROM food_logs WHERE user_id = ? AND date = ? ORDER BY id DESC', 
            [req.user.id, date]
        );
        
        const totalCalories = foods.reduce((sum, item) => sum + item.calories, 0);

        res.json({ data: foods, total: totalCalories });
    } catch (err) {
        console.error("Error getFoods:", err); // Log error ke terminal biar ketahuan
        res.status(500).json({ message: err.message });
    }
};

// 2. ADD FOOD (CREATE)
exports.addFood = async (req, res) => {
    const { food_name, calories, date } = req.body;
    try {
        // FIX: Tambahkan 'Snack' sebagai default meal_time karena kolom ini wajib (NOT NULL) di DB
        await db.query(
            'INSERT INTO food_logs (user_id, food_name, calories, date, meal_time) VALUES (?, ?, ?, ?, ?)',
            [req.user.id, food_name, calories, date, 'Snack']
        );
        res.status(201).json({ message: 'Makanan berhasil dicatat!' });
    } catch (err) {
        console.error("Error addFood:", err);
        res.status(500).json({ message: err.message });
    }
};

// 3. DELETE FOOD
exports.deleteFood = async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('DELETE FROM food_logs WHERE id = ? AND user_id = ?', [id, req.user.id]);
        res.json({ message: 'Makanan dihapus.' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// 4. UPDATE FOOD
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