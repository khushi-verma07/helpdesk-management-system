const Ticket = require('../models/Ticket');
const User = require('../models/User');

const getUnassignedTickets = async (req, res) => {
  try {
    const tickets = await Ticket.getUnassignedTickets();
    res.json({ tickets });
  } catch (error) {
    res.status(500).json({ 
      message: 'Failed to fetch unassigned tickets', 
      error: error.message 
    });
  }
};

const getAllTickets = async (req, res) => {
  try {
    const tickets = await Ticket.getAllTickets();
    res.json({ tickets });
  } catch (error) {
    console.error('Error in getAllTickets:', error);
    res.status(500).json({ 
      message: 'Failed to fetch all tickets', 
      error: error.message 
    });
  }
};

const getAgents = async (req, res) => {
  try {
    const [rows] = await require('../config/database').execute(
      'SELECT id, first_name, last_name, email FROM users WHERE role = "agent" AND is_active = TRUE ORDER BY first_name, last_name'
    );
    res.json({ agents: rows });
  } catch (error) {
    res.status(500).json({ 
      message: 'Failed to fetch agents', 
      error: error.message 
    });
  }
};

const assignTicket = async (req, res) => {
  try {
    const { ticketId, agentId } = req.body;

    if (!ticketId || !agentId) {
      return res.status(400).json({ message: 'Ticket ID and Agent ID are required' });
    }

    // Verify ticket exists
    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    // Verify agent exists and is an agent
    const agent = await User.findById(agentId);
    if (!agent || agent.role !== 'agent') {
      return res.status(400).json({ message: 'Invalid agent' });
    }

    await Ticket.assignToAgent(ticketId, agentId, req.user.id);

    res.json({ 
      message: 'Ticket assigned successfully',
      ticket: await Ticket.findById(ticketId)
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Failed to assign ticket', 
      error: error.message 
    });
  }
};

const getOverdueTickets = async (req, res) => {
  try {
    const tickets = await Ticket.getOverdueTickets();
    res.json({ tickets });
  } catch (error) {
    res.status(500).json({ 
      message: 'Failed to fetch overdue tickets', 
      error: error.message 
    });
  }
};

module.exports = {
  getUnassignedTickets,
  getAllTickets,
  getAgents,
  assignTicket,
  getOverdueTickets
};