const pool = require('../config/database');

class Ticket {
  static async create(ticketData) {
    const { title, description, customer_id, priority = 'medium', category } = ticketData;
    
    const slaHours = await this.getSLAHours(priority);
    const slaDeadline = new Date();
    slaDeadline.setHours(slaDeadline.getHours() + slaHours);
    
    const [result] = await pool.execute(
      'INSERT INTO tickets (title, description, customer_id, priority, category, sla_deadline) VALUES (?, ?, ?, ?, ?, ?)',
      [title, description, customer_id, priority, category, slaDeadline]
    );
    
    return result.insertId;
  }

  static async findByCustomer(customerId) {
    const [rows] = await pool.execute(
      'SELECT * FROM tickets WHERE customer_id = ? ORDER BY created_at DESC',
      [customerId]
    );
    return rows;
  }

  static async findById(ticketId) {
    const [rows] = await pool.execute(
      `SELECT t.*, 
              c.first_name as customer_first_name, c.last_name as customer_last_name, c.email as customer_email,
              a.first_name as agent_first_name, a.last_name as agent_last_name, a.email as agent_email
       FROM tickets t 
       JOIN users c ON t.customer_id = c.id 
       LEFT JOIN users a ON t.assigned_agent_id = a.id 
       WHERE t.id = ?`,
      [ticketId]
    );
    return rows[0];
  }

  static async getSLAHours(priority) {
    const [rows] = await pool.execute(
      'SELECT resolution_hours FROM sla_rules WHERE priority = ?',
      [priority]
    );
    return rows[0]?.resolution_hours || 24;
  }

  static async getMessages(ticketId, userRole = null) {
    console.log(`Getting messages for ticket ${ticketId}, user role: ${userRole}`);
    
    let query = `SELECT m.*, u.first_name, u.last_name, u.role, 
                        COALESCE(m.is_internal, FALSE) as is_internal
                 FROM chat_messages m 
                 JOIN users u ON m.sender_id = u.id 
                 WHERE m.ticket_id = ?`;
    
    // Only show internal notes to agents and admins
    if (userRole && !['agent', 'admin'].includes(userRole)) {
      console.log('Filtering out internal notes for customer');
      query += ` AND COALESCE(m.is_internal, FALSE) = FALSE`;
    } else {
      console.log('Showing all messages including internal notes');
    }
    
    query += ` ORDER BY m.created_at ASC`;
    console.log('Final query:', query);
    
    const [rows] = await pool.execute(query, [ticketId]);
    console.log(`Found ${rows.length} messages, internal notes: ${rows.filter(r => r.is_internal).length}`);
    return rows;
  }

  static async addMessage(ticketId, senderId, message) {
    const [result] = await pool.execute(
      'INSERT INTO chat_messages (ticket_id, sender_id, message) VALUES (?, ?, ?)',
      [ticketId, senderId, message]
    );
    return result.insertId;
  }

  static async getUnassignedTickets() {
    const [rows] = await pool.execute(
      `SELECT t.*, c.first_name as customer_first_name, c.last_name as customer_last_name, c.email as customer_email
       FROM tickets t 
       JOIN users c ON t.customer_id = c.id 
       WHERE t.assigned_agent_id IS NULL AND t.status != 'closed'
       ORDER BY t.priority DESC, t.created_at ASC`
    );
    return rows;
  }

  static async getAllTickets() {
    const [rows] = await pool.execute(
      `SELECT t.*, 
              c.first_name as customer_first_name, c.last_name as customer_last_name, c.email as customer_email,
              a.first_name as agent_first_name, a.last_name as agent_last_name, a.email as agent_email
       FROM tickets t 
       JOIN users c ON t.customer_id = c.id 
       LEFT JOIN users a ON t.assigned_agent_id = a.id 
       ORDER BY t.created_at DESC`
    );
    return rows;
  }

  static async assignToAgent(ticketId, agentId, assignedBy) {
    await pool.execute(
      'UPDATE tickets SET assigned_agent_id = ?, status = "in_progress", updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [agentId, ticketId]
    );

    await this.logChange(ticketId, 'assigned_agent_id', agentId, assignedBy);
    await this.logChange(ticketId, 'status', 'in_progress', assignedBy);
  }

  static async getAgentTickets(agentId) {
    const [rows] = await pool.execute(
      'SELECT t.*, c.first_name as customer_first_name, c.last_name as customer_last_name, c.email as customer_email FROM tickets t JOIN users c ON t.customer_id = c.id WHERE t.assigned_agent_id = ? AND t.status != "closed" ORDER BY t.priority DESC, t.created_at ASC',
      [agentId]
    );
    return rows;
  }

  static async logChange(ticketId, fieldName, newValue, changedBy) {
    await pool.execute(
      'INSERT INTO ticket_history (ticket_id, field_name, new_value, changed_by) VALUES (?, ?, ?, ?)',
      [ticketId, fieldName, newValue, changedBy]
    );
  }

  static async updateStatus(ticketId, status, updatedBy) {
    const resolvedAt = status === 'resolved' ? new Date() : null;
    
    await pool.execute(
      'UPDATE tickets SET status = ?, resolved_at = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [status, resolvedAt, ticketId]
    );

    await this.logChange(ticketId, 'status', status, updatedBy);
  }

  static async addInternalNote(ticketId, agentId, note) {
    const [result] = await pool.execute(
      'INSERT INTO chat_messages (ticket_id, sender_id, message, is_internal) VALUES (?, ?, ?, TRUE)',
      [ticketId, agentId, note]
    );
    return result.insertId;
  }

  static async getTicketHistory(ticketId) {
    const [rows] = await pool.execute(
      `SELECT h.*, u.first_name, u.last_name 
       FROM ticket_history h 
       JOIN users u ON h.changed_by = u.id 
       WHERE h.ticket_id = ? 
       ORDER BY h.created_at DESC`,
      [ticketId]
    );
    return rows;
  }

  static async getOverdueTickets() {
    const [rows] = await pool.execute(
      `SELECT t.*, 
              c.first_name as customer_first_name, c.last_name as customer_last_name, c.email as customer_email,
              a.first_name as agent_first_name, a.last_name as agent_last_name, a.email as agent_email
       FROM tickets t 
       JOIN users c ON t.customer_id = c.id 
       LEFT JOIN users a ON t.assigned_agent_id = a.id 
       WHERE t.sla_deadline < NOW() AND t.status NOT IN ('resolved', 'closed')
       ORDER BY t.priority DESC, t.sla_deadline ASC`
    );
    return rows;
  }
}

module.exports = Ticket;