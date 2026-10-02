const mysql = require('mysql2/promise');
async function run() {
    const conn = await mysql.createConnection({ host: 'localhost', user: 'root', password: '' });
    await conn.query('USE good_health_db;');
    
    const tables = ['tasks_food', 'tasks_exercise', 'tasks_mental', 'tasks_sleep', 'tasks_habits'];
    console.log("=== COUNTS PER TABLE & CONDITION ===");
    for (const t of tables) {
        const [rows] = await conn.query(`SELECT condition_key, COUNT(*) as cnt FROM ${t} GROUP BY condition_key`);
        console.log(`\nTable ${t}:`);
        console.table(rows);
    }
    process.exit(0);
}
run();
