import React, { useEffect, useState } from 'react';
import { fetchLearnerFutureReadiness } from '../../services/api';
import { Sparkles, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';

const NAVY = '#1a3a6b';

export default function FutureReadinessLearnerPage() {
  const [signals, setSignals] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetchLearnerFutureReadiness();
      setSignals(res || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid #e5e7eb', paddingBottom: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Sparkles size={28} color="#7c3aed" />
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: NAVY, margin: 0 }}>Institutional Future-Readiness</h1>
          </div>
          <p style={{ fontSize: '0.85rem', color: '#4b5563', marginTop: '0.3rem' }}>
            Competencies gaining priority across MoSPI strategy documents, NSSTA training calendars, and policy updates.
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
          Refresh Signals
        </button>
      </div>

      {loading ? (
        <div style={{ background: 'white', borderRadius: '14px', padding: '3rem', border: '1px solid #e5e7eb', textAlign: 'center', color: '#6b7280' }}>
          Loading institutional future-readiness signals...
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
          {signals.map((sig) => {
            const isRising = sig.future_readiness_tag === 'Rising';
            return (
              <div key={sig.code} style={{ background: 'white', borderRadius: '14px', border: '1px solid #e5e7eb', padding: '1.25rem', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', justifyBetween: 'space-between', gap: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <div>
                    <span style={{ fontSize: '0.72rem', fontWeight: 800, color: NAVY, background: '#eef2fb', padding: '0.15rem 0.5rem', borderRadius: '4px', fontFamily: 'monospace' }}>
                      {sig.code}
                    </span>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#111827', margin: '0.3rem 0 0 0' }}>{sig.name}</h3>
                  </div>
                  <span style={{ fontSize: '0.72rem', fontWeight: 800, padding: '0.2rem 0.6rem', borderRadius: '12px', background: isRising ? '#fee2e2' : '#fef3c7', color: isRising ? '#dc2626' : '#d97706', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                    {isRising ? <AlertCircle size={12} /> : <CheckCircle2 size={12} />}
                    {isRising ? 'Rising Priority' : 'Stable Baseline'}
                  </span>
                </div>

                <div style={{ fontSize: '0.8rem', color: '#4b5563', background: '#f8fafc', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #e2e8f0', lineHeight: 1.4 }}>
                  <strong>Sourced Note:</strong> {sig.future_readiness_note || 'Standard institutional competency requirement.'}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
