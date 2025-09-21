const pool = require('../config/database');

const getDashboardMetrics = async (req, res) => {
  try {
    // Get basic ticket counts
    const [ticketCounts] = await pool.execute(`
      SELECT 
        COUNT(*) as total_tickets,
        SUM(CASE WHEN status IN ('open', 'in_progress', 'on_hold') THEN 1 ELSE 0 END) as open_tickets,
        SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) as resolved_tickets,
        SUM(CASE WHEN status = 'closed' THEN 1 ELSE 0 END) as closed_tickets,
        SUM(CASE WHEN sla_deadline < NOW() AND status NOT IN ('resolved', 'closed') THEN 1 ELSE 0 END) as sla_breaches
      FROM tickets
    `);

    // Get average resolution time
    const [avgResolution] = await pool.execute(`
      SELECT 
        AVG(TIMESTAMPDIFF(HOUR, created_at, resolved_at)) as avg_resolution_hours
      FROM tickets 
      WHERE resolved_at IS NOT NULL
    `);

    // Get monthly ticket counts for last 6 months
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

    // Get priority breakdown
    const [priorityData] = await pool.execute(`
      SELECT 
        priority,
        COUNT(*) as count,
        SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) as resolved_count
      FROM tickets 
      GROUP BY priority
    `);

    res.json({
      metrics: ticketCounts[0],
      avgResolutionHours: avgResolution[0]?.avg_resolution_hours || 0,
      monthlyData,
      priorityData
    });
  } catch (error) {
    console.error('Error fetching dashboard metrics:', error);
    res.status(500).json({ 
      message: 'Failed to fetch dashboard metrics', 
      error: error.message 
    });
  }
};

module.exports = {
  getDashboardMetrics
};