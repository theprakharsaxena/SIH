import React, { useState, useEffect } from 'react';
import { BookOpen, Clock, Star, Filter, Loader, ExternalLink } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { fetchRecommendations } from '../../services/api';

const NAVY = '#1a3a6b';
const ORANGE = '#e8720a';

const LEVELS = ['All', 'Beginner', 'Intermediate', 'Advanced'];
const PROVIDERS = ['All', 'iGOT', 'NSSTA'];

export default function CoursesPage() {
  const { user } = useAuth();
  const [recs, setRecs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [levelFilter, setLevelFilter] = useState('All');
  const [providerFilter, setProviderFilter] = useState('All');
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!user?.id) return;
    fetchRecommendations(user.id, 20)
      .then(data => setRecs(data?.recommendations || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user?.id]);

  const filtered = recs.filter(r => {
    if (levelFilter !== 'All' && r.level !== levelFilter) return false;
    if (providerFilter !== 'All' && r.provider_type !== providerFilter) return false;
    if (search && !r.course_title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 800, color: NAVY, fontSize: '1.4rem', marginBottom: '0.3rem' }}>
          My Recommended Courses
        </h1>
        <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
          AI-curated courses from iGOT Karmayogi and NSSTA, matched to your skill gaps
        </p>
      </div>

      {/* Filters */}
      <div style={{ background: 'white', borderRadius: '12px', padding: '1rem 1.25rem', border: '1px solid #e5e7eb', marginBottom: '1.25rem', display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <Filter size={16} color="#9ca3af" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search courses…"
          style={{ flex: 1, minWidth: '180px', padding: '0.45rem 0.75rem', border: '1.5px solid #d1d5db', borderRadius: '8px', fontSize: '0.875rem', outline: 'none', fontFamily: 'inherit' }}
        />
        <div style={{ display: 'flex', gap: '0.4rem' }}>
          {LEVELS.map(l => (
            <button key={l} onClick={() => setLevelFilter(l)} style={{ padding: '0.35rem 0.85rem', borderRadius: '20px', border: '1.5px solid', fontWeight: 600, fontSize: '0.78rem', cursor: 'pointer', background: levelFilter === l ? NAVY : 'white', color: levelFilter === l ? 'white' : '#6b7280', borderColor: levelFilter === l ? NAVY : '#d1d5db' }}>
              {l}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '0.4rem' }}>
          {PROVIDERS.map(p => (
            <button key={p} onClick={() => setProviderFilter(p)} style={{ padding: '0.35rem 0.85rem', borderRadius: '20px', border: '1.5px solid', fontWeight: 600, fontSize: '0.78rem', cursor: 'pointer', background: providerFilter === p ? ORANGE : 'white', color: providerFilter === p ? 'white' : '#6b7280', borderColor: providerFilter === p ? ORANGE : '#d1d5db' }}>
              {p}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: '#9ca3af' }}>
          <Loader size={36} style={{ animation: 'spin 1s linear infinite', marginBottom: '1rem' }} />
          <div>Loading your courses…</div>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: '#9ca3af' }}>
          <BookOpen size={48} style={{ marginBottom: '1rem' }} />
          <div style={{ fontWeight: 600, fontSize: '1rem', color: '#4b5563', marginBottom: '0.5rem' }}>No courses found</div>
          <div style={{ fontSize: '0.875rem' }}>Try adjusting your filters or upload your profile to get recommendations.</div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
          {filtered.map(rec => {
            const levelColor = rec.level === 'Beginner' ? '#16a34a' : rec.level === 'Intermediate' ? '#d97706' : '#dc2626';
            return (
              <div key={rec.course_id} style={{
                background: 'white', borderRadius: '14px', border: '1px solid #e5e7eb',
                overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                transition: 'box-shadow 0.2s, transform 0.2s',
                cursor: 'pointer',
              }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.10)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)'; e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                {/* Header strip */}
                <div style={{ padding: '0.5rem 1rem', background: rec.provider_type === 'iGOT' ? '#eef2fb' : '#fff3e0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: rec.provider_type === 'iGOT' ? NAVY : ORANGE }}>{rec.provider_type}</span>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: levelColor, background: levelColor + '18', padding: '0.1rem 0.5rem', borderRadius: '8px' }}>{rec.level}</span>
                </div>
                <div style={{ padding: '1rem' }}>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: NAVY, lineHeight: 1.4, marginBottom: '0.5rem' }}>{rec.course_title}</div>
                  <div style={{ fontSize: '0.78rem', color: '#6b7280', marginBottom: '0.75rem' }}>
                    <span style={{ fontWeight: 600 }}>Competency:</span> {rec.competency_name}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                      <span style={{ fontSize: '0.75rem', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Clock size={11} /> {rec.duration_hours}h
                      </span>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#16a34a', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Star size={11} /> {(rec.relevance_score * 100).toFixed(0)}% match
                      </span>
                    </div>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#dc2626', background: '#fef2f2', padding: '0.15rem 0.5rem', borderRadius: '6px' }}>
                      Gap: {rec.gap_addressed.toFixed(1)}
                    </span>
                  </div>
                  <div style={{ marginTop: '0.75rem', fontSize: '0.75rem', color: '#6b7280', lineHeight: 1.5, borderTop: '1px solid #f3f4f6', paddingTop: '0.6rem' }}>
                    {rec.reason_text?.slice(0, 120)}…
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.8rem', color: '#9ca3af' }}>
        Showing {filtered.length} of {recs.length} recommendations
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); }}`}</style>
    </div>
  );
}
