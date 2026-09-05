import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Activity, Users, ShieldAlert, BookOpen } from 'lucide-react';

export default function AdminDashboard() {
  const [health, setHealth] = useState<string>("Checking...");

  useEffect(() => {
    axios.get('http://localhost:8000/health')
      .then(res => setHealth(res.data.status))
      .catch(() => setHealth("Down"));
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
          <h2>1,284</h2>
          <span className="badge badge-success">+12% this week</span>
        </div>

        <div className="glass-panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
            <h3>High Risk Students</h3>
            <ShieldAlert color="var(--warning)" />
          </div>
          <h2>42</h2>
          <span className="badge badge-warning">Requires intervention</span>
        </div>
      </div>
    </div>
  );
}
