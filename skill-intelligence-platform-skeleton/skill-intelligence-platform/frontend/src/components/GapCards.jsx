import React, { useState } from 'react';
import { AlertCircle, CheckCircle, AlertTriangle, ChevronDown, ChevronUp, Info } from 'lucide-react';

export default function GapCards({ gaps }) {
  const [expandedCode, setExpandedCode] = useState(null);

  if (!gaps || gaps.length === 0) return null;

  const categoryA = gaps.filter(g => g.category === 'A');
  const categoryB = gaps.filter(g => g.category === 'B');
  const categoryC = gaps.filter(g => g.category === 'C');

  const toggleExpand = (code) => {
    setExpandedCode(expandedCode === code ? null : code);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Category Summaries */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        <div className="glass-card" style={{ borderLeft: '4px solid #F43F5E' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Considerable Gaps (Cat C)</span>
            <AlertCircle style={{ width: '18px', height: '18px', color: '#F43F5E' }} />
          </div>
          <p style={{ fontSize: '1.75rem', fontWeight: 700, margin: '0.2rem 0 0 0', color: '#F87171' }}>
            {categoryC.length}
          </p>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Gap &gt; 1.5 • High priority</span>
        </div>

        <div className="glass-card" style={{ borderLeft: '4px solid #F59E0B' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Slight Gaps (Cat B)</span>
            <AlertTriangle style={{ width: '18px', height: '18px', color: '#F59E0B' }} />
          </div>
          <p style={{ fontSize: '1.75rem', fontWeight: 700, margin: '0.2rem 0 0 0', color: '#FBBF24' }}>
            {categoryB.length}
          </p>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Gap 0.1 – 1.5 • Moderate priority</span>
        </div>

        <div className="glass-card" style={{ borderLeft: '4px solid #10B981' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Proficient (Cat A)</span>
            <CheckCircle style={{ width: '18px', height: '18px', color: '#10B981' }} />
          </div>
          <p style={{ fontSize: '1.75rem', fontWeight: 700, margin: '0.2rem 0 0 0', color: '#34D399' }}>
            {categoryA.length}
          </p>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Requirement met or exceeded</span>
        </div>
      </div>

      {/* Gap Detail List */}
      <div className="glass-card">
        <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Competency Gap Breakdown & Evidence Audit</h3>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Click item to reveal formula audit trail</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', maxHeight: '420px', overflowY: 'auto' }}>
          {gaps.map((g) => {
            const isExpanded = expandedCode === g.competency_code;
            const badgeClass = g.category === 'C' ? 'badge-cat-c' : g.category === 'B' ? 'badge-cat-b' : 'badge-cat-a';

            return (
              <div
                key={g.competency_code}
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '8px',
                  padding: '0.75rem 1rem',
                  cursor: 'pointer',
                }}
                onClick={() => toggleExpand(g.competency_code)}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span className={`badge ${badgeClass}`}>Cat {g.category}</span>
                    <div>
                      <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'white' }}>
                        {g.competency_code} — {g.competency_name}
                      </span>
                      {g.priority === 'critical' && (
                        <span style={{ marginLeft: '0.5rem', fontSize: '0.65rem', color: '#F87171', background: 'rgba(248, 113, 113, 0.1)', padding: '2px 6px', borderRadius: '4px' }}>
                          Critical Role Requirement
                        </span>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ textAlign: 'right', fontSize: '0.8rem' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Score: </span>
                      <strong style={{ color: '#3B82F6' }}>{g.current_score.toFixed(1)}</strong>
                      <span style={{ color: 'var(--text-muted)' }}> / {g.required_score.toFixed(1)} req</span>
                      {g.gap > 0 ? (
                        <span style={{ color: '#F87171', marginLeft: '0.5rem', fontWeight: 600 }}>(-{g.gap.toFixed(1)})</span>
                      ) : (
                        <span style={{ color: '#34D399', marginLeft: '0.5rem' }}>✓</span>
                      )}
                    </div>

                    {isExpanded ? <ChevronUp style={{ width: '16px', height: '16px' }} /> : <ChevronDown style={{ width: '16px', height: '16px' }} />}
                  </div>
                </div>

                {/* Audit Explanation Breakdown */}
                {isExpanded && g.score_breakdown && (
                  <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px dashed var(--border-subtle)', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#60A5FA', marginBottom: '0.4rem' }}>
                      <Info style={{ width: '14px', height: '14px' }} />
                      <strong style={{ fontSize: '0.75rem' }}>Explainable Scoring Calculation (5-Factor Formula):</strong>
                    </div>
                    <p style={{ background: 'rgba(0,0,0,0.3)', padding: '0.5rem 0.75rem', borderRadius: '6px', fontFamily: 'monospace', fontSize: '0.75rem', color: '#D1D5DB' }}>
                      {g.score_breakdown.explanation}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
