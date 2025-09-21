const express = require('express');
const { 
  getUnassignedTickets,
  getAllTickets,
  getAgents,
  assignTicket,
  getOverdueTickets
} = require('../controllers/adminController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

// Admin only routes
router.get('/tickets/unassigned', authenticateToken, authorizeRoles('admin'), getUnassignedTickets);
router.get('/tickets/overdue', authenticateToken, authorizeRoles('admin'), getOverdueTickets);
router.get('/tickets', authenticateToken, authorizeRoles('admin'), getAllTickets);
router.get('/agents', authenticateToken, authorizeRoles('admin'), getAgents);
router.post('/tickets/assign', authenticateToken, authorizeRoles('admin'), assignTicket);

module.exports = router;