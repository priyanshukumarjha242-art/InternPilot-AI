const db = require('../config/db');

const Interview = {
  create: async (interviewData) => {
    const { application_id, type, date, status, notes } = interviewData;
    const query = `
      INSERT INTO interviews (application_id, type, date, status, notes) 
      VALUES (?, ?, ?, ?, ?)
    `;
    const [result] = await db.execute(query, [application_id, type, date, status || 'Scheduled', notes || null]);
    return result.insertId;
  },

  findByApplicationId: async (application_id) => {
    const query = 'SELECT * FROM interviews WHERE application_id = ? ORDER BY date ASC';
    const [rows] = await db.execute(query, [application_id]);
    return rows;
  },

  findById: async (id) => {
    const query = 'SELECT * FROM interviews WHERE id = ?';
    const [rows] = await db.execute(query, [id]);
    return rows[0];
  },

  update: async (id, updateData) => {
    const { type, date, status, notes } = updateData;
    const query = `
      UPDATE interviews 
      SET type = ?, date = ?, status = ?, notes = ? 
      WHERE id = ?
    `;
    const [result] = await db.execute(query, [type, date, status, notes || null, id]);
    return result.affectedRows;
  },

  delete: async (id) => {
    const query = 'DELETE FROM interviews WHERE id = ?';
    const [result] = await db.execute(query, [id]);
    return result.affectedRows;
  }
};

module.exports = Interview;
