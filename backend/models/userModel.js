const db = require('../config/db');

const User = {
  create: async (userData) => {
    const { name, email, password } = userData;
    const query = 'INSERT INTO users (name, email, password) VALUES (?, ?, ?)';
    const [result] = await db.execute(query, [name, email, password]);
    return result.insertId;
  },

  findByEmail: async (email) => {
    const query = 'SELECT * FROM users WHERE email = ?';
    const [rows] = await db.execute(query, [email]);
    return rows[0];
  },

  findById: async (id) => {
    const query = 'SELECT id, name, email, college, branch, graduation_year, skills, github, linkedin, resume_link, created_at FROM users WHERE id = ?';
    const [rows] = await db.execute(query, [id]);
    return rows[0];
  },

  update: async (id, updateData) => {
    const { name, college, branch, graduation_year, skills, github, linkedin, resume_link } = updateData;
    const query = `
      UPDATE users 
      SET name = ?, college = ?, branch = ?, graduation_year = ?, skills = ?, github = ?, linkedin = ?, resume_link = ?
      WHERE id = ?
    `;
    const [result] = await db.execute(query, [
      name, college || null, branch || null, graduation_year || null, skills || null, github || null, linkedin || null, resume_link || null, id
    ]);
    return result.affectedRows;
  }
};

module.exports = User;
