import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import AdminDashboard from './AdminDashboard';
import FacultyDashboard from './FacultyDashboard';
import './index.css';
import { LayoutDashboard, GraduationCap } from 'lucide-react';

function App() {
  return (
    <div className="app-container">
      <nav className="sidebar">
        <h2 className="text-gradient" style={{ marginBottom: '40px', textAlign: 'center' }}>LearnSense</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <Link to="/admin" style={{ color: 'var(--text-primary)', textDecoration: 'none', display: 'flex', gap: '10px' }}>
            <LayoutDashboard size={20} /> Admin Panel
          </Link>
          <Link to="/faculty" style={{ color: 'var(--text-primary)', textDecoration: 'none', display: 'flex', gap: '10px' }}>
            <GraduationCap size={20} /> Faculty Portal
          </Link>
        </div>
      </nav>
      
      <Routes>
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/faculty" element={<FacultyDashboard />} />
        <Route path="/" element={<AdminDashboard />} />
      </Routes>
    </div>
  );
}

export default App;
