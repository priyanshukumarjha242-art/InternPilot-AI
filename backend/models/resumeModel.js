const db = require('../config/db');

const Resume = {
  create: async (resumeData) => {
    const { user_id, name, description, content, analysis } = resumeData;
    const query = `
      INSERT INTO resumes (user_id, name, description, content, analysis) 
      VALUES (?, ?, ?, ?, ?)
    `;
    const [result] = await db.execute(query, [user_id, name, description || null, content || null, analysis || null]);
    return result.insertId;
  },

  findByUserId: async (user_id) => {
    const query = 'SELECT id, user_id, name, description, analysis, created_at FROM resumes WHERE user_id = ? ORDER BY created_at DESC';
    // Not selecting content by default for list views to save memory
    const [rows] = await db.execute(query, [user_id]);
    return rows;
  },

  findByIdAndUserId: async (id, user_id) => {
    const query = 'SELECT * FROM resumes WHERE id = ? AND user_id = ?';
    const [rows] = await db.execute(query, [id, user_id]);
    return rows[0];
  },

  update: async (id, user_id, updateData) => {
    const { name, description, content, analysis } = updateData;
    const query = `
      UPDATE resumes 
      SET name = ?, description = ?, content = ?, analysis = ? 
      WHERE id = ? AND user_id = ?
    `;
    const [result] = await db.execute(query, [name, description || null, content || null, analysis || null, id, user_id]);
    return result.affectedRows;
  },

  delete: async (id, user_id) => {
    const query = 'DELETE FROM resumes WHERE id = ? AND user_id = ?';
    const [result] = await db.execute(query, [id, user_id]);
    return result.affectedRows;
  }
};

module.exports = Resume;
