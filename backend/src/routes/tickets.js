const express = require('express');
const { 
  createTicket, 
  getMyTickets, 
  getTicketById, 
  addMessage,
  getAgentTickets,
  updateTicketStatus,
  addInternalNote
} = require('../controllers/ticketController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

// Create new ticket
router.post('/', authenticateToken, createTicket);

// Get user's tickets
router.get('/my', authenticateToken, getMyTickets);

// Get agent's assigned tickets
router.get('/assigned', authenticateToken, getAgentTickets);

// Get specific ticket with messages
router.get('/:id', authenticateToken, getTicketById);

// Add message to ticket
router.post('/:id/messages', authenticateToken, addMessage);

// Update ticket status
router.patch('/:id/status', authenticateToken, updateTicketStatus);

// Add internal note (agents/admins only)
router.post('/:id/internal-notes', authenticateToken, authorizeRoles('agent', 'admin'), addInternalNote);

module.exports = router;