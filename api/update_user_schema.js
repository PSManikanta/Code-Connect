const pool = require('./db');

async function main() {
  try {
    console.log("Updating users table schema for profile fields...");
    
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT DEFAULT ''`);
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS role_title VARCHAR(255) DEFAULT ''`);
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS skills JSONB DEFAULT '[]'::jsonb`);
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS github_url VARCHAR(255) DEFAULT ''`);
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS linkedin_url VARCHAR(255) DEFAULT ''`);
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS experience_level VARCHAR(50) DEFAULT 'Intermediate'`);

    console.log("User table schema updated successfully.");
  } catch (error) {
    console.error("Error updating user table schema:", error);
  } finally {
    await pool.end();
  }
}

main();
