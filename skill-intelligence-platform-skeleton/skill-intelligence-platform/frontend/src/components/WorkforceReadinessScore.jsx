import React from 'react';
import { Target, Zap, TrendingUp, AlertTriangle } from 'lucide-react';

export default function WorkforceReadinessScore({ data }) {
  if (!data) return null;

  const readinessPct = data.overall_workforce_readiness_pct || 67.5;
  const breakdown = data.domain_breakdown || [];
  const simulations = data.target_role_simulations || [];

  return (
    <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Zap style={{ width: '20px', height: '20px', color: '#F59E0B' }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Workforce Readiness Intelligence</h3>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            MoSPI official statistical capacity index across key operational domains
          </p>
        </div>

        {/* Big Headline Metric */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'rgba(255, 255, 255, 0.05)', padding: '0.6rem 1.2rem', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Overall Readiness</span>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#3B82F6', lineHeight: '1.1' }}>
              {readinessPct}%
            </div>
          </div>
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'conic-gradient(#3B82F6 0% 67.5%, rgba(255,255,255,0.1) 67.5% 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--bg-main)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700 }}>
              MoSPI
            </div>
          </div>
        </div>
      </div>

      {/* Domain Readiness Bars */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
        {breakdown.map((d) => (
          <div key={d.domain_category} style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.4rem' }}>
              <span style={{ fontWeight: 600, color: 'white' }}>{d.domain_category}</span>
              <strong style={{ color: d.readiness_percentage > 70 ? '#34D399' : d.readiness_percentage > 50 ? '#FBBF24' : '#F87171' }}>
                {d.readiness_percentage}%
              </strong>
            </div>
            <div style={{ width: '100%', height: '8px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '4px', overflow: 'hidden' }}>
              <div
                style={{
                  width: `${d.readiness_percentage}%`,
                  height: '100%',
                  background: d.readiness_percentage > 70 ? 'linear-gradient(90deg, #10B981, #34D399)' : d.readiness_percentage > 50 ? 'linear-gradient(90deg, #F59E0B, #FBBF24)' : 'linear-gradient(90deg, #F43F5E, #F87171)',
                  borderRadius: '4px',
                  transition: 'width 0.5s ease',
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Target Role Simulation */}
      {simulations.length > 0 && (
        <div style={{ background: 'rgba(59, 130, 246, 0.05)', border: '1px solid rgba(59, 130, 246, 0.2)', borderRadius: '8px', padding: '0.85rem 1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
            <Target style={{ width: '16px', height: '16px', color: '#60A5FA' }} />
            <strong style={{ fontSize: '0.85rem', color: '#93C5FD' }}>Target Role Simulation: Senior Statistical Analyst</strong>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            <span>Current Cadre Readiness: <strong style={{ color: 'white' }}>68.5%</strong></span>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <span>Missing Critical Capabilities:</span>
              <span className="badge badge-cat-c" style={{ fontSize: '0.65rem' }}>🔴 GIS</span>
              <span className="badge badge-cat-c" style={{ fontSize: '0.65rem' }}>🔴 AI/ML</span>
              <span className="badge badge-cat-b" style={{ fontSize: '0.65rem' }}>🟡 Data Quality</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
