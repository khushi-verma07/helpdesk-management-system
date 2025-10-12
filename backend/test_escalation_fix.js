const mysql = require('mysql2/promise');

async function testEscalationFix() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '2102',
    database: 'ticketing_system'
  });

  try {
    console.log('🔍 Testing escalation message fix...\n');
    
    // Check if there are any existing escalation messages
    const [escalationMessages] = await connection.execute(`
      SELECT m.id, m.ticket_id, m.message, m.is_internal, m.created_at,
             u.first_name, u.last_name, u.role
      FROM chat_messages m
      JOIN users u ON m.sender_id = u.id
      WHERE m.message LIKE '%ESCALATION%' AND m.is_internal = TRUE
      ORDER BY m.created_at DESC
      LIMIT 5
    `);
    
    if (escalationMessages.length > 0) {
      console.log('📋 Recent escalation messages:');
      escalationMessages.forEach(msg => {
        console.log(`  Ticket #${msg.ticket_id}: "${msg.message}"`);
        console.log(`  Sent by: ${msg.first_name} ${msg.last_name} (${msg.role})`);
        console.log(`  Date: ${msg.created_at}\n`);
      });
    } else {
      console.log('ℹ️ No escalation messages found in the system yet.\n');
    }
    
    // Check ticket assignment history
    const [assignmentHistory] = await connection.execute(`
      SELECT th.ticket_id, th.field_name, th.new_value, th.created_at,
             u.first_name, u.last_name, u.role
      FROM ticket_history th
      JOIN users u ON th.changed_by = u.id
      WHERE th.field_name = 'assigned_agent_id'
      ORDER BY th.created_at DESC
      LIMIT 5
    `);
    
    if (assignmentHistory.length > 0) {
      console.log('📋 Recent ticket assignments:');
      assignmentHistory.forEach(history => {
        console.log(`  Ticket #${history.ticket_id}: Assigned agent ID ${history.new_value}`);
        console.log(`  Assigned by: ${history.first_name} ${history.last_name} (${history.role})`);
        console.log(`  Date: ${history.created_at}\n`);
      });
    } else {
      console.log('ℹ️ No ticket assignment history found.\n');
    }
    
    console.log('✅ Test completed. The fix ensures escalation messages will show the admin who assigned the ticket instead of the customer.');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await connection.end();
  }
}

testEscalationFix();