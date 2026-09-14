import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, ShieldAlert, Cpu, BookOpen, ArrowRight, CheckCircle2, FileText, Zap } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { fetchGapAnalysis } from '../../services/api';

const NAVY = '#14343b';
const TERRACOTTA = '#c4713d';

const RISK_MAPPINGS = {
  'OS-01': 'Potential risk of non-sampling error inflation and unrepresentative cluster selection in national survey rounds.',
  'OS-02': 'High risk of incorrect design effect estimation and delayed variance calculations in ASI and PLFS publications.',
  'OS-03': 'Potential risk of methodological reporting latency or miscalculated GVA deflators in official National Accounts releases.',
  'TC-01': 'Risk of operational processing bottlenecks during CAPI automated microdata cleaning and validation workflows.',
  'TC-03': 'Risk of query execution latency or data corruption during multi-division survey database integration.',
  'DG-05': 'Non-compliance risk with MeghRaj Gov Cloud API gateway data privacy standards during inter-ministry data exchange.'
};

export default function SkillGapAnalysisPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [gaps, setGaps] = useState([]);

  useEffect(() => {
    if (!user?.id) return;
    loadData();
  }, [user?.id]);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchGapAnalysis(user.id, { role_code: user?.role_code || 'SSO' });
      const raw = data?.gaps || data?.competencies || [];

      const formatted = raw.slice(0, 5).map(item => {
        const code = item.competency_code || item.code || 'OS-01';
        const name = item.competency_name || item.name || 'Competency';
        const current = item.current_score ?? item.current_level ?? 1.0;
        const required = item.required_score ?? item.required_level ?? 4.0;
        const deficit = Math.max(0, required - current);
        
        let priority = 'Immediate Action (Critical Priority)';
        let badgeBg = '#fef2f2';
        let badgeColor = '#dc2626';

        if (deficit <= 1.0) {
          priority = 'Moderate Priority (Targeted Refinement)';
          badgeBg = '#fffbeb';
          badgeColor = '#d97706';
        }

        return {
          code,
          name,
          current: current.toFixed(1),
          required: required.toFixed(1),
          deficit: deficit.toFixed(1),
          priority,
          badgeBg,
          badgeColor,
          aiReasoning: `Demonstrated proficiency (${current.toFixed(1)}/5.0) falls below the mandate target (${required.toFixed(1)}/5.0) required for official ${user?.role_code || 'SSO'} duties.`,
          operationalRisk: RISK_MAPPINGS[code] || 'Potential operational latency or quality verification overhead in division deliverables.',
          intervention: 'Enroll in targeted iGOT Karmayogi programmes and NSSTA capacity building modules.',
          mandateCriticality: `High Criticality for ${user?.current_assignment || 'Statistical Data Processing & Automation'}`,
          weakAreas: ['Foundational concepts & statutory workflows', 'Operational procedures & microdata validation', 'Standard error reporting']
        };
      });

      setGaps(formatted);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '1050px', margin: '0 auto', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      
      {/* Header Banner */}
      <div style={{
        background: `linear-gradient(135deg, ${NAVY} 0%, #1e4d56 100%)`,
        borderRadius: '16px', padding: '2rem 2.25rem', color: 'white', marginBottom: '1.75rem',
        boxShadow: '0 4px 18px rgba(20, 52, 59, 0.15)', border: '1px solid rgba(255,255,255,0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.4rem' }}>
          <span style={{ background: TERRACOTTA, color: 'white', padding: '0.2rem 0.65rem', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Lifecycle Step 5
          </span>
          <span style={{ background: 'rgba(255,255,255,0.15)', color: '#cbd5e1', padding: '0.2rem 0.65rem', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 700 }}>
            Operational Deficit Translation
          </span>
        </div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: '0.4rem 0', color: 'white', letterSpacing: '-0.02em' }}>
          AI Skill Gap Analysis & Operational Risks
        </h1>
        <p style={{ color: '#cbd5e1', fontSize: '0.925rem', maxWidth: '800px', lineHeight: 1.5 }}>
          Translating diagnosed competency deficits directly into operational risks, mandate criticality, and recommended institutional capacity building interventions.
        </p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: '#94a3b8' }}>
          <div style={{ fontWeight: 600, color: '#475569' }}>Analyzing Skill Gaps & Operational Risk...</div>
        </div>
      ) : (
        <>
          {/* Gaps Cards List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '2rem' }}>
            {gaps.map((gap, idx) => (
              <div key={gap.code} style={{
                background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0',
                padding: '1.75rem', boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
              }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem' }}>
                  <div>
                    <span style={{ fontSize: '0.72rem', fontWeight: 800, color: TERRACOTTA, textTransform: 'uppercase' }}>
                      DEFICIT CARD #{idx + 1} · {gap.code}
                    </span>
                    <h3 style={{ margin: '0.2rem 0 0 0', color: NAVY, fontSize: '1.2rem', fontWeight: 800 }}>
                      {gap.name}
                    </h3>
                  </div>

                  <span style={{
                    background: gap.badgeBg, color: gap.badgeColor, padding: '0.35rem 0.85rem',
                    borderRadius: '20px', fontSize: '0.78rem', fontWeight: 800, border: `1px solid ${gap.badgeColor}33`
                  }}>
                    {gap.priority}
                  </span>
                </div>

                {/* Score Level Metrics */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', background: '#f8fafc', padding: '1rem', borderRadius: '10px', marginBottom: '1.25rem', border: '1px solid #e2e8f0' }}>
                  <div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700 }}>Required Target Level</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: NAVY }}>{gap.required} / 5.0</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700 }}>Current Demonstrated Level</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#dc2626' }}>{gap.current} / 5.0</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700 }}>Diagnosed Skill Gap Deficit</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: TERRACOTTA }}>{gap.deficit} Level Deficit</div>
                  </div>
                </div>

                {/* AI Reasoning Block */}
                <div style={{ background: '#eff6ff', borderRadius: '10px', padding: '1rem 1.25rem', borderLeft: '4px solid #2563eb', marginBottom: '1rem' }}>
                  <div style={{ fontWeight: 800, color: '#1e40af', fontSize: '0.85rem', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Cpu size={16} /> AI Reasoning (Why this gap exists)
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#1e3a8a', lineHeight: 1.5 }}>
                    {gap.aiReasoning}
                  </div>
                </div>

                {/* Operational Risk Block */}
                <div style={{ background: '#fef2f2', borderRadius: '10px', padding: '1rem 1.25rem', borderLeft: '4px solid #dc2626', marginBottom: '1rem' }}>
                  <div style={{ fontWeight: 800, color: '#991b1b', fontSize: '0.85rem', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <ShieldAlert size={16} /> Operational Risk Assessment
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#7f1d1d', lineHeight: 1.5 }}>
                    {gap.operationalRisk}
                  </div>
                </div>

                {/* Specific Weak Areas */}
                <div style={{ marginBottom: '1.25rem' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: NAVY, marginBottom: '0.5rem' }}>Specific Weak Areas to Address in Learning:</div>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {gap.weakAreas.map((area, i) => (
                      <span key={i} style={{ background: '#f1f5f9', color: '#475569', padding: '0.3rem 0.75rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600, border: '1px solid #e2e8f0' }}>
                        • {area}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Recommended Intervention */}
                <div style={{ background: '#f8fafc', padding: '0.85rem 1rem', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <div style={{ fontSize: '0.825rem', color: NAVY, fontWeight: 700 }}>
                    <span style={{ color: TERRACOTTA }}>Recommended Intervention:</span> {gap.intervention}
                  </div>
                  <button onClick={() => navigate('/dashboard/roadmap')} style={{ background: NAVY, color: 'white', border: 'none', borderRadius: '8px', padding: '0.5rem 1.25rem', fontSize: '0.8rem', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    View Roadmap Track <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button onClick={() => navigate('/dashboard/roadmap')} style={{ background: TERRACOTTA, color: 'white', border: 'none', borderRadius: '10px', padding: '0.85rem 2rem', fontWeight: 800, fontSize: '0.95rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              Proceed to Learning Roadmap (Step 6) <ArrowRight size={18} />
            </button>
          </div>
        </>
      )}
    </div>
  );
}
