const mysql = require('mysql2');

const pool = mysql.createPool({
    host: 'localhost',
    user: 'mahasiswa',
    password: 'akucintafik',
    database: '2410511069_TarakaZubairGama',
    waitForConnections: true,
    connectionLimit: 10,
});

module.exports = pool.promise();