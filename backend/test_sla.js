const pool = require('./src/config/database');

async function testSLA() {
  console.log('🧪 Testing SLA System...\n');

  try {
    // 1. Check if SLA tables exist
    console.log('1. Checking SLA tables...');
    const [slaRules] = await pool.execute('SELECT * FROM sla_rules');
    console.log('✅ SLA Rules:', slaRules);

    // 2. Check existing tickets with SLA deadlines
    console.log('\n2. Checking tickets with SLA deadlines...');
    const [tickets] = await pool.execute(`
      SELECT id, title, priority, created_at, sla_deadline, 
             CASE WHEN sla_deadline < NOW() THEN 'OVERDUE' ELSE 'OK' END as status
      FROM tickets 
      ORDER BY created_at DESC 
      LIMIT 5
    `);
    console.log('📋 Recent tickets:');
    tickets.forEach(t => {
      console.log(`   #${t.id}: ${t.title} (${t.priority}) - ${t.status}`);
      console.log(`        Deadline: ${t.sla_deadline}`);
    });

    // 3. Create a test overdue ticket
    console.log('\n3. Creating test overdue ticket...');
    const pastDate = new Date();
    pastDate.setHours(pastDate.getHours() - 1); // 1 hour ago
    
    const [result] = await pool.execute(`
      INSERT INTO tickets (title, description, customer_id, priority, sla_deadline) 
      VALUES ('TEST OVERDUE TICKET', 'This is a test overdue ticket', 1, 'high', ?)
    `, [pastDate]);
    
    console.log(`✅ Created test ticket #${result.insertId} (overdue)`);

    // 4. Check overdue tickets
    console.log('\n4. Checking overdue tickets...');
    const [overdue] = await pool.execute(`
      SELECT id, title, priority, sla_deadline 
      FROM tickets 
      WHERE sla_deadline < NOW() AND status NOT IN ('resolved', 'closed')
    `);
    
    console.log(`🚨 Found ${overdue.length} overdue tickets:`);
    overdue.forEach(t => {
      console.log(`   #${t.id}: ${t.title} (${t.priority})`);
    });

    console.log('\n✅ SLA System Test Complete!');
    console.log('\n📝 To see it in action:');
    console.log('   1. Start backend: npm start');
    console.log('   2. Start frontend: ng serve');
    console.log('   3. Login as admin and go to /admin/tickets');
    console.log('   4. Look for red "overdue" badge and red deadlines');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    process.exit(0);
  }
}

testSLA();