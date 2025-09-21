const express = require('express');
const { getDashboardMetrics } = require('../controllers/analyticsController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

// Admin only analytics routes
router.get('/dashboard', authenticateToken, authorizeRoles('admin'), getDashboardMetrics);

module.exports = router;