import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { promises as fs } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let db = null;

export async function initializeDatabase() {
  try {
    // 确保数据目录存在
    const dataDir = join(__dirname, '../../data');
    await fs.mkdir(dataDir, { recursive: true });
    
    const dbPath = process.env.DATABASE_PATH || join(dataDir, 'etf-dashboard.db');
    
    return new Promise((resolve, reject) => {
      db = new sqlite3.Database(dbPath, (err) => {
        if (err) {
          console.error('❌ Database connection error:', err);
          reject(err);
          return;
        }
        
        console.log('✅ Connected to SQLite database');
        
        // 创建表
        createTables()
          .then(() => {
            console.log('📋 Database tables initialized');
            resolve(db);
          })
          .catch(reject);
      });
    });
  } catch (error) {
    console.error('❌ Database initialization error:', error);
    throw error;
  }
}

async function createTables() {
  return new Promise((resolve, reject) => {
    const createHistoryTable = `
      CREATE TABLE IF NOT EXISTS etf_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        symbol TEXT NOT NULL,
        date TEXT NOT NULL,
        daily_inflow REAL,
        total_assets REAL,
        market_ratio REAL,
        cumulative_inflow REAL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(symbol, date)
      )
    `;

    const createCacheTable = `
      CREATE TABLE IF NOT EXISTS api_cache (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        cache_key TEXT UNIQUE NOT NULL,
        data TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        expires_at DATETIME NOT NULL
      )
    `;

    db.serialize(() => {
      db.run(createHistoryTable, (err) => {
        if (err) {
          console.error('Error creating history table:', err);
          reject(err);
          return;
        }
      });

      db.run(createCacheTable, (err) => {
        if (err) {
          console.error('Error creating cache table:', err);
          reject(err);
          return;
        }
        resolve();
      });
    });
  });
}

export function getDatabase() {
  return db;
}

export async function saveHistoryData(symbol, data) {
  return new Promise((resolve, reject) => {
    const stmt = db.prepare(`
      INSERT OR REPLACE INTO etf_history 
      (symbol, date, daily_inflow, total_assets, market_ratio, cumulative_inflow)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    stmt.run([
      symbol,
      new Date().toISOString().split('T')[0],
      data.dailyInflow,
      data.totalAssets,
      data.marketRatio,
      data.cumulativeInflow
    ], function(err) {
      if (err) {
        reject(err);
        return;
      }
      resolve(this.lastID);
    });

    stmt.finalize();
  });
}

export async function getHistoryData(symbol, days = 30) {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT * FROM etf_history 
      WHERE symbol = ? 
      ORDER BY date DESC 
      LIMIT ?
    `;

    db.all(query, [symbol.toUpperCase(), days], (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(rows);
    });
  });
}