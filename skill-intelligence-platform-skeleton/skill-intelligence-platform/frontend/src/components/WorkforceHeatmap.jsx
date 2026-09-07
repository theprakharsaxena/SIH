import React from 'react';
import { Grid, Layers } from 'lucide-react';

export default function WorkforceHeatmap({ heatmapData, data }) {
  const actualData = heatmapData || data;
  if (!actualData || !actualData.competency_matrix) {
    return (
      <div className="glass-card" style={{ textAlign: 'center', padding: '2rem' }}>
        <p style={{ color: 'var(--text-muted)' }}>Loading workforce heatmap...</p>
      </div>
    );
  }

  const roles = actualData.roles || [];
  const matrix = actualData.competency_matrix || [];

  const getColorForScore = (score) => {
    if (score >= 4.0) return 'rgba(16, 185, 129, 0.25)'; // High - emerald
    if (score >= 2.5) return 'rgba(59, 130, 246, 0.25)'; // Medium - blue
    if (score >= 1.5) return 'rgba(245, 158, 11, 0.25)'; // Low-medium - amber
    return 'rgba(244, 63, 94, 0.25)'; // Critical low - rose
  };

  const getTextColorForScore = (score) => {
    if (score >= 4.0) return '#34D399';
    if (score >= 2.5) return '#60A5FA';
    if (score >= 1.5) return '#FBBF24';
    return '#F87171';
  };

  return (
    <div className="glass-card">
      <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Grid style={{ width: '18px', height: '18px', color: '#60A5FA' }} />
            <h3 style={{ fontSize: '1.05rem', fontWeight: 600 }}>Workforce Skill Gap Heatmap (Role × Competency)</h3>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            Ministry-wide competency distribution across JSO, SSO, MCTP-II, and MCTP-III cadres
          </p>
        </div>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-subtle)', background: 'rgba(255, 255, 255, 0.04)' }}>
              <th style={{ padding: '0.75rem 1rem', color: 'var(--text-secondary)' }}>Code</th>
              <th style={{ padding: '0.75rem 1rem', color: 'var(--text-secondary)' }}>Competency Name</th>
              <th style={{ padding: '0.75rem 1rem', color: 'var(--text-secondary)' }}>Category</th>
              {roles.map((r) => (
                <th key={r.code} style={{ padding: '0.75rem 1rem', textAlign: 'center', color: '#93C5FD' }}>
                  {r.code}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {matrix.map((row) => (
              <tr key={row.competency_code} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <td style={{ padding: '0.6rem 1rem', fontWeight: 600, color: 'white' }}>
                  {row.competency_code}
                </td>
                <td style={{ padding: '0.6rem 1rem', color: 'var(--text-primary)' }}>
                  {row.competency_name}
                </td>
                <td style={{ padding: '0.6rem 1rem', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                  {row.domain_category}
                </td>
                {roles.map((r) => {
                  const score = row[r.code] || 0.0;
                  return (
                    <td
                      key={r.code}
                      style={{
                        padding: '0.6rem 1rem',
                        textAlign: 'center',
                        fontWeight: 700,
                        backgroundColor: getColorForScore(score),
                        color: getTextColorForScore(score),
                        borderRadius: '4px',
                      }}
                    >
                      {score > 0 ? score.toFixed(1) : '—'}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
