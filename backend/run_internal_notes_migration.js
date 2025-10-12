const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '2102',
    database: 'ticketing_system'
  });

  try {
    console.log('🔄 Running internal notes migration...');
    
    const migrationPath = path.join(__dirname, 'database', 'migrations', 'add_internal_notes.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    const statements = migrationSQL.split(';').filter(stmt => stmt.trim());
    
    for (const statement of statements) {
      if (statement.trim()) {
        await connection.execute(statement);
        console.log('✅ Executed:', statement.trim().substring(0, 50) + '...');
      }
    }
    
    console.log('✅ Internal notes migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
  } finally {
    await connection.end();
  }
}

runMigration();