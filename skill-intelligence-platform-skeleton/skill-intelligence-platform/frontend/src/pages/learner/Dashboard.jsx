import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle, CheckCircle, TrendingDown, BookOpen,
  ClipboardCheck, ChevronDown, ChevronUp, Star, Clock, Target, Upload, Loader,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { fetchGapAnalysis, fetchRecommendations } from '../../services/api';

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

  const overall = gapData?.overall_readiness_pct ?? 0;
  const critical = gapData?.critical_gaps ?? 0;
  const moderate = gapData?.slight_gaps ?? 0;
  const proficient = gapData?.no_gaps ?? 0;
  const comps = gapData?.competencies ?? [];
  const visible = expanded ? comps : comps.slice(0, 6);

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
            <StatCard
              value={`${overall.toFixed(0)}%`}
              label={`Readiness (${gapData?.role_code || user?.role_code})`}
              color={overall >= 60 ? '#16a34a' : overall >= 30 ? '#d97706' : '#dc2626'}
              icon={Target}
            />
            <StatCard value={critical} label="Critical Gaps" color="#dc2626" icon={AlertTriangle} />
            <StatCard value={moderate} label="Moderate Gaps" color="#d97706" icon={TrendingDown} />
            <StatCard value={proficient} label="Proficient Areas" color="#16a34a" icon={CheckCircle} />
          </div>

          {/* Two column */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            {/* Competency breakdown */}
            <div style={{ background: 'white', borderRadius: '14px', padding: '1.5rem', border: '1px solid #e5e7eb', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              <div style={{ fontWeight: 800, fontSize: '1rem', color: NAVY, fontFamily: "'Poppins', sans-serif", marginBottom: '1rem' }}>
                Competency Analysis
              </div>
              {comps.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#9ca3af' }}>
                  <Target size={32} style={{ marginBottom: '0.5rem' }} />
                  <div style={{ fontSize: '0.875rem' }}>No competency data yet. Upload your profile above.</div>
                </div>
              ) : (
                <>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    {visible.map(comp => {
                      const current = comp.current_level ?? 0;
                      const required = comp.required_level ?? 5;
                      const pct = Math.round((current / 5) * 100);
                      const color = comp.gap_severity === 'critical' ? '#dc2626' : comp.gap_severity === 'moderate' ? '#d97706' : '#16a34a';
                      return (
                        <div key={comp.code} style={{ padding: '0.6rem 0.875rem', background: '#f9fafb', borderRadius: '10px', border: '1px solid #f3f4f6' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: NAVY }}>{comp.competency_name}</span>
                            <span style={{ fontSize: '0.72rem', fontWeight: 700, color, background: color + '15', padding: '0.1rem 0.45rem', borderRadius: '8px' }}>
                              {comp.gap_severity === 'proficient' ? '✓ OK' : `Gap ${(required - current).toFixed(1)}`}
                            </span>
                          </div>
                          <div style={{ height: '5px', background: '#e5e7eb', borderRadius: '3px', overflow: 'hidden' }}>
                            <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: '3px', transition: 'width 0.6s ease' }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {comps.length > 6 && (
                    <button onClick={() => setExpanded(!expanded)} style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem', color: NAVY, fontWeight: 600, fontSize: '0.82rem', background: 'none', border: 'none', cursor: 'pointer' }}>
                      {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      {expanded ? 'Show less' : `Show ${comps.length - 6} more`}
                    </button>
                  )}
                </>
              )}
            </div>

            {/* Recommendations */}
            <div style={{ background: 'white', borderRadius: '14px', padding: '1.5rem', border: '1px solid #e5e7eb', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div style={{ fontWeight: 800, fontSize: '1rem', color: NAVY, fontFamily: "'Poppins', sans-serif" }}>
                  Recommended Courses
                </div>
                <button onClick={() => navigate('/dashboard/courses')} style={{ fontSize: '0.78rem', fontWeight: 700, color: ORANGE, background: 'none', border: 'none', cursor: 'pointer' }}>
                  See all →
                </button>
              </div>
              {recsData?.recommendations?.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {recsData.recommendations.slice(0, 5).map(rec => (
                    <CourseChip key={rec.course_id} rec={rec} />
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#9ca3af' }}>
                  <BookOpen size={32} style={{ marginBottom: '0.5rem' }} />
                  <div style={{ fontSize: '0.875rem' }}>No recommendations yet. Upload your profile above.</div>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); }}`}</style>
    </div>
  );
}
