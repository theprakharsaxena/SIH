import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle, CheckCircle, TrendingDown, BookOpen,
  ClipboardCheck, ChevronDown, ChevronUp, Star, Clock, Target, Upload, Loader,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { fetchGapAnalysis, fetchRecommendations } from '../../services/api';
import LearningPathRoadmap from '../../components/LearningPathRoadmap';

const NAVY = '#1a3a6b';
const ORANGE = '#e8720a';

function StatCard({ value, label, color, icon: Icon }) {
  return (
    <div style={{ background: 'white', borderRadius: '14px', padding: '1.25rem', border: '1px solid #e5e7eb', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', textAlign: 'center' }}>
      <Icon size={22} color={color} style={{ marginBottom: '0.4rem' }} />
      <div style={{ fontSize: '2rem', fontWeight: 900, color, fontFamily: "'Poppins', sans-serif", lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 600, marginTop: '0.3rem' }}>{label}</div>
    </div>
  );
}

function CourseChip({ rec }) {
  return (
    <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', padding: '1rem', display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
      <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#eef2fb', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <BookOpen size={18} color={NAVY} />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 700, color: NAVY, fontSize: '0.875rem', marginBottom: '0.25rem', lineHeight: 1.3 }}>{rec.course_title}</div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.72rem', fontWeight: 600, color: NAVY, background: '#eef2fb', padding: '0.15rem 0.5rem', borderRadius: '6px' }}>{rec.provider_type}</span>
          <span style={{ fontSize: '0.72rem', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <Clock size={10} /> {rec.duration_hours}h
          </span>
          <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#16a34a', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <Star size={10} /> {(rec.relevance_score * 100).toFixed(0)}% match
          </span>
        </div>
      </div>
    </div>
  );
}

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

  // Filter raw gaps to ONLY the role-mandated competencies for this officer's role
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
        code.startsWith('OS') ? '📊 Official Statistics' :
        code.startsWith('TC') ? '💻 Technical & Computing' :
        code.startsWith('DG') ? '🏛️ Digital Governance' :
        '🤝 Behavioural & Managerial'
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
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      {/* Welcome banner */}
      <div style={{
        background: `linear-gradient(135deg, ${NAVY} 0%, #2451a3 100%)`,
        borderRadius: '16px', padding: '1.5rem 2rem', marginBottom: '1.5rem',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem',
      }}>
        <div>
          <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'white', fontFamily: "'Poppins', sans-serif" }}>
            Welcome back, {user?.full_name?.split(' ')[0] || 'Officer'} 👋
          </div>
          <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', marginTop: '0.25rem' }}>
            {user?.designation || user?.role_code} · {user?.department}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button onClick={() => setShowUpload(!showUpload)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.12)', color: 'white', border: '1.5px solid rgba(255,255,255,0.25)', borderRadius: '30px', padding: '0.5rem 1.1rem', cursor: 'pointer', fontWeight: 600, fontSize: '0.82rem' }}>
            <Upload size={14} /> Update Profile
          </button>
          <button onClick={() => navigate('/dashboard/assessment')} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: ORANGE, color: 'white', border: 'none', borderRadius: '30px', padding: '0.5rem 1.1rem', cursor: 'pointer', fontWeight: 700, fontSize: '0.82rem' }}>
            <ClipboardCheck size={14} /> Take Assessment
          </button>
        </div>
      </div>

      {/* Upload panel */}
      {showUpload && (
        <div style={{ background: 'white', borderRadius: '14px', padding: '1.5rem', marginBottom: '1.5rem', border: '1px solid #e5e7eb', boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}>
          <div style={{ fontWeight: 700, color: NAVY, marginBottom: '0.5rem' }}>📄 Update Profile via AI Extraction</div>
          <div style={{ fontSize: '0.8rem', color: '#6b7280', marginBottom: '0.75rem' }}>Paste your job description, CV excerpt, or training history and AI will re-analyse your competencies.</div>
          <textarea value={profileText} onChange={e => setProfileText(e.target.value)} rows={5} placeholder="Paste your profile text here…" style={{ width: '100%', padding: '0.75rem', border: '1.5px solid #d1d5db', borderRadius: '10px', fontSize: '0.875rem', fontFamily: 'inherit', resize: 'vertical', boxSizing: 'border-box', outline: 'none' }} />
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.75rem' }}>
            <button onClick={handleUpload} disabled={uploading} style={{ background: NAVY, color: 'white', border: 'none', borderRadius: '8px', padding: '0.6rem 1.25rem', fontWeight: 700, cursor: uploading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
              {uploading ? <><Loader size={14} style={{ animation: 'spin 1s linear infinite' }} /> Analysing…</> : '🤖 Analyse & Update'}
            </button>
            <button onClick={() => setShowUpload(false)} style={{ background: '#f3f4f6', color: '#374151', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '0.6rem 1rem', fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem' }}>Cancel</button>
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: '#9ca3af' }}>
          <Loader size={36} style={{ animation: 'spin 1s linear infinite', marginBottom: '1rem' }} />
          <div>Loading your dashboard…</div>
        </div>
      ) : (
        <>
          {/* Stats row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
            <div onClick={() => setFilterSev('all')} style={{ cursor: 'pointer' }}>
              <StatCard
                value={`${overall.toFixed(0)}%`}
                label={`Readiness (${gapData?.role_code || user?.role_code})`}
                color={overall >= 60 ? '#16a34a' : overall >= 30 ? '#d97706' : '#dc2626'}
                icon={Target}
              />
            </div>
            <div onClick={() => setFilterSev('critical')} style={{ cursor: 'pointer' }}>
              <StatCard value={critical} label="Critical Gaps (Click)" color="#dc2626" icon={AlertTriangle} />
            </div>
            <div onClick={() => setFilterSev('moderate')} style={{ cursor: 'pointer' }}>
              <StatCard value={moderate} label="Moderate Gaps (Click)" color="#d97706" icon={TrendingDown} />
            </div>
            <div onClick={() => setFilterSev('proficient')} style={{ cursor: 'pointer' }}>
              <StatCard value={proficient} label="Proficient Areas (Click)" color="#16a34a" icon={CheckCircle} />
            </div>
          </div>

          {/* Competency breakdown */}
          <div style={{ background: 'white', borderRadius: '14px', padding: '1.5rem', border: '1px solid #e5e7eb', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', marginBottom: '1.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div>
                <div style={{ fontWeight: 800, fontSize: '1rem', color: NAVY, fontFamily: "'Poppins', sans-serif" }}>
                  Competency Analysis & Missing Deficits
                </div>
                <div style={{ fontSize: '0.78rem', color: '#6b7280', marginTop: '0.15rem' }}>
                  Showing exact score requirements vs. current assessed scores
                </div>
              </div>

              {/* Filter tabs */}
              <div style={{ display: 'flex', gap: '0.4rem' }}>
                {['all', 'critical', 'moderate', 'proficient'].map(sev => (
                  <button
                    key={sev}
                    onClick={() => setFilterSev(sev)}
                    style={{
                      padding: '0.3rem 0.75rem', borderRadius: '16px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer',
                      background: filterSev === sev ? (sev === 'critical' ? '#dc2626' : sev === 'moderate' ? '#d97706' : sev === 'proficient' ? '#16a34a' : NAVY) : '#f3f4f6',
                      color: filterSev === sev ? 'white' : '#6b7280', border: 'none', textTransform: 'capitalize'
                    }}
                  >
                    {sev} ({sev === 'all' ? comps.length : sev === 'critical' ? critical : sev === 'moderate' ? moderate : proficient})
                  </button>
                ))}
              </div>
            </div>

            {comps.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#9ca3af' }}>
                <Target size={32} style={{ marginBottom: '0.5rem' }} />
                <div style={{ fontSize: '0.875rem' }}>No competency data yet. Upload your profile above.</div>
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {visible.map(comp => {
                    const current = comp.current_level ?? 0;
                    const required = comp.required_level ?? 5;
                    const gapAmount = Math.max(0, required - current);
                    const pct = Math.round((current / 5) * 100);
                    const color = comp.gap_severity === 'critical' ? '#dc2626' : comp.gap_severity === 'moderate' ? '#d97706' : '#16a34a';

                    return (
                      <div key={comp.code} style={{ padding: '0.8rem 1rem', background: comp.gap_severity === 'critical' ? '#fff5f5' : comp.gap_severity === 'moderate' ? '#fffdf5' : '#f8fafc', borderRadius: '10px', border: `1px solid ${comp.gap_severity === 'critical' ? '#fecaca' : comp.gap_severity === 'moderate' ? '#fde68a' : '#e2e8f0'}` }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: NAVY, background: '#e2e8f0', padding: '0.15rem 0.5rem', borderRadius: '4px', fontFamily: 'monospace' }}>{comp.code}</span>
                            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: NAVY }}>{comp.competency_name}</span>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <span style={{ fontSize: '0.78rem', color: '#475569', fontWeight: 600 }}>
                              Score: {current.toFixed(1)} / {required.toFixed(1)}
                            </span>
                            {comp.gap_severity !== 'proficient' ? (
                              <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#dc2626', background: '#fef2f2', padding: '0.15rem 0.55rem', borderRadius: '8px' }}>
                                Missing: -{gapAmount.toFixed(1)} Pts
                              </span>
                            ) : (
                              <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#16a34a', background: '#dcfce7', padding: '0.15rem 0.55rem', borderRadius: '8px' }}>
                                Met Target ✓
                              </span>
                            )}
                          </div>
                        </div>

                        <div style={{ height: '6px', background: '#e5e7eb', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: '3px', transition: 'width 0.6s ease' }} />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {filteredComps.length > 10 && (
                  <button onClick={() => setExpanded(!expanded)} style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem', color: NAVY, fontWeight: 700, fontSize: '0.82rem', background: 'none', border: 'none', cursor: 'pointer' }}>
                    {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    {expanded ? 'Show less' : `Show all ${filteredComps.length - 10} more missing competencies`}
                  </button>
                )}
              </>
            )}
          </div>

          {/* Sequential Learning Path Roadmap */}
          <div style={{ background: 'white', borderRadius: '16px', padding: '1.5rem', border: '1px solid #e5e7eb', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
            <LearningPathRoadmap
              recommendations={recsData?.recommendations || []}
              roleCode={user?.role_code || gapData?.role_code || 'SSO'}
              selectedOfficer={user}
              onRefreshData={() => load()}
            />
          </div>
        </>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); }}`}</style>
    </div>
  );
}
