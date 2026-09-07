import React, { useState, useEffect } from 'react';
import { Loader } from 'lucide-react';
import { fetchWorkforceHeatmap } from '../../services/api';
import WorkforceHeatmap from '../../components/WorkforceHeatmap';

const NAVY = '#1a3a6b';

export default function HeatmapPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWorkforceHeatmap()
      .then(d => setData(d))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ maxWidth: '1300px', margin: '0 auto' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 800, color: NAVY, fontSize: '1.4rem', marginBottom: '0.3rem' }}>
          Workforce Competency Heatmap
        </h1>
        <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
          Average competency scores across all roles — deeper blue = higher proficiency, red = critical gap.
        </p>
      </div>

      <div style={{ background: 'white', borderRadius: '14px', padding: '1.5rem', border: '1px solid #e5e7eb', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: '#9ca3af' }}>
            <Loader size={36} style={{ animation: 'spin 1s linear infinite', marginBottom: '1rem' }} />
            <div>Loading heatmap…</div>
          </div>
        ) : (
          <WorkforceHeatmap heatmapData={data} data={data} />
        )}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); }}`}</style>
    </div>
  );
}
