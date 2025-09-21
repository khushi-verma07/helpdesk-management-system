const cron = require('node-cron');
const pool = require('../config/database');

class SLAScheduler {
  static start() {
    // Run every 5 minutes to check for overdue tickets
    cron.schedule('*/5 * * * *', async () => {
      console.log('🕐 Running SLA check...');
      await this.checkOverdueTickets();
    });

    console.log('✅ SLA Scheduler started - checking every 5 minutes');
  }

  static async checkOverdueTickets() {
    try {
      // Find tickets that are overdue and not yet flagged
      const [overdueTickets] = await pool.execute(`
        SELECT t.id, t.title, t.priority, t.sla_deadline,
               c.first_name as customer_first_name, c.last_name as customer_last_name,
               a.first_name as agent_first_name, a.last_name as agent_last_name, a.email as agent_email
        FROM tickets t
        JOIN users c ON t.customer_id = c.id
        LEFT JOIN users a ON t.assigned_agent_id = a.id
        WHERE t.sla_deadline < NOW() 
        AND t.status NOT IN ('resolved', 'closed')
        AND (t.is_overdue = FALSE OR t.is_overdue IS NULL)
      `);

      if (overdueTickets.length > 0) {
        console.log(`⚠️ Found ${overdueTickets.length} overdue tickets`);
        
        for (const ticket of overdueTickets) {
          await this.flagAsOverdue(ticket.id);
          await this.notifyStakeholders(ticket);
        }
      }
    } catch (error) {
      console.error('❌ Error checking overdue tickets:', error);
    }
  }

  static async flagAsOverdue(ticketId) {
    await pool.execute(
      'UPDATE tickets SET is_overdue = TRUE, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [ticketId]
    );
    
    // Log the escalation
    await pool.execute(
      'INSERT INTO ticket_history (ticket_id, field_name, new_value, changed_by) VALUES (?, ?, ?, ?)',
      [ticketId, 'escalated', 'overdue', 1] // System user ID = 1
    );
  }

  static async notifyStakeholders(ticket) {
    // In a real system, you would send emails/notifications here
    console.log(`📧 ESCALATION: Ticket #${ticket.id} "${ticket.title}" is overdue`);
    console.log(`   Priority: ${ticket.priority.toUpperCase()}`);
    console.log(`   Customer: ${ticket.customer_first_name} ${ticket.customer_last_name}`);
    console.log(`   Agent: ${ticket.agent_first_name ? `${ticket.agent_first_name} ${ticket.agent_last_name}` : 'Unassigned'}`);
    console.log(`   SLA Deadline: ${ticket.sla_deadline}`);
    
    // Add internal escalation note
    await pool.execute(
      'INSERT INTO chat_messages (ticket_id, sender_id, message, is_internal) VALUES (?, ?, ?, TRUE)',
      [ticket.id, 1, `🚨 ESCALATION: This ticket has exceeded its SLA deadline and requires immediate attention.`]
    );
  }

  static async getOverdueStats() {
    const [result] = await pool.execute(`
      SELECT 
        COUNT(*) as total_overdue,
        SUM(CASE WHEN priority = 'high' THEN 1 ELSE 0 END) as high_priority_overdue,
        SUM(CASE WHEN assigned_agent_id IS NULL THEN 1 ELSE 0 END) as unassigned_overdue
      FROM tickets 
      WHERE is_overdue = TRUE AND status NOT IN ('resolved', 'closed')
    `);
    
    return result[0];
  }
}

module.exports = SLAScheduler;