const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const path = require('path');

// Open the SQLite database
const dbPromise = open({
  filename: path.join(__dirname, '../internpilot.sqlite'),
  driver: sqlite3.Database
});

// Auto-initialize the tables on startup so the user doesn't have to do anything manually!
const initDb = async () => {
  const db = await dbPromise;
  
  // Enable foreign keys
  await db.exec('PRAGMA foreign_keys = ON;');

  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        college TEXT,
        branch TEXT,
        graduation_year INTEGER,
        skills TEXT,
        github TEXT,
        linkedin TEXT,
        resume_link TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS applications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        company_name TEXT NOT NULL,
        role TEXT NOT NULL,
        application_date DATE NOT NULL,
        deadline DATE,
        status TEXT DEFAULT 'Applied',
        location TEXT,
        job_link TEXT,
        notes TEXT,
        job_description TEXT,
        cover_letter TEXT,
        follow_up_date DATE,
        follow_up_completed INTEGER DEFAULT 0,
        ai_match_score INTEGER,
        ai_match_data TEXT,
        ai_interview_prep TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS interviews (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        application_id INTEGER NOT NULL,
        type TEXT NOT NULL,
        date DATETIME NOT NULL,
        status TEXT DEFAULT 'Scheduled',
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS resumes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        content TEXT,
        analysis TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  // Safe migrations for existing databases
  try { await db.exec(`ALTER TABLE applications ADD COLUMN job_description TEXT`); } catch(e) { /* ignore if exists */ }
  try { await db.exec(`ALTER TABLE applications ADD COLUMN cover_letter TEXT`); } catch(e) { /* ignore if exists */ }
  try { await db.exec(`ALTER TABLE applications ADD COLUMN follow_up_date DATE`); } catch(e) { /* ignore if exists */ }
  try { await db.exec(`ALTER TABLE applications ADD COLUMN follow_up_completed INTEGER DEFAULT 0`); } catch(e) { /* ignore if exists */ }
  try { await db.exec(`ALTER TABLE applications ADD COLUMN ai_match_score INTEGER`); } catch(e) { /* ignore if exists */ }
  try { await db.exec(`ALTER TABLE applications ADD COLUMN ai_match_data TEXT`); } catch(e) { /* ignore if exists */ }
  try { await db.exec(`ALTER TABLE applications ADD COLUMN ai_interview_prep TEXT`); } catch(e) { /* ignore if exists */ }
};
initDb().catch(console.error);

// Wrapper that mimics the mysql2 connection pool API so we don't have to rewrite the models
const dbWrapper = {
  execute: async (query, params = []) => {
    const db = await dbPromise;
    const isSelect = query.trim().toUpperCase().startsWith('SELECT');
    
    if (isSelect) {
      const rows = await db.all(query, params);
      return [rows]; // mysql2 returns [rows, fields]
    } else {
      const result = await db.run(query, params);
      return [{
        insertId: result.lastID,
        affectedRows: result.changes
      }];
    }
  }
};

module.exports = dbWrapper;
