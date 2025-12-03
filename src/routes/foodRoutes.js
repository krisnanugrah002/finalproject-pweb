const express = require('express');
const router = express.Router();
const foodController = require('../controllers/foodController');
const verifyToken = require('../middleware/authMiddleware');

router.get('/', verifyToken, foodController.getFoods);
router.post('/', verifyToken, foodController.addFood);
router.put('/:id', verifyToken, foodController.updateFood);
router.delete('/:id', verifyToken, foodController.deleteFood);

module.exports = router;