import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Tracker from './pages/Tracker';
import Profile from './pages/Profile';
import ApplicationDetail from './pages/ApplicationDetail';
import Resumes from './pages/Resumes';

const PrivateRoute = ({ children }) => {
  const { user, loading } = React.useContext(AuthContext);
  
  if (loading) return <div>Loading...</div>;
  
  return user ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app-container">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route 
              path="/dashboard/*" 
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/tracker" 
              element={
                <PrivateRoute>
                  <Tracker />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/applications/:id" 
              element={
                <PrivateRoute>
                  <ApplicationDetail />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/resumes" 
              element={
                <PrivateRoute>
                  <Resumes />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/profile" 
              element={
                <PrivateRoute>
                  <Profile />
                </PrivateRoute>
              } 
            />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
