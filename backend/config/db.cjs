const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER || 'assura_user',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'assura',
  password: process.env.DB_PASS || 'Gce6pmd040915+',
  port: process.env.DB_PORT || 5432,
  ssl: process.env.DB_HOST ? { rejectUnauthorized: false } : false,
});

module.exports = pool;
