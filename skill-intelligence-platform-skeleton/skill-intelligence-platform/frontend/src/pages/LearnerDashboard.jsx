import React, { useState } from 'react';
import {
  Upload, RefreshCw, BookOpen, AlertTriangle, CheckCircle,
  TrendingDown, ChevronDown, ChevronUp, Target,
  Award, Loader, Info, Star, Clock, MapPin, Compass
} from 'lucide-react';
import LearningPathRoadmap from '../components/LearningPathRoadmap';

const NAVY = '#1a3a6b';
const ORANGE = '#e8720a';

/* ─── Competency Radar as a simple table-style view ─── */
function CompetencyBreakdown({ gapData }) {
  const [expanded, setExpanded] = useState(false);
  if (!gapData?.competencies) return null;

  const comps = gapData.competencies;
  const visible = expanded ? comps : comps.slice(0, 8);
  const critical = comps.filter(c => c.gap_severity === 'critical').length;
  const moderate = comps.filter(c => c.gap_severity === 'moderate').length;
  const proficient = comps.filter(c => c.gap_severity === 'proficient').length;

  const severityColor = (sev) => {
    if (sev === 'critical') return '#dc2626';
    if (sev === 'moderate') return '#d97706';
    if (sev === 'proficient') return '#16a34a';
    return '#9ca3af';
  };

  return (
    <div>
      {/* Category pills */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.35rem 0.9rem', background: '#fef2f2', borderRadius: '20px', border: '1px solid #fecaca', fontSize: '0.8rem', fontWeight: 600, color: '#dc2626' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#dc2626' }} />
          Critical Gap: {critical}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.35rem 0.9rem', background: '#fffbeb', borderRadius: '20px', border: '1px solid #fde68a', fontSize: '0.8rem', fontWeight: 600, color: '#d97706' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#d97706' }} />
          Moderate Gap: {moderate}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.35rem 0.9rem', background: '#f0fdf4', borderRadius: '20px', border: '1px solid #bbf7d0', fontSize: '0.8rem', fontWeight: 600, color: '#16a34a' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#16a34a' }} />
          Proficient: {proficient}
        </div>
      </div>

      {/* Competency bars */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
        {visible.map(comp => {
          const current = comp.current_level ?? 0;
          const required = comp.required_level ?? 5;
          const pct = Math.round((current / 5) * 100);
          const color = severityColor(comp.gap_severity);
          return (
            <div key={comp.code} style={{ padding: '0.75rem 1rem', background: '#f9fafb', borderRadius: '10px', border: '1px solid #f3f4f6' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#6b7280', background: '#e5e7eb', padding: '0.1rem 0.45rem', borderRadius: '4px', fontFamily: 'monospace' }}>{comp.code}</span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: NAVY }}>{comp.competency_name}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.78rem', color: '#6b7280' }}>{current.toFixed(1)} / {required}</span>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color, background: color + '15', padding: '0.15rem 0.5rem', borderRadius: '10px', textTransform: 'capitalize' }}>
                    {comp.gap_severity === 'proficient' ? '✓ OK' : `Gap: ${(required - current).toFixed(1)}`}
                  </span>
                </div>
              </div>
              <div style={{ height: '6px', background: '#e5e7eb', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ width: `${pct}%`, height: '100%', background: comp.gap_severity === 'proficient' ? '#16a34a' : comp.gap_severity === 'moderate' ? '#d97706' : '#dc2626', borderRadius: '3px', transition: 'width 0.6s ease' }} />
              </div>
            </div>
          );
        })}
      </div>

      {comps.length > 8 && (
        <button
          onClick={() => setExpanded(!expanded)}
          style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem', color: NAVY, fontWeight: 600, fontSize: '0.85rem', background: 'none', border: 'none', cursor: 'pointer', padding: '0.5rem 0' }}
        >
          {expanded ? <ChevronUp style={{ width: '16px', height: '16px' }} /> : <ChevronDown style={{ width: '16px', height: '16px' }} />}
          {expanded ? 'Show less' : `Show ${comps.length - 8} more competencies`}
        </button>
      )}
    </div>
  );
}

/* ─── Course Recommendation Card ─── */
function CourseCard({ rec }) {
  const levelColor = rec.level === 'Beginner' ? '#16a34a' : rec.level === 'Intermediate' ? '#d97706' : '#dc2626';
  return (
    <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', overflow: 'hidden', transition: 'box-shadow 0.2s', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
      {/* Header strip */}
      <div style={{ padding: '0.5rem 1rem', background: rec.provider_type === 'iGOT' ? '#eef2fb' : '#fff3e0', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '0.72rem', fontWeight: 700, color: rec.provider_type === 'iGOT' ? NAVY : ORANGE }}>{rec.provider_type}</span>
        <span style={{ fontSize: '0.72rem', fontWeight: 700, color: levelColor, background: levelColor + '18', padding: '0.1rem 0.5rem', borderRadius: '10px' }}>{rec.level}</span>
      </div>
      <div style={{ padding: '1rem' }}>
        <div style={{ fontSize: '0.9rem', fontWeight: 700, color: NAVY, marginBottom: '0.35rem', lineHeight: 1.4 }}>{rec.course_title}</div>
        <div style={{ fontSize: '0.78rem', color: '#6b7280', marginBottom: '0.65rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Clock style={{ width: '12px', height: '12px' }} /> {rec.duration_hours}h</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Target style={{ width: '12px', height: '12px' }} /> {rec.competency_name}</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Star style={{ width: '12px', height: '12px', color: ORANGE }} /> {(rec.relevance_score * 100).toFixed(0)}% match</span>
        </div>
        <div style={{ fontSize: '0.78rem', color: '#4b5563', background: '#f9fafb', padding: '0.5rem 0.65rem', borderRadius: '6px', borderLeft: `3px solid ${NAVY}`, lineHeight: 1.5 }}>
          {rec.reason_text?.replace('Recommended because: ', '') ?? 'Recommended for your role.'}
        </div>
      </div>
    </div>
  );
}

export default function LearnerDashboard({ selectedOfficer, gapData, recsData, onRefreshData, onGoAssessment, officerLoading }) {
  const [profileText, setProfileText] = useState('');
  const [uploading, setUploading]     = useState(false);
  const [showUpload, setShowUpload]   = useState(false);

  const handleExtract = async () => {
    if (!profileText.trim() || !selectedOfficer) return;
    setUploading(true);
    try {
      await onRefreshData(selectedOfficer.id, profileText, selectedOfficer.role_code || 'SSO');
      setShowUpload(false);
    } finally {
      setUploading(false);
    }
  };

  if (!selectedOfficer) {
    return (
      <div style={{ padding: '3rem 2rem', maxWidth: '1280px', margin: '0 auto', textAlign: 'center' }}>
        <Info style={{ width: '48px', height: '48px', color: '#9ca3af', margin: '0 auto 1rem' }} />
        <div style={{ fontSize: '1.1rem', fontWeight: 600, color: '#4b5563' }}>No officer selected</div>
        <div style={{ fontSize: '0.875rem', color: '#9ca3af', marginTop: '0.35rem' }}>Select an officer from the top navigation bar to view their dashboard.</div>
      </div>
    );
  }

  const overall = gapData?.overall_readiness_pct ?? 0;
  const criticalGaps = gapData?.critical_gaps ?? 0;
  const slightGaps   = gapData?.slight_gaps   ?? 0;
  const noGaps       = gapData?.no_gaps       ?? 0;

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '2rem 1.5rem' }}>

      {/* ── Officer header banner ── */}
      <div style={{ background: NAVY, borderRadius: '16px', padding: '1.5rem 2rem', marginBottom: '1.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(255,255,255,0.15)', border: '3px solid rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 700, color: 'white', flexShrink: 0 }}>
            {selectedOfficer.full_name.charAt(0)}
          </div>
          <div>
            <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'white', fontFamily: 'Poppins, sans-serif' }}>{selectedOfficer.full_name}</div>
            <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.75)', marginTop: '0.2rem' }}>
              {selectedOfficer.designation} · {selectedOfficer.department}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => setShowUpload(!showUpload)}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.12)', color: 'white', fontWeight: 600, padding: '0.55rem 1.1rem', borderRadius: '30px', border: '1.5px solid rgba(255,255,255,0.25)', cursor: 'pointer', fontSize: '0.85rem' }}
          >
            <Upload style={{ width: '15px', height: '15px' }} /> Upload Profile
          </button>
          <button
            onClick={onGoAssessment}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: ORANGE, color: 'white', fontWeight: 600, padding: '0.55rem 1.1rem', borderRadius: '30px', border: 'none', cursor: 'pointer', fontSize: '0.85rem' }}
          >
            <Award style={{ width: '15px', height: '15px' }} /> Take Assessment
          </button>
        </div>
      </div>

      {/* ── Profile Upload Panel ── */}
      {showUpload && (
        <div style={{ background: 'white', borderRadius: '14px', padding: '1.5rem', marginBottom: '1.5rem', border: '1px solid #e5e7eb', boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}>
          <div style={{ fontSize: '1rem', fontWeight: 700, color: NAVY, marginBottom: '0.5rem' }}>📄 Update Profile via AI Extraction</div>
          <div style={{ fontSize: '0.82rem', color: '#6b7280', marginBottom: '0.75rem' }}>
            Paste your CV, service record, or any profile text. Our AI will automatically extract experience, certifications, and training history to compute your competency scores.
          </div>
          <textarea
            value={profileText}
            onChange={e => setProfileText(e.target.value)}
            placeholder="Paste your CV or service record here… e.g. 'M.Sc. Statistics. 8 years in data collection division. Trained in Python, R, and SPSS at ISI Delhi 2022. Completed MCTP-I programme. Experience in PLFS fieldwork and household surveys.'"
            rows={6}
            style={{ width: '100%', padding: '0.75rem 1rem', border: '1.5px solid #e5e7eb', borderRadius: '10px', fontSize: '0.875rem', fontFamily: 'inherit', outline: 'none', resize: 'vertical', lineHeight: 1.6 }}
          />
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.75rem' }}>
            <button
              onClick={handleExtract}
              disabled={!profileText.trim() || uploading}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: !profileText.trim() || uploading ? '#9ca3af' : NAVY, color: 'white', fontWeight: 700, padding: '0.6rem 1.5rem', borderRadius: '30px', border: 'none', cursor: !profileText.trim() || uploading ? 'not-allowed' : 'pointer', fontSize: '0.875rem' }}
            >
              {uploading ? <><Loader style={{ width: '15px', height: '15px', animation: 'spin 1s linear infinite' }} /> Analysing…</> : <><RefreshCw style={{ width: '15px', height: '15px' }} /> Extract & Recompute</>}
            </button>
            <button onClick={() => { setShowUpload(false); setProfileText(''); }} style={{ padding: '0.6rem 1.2rem', borderRadius: '30px', border: '1.5px solid #e5e7eb', background: 'white', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600, color: '#4b5563' }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* ── Readiness overview 4-stat bar ── */}
      {officerLoading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#9ca3af' }}>
          <Loader style={{ width: '32px', height: '32px', animation: 'spin 1s linear infinite', margin: '0 auto 0.75rem' }} />
          <div>Loading gap analysis…</div>
        </div>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
            {/* Overall readiness donut */}
            <div style={{ background: 'white', borderRadius: '14px', padding: '1.25rem', border: '1px solid #e5e7eb', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', gridColumn: '1', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', minHeight: '120px' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: 900, color: overall >= 60 ? '#16a34a' : overall >= 30 ? '#d97706' : '#dc2626', fontFamily: 'Poppins, sans-serif', lineHeight: 1 }}>
                {overall.toFixed(0)}%
              </div>
              <div style={{ fontSize: '0.78rem', color: '#6b7280', fontWeight: 600, textAlign: 'center' }}>Overall Readiness<br />for {gapData?.role_code ?? selectedOfficer.role_code}</div>
            </div>

            <div style={{ background: '#fef2f2', borderRadius: '14px', padding: '1.25rem', border: '1px solid #fecaca', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '0.25rem' }}>
              <AlertTriangle style={{ width: '24px', height: '24px', color: '#dc2626' }} />
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#dc2626', fontFamily: 'Poppins, sans-serif', lineHeight: 1 }}>{criticalGaps}</div>
              <div style={{ fontSize: '0.78rem', color: '#dc2626', fontWeight: 600 }}>Critical Gaps</div>
            </div>

            <div style={{ background: '#fffbeb', borderRadius: '14px', padding: '1.25rem', border: '1px solid #fde68a', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '0.25rem' }}>
              <TrendingDown style={{ width: '24px', height: '24px', color: '#d97706' }} />
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#d97706', fontFamily: 'Poppins, sans-serif', lineHeight: 1 }}>{slightGaps}</div>
              <div style={{ fontSize: '0.78rem', color: '#d97706', fontWeight: 600 }}>Moderate Gaps</div>
            </div>

            <div style={{ background: '#f0fdf4', borderRadius: '14px', padding: '1.25rem', border: '1px solid #bbf7d0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '0.25rem' }}>
              <CheckCircle style={{ width: '24px', height: '24px', color: '#16a34a' }} />
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#16a34a', fontFamily: 'Poppins, sans-serif', lineHeight: 1 }}>{noGaps}</div>
              <div style={{ fontSize: '0.78rem', color: '#16a34a', fontWeight: 600 }}>Proficient</div>
            </div>
          </div>

          {/* ── Competency Analysis Breakdown ── */}
          <div style={{ background: 'white', borderRadius: '14px', padding: '1.5rem', border: '1px solid #e5e7eb', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', marginBottom: '1.75rem' }}>
            <div style={{ fontWeight: 800, fontSize: '1.1rem', color: NAVY, fontFamily: 'Poppins, sans-serif', marginBottom: '0.25rem' }}>
              Competency Analysis & Target Benchmarks
            </div>
            <div style={{ fontSize: '0.8rem', color: '#6b7280', marginBottom: '1.25rem' }}>
              Your current assessed levels vs. official MoSPI NKM role requirements ({gapData?.role_code ?? selectedOfficer.role_code})
            </div>
            {gapData ? (
              <CompetencyBreakdown gapData={gapData} />
            ) : (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#9ca3af' }}>
                <Target style={{ width: '32px', height: '32px', margin: '0 auto 0.5rem' }} />
                <div style={{ fontSize: '0.875rem' }}>Upload your profile to see gap analysis</div>
              </div>
            )}
          </div>

          {/* ── Full Interactive Learning Path Roadmap Section ── */}
          <div style={{ background: 'white', borderRadius: '16px', padding: '1.75rem', border: '1px solid #e5e7eb', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
            <LearningPathRoadmap
              recommendations={recsData?.recommendations || []}
              roleCode={gapData?.role_code ?? selectedOfficer.role_code}
              onStartAssessment={onGoAssessment}
            />
          </div>
        </>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
