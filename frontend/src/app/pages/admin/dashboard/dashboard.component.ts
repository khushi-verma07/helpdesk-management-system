import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dashboard-container">
      <div class="dashboard-header">
        <h1>Admin Dashboard</h1>
        <p>Overview of ticket system metrics and performance</p>
      </div>

      <div *ngIf="loading" class="loading">Loading dashboard...</div>
      
      <div *ngIf="!loading && !dashboardData" class="error">
        <p>Failed to load dashboard data. Please check console for errors.</p>
        <button (click)="loadDashboardData()" class="retry-btn">Retry</button>
      </div>

      <div *ngIf="!loading && dashboardData" class="dashboard-content">
        <!-- Key Metrics Cards -->
        <div class="metrics-grid">
          <div class="metric-card">
            <div class="metric-value">{{dashboardData.metrics.total_tickets}}</div>
            <div class="metric-label">Total Tickets</div>
          </div>
          <div class="metric-card">
            <div class="metric-value">{{dashboardData.metrics.open_tickets}}</div>
            <div class="metric-label">Open Tickets</div>
          </div>
          <div class="metric-card">
            <div class="metric-value">{{dashboardData.metrics.resolved_tickets}}</div>
            <div class="metric-label">Resolved Tickets</div>
          </div>
          <div class="metric-card sla-breach">
            <div class="metric-value">{{dashboardData.metrics.sla_breaches}}</div>
            <div class="metric-label">SLA Breaches</div>
          </div>
          <div class="metric-card">
            <div class="metric-value">{{getAvgResolutionTime()}}</div>
            <div class="metric-label">Avg Resolution Time</div>
          </div>
        </div>

        <!-- Charts Section -->
        <div class="charts-section">
          <!-- Monthly Tickets Chart -->
          <div class="chart-card">
            <h3>Monthly Ticket Trends</h3>
            <div class="chart-container">
              <div class="bar-chart">
                <div *ngFor="let month of dashboardData.monthlyData" class="bar-group">
                  <div class="bar-container">
                    <div class="bar created" [style.height.px]="getBarHeight(month.ticket_count, getMaxMonthlyCount())"></div>
                    <div class="bar resolved" [style.height.px]="getBarHeight(month.resolved_count, getMaxMonthlyCount())"></div>
                  </div>
                  <div class="bar-label">{{formatMonth(month.month)}}</div>
                </div>
              </div>
              <div class="chart-legend">
                <div class="legend-item">
                  <div class="legend-color created"></div>
                  <span>Created</span>
                </div>
                <div class="legend-item">
                  <div class="legend-color resolved"></div>
                  <span>Resolved</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Priority Breakdown -->
          <div class="chart-card">
            <h3>Priority Breakdown</h3>
            <div class="priority-stats">
              <div *ngFor="let priority of dashboardData.priorityData" class="priority-item">
                <div class="priority-header">
                  <span class="priority-badge" [class]="'priority-' + priority.priority">
                    {{priority.priority | uppercase}}
                  </span>
                  <span class="priority-count">{{priority.count}} tickets</span>
                </div>
                <div class="priority-bar">
                  <div class="progress-bar">
                    <div class="progress-fill" [style.width.%]="getPriorityPercentage(priority.count)"></div>
                  </div>
                  <span class="resolution-rate">{{getResolutionRate(priority.resolved_count, priority.count)}}% resolved</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Summary Table -->
        <div class="summary-section">
          <div class="summary-card">
            <h3>Performance Summary</h3>
            <table class="summary-table">
              <thead>
                <tr>
                  <th>Metric</th>
                  <th>Value</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Resolution Rate</td>
                  <td>{{getOverallResolutionRate()}}%</td>
                  <td><span class="status-badge" [class]="getResolutionRateStatus()">{{getResolutionRateLabel()}}</span></td>
                </tr>
                <tr>
                  <td>SLA Compliance</td>
                  <td>{{getSLACompliance()}}%</td>
                  <td><span class="status-badge" [class]="getSLAComplianceStatus()">{{getSLAComplianceLabel()}}</span></td>
                </tr>
                <tr>
                  <td>Average Resolution Time</td>
                  <td>{{getAvgResolutionTime()}}</td>
                  <td><span class="status-badge good">Good</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      padding: 2rem;
      max-width: 1400px;
      margin: 0 auto;
    }
    .dashboard-header {
      margin-bottom: 2rem;
    }
    .dashboard-header h1 {
      margin: 0 0 0.5rem 0;
      color: #333;
    }
    .dashboard-header p {
      margin: 0;
      color: #666;
    }
    .loading {
      text-align: center;
      padding: 3rem;
      color: #666;
    }
    .error {
      text-align: center;
      padding: 3rem;
      color: #dc3545;
    }
    .retry-btn {
      background: #007bff;
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      cursor: pointer;
      margin-top: 1rem;
    }
    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }
    .metric-card {
      background: white;
      padding: 1.5rem;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      text-align: center;
    }
    .metric-card.sla-breach {
      background: #fff5f5;
      border-left: 4px solid #dc3545;
    }
    .metric-value {
      font-size: 2.5rem;
      font-weight: bold;
      color: #333;
      margin-bottom: 0.5rem;
    }
    .metric-label {
      color: #666;
      font-size: 0.875rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .charts-section {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 2rem;
      margin-bottom: 2rem;
    }
    .chart-card {
      background: white;
      padding: 1.5rem;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    .chart-card h3 {
      margin: 0 0 1rem 0;
      color: #333;
    }
    .bar-chart {
      display: flex;
      align-items: end;
      gap: 1rem;
      height: 200px;
      margin-bottom: 1rem;
    }
    .bar-group {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .bar-container {
      display: flex;
      align-items: end;
      gap: 2px;
      height: 180px;
    }
    .bar {
      width: 20px;
      min-height: 2px;
      border-radius: 2px 2px 0 0;
    }
    .bar.created {
      background: #007bff;
    }
    .bar.resolved {
      background: #28a745;
    }
    .bar-label {
      font-size: 0.75rem;
      color: #666;
      margin-top: 0.5rem;
      text-align: center;
    }
    .chart-legend {
      display: flex;
      gap: 1rem;
      justify-content: center;
    }
    .legend-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.875rem;
    }
    .legend-color {
      width: 12px;
      height: 12px;
      border-radius: 2px;
    }
    .legend-color.created {
      background: #007bff;
    }
    .legend-color.resolved {
      background: #28a745;
    }
    .priority-stats {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    .priority-item {
      padding: 1rem;
      border: 1px solid #e9ecef;
      border-radius: 4px;
    }
    .priority-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.5rem;
    }
    .priority-badge {
      padding: 0.25rem 0.75rem;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: bold;
    }
    .priority-high { background-color: #f8d7da; color: #721c24; }
    .priority-medium { background-color: #fff3cd; color: #856404; }
    .priority-low { background-color: #d4edda; color: #155724; }
    .priority-count {
      font-weight: 500;
    }
    .priority-bar {
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    .progress-bar {
      flex: 1;
      height: 8px;
      background: #e9ecef;
      border-radius: 4px;
      overflow: hidden;
    }
    .progress-fill {
      height: 100%;
      background: #007bff;
      transition: width 0.3s ease;
    }
    .resolution-rate {
      font-size: 0.875rem;
      color: #666;
      min-width: 80px;
    }
    .summary-section {
      margin-bottom: 2rem;
    }
    .summary-card {
      background: white;
      padding: 1.5rem;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    .summary-card h3 {
      margin: 0 0 1rem 0;
      color: #333;
    }
    .summary-table {
      width: 100%;
      border-collapse: collapse;
    }
    .summary-table th,
    .summary-table td {
      padding: 0.75rem;
      text-align: left;
      border-bottom: 1px solid #e9ecef;
    }
    .summary-table th {
      background: #f8f9fa;
      font-weight: 600;
      color: #495057;
    }
    .status-badge {
      padding: 0.25rem 0.75rem;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 500;
    }
    .status-badge.good {
      background: #d4edda;
      color: #155724;
    }
    .status-badge.warning {
      background: #fff3cd;
      color: #856404;
    }
    .status-badge.danger {
      background: #f8d7da;
      color: #721c24;
    }
    @media (max-width: 768px) {
      .charts-section {
        grid-template-columns: 1fr;
      }
      .metrics-grid {
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      }
    }
  `]
})
export class DashboardComponent implements OnInit {
  dashboardData: any = null;
  loading = true;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    console.log('Loading dashboard data from:', `${environment.apiUrl}/analytics/dashboard`);
    this.http.get(`${environment.apiUrl}/analytics/dashboard`).subscribe({
      next: (data) => {
        console.log('Dashboard data loaded successfully:', data);
        this.dashboardData = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Failed to load dashboard data:', error);
        console.error('Status:', error.status);
        console.error('Message:', error.message);
        console.error('Full error:', error);
        this.loading = false;
      }
    });
  }

  getAvgResolutionTime(): string {
    const hours = this.dashboardData?.avgResolutionHours || 0;
    if (hours < 1) return '< 1 hour';
    if (hours < 24) return `${Math.round(hours)} hours`;
    return `${Math.round(hours / 24)} days`;
  }

  getMaxMonthlyCount(): number {
    return Math.max(...this.dashboardData.monthlyData.map((m: any) => m.ticket_count));
  }

  getBarHeight(value: number, max: number): number {
    return Math.max(2, (value / max) * 160);
  }

  formatMonth(month: string): string {
    const [year, monthNum] = month.split('-');
    const date = new Date(parseInt(year), parseInt(monthNum) - 1);
    return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
  }

  getPriorityPercentage(count: number): number {
    const total = this.dashboardData.metrics.total_tickets;
    return total > 0 ? (count / total) * 100 : 0;
  }

  getResolutionRate(resolved: number, total: number): number {
    return total > 0 ? Math.round((resolved / total) * 100) : 0;
  }

  getOverallResolutionRate(): number {
    const { resolved_tickets, total_tickets } = this.dashboardData.metrics;
    return total_tickets > 0 ? Math.round((resolved_tickets / total_tickets) * 100) : 0;
  }

  getSLACompliance(): number {
    const { total_tickets, sla_breaches } = this.dashboardData.metrics;
    return total_tickets > 0 ? Math.round(((total_tickets - sla_breaches) / total_tickets) * 100) : 100;
  }

  getResolutionRateStatus(): string {
    const rate = this.getOverallResolutionRate();
    if (rate >= 80) return 'good';
    if (rate >= 60) return 'warning';
    return 'danger';
  }

  getResolutionRateLabel(): string {
    const rate = this.getOverallResolutionRate();
    if (rate >= 80) return 'Excellent';
    if (rate >= 60) return 'Good';
    return 'Needs Improvement';
  }

  getSLAComplianceStatus(): string {
    const compliance = this.getSLACompliance();
    if (compliance >= 95) return 'good';
    if (compliance >= 85) return 'warning';
    return 'danger';
  }

  getSLAComplianceLabel(): string {
    const compliance = this.getSLACompliance();
    if (compliance >= 95) return 'Excellent';
    if (compliance >= 85) return 'Good';
    return 'Critical';
  }
}