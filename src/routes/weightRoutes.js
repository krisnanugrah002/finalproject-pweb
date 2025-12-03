const express = require('express');
const router = express.Router();
const weightController = require('../controllers/weightController');
const verifyToken = require('../middleware/authMiddleware');

// Semua route ini butuh login (verifyToken)
router.get('/', verifyToken, weightController.getLogs);  
router.post('/', verifyToken, weightController.addLog);      
router.put('/:id', verifyToken, weightController.updateLog); 
router.delete('/:id', verifyToken, weightController.deleteLog); 

module.exports = router;