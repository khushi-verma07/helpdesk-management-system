const mysql = require('mysql2/promise');

async function testNewEscalation() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '2102',
    database: 'ticketing_system'
  });

  try {
    console.log('🧪 Testing new escalation message logic...\n');
    
    // Simulate adding an escalation message with the fixed logic
    const testTicketId = 1; // Use an existing ticket
    
    // Get the admin who assigned the ticket
    const [adminResult] = await connection.execute(`
      SELECT th.changed_by, u.first_name, u.last_name, u.role
      FROM ticket_history th
      JOIN users u ON th.changed_by = u.id
      WHERE th.ticket_id = ? AND th.field_name = 'assigned_agent_id' AND u.role = 'admin'
      ORDER BY th.created_at DESC
      LIMIT 1
    `, [testTicketId]);
    
    let assigningAdminId = 3; // Default to Admin User (ID 3)
    let adminName = 'Admin User';
    
    if (adminResult.length > 0) {
      assigningAdminId = adminResult[0].changed_by;
      adminName = `${adminResult[0].first_name} ${adminResult[0].last_name}`;
      console.log(`✅ Found admin who assigned ticket: ${adminName} (ID: ${assigningAdminId})`);
    } else {
      console.log(`ℹ️ No assignment history found, using default admin: ${adminName} (ID: ${assigningAdminId})`);
    }
    
    // Add a test escalation message
    const testMessage = `🚨 ESCALATION: This ticket has exceeded its SLA deadline and requires immediate attention. [TEST MESSAGE]`;
    
    await connection.execute(
      'INSERT INTO chat_messages (ticket_id, sender_id, message, is_internal) VALUES (?, ?, ?, TRUE)',
      [testTicketId, assigningAdminId, testMessage]
    );
    
    console.log(`✅ Added test escalation message for ticket #${testTicketId}`);
    
    // Verify the message was added correctly
    const [newMessage] = await connection.execute(`
      SELECT m.id, m.ticket_id, m.message, m.is_internal, m.created_at,
             u.first_name, u.last_name, u.role
      FROM chat_messages m
      JOIN users u ON m.sender_id = u.id
      WHERE m.message LIKE '%TEST MESSAGE%'
      ORDER BY m.created_at DESC
      LIMIT 1
    `);
    
    if (newMessage.length > 0) {
      const msg = newMessage[0];
      console.log('\n📋 Test escalation message:');
      console.log(`  Ticket #${msg.ticket_id}: "${msg.message}"`);
      console.log(`  Sent by: ${msg.first_name} ${msg.last_name} (${msg.role})`);
      console.log(`  Internal: ${msg.is_internal}`);
      console.log(`  Date: ${msg.created_at}`);
      
      if (msg.role === 'admin') {
        console.log('\n✅ SUCCESS: Escalation message now shows admin instead of customer!');
      } else {
        console.log(`\n❌ ISSUE: Message still shows ${msg.role} instead of admin`);
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await connection.end();
  }
}

testNewEscalation();