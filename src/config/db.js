const mysql = require('mysql2');
const dotenv = require('dotenv');

dotenv.config();

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',      
    password: '',      
    database: 'fitmate_db', 
    waitForConnections: true,
    connectionLimit: 10,
    port: process.env.DB_PORT || 3306,
    queueLimit: 0
    
});

pool.getConnection((err, connection) => {
    if (err) {
        console.error('Database Error:', err.code);
    } else {
        console.log('Terhubung ke Database MySQL: fitmate_db');
        connection.release();
    }
});

module.exports = pool.promise();