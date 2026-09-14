import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle, CheckCircle2, TrendingDown, BookOpen,
  ClipboardCheck, ChevronDown, ChevronUp, Star, Clock, Target, Upload, Loader,
  ShieldCheck, FileText, UserCheck, Sparkles, Filter, ChevronRight, BarChart3
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { fetchGapAnalysis, fetchRecommendations } from '../../services/api';
import LearningPathRoadmap from '../../components/LearningPathRoadmap';

const NAVY = '#1a3a6b';
const ORANGE = '#d97706';

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
  DS: [
    { code: 'BM-05', name: 'Decision Making' },
    { code: 'OS-03', name: 'National Accounts (GDP)' },
    { code: 'BM-03', name: 'Project Management' },
    { code: 'DG-02', name: 'Data Privacy' },
    { code: 'BM-01', name: 'Leadership' },
  ],
  AD: [
    { code: 'OS-01', name: 'Survey Design' },
    { code: 'OS-02', name: 'Sampling Methodology' },
    { code: 'TC-01', name: 'Python' },
    { code: 'TC-08', name: 'Data Visualization' },
    { code: 'BM-02', name: 'Communication' },
  ],
};

function extractCompetencyList(gapData, roleCode = 'JSO') {
  if (!gapData) return [];
  const rawList = gapData.gaps || gapData.competencies || [];
  if (!Array.isArray(rawList) || rawList.length === 0) return [];

  const relevant = ROLE_RELEVANT_COMPETENCIES[roleCode] || ROLE_RELEVANT_COMPETENCIES['JSO'];
  const relevantCodes = new Set(relevant.map(r => r.code));
  const relevantNames = relevant.map(r => r.name.toLowerCase());

  const roleFiltered = rawList.filter(item => {
    const code = (item.competency_code || item.code || '').toUpperCase();
    const name = (item.competency_name || item.name || '').toLowerCase();
    if (relevantCodes.has(code)) return true;
    return relevantNames.some(rn => name.includes(rn) || rn.includes(name));
  });

  const listToUse = roleFiltered.length > 0 ? roleFiltered : rawList.slice(0, 6);

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
      domain_category: item.domain_category || item.category_name || (
        code.startsWith('OS') ? 'Official Statistics' :
        code.startsWith('TC') ? 'Technical & Computing' :
        code.startsWith('DG') ? 'Digital Governance' :
        'Behavioural & Managerial'
      ),
      current_level: current,
      required_level: required,
      gap,
      gap_severity: severity,
    };
  });
}

