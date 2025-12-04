const express = require('express');
const router = express.Router();
const recipeController = require('../controllers/recipeController');
const verifyToken = require('../middleware/authMiddleware');

// GET /api/recipes -> Public
router.get('/', recipeController.getAllRecipes);

// GET /api/recipes/:id -> Public (Detail Resep) - Tambahkan ini
router.get('/:id', recipeController.getRecipeById);

// POST /api/recipes -> Private
router.post('/', verifyToken, recipeController.createRecipe);

// DELETE /api/recipes/:id -> Private
router.delete('/:id', verifyToken, recipeController.deleteRecipe);

module.exports = router;