import React, { useEffect, useState } from 'react';
import { User, AlertTriangle, BookOpen } from 'lucide-react';
import { getFacultyStudents } from './services/api';

export default function FacultyDashboard() {
  const [riskStudents, setRiskStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getFacultyStudents().then(data => {
      setRiskStudents(data);
    }).finally(() => setLoading(false));
  }, []);

  return (
    <div className="main-content">
      <div className="header">
        <div>
          <h1 className="text-gradient">Faculty Dashboard</h1>
          <p className="text-secondary">Course & Student Interventions</p>
        </div>
        <button className="btn btn-primary">Generate Reports</button>
      </div>

      <div className="grid grid-cols-3" style={{ marginBottom: '40px' }}>
        <div className="glass-panel">
          <h3>Total Enrolled</h3>
          <h2 style={{marginTop: '10px'}}>150</h2>
        </div>
        <div className="glass-panel">
          <h3>Avg Topic Mastery</h3>
          <h2 style={{marginTop: '10px'}}>78%</h2>
        </div>
        <div className="glass-panel">
          <h3>Interventions Pending</h3>
          <h2 style={{marginTop: '10px', color: 'var(--danger)'}}>3</h2>
        </div>
      </div>

      <div className="glass-panel">
        <h2 style={{ marginBottom: '20px' }}>Students at Risk</h2>
        <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
              <th style={{ padding: '12px 0' }}>Student</th>
              <th style={{ padding: '12px 0' }}>Struggling Topic</th>
              <th style={{ padding: '12px 0' }}>Risk Tier</th>
              <th style={{ padding: '12px 0' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {riskStudents.map(student => (
              <tr key={student.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                <td style={{ padding: '12px 0' }}>{student.name}</td>
                <td style={{ padding: '12px 0' }}>{student.topic}</td>
                <td style={{ padding: '12px 0' }}>
                  <span className={`badge ${student.score === 'High' ? 'badge-danger' : 'badge-warning'}`}>
                    {student.score}
                  </span>
                </td>
                <td style={{ padding: '12px 0' }}>
                  <button className="btn" style={{ background: 'var(--bg-secondary)', color: 'white' }}>
                    View Profile
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
