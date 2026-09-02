import React from 'react';
import WorkforceReadinessScore from '../components/WorkforceReadinessScore';
import WorkforceHeatmap from '../components/WorkforceHeatmap';
import { Users, BookOpen, Layers, Award } from 'lucide-react';

export default function AdminDashboard({ readinessData, heatmapData, statsData }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Top Admin Summary Stats */}
      {statsData && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
          <div className="glass-card">
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Total Registered Officials</span>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'white', marginTop: '0.2rem' }}>
              {statsData.total_officers || 4}
            </div>
          </div>

          <div className="glass-card">
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Domain Competencies</span>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#60A5FA', marginTop: '0.2rem' }}>
              {statsData.total_competencies || 35}
            </div>
          </div>

          <div className="glass-card">
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Course Catalog Size</span>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#C084FC', marginTop: '0.2rem' }}>
              {statsData.total_courses || 50}
            </div>
          </div>

          <div className="glass-card">
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Avg Competency Score</span>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#34D399', marginTop: '0.2rem' }}>
              {statsData.average_workforce_competency_score || '2.84'} / 5.0
            </div>
          </div>
        </div>
      )}

      {/* Workforce Readiness Score */}
      <WorkforceReadinessScore data={readinessData} />

      {/* Workforce Heatmap */}
      <WorkforceHeatmap heatmapData={heatmapData} />
    </div>
  );
}
