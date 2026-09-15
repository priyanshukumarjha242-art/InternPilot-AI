import React from 'react';
import Sidebar from './Sidebar';

function Layout({ children }) {
  return (
    <div className="layout-container">
      <Sidebar />
      <main className="layout-main">
        {children}
      </main>
    </div>
  );
}

export default Layout;
