import React, { useState } from 'react';
import {
  Upload, RefreshCw, BookOpen, AlertTriangle, CheckCircle,
  TrendingDown, ChevronDown, ChevronUp, Target,
  Award, Loader, Info, Star, Clock, MapPin, Compass
} from 'lucide-react';
import LearningPathRoadmap from '../components/LearningPathRoadmap';

const NAVY = '#1a3a6b';
const ORANGE = '#e8720a';

const ROLE_RELEVANT_COMPETENCIES = {
  JSO: [
    { code: 'OS-01', name: 'Survey Design' },
    { code: 'OS-02', name: 'Sampling Methodology' },
    { code: 'OS-10', name: 'Data Quality Frameworks' },
    { code: 'TC-01', name: 'Python' },
    { code: 'TC-03', name: 'SQL' },
    { code: 'BM-02', name: 'Communication' },
  ],
  SSO: [
    { code: 'OS-03', name: 'National Accounts (GDP)' },
    { code: 'DG-02', name: 'Data Privacy' },
    { code: 'TC-07', name: 'GIS' },
    { code: 'TC-01', name: 'Python' },
    { code: 'TC-08', name: 'Data Visualization' },
    { code: 'BM-01', name: 'Leadership' },
  ],
  'MCTP-II': [
    { code: 'BM-05', name: 'Decision Making' },
    { code: 'DG-05', name: 'Digital Public Infrastructure' },
    { code: 'BM-02', name: 'Communication' },
    { code: 'TC-10', name: 'Cloud Computing' },
    { code: 'BM-06', name: 'Change Management' },
  ],
  'MCTP-III': [
    { code: 'OS-11', name: 'Time Series & Applied Econometrics' },
    { code: 'TC-09', name: 'AI/ML' },
    { code: 'BM-03', name: 'Project Management' },
    { code: 'DG-01', name: 'Cybersecurity' },
    { code: 'BM-04', name: 'Ethics' },
  ],
};

function extractCompetencyList(gapData, roleCode = 'JSO') {
  if (!gapData) return [];
  const rawList = gapData.competencies || gapData.gaps || [];

  const relevant = ROLE_RELEVANT_COMPETENCIES[roleCode] || ROLE_RELEVANT_COMPETENCIES['JSO'];
  const relevantCodes = new Set(relevant.map(r => r.code));
  const relevantNames = relevant.map(r => r.name.toLowerCase());

  const filteredRaw = rawList.filter(item => {
    const code = (item.competency_code || item.code || '').toUpperCase();
    const name = (item.competency_name || item.name || '').toLowerCase();
    if (relevantCodes.has(code)) return true;
    return relevantNames.some(rn => name.includes(rn) || rn.includes(name));
  });

  const listToUse = filteredRaw.length > 0 ? filteredRaw : rawList.slice(0, 6);

  return listToUse.map(item => {
    const code = item.competency_code || item.code || '';
    const name = item.competency_name || item.name || code;
    const current = item.current_score ?? item.current_level ?? 0;
    const required = item.required_score ?? item.required_level ?? 4;
    const gap = item.gap ?? Math.max(0, required - current);

    let severity = item.gap_severity || item.category || 'critical';
    if (severity === 'category_c' || gap > 1.5) {
      severity = 'critical';
    } else if (severity === 'category_b' || (gap > 0 && gap <= 1.5)) {
      severity = 'moderate';
    } else if (severity === 'category_a' || gap <= 0) {
      severity = 'proficient';
    }

    return {
      code,
      competency_name: name,
      domain_category: item.domain_category || item.category_name || (code.startsWith('OS') ? '📊 Official Statistics' : code.startsWith('TC') ? '💻 Technical & Computing' : code.startsWith('DG') ? '🏛️ Digital Governance' : '🤝 Behavioural & Managerial'),
      current_level: current,
      required_level: required,
      gap,
      gap_severity: severity,
    };
  });
}

