/**
 * Good Health and Well-Being - MySQL Connection Pool
 * Robust connection manager with graceful fallback when MySQL is offline.
 */

const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'good_health_db',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

let pool = null;
let isConnected = false;

// In-Memory Fallback Store (ensures app operates even if MySQL server is not locally running)
const memoryStore = {
  custom_tasks: [
    { id: 'custom_seed_1', user_id: null, category: 'general', condition_key: 'general', name: 'Morning 20m Yoga', tip: 'Improves body flexibility, posture, and decreases morning stiffness', icon: '🧘', is_active: 1, created_at: new Date() },
    { id: 'custom_seed_2', user_id: null, category: 'general', condition_key: 'general', name: 'Drink Herbal Green Tea', tip: 'Boosts cellular antioxidants and supports digestive metabolism', icon: '🍵', is_active: 1, created_at: new Date() },
    { id: 'custom_seed_3', user_id: null, category: 'general', condition_key: 'general', name: 'Digital Detox After 9 PM', tip: 'Enhances deep REM sleep restorative recovery', icon: '🌙', is_active: 1, created_at: new Date() }
  ],
  users: [],
  contact_messages: [],
  task_completions: []
};

async function initDB() {
  try {
    pool = mysql.createPool(dbConfig);
    const conn = await pool.getConnection();
    console.log(`[MySQL DB]: Connected successfully to MySQL database "${dbConfig.database}" on ${dbConfig.host}:${dbConfig.port}`);
    isConnected = true;
    conn.release();
  } catch (err) {
    isConnected = false;
    console.warn(`[MySQL DB Warning]: Could not connect to MySQL server (${err.message}).`);
    console.warn(`[MySQL DB Fallback]: Application is operating in resilient In-Memory Mode with active REST APIs.`);
  }
}

function getPool() {
  return pool;
}

function getIsConnected() {
  return isConnected;
}

function getMemoryStore() {
  return memoryStore;
}

module.exports = {
  initDB,
  getPool,
  getIsConnected,
  getMemoryStore
};
