import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import api from '../utils/api';

import { Link } from 'react-router-dom';

function Tracker() {
  const [applications, setApplications] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    company_name: '',
    role: '',
    application_date: '',
    deadline: '',
    status: 'Applied',
    location: '',
    job_link: '',
    notes: '',
    job_description: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [showCLModal, setShowCLModal] = useState(false);
  const [clLoading, setClLoading] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [clError, setClError] = useState('');
  const [editId, setEditId] = useState(null);
  const [selectedAppId, setSelectedAppId] = useState(null);
  const [copyStatus, setCopyStatus] = useState('📋 Copy to Clipboard');

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const res = await api.get('/applications');
      setApplications(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await api.put(`/applications/${editId}`, formData);
      } else {
        await api.post('/applications', formData);
      }
      setShowModal(false);
      setEditId(null);
      setFormData({
        company_name: '', role: '', application_date: '', deadline: '', status: 'Applied', location: '', job_link: '', notes: '', job_description: ''
      });
      fetchApplications();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (app) => {
    setFormData({
      company_name: app.company_name,
      role: app.role,
      application_date: app.application_date.split('T')[0],
      deadline: app.deadline ? app.deadline.split('T')[0] : '',
      status: app.status,
      location: app.location || '',
      job_link: app.job_link || '',
      notes: app.notes || '',
      job_description: app.job_description || ''
    });
    setEditId(app.id);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this application?')) {
      try {
        await api.delete(`/applications/${id}`);
        fetchApplications();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const openNewModal = () => {
    setEditId(null);
    setFormData({
      company_name: '', role: '', application_date: new Date().toISOString().split('T')[0], deadline: '', status: 'Applied', location: '', job_link: '', notes: '', job_description: ''
    });
    setShowModal(true);
  };

  const exportToCSV = () => {
    if (applications.length === 0) return;
    const headers = ['Company', 'Role', 'Date', 'Status', 'Location', 'Link', 'Notes'];
    const csvRows = [headers.join(',')];
    
    applications.forEach(app => {
      const row = [
        `"${app.company_name}"`,
        `"${app.role}"`,
        `"${new Date(app.application_date).toLocaleDateString()}"`,
        `"${app.status}"`,
        `"${app.location || ''}"`,
        `"${app.job_link || ''}"`,
        `"${app.notes ? app.notes.replace(/\n/g, ' ') : ''}"`
      ];
      csvRows.push(row.join(','));
    });

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', 'applications.csv');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleGenerateCL = async (app) => {
    setSelectedAppId(app.id);
    if (app.cover_letter) {
      setCoverLetter(app.cover_letter);
      setClError('');
      setShowCLModal(true);
      return;
    }
    await generateNewCL(app.id);
  };

  const generateNewCL = async (appId) => {
    setCoverLetter('');
    setClError('');
    setShowCLModal(true);
    setClLoading(true);
    try {
      const res = await api.post('/ai/generate-cover-letter', { applicationId: appId });
      setCoverLetter(res.data.coverLetter);
    } catch (err) {
      setClError(err.response?.data?.message || 'Unable to generate the cover letter right now. Please try again.');
    } finally {
      setClLoading(false);
    }
  };

  const filteredApplications = applications.filter(app => {
    const matchesSearch = app.company_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          app.role.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'All' || app.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <Layout>
      <div className="tracker-header">
        <h2>Application Tracker</h2>
        <div className="tracker-actions">
          <button onClick={exportToCSV} className="btn-secondary" style={{ width: 'auto', marginRight: '10px' }}>Export CSV</button>
          <button onClick={openNewModal} className="btn-primary" style={{ width: 'auto' }}>+ New Application</button>
        </div>
      </div>

      <div className="tracker-filters" style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <input 
          type="text" 
          placeholder="Search by company or role..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="form-select"
          style={{ flex: 1, padding: '10px' }}
        />
        <select 
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="form-select"
          style={{ width: '200px' }}
        >
          <option value="All">All Statuses</option>
          <option value="Applied">Applied</option>
          <option value="Interview">Interview</option>
          <option value="Selected">Selected</option>
          <option value="Rejected">Rejected</option>
        </select>
      </div>

      <div className="table-container">
        <table className="app-table">
          <thead>
            <tr>
              <th>Company</th>
              <th>Role</th>
              <th>Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredApplications.length > 0 ? (
              filteredApplications.map((app) => (
                <tr key={app.id}>
                  <td>{app.company_name}</td>
                  <td>{app.role}</td>
                  <td>{new Date(app.application_date).toLocaleDateString()}</td>
                  <td>
                    <span className={`status-badge status-${app.status.toLowerCase()}`}>
                      {app.status}
                    </span>
                  </td>
                  <td>
                    <Link to={`/applications/${app.id}`} className="btn-action edit" style={{ marginRight: '5px', backgroundColor: '#3b82f6', color: 'white', textDecoration: 'none', padding: '4px 8px', borderRadius: '4px', fontSize: '12px' }}>View Details</Link>
                    <button onClick={() => handleGenerateCL(app)} className="btn-action edit" style={{ marginRight: '5px', backgroundColor: '#8b5cf6', color: 'white' }}>✨ AI Cover Letter</button>
                    <button onClick={() => handleEdit(app)} className="btn-action edit" style={{ marginRight: '5px' }}>Edit</button>
                    <button onClick={() => handleDelete(app.id)} className="btn-action delete">Delete</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center">No applications found. Add one to get started!</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>{editId ? 'Edit Application' : 'Add New Application'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Company Name*</label>
                <input type="text" name="company_name" value={formData.company_name} onChange={handleInputChange} required />
              </div>
              <div className="form-group">
                <label>Role*</label>
                <input type="text" name="role" value={formData.role} onChange={handleInputChange} required />
              </div>
              <div className="form-group">
                <label>Job Description (Optional)</label>
                <textarea name="job_description" value={formData.job_description} onChange={handleInputChange} rows="3" className="form-select" placeholder="Paste the job description here..." />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Application Date*</label>
                  <input type="date" name="application_date" value={formData.application_date} onChange={handleInputChange} required />
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <select name="status" value={formData.status} onChange={handleInputChange} className="form-select">
                    <option value="Applied">Applied</option>
                    <option value="Interview">Interview</option>
                    <option value="Selected">Selected</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
              </div>
              <div className="form-actions">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary" style={{ width: 'auto' }}>Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showCLModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '600px' }}>
            <h3>✨ AI Cover Letter Generator</h3>
            
            {clLoading ? (
              <div style={{ padding: '20px', textAlign: 'center' }}>
                <p>✨ Generating your personalized cover letter...</p>
                <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '10px' }}>(This may take up to a minute due to free tier API rate limits. Please do not close this window.)</p>
              </div>
            ) : clError ? (
              <div style={{ padding: '20px', color: 'red' }}>
                <p>{clError}</p>
              </div>
            ) : (
              <div className="form-group" style={{ marginTop: '15px' }}>
                <textarea 
                  value={coverLetter} 
                  onChange={(e) => setCoverLetter(e.target.value)}
                  style={{ width: '100%', height: '300px', padding: '10px', fontSize: '14px', lineHeight: '1.5', fontFamily: 'inherit', borderRadius: '4px', border: '1px solid #ddd' }}
                />
              </div>
            )}
            
            <div className="form-actions" style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
              <button onClick={() => generateNewCL(selectedAppId)} className="btn-action edit" disabled={clLoading} style={{ marginRight: 'auto', backgroundColor: '#e5e7eb', color: '#374151' }}>
                🔄 Regenerate
              </button>
              
              <button onClick={() => {
                if(coverLetter) {
                  navigator.clipboard.writeText(coverLetter);
                  setCopyStatus('✓ Copied!');
                  setTimeout(() => setCopyStatus('📋 Copy to Clipboard'), 2000);
                }
              }} className="btn-secondary" disabled={clLoading || !coverLetter}>
                {copyStatus}
              </button>

              <button type="button" onClick={async () => {
                try {
                  await api.put(`/applications/${selectedAppId}/cover-letter`, { cover_letter: coverLetter });
                  alert('Cover letter saved successfully.');
                  fetchApplications();
                } catch (e) {
                  alert('Failed to save cover letter.');
                }
              }} className="btn-primary" disabled={clLoading || !coverLetter} style={{ width: 'auto' }}>
                💾 Save
              </button>

              <button onClick={() => setShowCLModal(false)} className="btn-secondary" style={{ width: 'auto' }}>Close</button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}

export default Tracker;
