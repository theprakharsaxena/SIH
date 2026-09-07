import React, { useState } from 'react';
import {
  BarChart3, Users, BookOpen, Target, TrendingUp,
  AlertTriangle, ArrowUp, ArrowDown, Minus, Info
} from 'lucide-react';

const NAVY = '#1a3a6b';
const ORANGE = '#e8720a';

function StatCard({ icon: Icon, label, value, sub, color = NAVY }) {
  return (
    <div style={{ background: 'white', borderRadius: '14px', padding: '1.25rem 1.5rem', border: '1px solid #e5e7eb', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
      <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon style={{ width: '24px', height: '24px', color: 'white' }} />
      </div>
      <div>
        <div style={{ fontSize: '1.8rem', fontWeight: 800, color: NAVY, fontFamily: 'Poppins, sans-serif', lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: '0.8rem', color: '#6b7280', fontWeight: 600, marginTop: '0.2rem' }}>{label}</div>
        {sub && <div style={{ fontSize: '0.72rem', color: '#9ca3af', marginTop: '0.1rem' }}>{sub}</div>}
      </div>
    </div>
  );
}

function DomainCard({ domain }) {
  const pct = domain.readiness_percentage;
  const color = pct >= 70 ? '#16a34a' : pct >= 40 ? '#d97706' : '#dc2626';
  return (
    <div style={{ background: 'white', borderRadius: '14px', padding: '1.25rem', border: '1px solid #e5e7eb', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
        <div style={{ fontSize: '0.9rem', fontWeight: 700, color: NAVY, maxWidth: '70%' }}>{domain.domain_category}</div>
        <span style={{ fontSize: '1.3rem', fontWeight: 800, color, fontFamily: 'Poppins, sans-serif' }}>{pct.toFixed(0)}%</span>
      </div>
      <div style={{ height: '8px', background: '#f3f4f6', borderRadius: '4px', overflow: 'hidden', marginBottom: '0.5rem' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: '4px', transition: 'width 0.6s ease' }} />
      </div>
      <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
        Avg. score: <strong>{domain.avg_score_out_of_5?.toFixed(1) ?? '—'}</strong> / 5
      </div>
    </div>
  );
}

function RoleSimCard({ sim }) {
  return (
    <div style={{ background: 'white', borderRadius: '14px', padding: '1.25rem', border: '1px solid #e5e7eb', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
        <div style={{ fontSize: '0.9rem', fontWeight: 700, color: NAVY }}>{sim.target_role}</div>
        <span style={{ fontSize: '1.2rem', fontWeight: 800, color: ORANGE, fontFamily: 'Poppins, sans-serif' }}>
          {sim.current_workforce_readiness?.toFixed(0) ?? 0}%
        </span>
      </div>
      <div style={{ height: '6px', background: '#f3f4f6', borderRadius: '3px', overflow: 'hidden', marginBottom: '0.75rem' }}>
        <div style={{ width: `${sim.current_workforce_readiness ?? 0}%`, height: '100%', background: NAVY, borderRadius: '3px' }} />
      </div>
      {sim.missing_key_skills?.length > 0 && (
        <div>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#6b7280', marginBottom: '0.4rem' }}>Top skill gaps:</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
            {sim.missing_key_skills.slice(0, 3).map(s => (
              <span key={s.code} style={{ fontSize: '0.72rem', background: '#fef2f2', color: '#dc2626', padding: '0.15rem 0.5rem', borderRadius: '10px', fontWeight: 600, border: '1px solid #fecaca' }}>
                {s.code}: {s.name}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function HeatmapTable({ heatmapData }) {
  if (!heatmapData?.heatmap_rows?.length) return null;

  const rows = heatmapData.heatmap_rows;
  const allCodes = [...new Set(rows.flatMap(r => r.cells.map(c => c.competency_code)))];
  const displayCodes = allCodes.slice(0, 12); // show first 12

  const cellColor = (val) => {
    if (val === null || val === undefined) return '#f9fafb';
    if (val >= 4) return '#dcfce7';
    if (val >= 3) return '#d1fae5';
    if (val >= 2) return '#fef3c7';
    if (val >= 1) return '#fee2e2';
    return '#fef2f2';
  };

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'left', padding: '0.5rem 0.75rem', background: '#f9fafb', borderBottom: '2px solid #e5e7eb', color: NAVY, fontWeight: 700, whiteSpace: 'nowrap', position: 'sticky', left: 0 }}>Role</th>
            {displayCodes.map(code => (
              <th key={code} style={{ textAlign: 'center', padding: '0.5rem 0.4rem', background: '#f9fafb', borderBottom: '2px solid #e5e7eb', color: '#6b7280', fontWeight: 600, minWidth: '48px', fontFamily: 'monospace', fontSize: '0.7rem' }}>{code}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => {
            const codeMap = {};
            row.cells.forEach(c => { codeMap[c.competency_code] = c.avg_score; });
            return (
              <tr key={ri}>
                <td style={{ padding: '0.6rem 0.75rem', borderBottom: '1px solid #f3f4f6', fontWeight: 600, color: NAVY, whiteSpace: 'nowrap', background: 'white', position: 'sticky', left: 0 }}>{row.role_code}</td>
                {displayCodes.map(code => {
                  const v = codeMap[code];
                  return (
                    <td key={code} style={{ textAlign: 'center', padding: '0.4rem', borderBottom: '1px solid #f9fafb', background: cellColor(v) }}>
                      <div title={v != null ? `Avg: ${v.toFixed(1)} / 5` : 'No data'} style={{ width: '34px', height: '28px', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', fontSize: '0.72rem', fontWeight: 700, color: v != null && v >= 2 ? '#1f2937' : '#6b7280' }}>
                        {v != null ? v.toFixed(1) : '—'}
                      </div>
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
      <div style={{ marginTop: '0.75rem', display: 'flex', gap: '1rem', fontSize: '0.72rem', color: '#6b7280', alignItems: 'center', flexWrap: 'wrap' }}>
        <span style={{ fontWeight: 600 }}>Legend:</span>
        {[{ color: '#dcfce7', label: '4–5 Proficient' }, { color: '#fef3c7', label: '2–3 Developing' }, { color: '#fee2e2', label: '0–1 Critical Gap' }].map(l => (
          <span key={l.label} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span style={{ width: '14px', height: '14px', background: l.color, borderRadius: '3px', border: '1px solid #e5e7eb', display: 'inline-block' }} />{l.label}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function AdminDashboard({ readinessData, heatmapData, statsData }) {
  const stats = statsData ?? {};
  const domainBreakdown = readinessData?.domain_breakdown ?? [];
  const targetSims = readinessData?.target_role_simulations ?? [];
  const overallPct = readinessData?.overall_workforce_readiness_pct ?? 0;

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '2rem 1.5rem' }}>

      {/* Page title */}
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: NAVY, fontFamily: 'Poppins, sans-serif', marginBottom: '0.3rem' }}>
          Workforce Analytics Dashboard
        </h1>
        <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
          Org-wide statistical capacity intelligence for MoSPI HR and Planning teams
        </p>
      </div>

      {/* ── Top Stats ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.75rem' }}>
        <StatCard icon={Users}    label="Total Officials"     value={stats.total_officers    ?? 0} color={NAVY}    sub="In platform" />
        <StatCard icon={Target}   label="Competencies"        value={stats.total_competencies ?? 0} color="#7c3aed" sub="Across 4 domains" />
        <StatCard icon={BookOpen} label="Courses Available"   value={stats.total_courses      ?? 0} color="#0891b2" sub="iGOT + NSSTA" />
        <StatCard icon={BarChart3} label="Assessments Taken"  value={stats.total_assessments_taken ?? 0} color={ORANGE}  sub="Closed loop" />
      </div>

      {/* ── Workforce Readiness Index ── */}
      <div style={{ background: NAVY, borderRadius: '16px', padding: '1.75rem 2rem', marginBottom: '1.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem' }}>
        <div>
          <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.35rem' }}>
            Overall Workforce Readiness Index
          </div>
          <div style={{ fontSize: '3.5rem', fontWeight: 900, color: 'white', fontFamily: 'Poppins, sans-serif', lineHeight: 1 }}>
            {overallPct.toFixed(1)}<span style={{ fontSize: '1.8rem', color: 'rgba(255,255,255,0.7)' }}>%</span>
          </div>
          <div style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.6)', marginTop: '0.35rem' }}>
            Avg across all 35 competencies & {stats.total_officers ?? 0} officials
          </div>
        </div>
        <div style={{ flex: 1, maxWidth: '400px' }}>
          <div style={{ height: '12px', background: 'rgba(255,255,255,0.15)', borderRadius: '6px', overflow: 'hidden', marginBottom: '0.5rem' }}>
            <div style={{ width: `${overallPct}%`, height: '100%', background: ORANGE, borderRadius: '6px', transition: 'width 0.8s ease' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)' }}>
            <span>0%</span><span>50%</span><span>100%</span>
          </div>
        </div>
      </div>

      {/* ── Domain Breakdown ── */}
      {domainBreakdown.length > 0 && (
        <div style={{ marginBottom: '1.75rem' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: NAVY, fontFamily: 'Poppins, sans-serif', marginBottom: '1rem' }}>
            Readiness by Competency Domain
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
            {domainBreakdown.map(d => <DomainCard key={d.domain_category} domain={d} />)}
          </div>
        </div>
      )}

      {/* ── Role Readiness Simulations ── */}
      {targetSims.length > 0 && (
        <div style={{ marginBottom: '1.75rem' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: NAVY, fontFamily: 'Poppins, sans-serif', marginBottom: '1rem' }}>
            Target Role Simulations
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
            {targetSims.map((sim, i) => <RoleSimCard key={i} sim={sim} />)}
          </div>
        </div>
      )}

      {/* ── Competency Heatmap ── */}
      <div style={{ background: 'white', borderRadius: '16px', padding: '1.5rem', border: '1px solid #e5e7eb', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        <div style={{ marginBottom: '1.25rem' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: NAVY, fontFamily: 'Poppins, sans-serif', marginBottom: '0.25rem' }}>
            Role × Competency Heatmap
          </h2>
          <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>Average competency scores across all roles (first 12 competencies shown)</div>
        </div>
        {heatmapData ? (
          <HeatmapTable heatmapData={heatmapData} />
        ) : (
          <div style={{ textAlign: 'center', padding: '2.5rem', color: '#9ca3af', fontSize: '0.875rem' }}>
            <Info style={{ width: '32px', height: '32px', margin: '0 auto 0.75rem' }} />
            No heatmap data available yet. Add officials and run gap analyses to populate.
          </div>
        )}
      </div>

    </div>
  );
}
