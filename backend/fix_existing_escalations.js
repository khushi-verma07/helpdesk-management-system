const mysql = require('mysql2/promise');

async function fixExistingEscalations() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '2102',
    database: 'ticketing_system'
  });

  try {
    console.log('🔧 Fixing existing escalation messages...\n');
    
    // Find all escalation messages that have wrong sender_id
    const [escalationMessages] = await connection.execute(`
      SELECT m.id, m.ticket_id, m.sender_id
      FROM chat_messages m
      WHERE m.message LIKE '%ESCALATION%' AND m.is_internal = TRUE
    `);
    
    console.log(`Found ${escalationMessages.length} escalation messages to fix`);
    
    for (const msg of escalationMessages) {
      // Find the admin who assigned this ticket
      const [adminResult] = await connection.execute(`
        SELECT th.changed_by
        FROM ticket_history th
        JOIN users u ON th.changed_by = u.id
        WHERE th.ticket_id = ? AND th.field_name = 'assigned_agent_id' AND u.role = 'admin'
        ORDER BY th.created_at DESC
        LIMIT 1
      `, [msg.ticket_id]);
      
      let correctAdminId = 3; // Default admin
      if (adminResult.length > 0) {
        correctAdminId = adminResult[0].changed_by;
      }
      
      // Update the message sender_id
      await connection.execute(
        'UPDATE chat_messages SET sender_id = ? WHERE id = ?',
        [correctAdminId, msg.id]
      );
      
      console.log(`✅ Fixed escalation message for ticket #${msg.ticket_id} - changed sender from ${msg.sender_id} to ${correctAdminId}`);
    }
    
    console.log('\n✅ All existing escalation messages have been fixed!');
    
  } catch (error) {
    console.error('❌ Fix failed:', error.message);
  } finally {
    await connection.end();
  }
}

fixExistingEscalations();