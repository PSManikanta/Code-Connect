const pool = require('./db');

async function main() {
  try {
    console.log("Adding missing columns to proposals table...");
    await pool.query(`ALTER TABLE proposals ADD COLUMN IF NOT EXISTS tags JSONB DEFAULT '[]'::jsonb`);
    await pool.query(`ALTER TABLE proposals ADD COLUMN IF NOT EXISTS role_requirements VARCHAR(255)`);
    console.log("Columns added successfully.");
  } catch (error) {
    console.error("Error adding columns:", error);
  } finally {
    await pool.end();
  }
}

main();
