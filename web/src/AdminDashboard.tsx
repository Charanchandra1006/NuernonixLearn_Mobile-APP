import React, { useEffect, useState } from 'react';
import { Activity, Users, ShieldAlert, BookOpen } from 'lucide-react';
import { getAdminDashboard, api } from './services/api';

export default function AdminDashboard() {
  const [health, setHealth] = useState<string>("Checking...");
  const [stats, setStats] = useState({ active_users: 0, high_risk_students: 0 });

  useEffect(() => {
    api.get('http://localhost:8000/health')
      .then(res => setHealth(res.data.status))
      .catch(() => setHealth("Down"));
      
    getAdminDashboard().then(data => setStats(data)).catch(console.error);
  }, []);

  return (
    <div className="main-content">
      <div className="header">
        <div>
          <h1 className="text-gradient">Admin Dashboard</h1>
          <p className="text-secondary">Platform Health & Global Analytics</p>
        </div>
      </div>

      <div className="grid grid-cols-3">
        <div className="glass-panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
            <h3>System Status</h3>
            <Activity color={health === 'ok' ? '#10b981' : '#ef4444'} />
          </div>
          <h2 style={{ color: health === 'ok' ? 'var(--success)' : 'var(--danger)' }}>{health.toUpperCase()}</h2>
        </div>

        <div className="glass-panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
            <h3>Active Users</h3>
            <Users color="var(--accent-primary)" />
          </div>
          <h2>{stats.active_users}</h2>
          <span className="badge badge-success">Live from Database</span>
        </div>

        <div className="glass-panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
            <h3>High Risk Students</h3>
            <ShieldAlert color="var(--warning)" />
          </div>
          <h2>{stats.high_risk_students}</h2>
          <span className="badge badge-warning">Requires intervention</span>
        </div>
      </div>
    </div>
  );
}
