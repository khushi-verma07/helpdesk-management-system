const axios = require('axios');

async function testDashboard() {
  try {
    // Login as admin
    console.log('Logging in as admin...');
    const loginResponse = await axios.post('http://localhost:9000/api/auth/login', {
      email: 'admin@test.com',
      password: 'admin123'
    });
    
    const token = loginResponse.data.token;
    console.log('Login successful!');
    
    // Test dashboard API
    console.log('\nFetching dashboard data...');
    const dashboardResponse = await axios.get('http://localhost:9000/api/analytics/dashboard', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const data = dashboardResponse.data;
    console.log('\nDashboard Data:');
    console.log('================');
    console.log(`Total Tickets: ${data.metrics.total_tickets}`);
    console.log(`Open Tickets: ${data.metrics.open_tickets}`);
    console.log(`Resolved Tickets: ${data.metrics.resolved_tickets}`);
    console.log(`SLA Breaches: ${data.metrics.sla_breaches}`);
    console.log(`Average Resolution Time: ${data.avgResolutionHours} hours`);
    
    console.log('\nMonthly Data:');
    data.monthlyData.forEach(month => {
      console.log(`  ${month.month}: ${month.ticket_count} created, ${month.resolved_count} resolved`);
    });
    
    console.log('\nPriority Breakdown:');
    data.priorityData.forEach(priority => {
      console.log(`  ${priority.priority.toUpperCase()}: ${priority.count} total, ${priority.resolved_count} resolved`);
    });
    
    console.log('\n✅ Dashboard API is working correctly!');
    console.log('\nTo access the dashboard:');
    console.log('1. Go to http://localhost:59101/login');
    console.log('2. Login with: admin@test.com / admin123');
    console.log('3. Navigate to http://localhost:59101/admin/dashboard');
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testDashboard();