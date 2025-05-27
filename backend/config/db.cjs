const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'Assura',
  password: '0409156',
  port: 5432,
});

module.exports = pool;
