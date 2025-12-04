const express = require('express');
const router = express.Router();
const activityController = require('../controllers/activityController');
const verifyToken = require('../middleware/authMiddleware');

router.get('/', verifyToken, activityController.getActivities);
router.post('/', verifyToken, activityController.addActivity);
router.put('/:id', verifyToken, activityController.updateActivity);
router.delete('/:id', verifyToken, activityController.deleteActivity);

module.exports = router;