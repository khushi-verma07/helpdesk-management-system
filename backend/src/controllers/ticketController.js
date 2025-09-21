const Ticket = require('../models/Ticket');

const createTicket = async (req, res) => {
  try {
    const { title, description, priority, category } = req.body;
    
    if (!title || !description) {
      return res.status(400).json({ message: 'Title and description are required' });
    }

    const ticketId = await Ticket.create({
      title, 
      description, 
      customer_id: req.user.id, 
      priority, 
      category
    });

    const ticket = await Ticket.findById(ticketId);
    res.status(201).json({ 
      message: 'Ticket created successfully', 
      ticket 
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Failed to create ticket', 
      error: error.message 
    });
  }
};

const getMyTickets = async (req, res) => {
  try {
    const tickets = await Ticket.findByCustomer(req.user.id);
    res.json({ tickets });
  } catch (error) {
    res.status(500).json({ 
      message: 'Failed to fetch tickets', 
      error: error.message 
    });
  }
};

const getTicketById = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    // Check if user owns the ticket or is an agent/admin
    if (ticket.customer_id !== req.user.id && !['agent', 'admin'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    console.log(`User ${req.user.id} (role: ${req.user.role}) accessing ticket ${req.params.id}`);
    const messages = await Ticket.getMessages(req.params.id, req.user.role);
    console.log(`Returning ${messages.length} messages to user`);
    res.json({ ticket, messages });
  } catch (error) {
    res.status(500).json({ 
      message: 'Failed to fetch ticket', 
      error: error.message 
    });
  }
};

const addMessage = async (req, res) => {
  try {
    const { message } = req.body;
    const ticketId = req.params.id;

    if (!message) {
      return res.status(400).json({ message: 'Message is required' });
    }

    // Check if user has access to this ticket
    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    if (ticket.customer_id !== req.user.id && !['agent', 'admin'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const messageId = await Ticket.addMessage(ticketId, req.user.id, message);
    res.status(201).json({ 
      message: 'Message added successfully', 
      messageId 
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Failed to add message', 
      error: error.message 
    });
  }
};

const getAgentTickets = async (req, res) => {
  try {
    console.log('Getting tickets for agent ID:', req.user.id);
    console.log('User role:', req.user.role);
    const tickets = await Ticket.getAgentTickets(req.user.id);
    console.log('Found tickets:', tickets.length);
    res.json({ tickets });
  } catch (error) {
    console.error('Error in getAgentTickets:', error);
    res.status(500).json({ 
      message: 'Failed to fetch agent tickets', 
      error: error.message 
    });
  }
};

const updateTicketStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const ticketId = req.params.id;

    if (!status) {
      return res.status(400).json({ message: 'Status is required' });
    }

    const validStatuses = ['open', 'in_progress', 'on_hold', 'resolved', 'closed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    // Check if user has access to this ticket
    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    // Only assigned agent, admin, or customer can update status
    const canUpdate = ticket.assigned_agent_id === req.user.id || 
                     req.user.role === 'admin' || 
                     ticket.customer_id === req.user.id;
    
    if (!canUpdate) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await Ticket.updateStatus(ticketId, status, req.user.id);
    
    res.json({ 
      message: 'Status updated successfully',
      ticket: await Ticket.findById(ticketId)
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Failed to update status', 
      error: error.message 
    });
  }
};

const addInternalNote = async (req, res) => {
  try {
    const { note } = req.body;
    const ticketId = req.params.id;

    if (!note) {
      return res.status(400).json({ message: 'Note is required' });
    }

    // Only agents and admins can add internal notes
    if (!['agent', 'admin'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Check if ticket exists
    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    const noteId = await Ticket.addInternalNote(ticketId, req.user.id, note);
    
    res.status(201).json({ 
      message: 'Internal note added successfully', 
      noteId 
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Failed to add internal note', 
      error: error.message 
    });
  }
};

module.exports = { 
  createTicket, 
  getMyTickets, 
  getTicketById, 
  addMessage,
  getAgentTickets,
  updateTicketStatus,
  addInternalNote
};