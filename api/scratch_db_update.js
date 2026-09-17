const pool = require('./db');

async function main() {
  try {
    console.log("Creating proposal_interests table...");
    await pool.query(`
      CREATE TABLE IF NOT EXISTS proposal_interests (
          id SERIAL PRIMARY KEY,
          proposal_id INTEGER REFERENCES proposals(id) ON DELETE CASCADE,
          interested_name VARCHAR(255) NOT NULL,
          interested_email VARCHAR(255) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("Table created successfully.");
  } catch (error) {
    console.error("Error creating table:", error);
  } finally {
    await pool.end();
  }
}

main();
