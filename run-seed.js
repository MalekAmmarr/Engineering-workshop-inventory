const { Client } = require('pg');
const fs = require('fs');
require('dotenv').config();

// Database configuration
const client = new Client({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// Paths to SQL files
const tableCreationFile = './backend/config/scripts.sql';
const seedFile = './backend/config/seed.sql';

const runSQLFile = async (filePath) => {
  const query = fs.readFileSync(filePath, 'utf8');
  await client.query(query);
};

const runSeed = async () => {
  try {
    await client.connect();
    console.log('✅ Connected to the database.');

    // Run table creation first
    console.log('🚧 Creating tables...');
    await runSQLFile(tableCreationFile);
    console.log('✅ Tables created successfully.');

    // Run seed data
    console.log('🚧 Inserting seed data...');
    await runSQLFile(seedFile);
    console.log('✅ Seed data inserted successfully!');
  } catch (err) {
    console.error('❌ Error running SQL file:', err.message);
  } finally {
    await client.end();
    console.log('🔌 Database connection closed.');
  }
};

runSeed();