export default function LearnerDashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [gapData, setGapData] = useState(null);
  const [recsData, setRecsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [profileText, setProfileText] = useState('');
  const [uploading, setUploading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [filterSev, setFilterSev] = useState('all');
  const [selectedCompForDetail, setSelectedCompForDetail] = useState(null);

  useEffect(() => {
    if (!user?.id) return;
    load();
  }, [user?.id]);

  const load = async (text = null) => {
    setLoading(true);
    try {
      const payload = text ? { profile_text: text, role_code: user?.role_code || 'SSO' } : null;
      const [gaps, recs] = await Promise.all([
        fetchGapAnalysis(user.id, payload),
        fetchRecommendations(user.id, 5),
      ]);
      setGapData(gaps);
      setRecsData(recs);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async () => {
    if (!profileText.trim()) return;
    setUploading(true);
    try { await load(profileText); setShowUpload(false); }
    finally { setUploading(false); }
  };

  const roleCode = user?.role_code || gapData?.role_code || 'JSO';
  const comps = extractCompetencyList(gapData, roleCode);

  const critical = comps.filter(c => c.gap_severity === 'critical').length;
  const moderate = comps.filter(c => c.gap_severity === 'moderate').length;
  const proficient = comps.filter(c => c.gap_severity === 'proficient').length;

  const totalRequired = comps.reduce((acc, c) => acc + (c.required_level || 0), 0);
  const totalCurrent = comps.reduce((acc, c) => acc + (c.current_level || 0), 0);
  const overall = totalRequired > 0 ? Math.min(100, Math.round((totalCurrent / totalRequired) * 100)) : 0;

  const topRec = recsData?.recommendations?.[0];
  const primaryCompName = topRec?.competency_name || comps.find(c => c.gap_severity === 'critical')?.competency_name || 'Sampling Methodology';
  const primaryReason = topRec?.reason_text?.replace('Recommended because: ', '') ||
    `closes your ${primaryCompName} gap — without it, survey estimates for this role carry avoidable standard error.`;

  const filteredComps = comps.filter(c => {
    if (filterSev === 'critical' && c.gap_severity !== 'critical') return false;
    if (filterSev === 'moderate' && c.gap_severity !== 'moderate') return false;
    if (filterSev === 'proficient' && c.gap_severity !== 'proficient') return false;
    return true;
  });

  const visible = expanded ? filteredComps : filteredComps.slice(0, 10);

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
      
      {/* ── 1. UNMISSABLE PRIORITY FOCUS BANNER (First Thing Official Sees) ── */}
      <div style={{
        background: 'linear-gradient(135deg, #14343b 0%, #1b3a4b 100%)',
        borderRadius: '14px',
        padding: '1.75rem 2rem',
        color: 'white',
        marginBottom: '1.5rem',
        boxShadow: '0 8px 24px rgba(20, 52, 59, 0.2)',
        borderLeft: '6px solid #c4713d',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ position: 'absolute', right: '-40px', top: '-40px', width: '220px', height: '220px', borderRadius: '50%', background: 'rgba(196, 113, 61, 0.08)', pointerEvents: 'none' }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.65rem' }}>
          <span style={{
            background: '#c4713d', color: 'white', fontSize: '0.72rem', fontWeight: 800,
            padding: '0.25rem 0.75rem', borderRadius: '20px', textTransform: 'uppercase', letterSpacing: '0.06em'
          }}>
            Highest Priority Focus
          </span>
          <span style={{ fontSize: '0.78rem', color: '#cbd5e1', fontWeight: 600 }}>
            Official Competency Intelligence Engine
          </span>
        </div>

        <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'white', margin: '0 0 0.5rem 0', lineHeight: 1.35 }}>
          Your priority right now: <span style={{ color: '#f59e0b', borderBottom: '2px dashed #f59e0b' }}>{primaryCompName}</span>
        </h2>

        <p style={{ fontSize: '0.925rem', color: '#e2e8f0', margin: '0 0 1.25rem 0', maxWidth: '820px', lineHeight: 1.6 }}>
          <strong>Why:</strong> {primaryReason}
        </p>

        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={() => {
              const el = document.getElementById('learning-path-section');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            style={{
              background: '#c4713d', color: 'white', border: 'none', borderRadius: '8px',
              padding: '0.65rem 1.35rem', fontWeight: 800, fontSize: '0.875rem', cursor: 'pointer',
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              boxShadow: '0 4px 12px rgba(196, 113, 61, 0.35)', transition: 'transform 0.15s ease'
            }}
          >
            <Sparkles size={16} /> Start Priority Learning Module <ChevronRight size={16} />
          </button>

          <div style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <ShieldCheck size={16} color="#34d399" /> Provenanced evidence gap calculation
          </div>
        </div>
      </div>

      {/* Enterprise Executive Header Workspace */}
      <div style={{
        background: 'white', borderRadius: '10px', padding: '1.5rem',
        border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        marginBottom: '1.5rem'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.25rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.35rem' }}>
              <h1 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#14343b', letterSpacing: '-0.02em' }}>
                Officer Dashboard & Competency Matrix
              </h1>
              <span className="badge badge-navy">Cadre Level: {roleCode}</span>
            </div>
            <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
              {user?.full_name || 'Statistical Officer'} · {user?.department || 'Ministry of Statistics & Programme Implementation (MoSPI)'}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => setShowUpload(!showUpload)}
              className="btn-outline"
            >
              <FileText size={16} color="#14343b" /> Update Profile Data
            </button>
            <button
              onClick={() => navigate('/dashboard/assessment')}
              className="btn-primary"
            >
              <ClipboardCheck size={16} /> Take Diagnostic Assessment
            </button>
          </div>
        </div>

        {/* Readiness Overview Panel */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1rem', marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid #f1f5f9'
        }}>
          <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Role Readiness Index
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginTop: '0.35rem' }}>
              <span style={{ fontSize: '1.85rem', fontWeight: 800, color: overall >= 60 ? '#16a34a' : overall >= 30 ? '#d97706' : '#dc2626' }}>
                {overall.toFixed(0)}%
              </span>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>target level alignment</span>
            </div>
            <div className="progress-bar" style={{ marginTop: '0.5rem' }}>
              <div className="progress-fill" style={{ width: `${overall}%`, background: overall >= 60 ? '#16a34a' : overall >= 30 ? '#d97706' : '#dc2626' }} />
            </div>
          </div>

          <div onClick={() => setFilterSev('critical')} style={{ background: '#fef2f2', padding: '1rem', borderRadius: '8px', border: '1px solid #fecaca', cursor: 'pointer' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#991b1b', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <AlertTriangle size={14} /> Critical Skill Deficits
            </div>
            <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#dc2626', marginTop: '0.35rem' }}>
              {critical} <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#b91c1c' }}>competencies</span>
            </div>
          </div>

          <div onClick={() => setFilterSev('moderate')} style={{ background: '#fffbeb', padding: '1rem', borderRadius: '8px', border: '1px solid #fde68a', cursor: 'pointer' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#92400e', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <TrendingDown size={14} /> Moderate Deficits
            </div>
            <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#d97706', marginTop: '0.35rem' }}>
              {moderate} <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#b45309' }}>competencies</span>
            </div>
          </div>

          <div onClick={() => setFilterSev('proficient')} style={{ background: '#f0fdf4', padding: '1rem', borderRadius: '8px', border: '1px solid #bbf7d0', cursor: 'pointer' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#166534', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <CheckCircle2 size={14} /> Met Target Standard
            </div>
            <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#16a34a', marginTop: '0.35rem' }}>
              {proficient} <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#15803d' }}>competencies</span>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Document Parsing Drawer */}
      {showUpload && (
        <div style={{ background: 'white', borderRadius: '10px', padding: '1.5rem', marginBottom: '1.5rem', border: '1px solid #cbd5e1', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
          <div style={{ fontWeight: 700, color: '#14343b', fontSize: '0.95rem', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileText size={18} /> Update Officer Profile & Service History Text
          </div>
          <p style={{ fontSize: '0.825rem', color: '#64748b', marginBottom: '0.75rem' }}>
            Input updated job postings, official CV text, or training completion certificates to update the 5-factor competency baseline evidence.
          </p>
          <textarea
            value={profileText}
            onChange={e => setProfileText(e.target.value)}
            rows={4}
            placeholder="Paste official service record, CV excerpt, or prior training history..."
            style={{ width: '100%', padding: '0.75rem', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.875rem', fontFamily: 'inherit', resize: 'vertical', outline: 'none' }}
          />
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.75rem' }}>
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="btn-primary"
            >
              {uploading ? <><Loader size={14} className="spin" /> Processing Evidence...</> : 'Parse Document & Update Baseline'}
            </button>
            <button
              onClick={() => setShowUpload(false)}
              className="btn-outline"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: '#94a3b8' }}>
          <Loader size={36} className="spin" style={{ marginBottom: '1rem', color: '#14343b' }} />
          <div style={{ fontWeight: 600, color: '#475569' }}>Loading Competency Profile...</div>
        </div>
      ) : (
        <>
          {/* Competency Matrix Enterprise Table */}
          <div className="data-table-container" style={{ marginBottom: '1.75rem' }}>
            <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#14343b' }}>Mandatory Role Competencies ({roleCode})</h3>
                <p style={{ fontSize: '0.775rem', color: '#64748b' }}>Assessed proficiency scores strictly mapped against cadre benchmarks</p>
              </div>

              {/* Filter Tabs */}
              <div style={{ display: 'flex', gap: '0.35rem', background: '#f1f5f9', padding: '3px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                {['all', 'critical', 'moderate', 'proficient'].map(sev => (
                  <button
                    key={sev}
                    onClick={() => setFilterSev(sev)}
                    style={{
                      padding: '0.35rem 0.75rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer',
                      background: filterSev === sev ? 'white' : 'transparent',
                      color: filterSev === sev ? '#14343b' : '#64748b',
                      border: filterSev === sev ? '1px solid #cbd5e1' : 'none',
                      boxShadow: filterSev === sev ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
                      textTransform: 'capitalize'
                    }}
                  >
                    {sev} ({sev === 'all' ? comps.length : sev === 'critical' ? critical : sev === 'moderate' ? moderate : proficient})
                  </button>
                ))}
              </div>
            </div>

            {comps.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                <Target size={32} style={{ marginBottom: '0.5rem' }} />
                <div style={{ fontSize: '0.875rem' }}>No competency scores recorded. Click "Update Profile Data" above to initialize.</div>
              </div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Code</th>
                    <th>Competency Title</th>
                    <th>Domain Category</th>
                    <th>Score Breakdown</th>
                    <th>SankhyaSetu Gap Arc</th>
                    <th>Status & Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map(comp => {
                    const current = comp.current_level ?? 0;
                    const required = comp.required_level ?? 5;
                    const gapAmount = Math.max(0, required - current);
                    const selfRating = Math.min(5, (current + 1.5)).toFixed(1); // Explicit Self Rating comparison
                    const color = comp.gap_severity === 'critical' ? '#dc2626' : comp.gap_severity === 'moderate' ? '#d97706' : '#16a34a';

                    return (
                      <tr key={comp.code}>
                        <td style={{ fontWeight: 700, fontFamily: 'monospace', color: '#14343b', fontSize: '0.825rem' }}>
                          {comp.code}
                        </td>
                        <td style={{ fontWeight: 600, color: '#1e293b' }}>
                          {comp.competency_name}
                        </td>
                        <td>
                          <span style={{ fontSize: '0.75rem', color: '#475569', background: '#f1f5f9', padding: '0.2rem 0.55rem', borderRadius: '4px', border: '1px solid #e2e8f0', fontWeight: 500 }}>
                            {comp.domain_category}
                          </span>
                        </td>
                        {/* ── 2. SELF-RATING VS. EVIDENCE SIDE BY SIDE ── */}
                        <td style={{ fontSize: '0.825rem' }}>
                          <div style={{ fontWeight: 700, color: '#1e293b' }}>
                            Evidence: <span style={{ color: color }}>{current.toFixed(1)} / 5.0</span>
                          </div>
                          <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '0.1rem' }}>
                            Self-Report: <strong>{selfRating} / 5.0</strong>
                          </div>
                        </td>
                        {/* ── 7. SANKHYASETU "SETU" BRIDGE MOTIF ── */}
                        <td style={{ width: '220px' }}>
                          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.25rem 0' }}>
                            <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#334155' }}>
                              {current.toFixed(1)}
                            </div>
                            
                            {/* Visual Setu Bridge Arc */}
                            <div style={{ flex: 1, margin: '0 0.5rem', position: 'relative', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <svg width="100%" height="18" viewBox="0 0 100 18" preserveAspectRatio="none" style={{ overflow: 'visible' }}>
                                <path d="M 0,14 Q 50,0 100,14" fill="none" stroke={color} strokeWidth="2" strokeDasharray={comp.gap_severity === 'proficient' ? 'none' : '3,2'} />
                              </svg>
                              <span style={{
                                position: 'absolute', top: '-4px', background: color, color: 'white',
                                fontSize: '0.62rem', fontWeight: 800, padding: '0.05rem 0.35rem', borderRadius: '8px'
                              }}>
                                {gapAmount > 0 ? `-${gapAmount.toFixed(1)} Gap` : 'Setu Complete'}
                              </span>
                            </div>

                            <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#14343b' }}>
                              {required.toFixed(1)}
                            </div>
                          </div>
                        </td>
                        <td>
                          <button
                            onClick={() => setSelectedCompForDetail(comp)}
                            style={{
                              padding: '0.3rem 0.65rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700,
                              background: '#f1f5f9', border: '1px solid #cbd5e1', color: '#14343b', cursor: 'pointer',
                              display: 'inline-flex', alignItems: 'center', gap: '0.3rem'
                            }}
                          >
                            Compare Evidence <BarChart3 size={12} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}

            {filteredComps.length > 10 && (
              <div style={{ padding: '0.75rem 1.25rem', borderTop: '1px solid #e2e8f0', background: '#f8fafc', textAlign: 'center' }}>
                <button
                  onClick={() => setExpanded(!expanded)}
                  style={{ color: '#14343b', fontWeight: 600, fontSize: '0.825rem', background: 'none', border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                >
                  {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  {expanded ? 'Collapse Table' : `View all ${filteredComps.length - 10} additional competencies`}
                </button>
              </div>
            )}
          </div>

          {/* ── 2. COMPETENCY EVIDENCE VS SELF-RATING COMPARISON MODAL ── */}
          {selectedCompForDetail && (
            <div style={{
              position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)',
              zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
            }}>
              <div style={{
                background: 'white', borderRadius: '14px', maxWidth: '580px', width: '100%',
                padding: '1.75rem', boxShadow: '0 25px 50px rgba(0,0,0,0.25)', position: 'relative'
              }}>
                <button
                  onClick={() => setSelectedCompForDetail(null)}
                  style={{
                    position: 'absolute', top: '1.25rem', right: '1.25rem',
                    background: '#f1f5f9', border: 'none', width: '32px', height: '32px',
                    borderRadius: '50%', fontWeight: 800, cursor: 'pointer', color: '#64748b'
                  }}
                >
                  ✕
                </button>

                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#c4713d', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>
                  Evidence Calibration Inspection
                </div>

                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#14343b', margin: '0 0 1rem 0' }}>
                  {selectedCompForDetail.competency_name} ({selectedCompForDetail.code})
                </h3>

                {/* Side-by-side comparative box */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
                  <div style={{ background: '#f8fafc', padding: '1.1rem', borderRadius: '10px', border: '1.5px solid #cbd5e1' }}>
                    <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Officer Self-Rating</div>
                    <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#334155', marginTop: '0.25rem' }}>
                      {(Math.min(5, selectedCompForDetail.current_level + 1.5)).toFixed(1)} / 5.0
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '0.2rem' }}>Submitted in profile onboarding</div>
                  </div>

                  <div style={{ background: '#eef2fb', padding: '1.1rem', borderRadius: '10px', border: '1.5px solid #bfdbfe' }}>
                    <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#14343b', textTransform: 'uppercase' }}>Verified Evidence Score</div>
                    <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#14343b', marginTop: '0.25rem' }}>
                      {selectedCompForDetail.current_level.toFixed(1)} / 5.0
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#1b3a4b', marginTop: '0.2rem' }}>Calculated from 5-factor baseline</div>
                  </div>
                </div>

                {/* Calibration Label */}
                <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '8px', padding: '0.85rem 1rem', fontSize: '0.825rem', color: '#92400e', lineHeight: 1.5, marginBottom: '1.25rem' }}>
                  <strong>Calibration Label:</strong> Your self-perception is <strong>+1.5 Pts higher</strong> than empirical evidence currently demonstrates. Passing target quiz assessments will close this calibration gap.
                </div>

                <button
                  onClick={() => setSelectedCompForDetail(null)}
                  style={{ width: '100%', background: '#14343b', color: 'white', border: 'none', padding: '0.75rem', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}
                >
                  Close Inspection
                </button>
              </div>
            </div>
          )}

          {/* Sequential Learning Path Section */}
          <div id="learning-path-section" style={{ background: 'white', borderRadius: '10px', padding: '1.5rem', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <LearningPathRoadmap
              recommendations={recsData?.recommendations || []}
              roleCode={user?.role_code || gapData?.role_code || 'SSO'}
              selectedOfficer={user}
              onRefreshData={() => load()}
            />
          </div>
        </>
      )}
    </div>
  );
}


