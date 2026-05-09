const mysql = require('mysql2');

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: '2410511069_TarakaZubairGama',
    waitForConnections: true,
    connectionLimit: 10,
});