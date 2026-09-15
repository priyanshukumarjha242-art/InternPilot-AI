import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

function Sidebar() {
  const { logout } = useContext(AuthContext);

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2>InternPilot</h2>
      </div>
      <nav className="sidebar-nav">
        <NavLink to="/dashboard" end className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
          Dashboard
        </NavLink>
        <NavLink to="/tracker" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
          Applications
        </NavLink>
        <NavLink to="/resumes" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
          Resumes
        </NavLink>
        <NavLink to="/profile" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
          Profile
        </NavLink>
      </nav>
      <div className="sidebar-footer">
        <button onClick={logout} className="btn-logout">Logout</button>
      </div>
    </div>
  );
}

export default Sidebar;
