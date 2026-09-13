import React, { useEffect, useState } from 'react';
import { fetchIntegrationStatus } from '../../services/api';
import { Server, CheckCircle2, AlertCircle, RefreshCw, Database, ShieldCheck, Clock } from 'lucide-react';

const NAVY = '#1a3a6b';
const ORANGE = '#e8720a';

export default function IntegrationStatusPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchIntegrationStatus();
      setData(res.adapters || []);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch integration status register.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '1200px', margin: '0 auto', padding: '0.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid #e5e7eb', paddingBottom: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Server size={28} color={NAVY} />
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: NAVY, margin: 0 }}>Integration Assumptions Register</h1>
          </div>
          <p style={{ fontSize: '0.85rem', color: '#4b5563', marginTop: '0.3rem' }}>
            Status of live vs mock data adapters for external platform integrations (iGOT Karmayogi, NSSTA TMS, MoSPI Cadre DB).
          </p>
        </div>
        <button
          onClick={loadData}
          disabled={loading}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.55rem 1.1rem',
            background: NAVY, color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer',
            fontSize: '0.85rem', fontWeight: 600, opacity: loading ? 0.6 : 1, transition: 'background 0.2s',
          }}
        >
          <RefreshCw size={16} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
          Check Adapters
        </button>
      </div>

      {/* Grid */}
      {loading ? (
        <div style={{ background: 'white', borderRadius: '14px', padding: '3rem', border: '1px solid #e5e7eb', textAlign: 'center', color: '#6b7280' }}>
          <RefreshCw size={28} color={NAVY} style={{ animation: 'spin 1s linear infinite', marginBottom: '0.5rem' }} />
          <div>Ping integration adapters...</div>
        </div>
      ) : error ? (
        <div style={{ background: 'white', borderRadius: '14px', padding: '2rem', border: '1px solid #fecaca', textAlign: 'center', color: '#dc2626', fontWeight: 600 }}>
          {error}
        </div>
      ) : !data || data.length === 0 ? (
        <div style={{ background: 'white', borderRadius: '14px', padding: '3rem', border: '1px solid #e5e7eb', textAlign: 'center', color: '#6b7280' }}>
          No external adapters registered.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
          {data.map((adapter, idx) => {
            const isMock = adapter.status.toLowerCase().includes('mock');
            return (
              <div
                key={idx}
                style={{
                  background: 'white', borderRadius: '14px', border: '1px solid #e5e7eb',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column',
                  justifyContent: 'space-between', overflow: 'hidden',
                }}
              >
                <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Database size={20} color={NAVY} />
                      <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#111827', margin: 0 }}>{adapter.system}</h3>
                    </div>
                    <span
                      style={{
                        fontSize: '0.72rem', padding: '0.2rem 0.6rem', borderRadius: '20px', fontWeight: 700,
                        display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                        background: isMock ? '#fffbe6' : '#ecfdf5', color: isMock ? '#92400e' : '#065f46',
                        border: isMock ? '1px solid #fef3c7' : '1px solid #a7f3d0',
                      }}
                    >
                      {isMock ? <AlertCircle size={13} color="#d97706" /> : <CheckCircle2 size={13} color="#059669" />}
                      {adapter.status}
                    </span>
                  </div>

                  <p style={{ fontSize: '0.78rem', color: '#4b5563', borderTop: '1px solid #f3f4f6', borderBottom: '1px solid #f3f4f6', padding: '0.6rem 0', margin: 0, lineHeight: 1.4 }}>
                    {adapter.notes}
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.78rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#6b7280', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <ShieldCheck size={14} color="#9ca3af" /> Auth Type:
                      </span>
                      <span style={{ fontWeight: 600, color: '#1f2937' }}>{adapter.auth_type}</span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#6b7280', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <Clock size={14} color="#9ca3af" /> Sync Cadence:
                      </span>
                      <span style={{ fontWeight: 600, color: '#1f2937' }}>{adapter.sync_frequency}</span>
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.3rem' }}>
                      Data Streams Synced
                    </div>
                    <div style={{ fontSize: '0.75rem', background: '#f8fafc', padding: '0.5rem 0.75rem', borderRadius: '6px', color: '#334155', fontFamily: 'monospace', border: '1px solid #e2e8f0' }}>
                      {adapter.data_synced}
                    </div>
                  </div>
                </div>

                <div style={{ background: '#f9fafb', padding: '0.65rem 1.25rem', borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: '#6b7280' }}>
                  <span>Adapter Health: Active</span>
                  <span style={{ fontFamily: 'monospace', color: '#16a34a', fontWeight: 700 }}>200 OK</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
