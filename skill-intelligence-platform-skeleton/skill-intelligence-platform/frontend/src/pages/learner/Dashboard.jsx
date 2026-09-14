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

  const filteredComps = comps.filter(c => {
    if (filterSev === 'critical' && c.gap_severity !== 'critical') return false;
    if (filterSev === 'moderate' && c.gap_severity !== 'moderate') return false;
    if (filterSev === 'proficient' && c.gap_severity !== 'proficient') return false;
    return true;
  });

  const visible = expanded ? filteredComps : filteredComps.slice(0, 10);

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
      
      {/* Enterprise Executive Header Workspace */}
      <div style={{
        background: 'white', borderRadius: '10px', padding: '1.5rem',
        border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        marginBottom: '1.5rem'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.25rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.35rem' }}>
              <h1 style={{ fontSize: '1.35rem', fontWeight: 800, color: NAVY, letterSpacing: '-0.02em' }}>
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
              <FileText size={16} color={NAVY} /> Update Profile Data
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
          <div style={{ fontWeight: 700, color: NAVY, fontSize: '0.95rem', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
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
          <Loader size={36} className="spin" style={{ marginBottom: '1rem', color: NAVY }} />
          <div style={{ fontWeight: 600, color: '#475569' }}>Loading Competency Profile...</div>
        </div>
      ) : (
        <>
          {/* Competency Matrix Enterprise Table */}
          <div className="data-table-container" style={{ marginBottom: '1.75rem' }}>
            <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: NAVY }}>Mandatory Role Competencies ({roleCode})</h3>
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
                      color: filterSev === sev ? NAVY : '#64748b',
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
                    <th>Score (Current / Target)</th>
                    <th>Progress</th>
                    <th>Gap Status</th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map(comp => {
                    const current = comp.current_level ?? 0;
                    const required = comp.required_level ?? 5;
                    const gapAmount = Math.max(0, required - current);
                    const pct = Math.round((current / 5) * 100);
                    const color = comp.gap_severity === 'critical' ? '#dc2626' : comp.gap_severity === 'moderate' ? '#d97706' : '#16a34a';

                    return (
                      <tr key={comp.code}>
                        <td style={{ fontWeight: 700, fontFamily: 'monospace', color: NAVY, fontSize: '0.825rem' }}>
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
                        <td style={{ fontWeight: 600, color: '#334155', fontSize: '0.825rem' }}>
                          {current.toFixed(1)} / {required.toFixed(1)} Pts
                        </td>
                        <td style={{ width: '160px' }}>
                          <div className="progress-bar">
                            <div className="progress-fill" style={{ width: `${pct}%`, background: color }} />
                          </div>
                        </td>
                        <td>
                          {comp.gap_severity !== 'proficient' ? (
                            <span className={comp.gap_severity === 'critical' ? 'badge badge-red' : 'badge badge-amber'}>
                              Deficit: -{gapAmount.toFixed(1)} Pts
                            </span>
                          ) : (
                            <span className="badge badge-green">
                              Met Target ✓
                            </span>
                          )}
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
                  style={{ color: NAVY, fontWeight: 600, fontSize: '0.825rem', background: 'none', border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                >
                  {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  {expanded ? 'Collapse Table' : `View all ${filteredComps.length - 10} additional competencies`}
                </button>
              </div>
            )}
          </div>

          {/* Sequential Learning Path Section */}
          <div style={{ background: 'white', borderRadius: '10px', padding: '1.5rem', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
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