/* ─── Enhanced Competency Breakdown with Filter Tabs, Search & Exact Deficit Details ─── */
function CompetencyBreakdown({ gapData, activeFilter, setActiveFilter, roleCode = 'JSO' }) {
  const [expanded, setExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const comps = extractCompetencyList(gapData, roleCode);
  if (comps.length === 0) return null;

  const critical = comps.filter(c => c.gap_severity === 'critical');
  const moderate = comps.filter(c => c.gap_severity === 'moderate');
  const proficient = comps.filter(c => c.gap_severity === 'proficient');

  const filtered = comps.filter(c => {
    if (activeFilter === 'critical' && c.gap_severity !== 'critical') return false;
    if (activeFilter === 'moderate' && c.gap_severity !== 'moderate') return false;
    if (activeFilter === 'proficient' && c.gap_severity !== 'proficient') return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const nameMatch = (c.competency_name || '').toLowerCase().includes(q);
      const codeMatch = (c.code || '').toLowerCase().includes(q);
      const domainMatch = (c.domain_category || '').toLowerCase().includes(q);
      if (!nameMatch && !codeMatch && !domainMatch) return false;
    }
    return true;
  });

  const visible = expanded ? filtered : filtered.slice(0, 10);

  const severityColor = (sev) => {
    if (sev === 'critical') return '#dc2626';
    if (sev === 'moderate') return '#d97706';
    if (sev === 'proficient') return '#16a34a';
    return '#9ca3af';
  };

  return (
    <div>
      {/* Category Pills & Filter Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => setActiveFilter('all')}
            style={{
              padding: '0.4rem 0.85rem', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer',
              background: activeFilter === 'all' ? NAVY : '#f3f4f6', color: activeFilter === 'all' ? 'white' : '#4b5563',
              border: activeFilter === 'all' ? `1px solid ${NAVY}` : '1px solid #e5e7eb'
            }}
          >
            All ({comps.length})
          </button>

          <button
            onClick={() => setActiveFilter('critical')}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.4rem 0.85rem', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer',
              background: activeFilter === 'critical' ? '#dc2626' : '#fef2f2', color: activeFilter === 'critical' ? 'white' : '#dc2626',
              border: '1px solid #fecaca'
            }}
          >
            <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: activeFilter === 'critical' ? 'white' : '#dc2626' }} />
            Critical Gaps ({critical.length})
          </button>

          <button
            onClick={() => setActiveFilter('moderate')}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.4rem 0.85rem', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer',
              background: activeFilter === 'moderate' ? '#d97706' : '#fffbeb', color: activeFilter === 'moderate' ? 'white' : '#d97706',
              border: '1px solid #fde68a'
            }}
          >
            <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: activeFilter === 'moderate' ? 'white' : '#d97706' }} />
            Moderate Gaps ({moderate.length})
          </button>

          <button
            onClick={() => setActiveFilter('proficient')}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.4rem 0.85rem', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer',
              background: activeFilter === 'proficient' ? '#16a34a' : '#f0fdf4', color: activeFilter === 'proficient' ? 'white' : '#16a34a',
              border: '1px solid #bbf7d0'
            }}
          >
            <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: activeFilter === 'proficient' ? 'white' : '#16a34a' }} />
            Proficient ({proficient.length})
          </button>
        </div>

        {/* Search Bar */}
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="🔍 Search gap by name or code (e.g. OS-01, Python)..."
          style={{
            padding: '0.4rem 0.85rem', border: '1.5px solid #d1d5db', borderRadius: '8px',
            fontSize: '0.8rem', outline: 'none', fontFamily: 'inherit', minWidth: '240px'
          }}
        />
      </div>

      {/* Active Filter Header Notice */}
      <div style={{ background: '#f8fafc', padding: '0.6rem 0.85rem', borderRadius: '8px', borderLeft: `3px solid ${activeFilter === 'critical' ? '#dc2626' : activeFilter === 'moderate' ? '#d97706' : activeFilter === 'proficient' ? '#16a34a' : NAVY}`, marginBottom: '1rem', fontSize: '0.78rem', color: '#334155' }}>
        <strong>Showing {filtered.length} Competencies:</strong> {activeFilter === 'critical' ? 'Listing all critical skill deficits (deficit ≥ 2.0 pts required for target role).' : activeFilter === 'moderate' ? 'Listing moderate skill gaps (deficit 0.1 to 1.9 pts).' : activeFilter === 'proficient' ? 'Competencies where current score meets or exceeds role target.' : 'All 35 official MoSPI NKM framework competencies.'}
      </div>

      {/* Competency Gap List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {visible.map(comp => {
          const current = comp.current_level ?? 0;
          const required = comp.required_level ?? 5;
          const gapAmount = Math.max(0, required - current);
          const pct = Math.round((current / 5) * 100);
          const color = severityColor(comp.gap_severity);

          return (
            <div key={comp.code} style={{ padding: '0.85rem 1.1rem', background: comp.gap_severity === 'critical' ? '#fff5f5' : comp.gap_severity === 'moderate' ? '#fffdf5' : '#f8fafc', borderRadius: '12px', border: `1px solid ${comp.gap_severity === 'critical' ? '#fecaca' : comp.gap_severity === 'moderate' ? '#fde68a' : '#e2e8f0'}` }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.45rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: NAVY, background: '#e2e8f0', padding: '0.15rem 0.55rem', borderRadius: '6px', fontFamily: 'monospace' }}>
                    {comp.code}
                  </span>
                  <div>
                    <span style={{ fontSize: '0.9rem', fontWeight: 700, color: NAVY }}>{comp.competency_name}</span>
                    {comp.domain_category && (
                      <span style={{ fontSize: '0.72rem', color: '#64748b', marginLeft: '0.6rem', background: 'white', padding: '0.1rem 0.4rem', borderRadius: '4px', border: '1px solid #cbd5e1' }}>
                        {comp.domain_category}
                      </span>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155' }}>
                      Current: {current.toFixed(1)} <span style={{ color: '#94a3b8' }}>/ Req: {required.toFixed(1)}</span>
                    </div>
                    {comp.gap_severity !== 'proficient' ? (
                      <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#dc2626' }}>
                        Missing: -{gapAmount.toFixed(1)} pts ({Math.round((gapAmount / required) * 100)}% gap)
                      </div>
                    ) : (
                      <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#16a34a' }}>
                        Met Role Target ✓
                      </div>
                    )}
                  </div>

                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color, background: color + '18', padding: '0.25rem 0.65rem', borderRadius: '12px', textTransform: 'uppercase', letterSpacing: '0.3px' }}>
                    {comp.gap_severity === 'critical' ? '🔴 Critical Gap' : comp.gap_severity === 'moderate' ? '🟡 Moderate Gap' : '🟢 Proficient'}
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              <div style={{ height: '7px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden', marginBottom: '0.35rem' }}>
                <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: '4px', transition: 'width 0.6s ease' }} />
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length > 10 && (
        <button
          onClick={() => setExpanded(!expanded)}
          style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem', color: NAVY, fontWeight: 700, fontSize: '0.85rem', background: 'none', border: 'none', cursor: 'pointer', padding: '0.5rem 0' }}
        >
          {expanded ? <ChevronUp style={{ width: '16px', height: '16px' }} /> : <ChevronDown style={{ width: '16px', height: '16px' }} />}
          {expanded ? 'Show less' : `Show all ${filtered.length - 10} more missing competencies`}
        </button>
      )}
    </div>
  );
}
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
  const [activeGapFilter, setActiveGapFilter] = useState('all');

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

  const roleCode = gapData?.role_code ?? selectedOfficer?.role_code ?? 'JSO';
  const comps = extractCompetencyList(gapData, roleCode);

  const criticalGaps = comps.filter(c => c.gap_severity === 'critical').length;
  const slightGaps   = comps.filter(c => c.gap_severity === 'moderate').length;
  const noGaps       = comps.filter(c => c.gap_severity === 'proficient').length;

  const totalRequired = comps.reduce((acc, c) => acc + (c.required_level || 0), 0);
  const totalCurrent = comps.reduce((acc, c) => acc + (c.current_level || 0), 0);
  const overall = totalRequired > 0 ? Math.min(100, Math.round((totalCurrent / totalRequired) * 100)) : 0;

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
            <div
              onClick={() => setActiveGapFilter('all')}
              style={{ background: activeGapFilter === 'all' ? '#f8fafc' : 'white', borderRadius: '14px', padding: '1.25rem', border: activeGapFilter === 'all' ? `2px solid ${NAVY}` : '1px solid #e5e7eb', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', cursor: 'pointer', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', minHeight: '120px' }}
            >
              <div style={{ fontSize: '2.5rem', fontWeight: 900, color: overall >= 60 ? '#16a34a' : overall >= 30 ? '#d97706' : '#dc2626', fontFamily: 'Poppins, sans-serif', lineHeight: 1 }}>
                {overall.toFixed(0)}%
              </div>
              <div style={{ fontSize: '0.78rem', color: '#6b7280', fontWeight: 600, textAlign: 'center' }}>Overall Readiness<br />for {gapData?.role_code ?? selectedOfficer.role_code}</div>
            </div>

            {/* Critical Gaps Stat Box */}
            <div
              onClick={() => setActiveGapFilter('critical')}
              style={{
                background: activeGapFilter === 'critical' ? '#fee2e2' : '#fef2f2',
                borderRadius: '14px', padding: '1.25rem',
                border: activeGapFilter === 'critical' ? '2.5px solid #dc2626' : '1px solid #fecaca',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)', cursor: 'pointer',
                display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '0.25rem',
                transition: 'all 0.2s'
              }}
            >
              <AlertTriangle style={{ width: '24px', height: '24px', color: '#dc2626' }} />
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#dc2626', fontFamily: 'Poppins, sans-serif', lineHeight: 1 }}>{criticalGaps}</div>
              <div style={{ fontSize: '0.78rem', color: '#dc2626', fontWeight: 700 }}>Critical Gaps (Click to view)</div>
            </div>

            {/* Moderate Gaps Stat Box */}
            <div
              onClick={() => setActiveGapFilter('moderate')}
              style={{
                background: activeGapFilter === 'moderate' ? '#fef3c7' : '#fffbeb',
                borderRadius: '14px', padding: '1.25rem',
                border: activeGapFilter === 'moderate' ? '2.5px solid #d97706' : '1px solid #fde68a',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)', cursor: 'pointer',
                display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '0.25rem',
                transition: 'all 0.2s'
              }}
            >
              <TrendingDown style={{ width: '24px', height: '24px', color: '#d97706' }} />
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#d97706', fontFamily: 'Poppins, sans-serif', lineHeight: 1 }}>{slightGaps}</div>
              <div style={{ fontSize: '0.78rem', color: '#d97706', fontWeight: 700 }}>Moderate Gaps (Click to view)</div>
            </div>

            {/* Proficient Stat Box */}
            <div
              onClick={() => setActiveGapFilter('proficient')}
              style={{
                background: activeGapFilter === 'proficient' ? '#dcfce7' : '#f0fdf4',
                borderRadius: '14px', padding: '1.25rem',
                border: activeGapFilter === 'proficient' ? '2.5px solid #16a34a' : '1px solid #bbf7d0',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)', cursor: 'pointer',
                display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '0.25rem',
                transition: 'all 0.2s'
              }}
            >
              <CheckCircle style={{ width: '24px', height: '24px', color: '#16a34a' }} />
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#16a34a', fontFamily: 'Poppins, sans-serif', lineHeight: 1 }}>{noGaps}</div>
              <div style={{ fontSize: '0.78rem', color: '#16a34a', fontWeight: 700 }}>Proficient Areas (Click to view)</div>
            </div>
          </div>

          {/* ── Competency Analysis Breakdown ── */}
          <div style={{ background: 'white', borderRadius: '14px', padding: '1.5rem', border: '1px solid #e5e7eb', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', marginBottom: '1.75rem' }}>
            <div style={{ fontWeight: 800, fontSize: '1.1rem', color: NAVY, fontFamily: 'Poppins, sans-serif', marginBottom: '0.25rem' }}>
              Competency Analysis & Target Benchmarks
            </div>
            <div style={{ fontSize: '0.8rem', color: '#6b7280', marginBottom: '1.25rem' }}>
              Detailed breakdown of current levels vs. official NKM target benchmarks for {gapData?.role_code ?? selectedOfficer.role_code}
            </div>
            {gapData ? (
              <CompetencyBreakdown gapData={gapData} activeFilter={activeGapFilter} setActiveFilter={setActiveGapFilter} roleCode={roleCode} />
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
              selectedOfficer={selectedOfficer}
              onRefreshData={onRefreshData}
            />
          </div>
        </>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
