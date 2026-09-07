import React, { useState, useEffect } from 'react';
import { ClipboardCheck, Loader, TrendingUp } from 'lucide-react';
import { fetchAssessmentResults } from '../../services/api';

const NAVY = '#1a3a6b';
const ORANGE = '#e8720a';

export default function AssessmentAnalytics() {
  const [data, setData] = useState({ results: [], total: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAssessmentResults(0, 100)
      .then(d => setData(d))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const results = data.results || [];
  const avgScore = results.length > 0
    ? (results.reduce((s, r) => s + r.score_percent, 0) / results.length).toFixed(1)
    : 0;
  const passed = results.filter(r => r.score_percent >= 60).length;

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 800, color: NAVY, fontSize: '1.4rem', marginBottom: '0.3rem' }}>
          Assessment Analytics
        </h1>
        <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>All MCQ assessment completions across the workforce.</p>
      </div>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        {[
          { label: 'Total Completions', value: data.total, color: NAVY, icon: ClipboardCheck },
          { label: 'Average Score', value: `${avgScore}%`, color: avgScore >= 60 ? '#16a34a' : '#d97706', icon: TrendingUp },
          { label: 'Pass Rate (≥60%)', value: `${results.length > 0 ? ((passed / results.length) * 100).toFixed(0) : 0}%`, color: '#16a34a', icon: ClipboardCheck },
        ].map(({ label, value, color, icon: Icon }) => (
          <div key={label} style={{ background: 'white', borderRadius: '14px', padding: '1.25rem', border: '1px solid #e5e7eb', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon size={22} color={color} />
            </div>
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: 900, color, fontFamily: "'Poppins', sans-serif" }}>{value}</div>
              <div style={{ fontSize: '0.78rem', color: '#6b7280', fontWeight: 600 }}>{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Results table */}
      <div style={{ background: 'white', borderRadius: '14px', border: '1px solid #e5e7eb', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #e5e7eb', fontWeight: 700, color: NAVY, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Recent Assessment Results</span>
          <span style={{ fontSize: '0.8rem', color: '#9ca3af', fontWeight: 400 }}>Sorted by most recent</span>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: '#9ca3af' }}>
            <Loader size={32} style={{ animation: 'spin 1s linear infinite', marginBottom: '0.75rem' }} />
            <div>Loading results…</div>
          </div>
        ) : results.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#9ca3af' }}>
            <ClipboardCheck size={40} style={{ marginBottom: '0.75rem' }} />
            <div style={{ fontWeight: 600, color: '#4b5563' }}>No assessments taken yet</div>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                {['#', 'Officer Name', 'Score', 'Grade', 'Completed At'].map(h => (
                  <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.78rem', fontWeight: 700, color: '#374151' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {results.map((r, i) => {
                const score = r.score_percent;
                const color = score >= 80 ? '#16a34a' : score >= 60 ? '#d97706' : '#dc2626';
                const grade = score >= 80 ? 'Excellent' : score >= 60 ? 'Pass' : 'Needs Work';
                return (
                  <tr key={r.id} style={{ borderBottom: '1px solid #f3f4f6', background: i % 2 === 0 ? 'white' : '#fafafa' }}>
                    <td style={{ padding: '0.8rem 1rem', fontSize: '0.8rem', color: '#9ca3af' }}>{i + 1}</td>
                    <td style={{ padding: '0.8rem 1rem', fontWeight: 600, color: NAVY, fontSize: '0.875rem' }}>{r.official_name}</td>
                    <td style={{ padding: '0.8rem 1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ width: '60px', height: '6px', background: '#e5e7eb', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{ width: `${score}%`, height: '100%', background: color, borderRadius: '3px' }} />
                        </div>
                        <span style={{ fontWeight: 700, color, fontSize: '0.875rem' }}>{score.toFixed(1)}%</span>
                      </div>
                    </td>
                    <td style={{ padding: '0.8rem 1rem' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color, background: color + '18', padding: '0.2rem 0.6rem', borderRadius: '8px' }}>{grade}</span>
                    </td>
                    <td style={{ padding: '0.8rem 1rem', fontSize: '0.8rem', color: '#6b7280' }}>
                      {r.completed_at ? new Date(r.completed_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); }}`}</style>
    </div>
  );
}
