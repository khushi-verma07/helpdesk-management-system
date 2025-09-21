const pool = require('./src/config/database');

async function testAnalytics() {
  console.log('🧪 Testing Analytics Queries...\n');

  try {
    // Test basic metrics
    console.log('1. Testing basic ticket metrics...');
    const [ticketCounts] = await pool.execute(`
      SELECT 
        COUNT(*) as total_tickets,
        SUM(CASE WHEN status IN ('open', 'in_progress', 'on_hold') THEN 1 ELSE 0 END) as open_tickets,
        SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) as resolved_tickets,
        SUM(CASE WHEN status = 'closed' THEN 1 ELSE 0 END) as closed_tickets,
        SUM(CASE WHEN sla_deadline < NOW() AND status NOT IN ('resolved', 'closed') THEN 1 ELSE 0 END) as sla_breaches
      FROM tickets
    `);
    console.log('✅ Ticket Metrics:', ticketCounts[0]);

    // Test average resolution time
    console.log('\n2. Testing average resolution time...');
    const [avgResolution] = await pool.execute(`
      SELECT 
        AVG(TIMESTAMPDIFF(HOUR, created_at, resolved_at)) as avg_resolution_hours
      FROM tickets 
      WHERE resolved_at IS NOT NULL
    `);
    console.log('✅ Avg Resolution:', avgResolution[0]);

    // Test monthly data
    console.log('\n3. Testing monthly ticket data...');
    const [monthlyData] = await pool.execute(`
      SELECT 
        DATE_FORMAT(created_at, '%Y-%m') as month,
        COUNT(*) as ticket_count,
        SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) as resolved_count
      FROM tickets 
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
      GROUP BY DATE_FORMAT(created_at, '%Y-%m')
      ORDER BY month DESC
    `);
    console.log('✅ Monthly Data:', monthlyData);

    // Test priority breakdown
    console.log('\n4. Testing priority breakdown...');
    const [priorityData] = await pool.execute(`
      SELECT 
        priority,
        COUNT(*) as count,
        SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) as resolved_count
      FROM tickets 
      GROUP BY priority
    `);
    console.log('✅ Priority Data:', priorityData);

    console.log('\n✅ All analytics queries working correctly!');
    console.log('\n📊 Dashboard should show:');
    console.log(`   - ${ticketCounts[0].total_tickets} total tickets`);
    console.log(`   - ${ticketCounts[0].open_tickets} open tickets`);
    console.log(`   - ${ticketCounts[0].resolved_tickets} resolved tickets`);
    console.log(`   - ${ticketCounts[0].sla_breaches} SLA breaches`);
    console.log(`   - ${monthlyData.length} months of data`);
    console.log(`   - ${priorityData.length} priority levels`);

  } catch (error) {
    console.error('❌ Analytics test failed:', error.message);
  } finally {
    process.exit(0);
  }
}

testAnalytics();