const mysql = require('mysql2');
require('dotenv').config();

const connection = mysql.createConnection({
  host: process.env.MASTER_DB_HOST,
  user: process.env.MASTER_DB_USER,
  password: process.env.MASTER_DB_PASSWORD,
  database: process.env.MASTER_DB_NAME,
  port: process.env.MASTER_DB_PORT
});

connection.query('SELECT ID, BANK_NAME, BANK_LOGO FROM bank_master', (err, results) => {
  if (err) {
    console.error('Error:', err);
  } else {
    console.log('Results:', JSON.stringify(results, null, 2));
  }
  connection.end();
});
