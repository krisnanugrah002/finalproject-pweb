const db = require('../config/db');

// 1. GET ALL RECIPES (READ)
exports.getAllRecipes = async (req, res) => {
    try {
        // Mengambil semua resep digabung dengan nama pembuatnya
        const query = `
            SELECT r.*, u.name AS creator_name 
            FROM recipes r 
            JOIN users u ON r.user_id = u.id 
            ORDER BY r.created_at DESC
        `;
        const [recipes] = await db.query(query);
        res.json(recipes);
    } catch (err) {
        console.error("Error getAllRecipes:", err);
        res.status(500).json({ message: err.message });
    }
};

// 2. CREATE RECIPE (CREATE)
exports.createRecipe = async (req, res) => {
    const { title, calories, category, ingredients, instructions, image_url } = req.body;
    
    // Validasi sederhana
    if (!title || !calories || !category) {
        return res.status(400).json({ message: 'Judul, Kalori, dan Kategori wajib diisi!' });
    }

    try {
        const query = `
            INSERT INTO recipes (user_id, title, category, calories, ingredients, instructions, image_url) 
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        
        await db.query(query, [
            req.user.id, // ID user dari token JWT
            title, 
            category, 
            calories, 
            ingredients, 
            instructions, 
            image_url || null
        ]);

        res.status(201).json({ message: 'Resep berhasil diterbitkan!' });
    } catch (err) {
        console.error("Error createRecipe:", err);
        res.status(500).json({ message: 'Gagal membuat resep: ' + err.message });
    }
};

// 3. DELETE RECIPE (DELETE)
exports.deleteRecipe = async (req, res) => {
    const { id } = req.params;
    try {
        // Cek apakah resep milik user yang login
        const [check] = await db.query('SELECT user_id FROM recipes WHERE id = ?', [id]);
        
        if (check.length === 0) return res.status(404).json({ message: 'Resep tidak ditemukan' });
        if (check[0].user_id !== req.user.id) return res.status(403).json({ message: 'Anda tidak berhak menghapus resep ini' });

        await db.query('DELETE FROM recipes WHERE id = ?', [id]);
        res.json({ message: 'Resep berhasil dihapus' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// 3. GET SINGLE RECIPE (READ) - Tambahkan fungsi ini
exports.getRecipeById = async (req, res) => {
    const { id } = req.params;
    try {
        const query = `
            SELECT r.*, u.name AS creator_name 
            FROM recipes r 
            JOIN users u ON r.user_id = u.id 
            WHERE r.id = ?
        `;
        const [recipes] = await db.query(query, [id]);

        if (recipes.length === 0) {
            return res.status(404).json({ message: 'Resep tidak ditemukan' });
        }

        res.json(recipes[0]);
    } catch (err) {
        console.error("Error getRecipeById:", err);
        res.status(500).json({ message: err.message });
    }
};