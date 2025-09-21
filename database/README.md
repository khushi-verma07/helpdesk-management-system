# Database Setup Instructions

## Prerequisites
- MySQL or MariaDB installed
- MySQL client or phpMyAdmin access

## Setup Steps

1. **Create Database:**
   ```bash
   mysql -u root -p < schema.sql
   ```

2. **Update Backend Environment:**
   - Edit `backend/.env` file
   - Set your database credentials:
     ```
     DB_HOST=localhost
     DB_USER=your_username
     DB_PASSWORD=your_password
     DB_NAME=ticketing_system
     ```

## Default Credentials
- **Admin User:** admin@ticketing.com / admin123

## Database Structure
- `users` - Customer, Agent, Admin accounts
- `tickets` - Support tickets with SLA tracking
- `chat_messages` - Real-time chat history
- `sla_rules` - Priority-based resolution times
- `ticket_history` - Audit trail for changes