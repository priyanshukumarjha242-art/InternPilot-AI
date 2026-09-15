import React, { useState, useEffect, useContext } from 'react';
import Layout from '../components/Layout';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';

function Profile() {
  const { user, setUser } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    college: '',
    branch: '',
    graduation_year: '',
    skills: '',
    github: '',
    linkedin: '',
    resume_link: ''
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        college: user.college || '',
        branch: user.branch || '',
        graduation_year: user.graduation_year || '',
        skills: user.skills || '',
        github: user.github || '',
        linkedin: user.linkedin || '',
        resume_link: user.resume_link || ''
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    try {
      const res = await api.put('/users/profile', formData);
      setUser(res.data);
      setMessage('Profile updated successfully!');
    } catch (err) {
      setError('Failed to update profile');
      console.error(err);
    }
  };

  return (
    <Layout>
      <div className="profile-container">
        <h2>My Profile</h2>
        <p className="subtitle">Update your personal and academic details.</p>

        {message && <div className="success-msg">{message}</div>}
        {error && <div className="error-msg">{error}</div>}

        <form onSubmit={handleSubmit} className="profile-form">
          <div className="form-row">
            <div className="form-group">
              <label>Full Name</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Email (cannot be changed)</label>
              <input type="email" name="email" value={formData.email} disabled />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>College/University</label>
              <input type="text" name="college" value={formData.college} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Branch/Major</label>
              <input type="text" name="branch" value={formData.branch} onChange={handleChange} />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Graduation Year</label>
              <input type="number" name="graduation_year" value={formData.graduation_year} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Skills (comma separated)</label>
              <input type="text" name="skills" value={formData.skills} onChange={handleChange} />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>GitHub Link</label>
              <input type="url" name="github" value={formData.github} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>LinkedIn Link</label>
              <input type="url" name="linkedin" value={formData.linkedin} onChange={handleChange} />
            </div>
          </div>

          <div className="form-group">
            <label>Resume Link (Google Drive, etc.)</label>
            <input type="url" name="resume_link" value={formData.resume_link} onChange={handleChange} />
          </div>

          <button type="submit" className="btn-primary" style={{ width: 'auto' }}>Save Changes</button>
        </form>
      </div>
    </Layout>
  );
}

export default Profile;
