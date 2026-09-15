const db = require('../config/db');

const Application = {
  create: async (appData) => {
    const { user_id, company_name, role, application_date, deadline, status, location, job_link, notes, job_description } = appData;
    const query = `
      INSERT INTO applications 
      (user_id, company_name, role, application_date, deadline, status, location, job_link, notes, job_description) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const [result] = await db.execute(query, [
      user_id, company_name, role, application_date, deadline || null, status || 'Applied', location || null, job_link || null, notes || null, job_description || null
    ]);
    return result.insertId;
  },

  findByUserId: async (user_id) => {
    const query = 'SELECT * FROM applications WHERE user_id = ? ORDER BY application_date DESC';
    const [rows] = await db.execute(query, [user_id]);
    return rows;
  },

  findByIdAndUserId: async (id, user_id) => {
    const query = 'SELECT * FROM applications WHERE id = ? AND user_id = ?';
    const [rows] = await db.execute(query, [id, user_id]);
    return rows[0];
  },

  update: async (id, user_id, updateData) => {
    const { company_name, role, application_date, deadline, status, location, job_link, notes, job_description, follow_up_date, follow_up_completed } = updateData;
    
    // We only update fields provided or null
    let query = `
      UPDATE applications 
      SET company_name = ?, role = ?, application_date = ?, deadline = ?, status = ?, location = ?, job_link = ?, notes = ?, job_description = ?
    `;
    const params = [
      company_name, role, application_date, deadline || null, status, location || null, job_link || null, notes || null, job_description || null
    ];

    if (follow_up_date !== undefined) {
      query += `, follow_up_date = ?`;
      params.push(follow_up_date || null);
    }
    if (follow_up_completed !== undefined) {
      query += `, follow_up_completed = ?`;
      params.push(follow_up_completed ? 1 : 0);
    }

    query += ` WHERE id = ? AND user_id = ?`;
    params.push(id, user_id);

    const [result] = await db.execute(query, params);
    return result.affectedRows;
  },

  delete: async (id, user_id) => {
    const query = 'DELETE FROM applications WHERE id = ? AND user_id = ?';
    const [result] = await db.execute(query, [id, user_id]);
    return result.affectedRows;
  },

  getStats: async (user_id) => {
    const query = `
      SELECT status, COUNT(*) as count 
      FROM applications 
      WHERE user_id = ? 
      GROUP BY status
    `;
    const [rows] = await db.execute(query, [user_id]);
    return rows;
  },

  saveCoverLetter: async (id, user_id, cover_letter) => {
    const query = `UPDATE applications SET cover_letter = ? WHERE id = ? AND user_id = ?`;
    const [result] = await db.execute(query, [cover_letter, id, user_id]);
    return result.affectedRows;
  },

  saveAIMatch: async (id, user_id, score, match_data) => {
    const query = `UPDATE applications SET ai_match_score = ?, ai_match_data = ? WHERE id = ? AND user_id = ?`;
    const [result] = await db.execute(query, [score, JSON.stringify(match_data), id, user_id]);
    return result.affectedRows;
  },

  saveAIPrep: async (id, user_id, prep_data) => {
    const query = `UPDATE applications SET ai_interview_prep = ? WHERE id = ? AND user_id = ?`;
    const [result] = await db.execute(query, [JSON.stringify(prep_data), id, user_id]);
    return result.affectedRows;
  }
};

module.exports = Application;
