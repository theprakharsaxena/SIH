import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { fetchProgressHistory } from '../../services/api';
import { TrendingUp, RefreshCw, Award, Activity } from 'lucide-react';

const NAVY = '#1a3a6b';
const ORANGE = '#e8720a';

export default function ProgressPage() {
  const { user } = useAuth();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await fetchProgressHistory(user.id);
      setData(res.progress_history || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid #e5e7eb', paddingBottom: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <TrendingUp size={28} color={NAVY} />
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: NAVY, margin: 0 }}>Progress Over Time</h1>
          </div>
          <p style={{ fontSize: '0.85rem', color: '#4b5563', marginTop: '0.3rem' }}>
            Track your competency score trajectory over time across assessments, experience updates, and completed trainings.
          </p>
        </div>
        <button
          onClick={loadData}
          disabled={loading}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.55rem 1.1rem',
            background: NAVY, color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer',
            fontSize: '0.85rem', fontWeight: 600, opacity: loading ? 0.6 : 1,
          }}
        >
          <RefreshCw size={16} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
          Refresh Timeline
        </button>
      </div>

      {loading ? (
        <div style={{ background: 'white', borderRadius: '14px', padding: '3rem', border: '1px solid #e5e7eb', textAlign: 'center', color: '#6b7280' }}>
          Loading your competency trajectory history...
        </div>
      ) : data.length === 0 ? (
        <div style={{ background: 'white', borderRadius: '14px', padding: '3rem', border: '1px solid #e5e7eb', textAlign: 'center', color: '#6b7280' }}>
          No historical evidence logs found yet. Complete a quiz or upload your CV to start tracking score shifts!
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {data.map((comp) => (
            <div key={comp.competency_code} style={{ background: 'white', borderRadius: '14px', border: '1px solid #e5e7eb', padding: '1.25rem', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: NAVY, background: '#eef2fb', padding: '0.2rem 0.55rem', borderRadius: '6px', fontFamily: 'monospace' }}>
                    {comp.competency_code}
                  </span>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#111827', margin: 0 }}>{comp.competency_name}</h3>
                </div>
                <span style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <Activity size={14} /> {comp.history.length} Event(s) Logged
                </span>
              </div>

              {/* Event Timeline list */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {comp.history.map((h, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0.85rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.8rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <Award size={16} color={ORANGE} />
                      <div>
                        <span style={{ fontWeight: 700, color: '#1f2937', textTransform: 'capitalize' }}>{h.evidence_type.replace('_', ' ')}:</span>{' '}
                        <span style={{ color: '#4b5563' }}>{h.source}</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <span style={{ fontSize: '0.72rem', color: '#9ca3af' }}>{h.timestamp ? new Date(h.timestamp).toLocaleDateString() : 'Recent'}</span>
                      <span style={{ fontSize: '0.85rem', fontWeight: 800, color: NAVY, background: '#eef2fb', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
                        Score: {h.raw_score.toFixed(1)} / 5.0
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
