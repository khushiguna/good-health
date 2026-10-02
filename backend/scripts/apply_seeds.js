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
    const seedsPath = path.join(__dirname, '../seeds/category_tasks.sql');
    const seeds = fs.readFileSync(seedsPath, 'utf8');
    await conn.query(seeds);
    console.log("Seeds applied.");
    process.exit(0);
}
run().catch(console.error);
