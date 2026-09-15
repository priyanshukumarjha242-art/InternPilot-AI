import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import api from '../utils/api';

function Resumes() {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadName, setUploadName] = useState('');
  const [uploading, setUploading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    fetchResumes();
  }, []);

  const fetchResumes = async () => {
    try {
      const res = await api.get('/resumes');
      setResumes(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!uploadFile) return alert('Please select a file');

    setUploading(true);
    const formData = new FormData();
    formData.append('resume', uploadFile);
    formData.append('name', uploadName || uploadFile.name);

    try {
      await api.post('/resumes/upload', formData);
      setUploadFile(null);
      setUploadName('');
      fetchResumes();
    } catch (err) {
      console.error("Upload error details:", err.response?.data || err);
      alert('Failed to upload resume: ' + (err.response?.data?.message || err.message));
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this resume?')) {
      try {
        await api.delete(`/resumes/${id}`);
        fetchResumes();
      } catch (err) {
        alert('Failed to delete resume');
      }
    }
  };

  const handleAnalyze = async (id) => {
    setAiLoading(true);
    try {
      await api.post('/ai/resume-analyze', { resumeId: id });
      fetchResumes();
    } catch (err) {
      console.error("Analyze error details:", err.response?.data || err);
      alert('Failed to analyze resume: ' + (err.response?.data?.message || err.message));
    } finally {
      setAiLoading(false);
    }
  };

  if (loading) return <Layout><div>Loading...</div></Layout>;

  return (
    <Layout>
      <div className="tracker-header">
        <h2>Resume Hub</h2>
      </div>

      <div className="dashboard-grid">
        <div className="chart-container" style={{ marginBottom: '24px' }}>
          <h3>Upload New Resume (PDF)</h3>
          <form onSubmit={handleUpload} style={{ marginTop: '16px' }}>
            <div className="form-group">
              <label>Resume Name</label>
              <input 
                type="text" 
                value={uploadName} 
                onChange={(e) => setUploadName(e.target.value)} 
                placeholder="e.g. Software Engineer Resume 2024" 
              />
            </div>
            <div className="form-group">
              <input 
                type="file" 
                accept=".pdf,.txt" 
                onChange={(e) => setUploadFile(e.target.files[0])} 
              />
            </div>
            <button type="submit" className="btn-primary" disabled={uploading}>
              {uploading ? 'Uploading...' : 'Upload & Parse'}
            </button>
          </form>
        </div>

        <div>
          {resumes.map(resume => {
            let analysis = null;
            if (resume.analysis) {
              try { analysis = JSON.parse(resume.analysis); } catch(e) {}
            }

            return (
              <div key={resume.id} className="chart-container" style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3>{resume.name}</h3>
                  <div>
                    <button onClick={() => handleAnalyze(resume.id)} className="btn-secondary" style={{ marginRight: '8px' }} disabled={aiLoading}>
                      {analysis ? 'Re-Analyze' : '✨ AI Analyze'}
                    </button>
                    <button onClick={() => handleDelete(resume.id)} className="btn-action delete">Delete</button>
                  </div>
                </div>

                {analysis && (
                  <div style={{ marginTop: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '16px' }}>
                      <div style={{ fontSize: '32px', fontWeight: 'bold', color: analysis.overallScore >= 70 ? '#2ecc71' : analysis.overallScore >= 50 ? '#f39c12' : '#ef233c' }}>
                        {analysis.overallScore}/100
                      </div>
                      <div style={{ fontSize: '14px', color: '#666' }}>Resume Score</div>
                    </div>

                    <h4 style={{ fontSize: '14px', marginBottom: '8px', color: '#4361ee' }}>Detected Skills</h4>
                    <p style={{ fontSize: '13px', marginBottom: '12px' }}>{analysis.detectedSkills?.join(', ')}</p>

                    <h4 style={{ fontSize: '14px', marginBottom: '8px', color: '#2ecc71' }}>Strengths</h4>
                    <ul style={{ fontSize: '13px', paddingLeft: '20px', marginBottom: '12px' }}>
                      {analysis.strengths?.map((s, i) => <li key={i}>{s}</li>)}
                    </ul>

                    <h4 style={{ fontSize: '14px', marginBottom: '8px', color: '#ef233c' }}>Areas to Improve</h4>
                    <ul style={{ fontSize: '13px', paddingLeft: '20px', marginBottom: '12px' }}>
                      {analysis.weaknesses?.map((w, i) => <li key={i}>{w}</li>)}
                    </ul>

                    <h4 style={{ fontSize: '14px', marginBottom: '8px', color: '#f39c12' }}>Suggestions</h4>
                    <ul style={{ fontSize: '13px', paddingLeft: '20px', marginBottom: '12px' }}>
                      {analysis.suggestions?.map((s, i) => <li key={i}>{s}</li>)}
                    </ul>
                  </div>
                )}
                
                {!analysis && (
                  <p style={{ fontSize: '14px', color: '#666', marginTop: '16px' }}>
                    Click 'AI Analyze' to get feedback on this resume.
                  </p>
                )}
              </div>
            );
          })}
          {resumes.length === 0 && (
            <div className="chart-container">
              <p>No resumes uploaded yet.</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

export default Resumes;
