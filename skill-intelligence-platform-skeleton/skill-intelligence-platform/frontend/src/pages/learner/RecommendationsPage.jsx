import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Clock, Star, ExternalLink, Filter, Loader, Cpu, CheckCircle2, ArrowRight } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { fetchRecommendations } from '../../services/api';

const NAVY = '#14343b';
const TERRACOTTA = '#c4713d';

export default function RecommendationsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [recs, setRecs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [providerFilter, setProviderFilter] = useState('All');

  useEffect(() => {
    if (!user?.id) return;
    fetchRecommendations(user.id, 15)
      .then(data => setRecs(data?.recommendations || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user?.id]);

  const filtered = recs.filter(r => {
    if (providerFilter !== 'All' && r.provider_type !== providerFilter) return false;
    return true;
  });

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
            Lifecycle Step 7
          </span>
          <span style={{ background: 'rgba(255,255,255,0.15)', color: '#cbd5e1', padding: '0.2rem 0.65rem', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 700 }}>
            Official Government Capacity Infrastructure
          </span>
        </div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: '0.4rem 0', color: 'white', letterSpacing: '-0.02em' }}>
          iGOT & NSSTA Official Course Recommendations
        </h1>
        <p style={{ color: '#cbd5e1', fontSize: '0.925rem', maxWidth: '800px', lineHeight: 1.5 }}>
          Curated learning programmes from iGOT Karmayogi Bharat and NSSTA Greater Noida, backed by explainable AI selection rationales matching your officer mandate.
        </p>
      </div>

      {/* Explainable AI Rationale Highlight */}
      <div style={{ background: 'white', borderRadius: '14px', padding: '1.25rem 1.5rem', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Cpu size={22} color="#2563eb" />
        </div>
        <div>
          <div style={{ fontWeight: 800, color: NAVY, fontSize: '0.95rem' }}>Explainable AI Recommendation Rationale</div>
          <div style={{ fontSize: '0.825rem', color: '#64748b', marginTop: '0.15rem' }}>
            Recommendations evaluate your designation ({user?.role_code || 'SSO'}), current assignment ({user?.current_assignment || 'DQAD'}), diagnosed gap level, and prior training to select official modules that de-duplicate effort.
          </div>
        </div>
      </div>

      {/* Provider Filter Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {['All', 'iGOT', 'NSSTA'].map(p => (
            <button
              key={p}
              onClick={() => setProviderFilter(p)}
              style={{
                padding: '0.45rem 1.1rem', borderRadius: '20px', border: '1px solid', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer',
                background: providerFilter === p ? NAVY : 'white',
                color: providerFilter === p ? 'white' : '#64748b',
                borderColor: providerFilter === p ? NAVY : '#cbd5e1'
              }}
            >
              {p === 'All' ? 'All Providers' : p === 'iGOT' ? 'iGOT Karmayogi' : 'NSSTA Greater Noida'}
            </button>
          ))}
        </div>
        <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>
          Showing {filtered.length} official courses
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: '#94a3b8' }}>
          <Loader size={36} className="spin" style={{ marginBottom: '1rem', color: NAVY }} />
          <div>Matching Official Courses...</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '2rem' }}>
          {filtered.map((rec, idx) => (
            <div key={rec.course_id || idx} style={{
              background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0',
              padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <div>
                  <span style={{
                    background: rec.provider_type === 'iGOT' ? '#eff6ff' : '#fff7ed',
                    color: rec.provider_type === 'iGOT' ? '#1d4ed8' : TERRACOTTA,
                    padding: '0.2rem 0.65rem', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 800
                  }}>
                    {rec.provider_type === 'iGOT' ? 'iGOT Karmayogi Bharat' : 'NSSTA Greater Noida'}
                  </span>
                  <h3 style={{ margin: '0.4rem 0 0 0', color: NAVY, fontSize: '1.15rem', fontWeight: 800 }}>
                    {rec.course_title}
                  </h3>
                </div>

                <a
                  href="https://igotkarmayogi.gov.in"
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    background: TERRACOTTA, color: 'white', border: 'none', borderRadius: '8px', padding: '0.55rem 1.1rem',
                    fontWeight: 800, fontSize: '0.825rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.35rem'
                  }}
                >
                  Start Course on iGOT Portal <ExternalLink size={14} />
                </a>
              </div>

              <div style={{ fontSize: '0.825rem', color: '#64748b', marginBottom: '0.85rem' }}>
                <strong>Target Competency:</strong> {rec.competency_name} · <strong>Duration:</strong> {rec.duration_hours || 10} Hours · <strong>Level:</strong> {rec.level || 'Intermediate'}
              </div>

              {/* Rationale box */}
              <div style={{ background: '#f8fafc', padding: '0.85rem 1rem', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.825rem', color: '#334155', lineHeight: 1.5 }}>
                <strong style={{ color: NAVY }}>Explainable AI Rationale:</strong> {rec.reason_text || 'Matched specifically to close diagnosed competency deficit.'}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Footer Navigation */}
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button onClick={() => navigate('/dashboard/progress')} style={{ background: TERRACOTTA, color: 'white', border: 'none', borderRadius: '10px', padding: '0.85rem 2rem', fontWeight: 800, fontSize: '0.95rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          Proceed to Progress Evaluation & Handbook Upload (Step 8) <ArrowRight size={18} />
        </button>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); }}`}</style>
    </div>
  );
}
