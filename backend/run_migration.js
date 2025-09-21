const fs = require('fs');
const path = require('path');
const pool = require('./src/config/database');

async function runMigration() {
  try {
    const migrationPath = path.join(__dirname, 'database', 'migrations', 'add_sla_support.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');
    
    // Split by semicolon and execute each statement
    const statements = sql.split(';').filter(stmt => stmt.trim());
    
    for (const statement of statements) {
      if (statement.trim()) {
        console.log('Executing:', statement.trim().substring(0, 50) + '...');
        await pool.execute(statement);
      }
    }
    
    console.log('✅ SLA migration completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigration();