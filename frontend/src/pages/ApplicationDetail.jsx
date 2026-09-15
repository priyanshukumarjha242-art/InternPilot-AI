import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import api from '../utils/api';

function ApplicationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [app, setApp] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Follow Up state
  const [followUpDate, setFollowUpDate] = useState('');
  const [followUpCompleted, setFollowUpCompleted] = useState(false);
  
  // AI State
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');

  // Interview state
  const [showInterviewModal, setShowInterviewModal] = useState(false);
  const [interviewData, setInterviewData] = useState({
    type: 'Phone',
    date: '',
    status: 'Scheduled',
    notes: ''
  });

  useEffect(() => {
    fetchApplication();
  }, [id]);

  const fetchApplication = async () => {
    try {
      const res = await api.get(`/applications/${id}`);
      setApp(res.data);
      if (res.data.follow_up_date) {
        setFollowUpDate(res.data.follow_up_date.split('T')[0]);
      }
      setFollowUpCompleted(res.data.follow_up_completed === 1);
    } catch (err) {
      console.error(err);
      navigate('/tracker');
    } finally {
      setLoading(false);
    }
  };

  const handleFollowUpSave = async () => {
    try {
      await api.put(`/applications/${id}/followup`, {
        follow_up_date: followUpDate || null,
        follow_up_completed: followUpCompleted ? 1 : 0
      });
      alert('Follow-up updated');
      fetchApplication();
    } catch (err) {
      alert('Failed to update follow-up');
    }
  };

  const handleGenerateJobMatch = async () => {
    setAiLoading(true);
    setAiError('');
    try {
      await api.post('/ai/job-match', { applicationId: id });
      fetchApplication();
    } catch (err) {
      setAiError('Failed to generate Job Match');
    } finally {
      setAiLoading(false);
    }
  };

  const handleGenerateInterviewPrep = async () => {
    setAiLoading(true);
    setAiError('');
    try {
      await api.post('/ai/interview-prep', { applicationId: id });
      fetchApplication();
    } catch (err) {
      setAiError('Failed to generate Interview Prep');
    } finally {
      setAiLoading(false);
    }
  };

  const handleInterviewSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/interviews', {
        application_id: id,
        ...interviewData
      });
      setShowInterviewModal(false);
      setInterviewData({ type: 'Phone', date: '', status: 'Scheduled', notes: '' });
      fetchApplication();
    } catch (err) {
      alert('Failed to add interview');
    }
  };

  const handleDeleteInterview = async (interviewId) => {
    if (window.confirm('Delete this interview?')) {
      try {
        await api.delete(`/interviews/${interviewId}`);
        fetchApplication();
      } catch (err) {
        alert('Failed to delete interview');
      }
    }
  };

  if (loading) return <Layout><div>Loading...</div></Layout>;
  if (!app) return <Layout><div>Not Found</div></Layout>;

  let aiMatchData = null;
  if (app.ai_match_data) {
    try { aiMatchData = JSON.parse(app.ai_match_data); } catch (e) {}
  }

  let aiPrepData = null;
  if (app.ai_interview_prep) {
    try { aiPrepData = JSON.parse(app.ai_interview_prep); } catch (e) {}
  }

  return (
    <Layout>
      <div className="tracker-header">
        <h2>{app.company_name} - {app.role}</h2>
        <span className={`status-badge status-${app.status.toLowerCase()}`}>{app.status}</span>
      </div>

      <div className="dashboard-grid">
        {/* Left Column: Details & Follow-up */}
        <div>
          <div className="chart-container" style={{ marginBottom: '24px' }}>
            <h3>Application Details</h3>
            <p><strong>Date Applied:</strong> {new Date(app.application_date).toLocaleDateString()}</p>
            <p><strong>Location:</strong> {app.location || 'N/A'}</p>
            <p><strong>Link:</strong> {app.job_link ? <a href={app.job_link} target="_blank" rel="noreferrer">View Job</a> : 'N/A'}</p>
            <p><strong>Notes:</strong> {app.notes}</p>
          </div>

          <div className="chart-container" style={{ marginBottom: '24px' }}>
            <h3>Follow-Up Reminder</h3>
            <div className="form-group">
              <label>Follow-up Date</label>
              <input type="date" value={followUpDate} onChange={(e) => setFollowUpDate(e.target.value)} />
            </div>
            <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <input type="checkbox" id="fcompleted" checked={followUpCompleted} onChange={(e) => setFollowUpCompleted(e.target.checked)} style={{ width: 'auto' }} />
              <label htmlFor="fcompleted" style={{ margin: 0 }}>Follow-up Completed</label>
            </div>
            <button className="btn-primary" onClick={handleFollowUpSave}>Save Follow-Up</button>
          </div>

          <div className="chart-container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3>Interviews</h3>
              <button onClick={() => setShowInterviewModal(true)} className="btn-secondary" style={{ padding: '4px 8px' }}>+ Add</button>
            </div>
            
            {app.interviews && app.interviews.length > 0 ? (
              app.interviews.map(inv => (
                <div key={inv.id} className="deadline-item" style={{ display: 'block' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <strong>{inv.type} Interview</strong>
                    <span className="deadline-date" style={{ background: '#e0f2fe', color: '#0284c7' }}>{new Date(inv.date).toLocaleDateString()}</span>
                  </div>
                  <div style={{ fontSize: '14px', color: '#666', marginTop: '4px' }}>Status: {inv.status}</div>
                  {inv.notes && <div style={{ fontSize: '14px', marginTop: '4px' }}>{inv.notes}</div>}
                  <button onClick={() => handleDeleteInterview(inv.id)} className="btn-action delete" style={{ marginTop: '8px', fontSize: '12px' }}>Delete</button>
                </div>
              ))
            ) : (
              <p style={{ color: '#666', fontSize: '14px' }}>No interviews scheduled yet.</p>
            )}
          </div>
        </div>

        {/* Right Column: AI Assistant */}
        <div>
          <div className="chart-container" style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3>✨ AI Job Match</h3>
              {!aiLoading && <button onClick={handleGenerateJobMatch} className="btn-secondary" style={{ padding: '4px 8px' }}>{aiMatchData ? 'Regenerate' : 'Analyze'}</button>}
            </div>
            
            {aiLoading && <p>Analyzing profile vs job description...</p>}
            {aiError && <p className="error-msg">{aiError}</p>}
            
            {aiMatchData && !aiLoading && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '16px' }}>
                  <div style={{ fontSize: '32px', fontWeight: 'bold', color: aiMatchData.score >= 70 ? '#2ecc71' : aiMatchData.score >= 50 ? '#f39c12' : '#ef233c' }}>
                    {aiMatchData.score}%
                  </div>
                  <div style={{ fontSize: '14px', color: '#666' }}>Match Score</div>
                </div>
                <p style={{ fontSize: '14px', marginBottom: '16px' }}>{aiMatchData.summary}</p>
                
                <h4 style={{ fontSize: '14px', marginBottom: '8px' }}>Strong Matches:</h4>
                <ul style={{ fontSize: '13px', paddingLeft: '20px', marginBottom: '12px', color: '#2ecc71' }}>
                  {aiMatchData.strongMatches?.map((s, i) => <li key={i}>{s}</li>)}
                </ul>
                
                <h4 style={{ fontSize: '14px', marginBottom: '8px' }}>Missing Skills:</h4>
                <ul style={{ fontSize: '13px', paddingLeft: '20px', marginBottom: '12px', color: '#ef233c' }}>
                  {aiMatchData.missingSkills?.map((s, i) => <li key={i}>{s}</li>)}
                </ul>
              </div>
            )}
            {!aiMatchData && !aiLoading && <p style={{ color: '#666', fontSize: '14px' }}>Click analyze to see how well you match this role.</p>}
          </div>

          <div className="chart-container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3>✨ AI Interview Prep</h3>
              {!aiLoading && <button onClick={handleGenerateInterviewPrep} className="btn-secondary" style={{ padding: '4px 8px' }}>{aiPrepData ? 'Regenerate' : 'Generate Questions'}</button>}
            </div>
            
            {aiLoading && <p>Generating interview questions...</p>}
            
            {aiPrepData && !aiLoading && (
              <div style={{ fontSize: '14px' }}>
                <h4 style={{ marginBottom: '8px', color: '#4361ee' }}>Technical Questions</h4>
                <ul style={{ paddingLeft: '20px', marginBottom: '16px' }}>
                  {aiPrepData.technical?.map((q, i) => <li key={i}>{q}</li>)}
                </ul>
                
                <h4 style={{ marginBottom: '8px', color: '#4361ee' }}>Behavioral Questions</h4>
                <ul style={{ paddingLeft: '20px', marginBottom: '16px' }}>
                  {aiPrepData.behavioral?.map((q, i) => <li key={i}>{q}</li>)}
                </ul>

                <h4 style={{ marginBottom: '8px', color: '#4361ee' }}>Skill Gap Questions</h4>
                <ul style={{ paddingLeft: '20px', marginBottom: '16px' }}>
                  {aiPrepData.skillGap?.map((q, i) => <li key={i}>{q}</li>)}
                </ul>
              </div>
            )}
            {!aiPrepData && !aiLoading && <p style={{ color: '#666', fontSize: '14px' }}>Generate tailored interview questions based on your profile and this role.</p>}
          </div>
        </div>
      </div>

      {showInterviewModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Add Interview</h3>
            <form onSubmit={handleInterviewSubmit}>
              <div className="form-group">
                <label>Interview Type</label>
                <select className="form-select" value={interviewData.type} onChange={(e) => setInterviewData({...interviewData, type: e.target.value})}>
                  <option value="Phone">Phone Screen</option>
                  <option value="Technical">Technical</option>
                  <option value="Behavioral">Behavioral</option>
                  <option value="Onsite">Onsite</option>
                  <option value="Final">Final Round</option>
                </select>
              </div>
              <div className="form-group">
                <label>Date & Time</label>
                <input type="datetime-local" className="form-select" required value={interviewData.date} onChange={(e) => setInterviewData({...interviewData, date: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Status</label>
                <select className="form-select" value={interviewData.status} onChange={(e) => setInterviewData({...interviewData, status: e.target.value})}>
                  <option value="Scheduled">Scheduled</option>
                  <option value="Completed">Completed</option>
                  <option value="Passed">Passed</option>
                  <option value="Failed">Failed</option>
                </select>
              </div>
              <div className="form-group">
                <label>Notes (Optional)</label>
                <textarea className="form-select" rows="3" value={interviewData.notes} onChange={(e) => setInterviewData({...interviewData, notes: e.target.value})}></textarea>
              </div>
              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowInterviewModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary" style={{ width: 'auto' }}>Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}

export default ApplicationDetail;
