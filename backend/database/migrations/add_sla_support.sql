-- Add SLA support to tickets table
ALTER TABLE tickets ADD COLUMN is_overdue BOOLEAN DEFAULT FALSE;

-- Create SLA rules table
CREATE TABLE IF NOT EXISTS sla_rules (
  id INT PRIMARY KEY AUTO_INCREMENT,
  priority ENUM('low', 'medium', 'high') NOT NULL UNIQUE,
  resolution_hours INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert default SLA rules
INSERT INTO sla_rules (priority, resolution_hours) VALUES
('high', 4),    -- 4 hours for high priority
('medium', 24), -- 24 hours for medium priority  
('low', 72)     -- 72 hours for low priority
ON DUPLICATE KEY UPDATE resolution_hours = VALUES(resolution_hours);

-- Create escalation log table
CREATE TABLE IF NOT EXISTS escalations (
  id INT PRIMARY KEY AUTO_INCREMENT,
  ticket_id INT NOT NULL,
  escalation_type ENUM('overdue', 'priority_change', 'manual') NOT NULL,
  escalated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  escalated_by INT,
  notes TEXT,
  FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE,
  FOREIGN KEY (escalated_by) REFERENCES users(id) ON DELETE SET NULL
);