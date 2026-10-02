const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function run() {
    const conn = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '',
        multipleStatements: true
    });
    await conn.query('USE good_health_db;');
    
    const sqlPath = path.join(__dirname, '../seeds/all_suggestions.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    await conn.query(sql);
    console.log("Suggestions inserted!");
    process.exit(0);
}
run().catch(console.error);
