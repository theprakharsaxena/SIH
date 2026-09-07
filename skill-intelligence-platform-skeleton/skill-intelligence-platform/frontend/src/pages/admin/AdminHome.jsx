import React, { useState, useEffect } from 'react';
import { Users, BookOpen, BarChart3, ClipboardCheck, TrendingUp, Loader } from 'lucide-react';
import { fetchAdminStats, fetchWorkforceReadiness } from '../../services/api';

const NAVY = '#1a3a6b';
const ORANGE = '#e8720a';

function KPICard({ value, label, icon: Icon, color, sub }) {
  return (
    <div style={{ background: 'white', borderRadius: '14px', padding: '1.5rem', border: '1px solid #e5e7eb', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', display: 'flex', gap: '1rem', alignItems: 'center' }}>
      <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon size={24} color={color} />
      </div>
      <div>
        <div style={{ fontSize: '1.75rem', fontWeight: 900, color, fontFamily: "'Poppins', sans-serif", lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#4b5563', marginTop: '0.2rem' }}>{label}</div>
        {sub && <div style={{ fontSize: '0.72rem', color: '#9ca3af', marginTop: '0.15rem' }}>{sub}</div>}
      </div>
    </div>
  );
}

export default function AdminHome() {
  const [stats, setStats] = useState(null);
  const [readiness, setReadiness] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchAdminStats(), fetchWorkforceReadiness()])
      .then(([s, r]) => { setStats(s); setReadiness(r); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ textAlign: 'center', padding: '4rem', color: '#9ca3af' }}>
      <Loader size={36} style={{ animation: 'spin 1s linear infinite', marginBottom: '1rem' }} />
      <div>Loading analytics…</div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); }}`}</style>
    </div>
  );

  const overall = readiness?.overall_workforce_readiness_pct ?? 0;
  const domains = readiness?.domain_breakdown ?? [];

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 800, color: NAVY, fontSize: '1.4rem', marginBottom: '0.3rem' }}>
          Workforce Intelligence Overview
        </h1>
        <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
          Real-time view of MoSPI workforce competency readiness across all roles and departments.
        </p>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        <KPICard value={stats?.total_officers ?? '—'} label="Total Officers" icon={Users} color={NAVY} sub="Registered in system" />
        <KPICard value={stats?.total_courses ?? '—'} label="Courses Available" icon={BookOpen} color={ORANGE} sub="iGOT + NSSTA" />
        <KPICard value={stats?.total_assessments_taken ?? '—'} label="Assessments Taken" icon={ClipboardCheck} color="#16a34a" sub="MCQ completions" />
        <KPICard value={`${overall.toFixed(1)}%`} label="Overall Readiness" icon={TrendingUp} color={overall >= 60 ? '#16a34a' : overall >= 30 ? '#d97706' : '#dc2626'} sub="Across all competencies" />
      </div>

      {/* Domain Breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        <div style={{ background: 'white', borderRadius: '14px', padding: '1.5rem', border: '1px solid #e5e7eb', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          <div style={{ fontWeight: 800, fontSize: '1rem', color: NAVY, fontFamily: "'Poppins', sans-serif", marginBottom: '1.25rem' }}>
            Readiness by Domain
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
            {domains.map(d => {
              const pct = d.readiness_percentage;
              const color = pct >= 60 ? '#16a34a' : pct >= 30 ? '#d97706' : '#dc2626';
              return (
                <div key={d.domain_category}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#374151' }}>{d.domain_category}</span>
                    <span style={{ fontSize: '0.85rem', fontWeight: 800, color }}>{pct.toFixed(1)}%</span>
                  </div>
                  <div style={{ height: '8px', background: '#f3f4f6', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: '4px', transition: 'width 0.6s ease' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* System stats */}
        <div style={{ background: 'white', borderRadius: '14px', padding: '1.5rem', border: '1px solid #e5e7eb', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          <div style={{ fontWeight: 800, fontSize: '1rem', color: NAVY, fontFamily: "'Poppins', sans-serif", marginBottom: '1.25rem' }}>
            System Summary
          </div>
          {[
            { label: 'Total Officers', value: stats?.total_officers, color: NAVY },
            { label: 'Competency Frameworks', value: stats?.total_competencies, color: '#3b82f6' },
            { label: 'Roles Defined', value: stats?.total_roles, color: '#8b5cf6' },
            { label: 'Courses Synced', value: stats?.total_courses, color: ORANGE },
            { label: 'Enrollments', value: stats?.total_enrollments, color: '#16a34a' },
            { label: 'Assessments Taken', value: stats?.total_assessments_taken, color: '#d97706' },
            { label: 'Avg Competency Score', value: stats?.average_workforce_competency_score ? `${stats.average_workforce_competency_score}/5` : '—', color: '#dc2626' },
          ].map(({ label, value, color }) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0', borderBottom: '1px solid #f3f4f6' }}>
              <span style={{ fontSize: '0.85rem', color: '#6b7280' }}>{label}</span>
              <span style={{ fontSize: '0.95rem', fontWeight: 800, color, fontFamily: "'Poppins', sans-serif" }}>{value ?? '—'}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Critical Gap Simulation */}
      {readiness?.target_role_simulations?.length > 0 && (
        <div style={{ marginTop: '1.5rem', background: 'white', borderRadius: '14px', padding: '1.5rem', border: '1px solid #e5e7eb', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          <div style={{ fontWeight: 800, fontSize: '1rem', color: NAVY, fontFamily: "'Poppins', sans-serif", marginBottom: '1rem' }}>
            Critical Gaps — Role Simulation
          </div>
          {readiness.target_role_simulations.map((sim, i) => (
            <div key={i}>
              <div style={{ fontSize: '0.875rem', fontWeight: 700, color: NAVY, marginBottom: '0.75rem' }}>
                {sim.target_role} — {sim.current_workforce_readiness}% readiness
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {sim.missing_key_skills.map(skill => (
                  <div key={skill.code} style={{ padding: '0.35rem 0.85rem', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 600, background: skill.status === 'Critical Gap' ? '#fef2f2' : '#fffbeb', color: skill.status === 'Critical Gap' ? '#dc2626' : '#d97706', border: `1px solid ${skill.status === 'Critical Gap' ? '#fecaca' : '#fde68a'}` }}>
                    {skill.code} — {skill.name} ({skill.status})
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); }}`}</style>
    </div>
  );
}
