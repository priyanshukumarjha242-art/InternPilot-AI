import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import Layout from '../components/Layout';
import api from '../utils/api';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

function Dashboard() {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState(null);
  const [deadlines, setDeadlines] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch stats
        const statsRes = await api.get('/applications/stats');
        setStats(statsRes.data);
        
        // Fetch all applications for deadlines
        const appsRes = await api.get('/applications');
        const apps = appsRes.data;
        
        // Process upcoming deadlines
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const upcoming = apps
          .filter(app => app.deadline)
          .map(app => ({
            ...app,
            deadlineDate: new Date(app.deadline)
          }))
          .filter(app => app.deadlineDate >= today)
          .sort((a, b) => a.deadlineDate - b.deadlineDate)
          .slice(0, 5); // top 5
          
        setDeadlines(upcoming);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  // Prepare data for the pie chart
  const COLORS = ['#0284c7', '#d97706', '#15803d', '#b91c1c'];
  const chartData = stats ? [
    { name: 'Applied', value: stats['Applied'] || 0 },
    { name: 'Interview', value: stats['Interview'] || 0 },
    { name: 'Selected', value: stats['Selected'] || 0 },
    { name: 'Rejected', value: stats['Rejected'] || 0 }
  ].filter(item => item.value > 0) : [];

  return (
    <Layout>
      <div className="dashboard-content">
        <h2>Welcome back, {user?.name}!</h2>
        <p className="subtitle">Here is an overview of your internship applications.</p>

        {stats ? (
          <>
            <div className="stats-grid">
              <div className="stat-card">
                <h3>Total Applications</h3>
                <p className="stat-value">{stats.total}</p>
              </div>
              <div className="stat-card">
                <h3>Applied</h3>
                <p className="stat-value text-blue">{stats['Applied']}</p>
              </div>
              <div className="stat-card">
                <h3>Interview</h3>
                <p className="stat-value text-orange">{stats['Interview']}</p>
              </div>
              <div className="stat-card">
                <h3>Selected</h3>
                <p className="stat-value text-green">{stats['Selected']}</p>
              </div>
              <div className="stat-card">
                <h3>Rejected</h3>
                <p className="stat-value text-red">{stats['Rejected']}</p>
              </div>
              <div className="stat-card">
                <h3>Interview Rate</h3>
                <p className="stat-value text-orange">
                  {stats.total > 0 ? Math.round(((stats['Interview'] + stats['Selected']) / stats.total) * 100) : 0}%
                </p>
              </div>
              <div className="stat-card">
                <h3>Offer Rate</h3>
                <p className="stat-value text-green">
                  {stats.total > 0 ? Math.round((stats['Selected'] / stats.total) * 100) : 0}%
                </p>
              </div>
            </div>

            <div className="dashboard-grid">
              <div className="chart-container">
                <h3>Application Status</h3>
                {chartData.length > 0 ? (
                  <div style={{ width: '100%', height: 300 }}>
                    <ResponsiveContainer>
                      <PieChart>
                        <Pie
                          data={chartData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend verticalAlign="bottom" height={36}/>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <p style={{ textAlign: 'center', marginTop: '40px', color: '#8d99ae' }}>No data to display yet.</p>
                )}
              </div>

              <div className="deadlines-list">
                <h3>Upcoming Deadlines</h3>
                {deadlines.length > 0 ? (
                  deadlines.map(app => (
                    <div key={app.id} className="deadline-item">
                      <div>
                        <div className="deadline-company">{app.company_name}</div>
                        <div className="deadline-role">{app.role}</div>
                      </div>
                      <div className="deadline-date">
                        {app.deadlineDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                    </div>
                  ))
                ) : (
                  <p style={{ textAlign: 'center', marginTop: '40px', color: '#8d99ae' }}>No upcoming deadlines.</p>
                )}
              </div>
            </div>
          </>
        ) : (
          <p>Loading stats...</p>
        )}
      </div>
    </Layout>
  );
}

export default Dashboard;
