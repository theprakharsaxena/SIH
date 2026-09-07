import React, { useState, useEffect } from 'react';
import { Search, Users, ChevronUp, ChevronDown, Loader, Shield } from 'lucide-react';
import { fetchAdminOfficers } from '../../services/api';

const NAVY = '#1a3a6b';
const ORANGE = '#e8720a';

export default function OfficersPage() {
  const [data, setData] = useState({ officers: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState('full_name');
  const [sortDir, setSortDir] = useState('asc');

  useEffect(() => {
    fetchAdminOfficers(0, 100)
      .then(d => setData(d))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const toggleSort = (field) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('asc'); }
  };

  const filtered = (data.officers || [])
    .filter(off => {
      if (!search) return true;
      const q = search.toLowerCase();
      return off.full_name?.toLowerCase().includes(q) ||
        off.email?.toLowerCase().includes(q) ||
        off.department?.toLowerCase().includes(q) ||
        off.role_code?.toLowerCase().includes(q);
    })
    .sort((a, b) => {
      const va = a[sortField] ?? '';
      const vb = b[sortField] ?? '';
      const cmp = va < vb ? -1 : va > vb ? 1 : 0;
      return sortDir === 'asc' ? cmp : -cmp;
    });

  const SortIcon = ({ field }) => {
    if (sortField !== field) return null;
    return sortDir === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />;
  };

  const thStyle = {
    padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.78rem', fontWeight: 700,
    color: '#374151', background: '#f9fafb', cursor: 'pointer', userSelect: 'none',
    whiteSpace: 'nowrap', borderBottom: '1px solid #e5e7eb',
  };

  return (
    <div style={{ maxWidth: '1300px', margin: '0 auto' }}>
      <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 800, color: NAVY, fontSize: '1.4rem', marginBottom: '0.3rem' }}>
            All Officers
          </h1>
          <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
            {data.total} officers registered · Showing {filtered.length}
          </p>
        </div>
        <div style={{ position: 'relative' }}>
          <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, email, role…"
            style={{ padding: '0.6rem 0.75rem 0.6rem 2.25rem', border: '1.5px solid #d1d5db', borderRadius: '10px', fontSize: '0.875rem', outline: 'none', width: '260px', fontFamily: 'inherit' }}
          />
        </div>
      </div>

      <div style={{ background: 'white', borderRadius: '14px', border: '1px solid #e5e7eb', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: '#9ca3af' }}>
            <Loader size={32} style={{ animation: 'spin 1s linear infinite', marginBottom: '0.75rem' }} />
            <div>Loading officers…</div>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {[
                    { key: 'full_name', label: 'Officer Name' },
                    { key: 'role_code', label: 'Role' },
                    { key: 'department', label: 'Department' },
                    { key: 'readiness_pct', label: 'Readiness %' },
                    { key: 'assessments_taken', label: 'Assessments' },
                    { key: 'onboarding_complete', label: 'Onboarded' },
                    { key: 'is_admin', label: 'Type' },
                  ].map(col => (
                    <th key={col.key} onClick={() => toggleSort(col.key)} style={thStyle}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        {col.label} <SortIcon field={col.key} />
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((off, i) => {
                  const r = off.readiness_pct;
                  const rColor = r >= 60 ? '#16a34a' : r >= 30 ? '#d97706' : '#dc2626';
                  return (
                    <tr key={off.id} style={{ background: i % 2 === 0 ? 'white' : '#fafafa', borderBottom: '1px solid #f3f4f6' }}>
                      <td style={{ padding: '0.9rem 1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: `linear-gradient(135deg, ${NAVY}, #2451a3)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '0.85rem', flexShrink: 0 }}>
                            {off.full_name?.[0]?.toUpperCase() || 'O'}
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, color: NAVY, fontSize: '0.875rem' }}>{off.full_name}</div>
                            <div style={{ fontSize: '0.72rem', color: '#9ca3af' }}>{off.email}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '0.9rem 1rem' }}>
                        <span style={{ background: '#eef2fb', color: NAVY, fontWeight: 700, fontSize: '0.75rem', padding: '0.25rem 0.6rem', borderRadius: '6px' }}>
                          {off.role_code || '—'}
                        </span>
                      </td>
                      <td style={{ padding: '0.9rem 1rem', fontSize: '0.82rem', color: '#4b5563', maxWidth: '180px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {off.department || '—'}
                      </td>
                      <td style={{ padding: '0.9rem 1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                          <div style={{ flex: 1, height: '6px', background: '#e5e7eb', borderRadius: '3px', minWidth: '60px', overflow: 'hidden' }}>
                            <div style={{ width: `${r}%`, height: '100%', background: rColor, borderRadius: '3px' }} />
                          </div>
                          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: rColor, minWidth: '38px' }}>{r}%</span>
                        </div>
                      </td>
                      <td style={{ padding: '0.9rem 1rem', textAlign: 'center', fontWeight: 700, color: NAVY }}>{off.assessments_taken}</td>
                      <td style={{ padding: '0.9rem 1rem', textAlign: 'center' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '0.2rem 0.55rem', borderRadius: '8px', background: off.onboarding_complete ? '#f0fdf4' : '#f9fafb', color: off.onboarding_complete ? '#16a34a' : '#9ca3af' }}>
                          {off.onboarding_complete ? '✓ Yes' : '— No'}
                        </span>
                      </td>
                      <td style={{ padding: '0.9rem 1rem', textAlign: 'center' }}>
                        {off.is_admin ? (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.72rem', fontWeight: 700, color: ORANGE, background: '#fff3e0', padding: '0.2rem 0.55rem', borderRadius: '8px' }}>
                            <Shield size={10} /> Admin
                          </span>
                        ) : (
                          <span style={{ fontSize: '0.72rem', color: '#6b7280' }}>Officer</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {filtered.length === 0 && (
              <div style={{ textAlign: 'center', padding: '3rem', color: '#9ca3af' }}>
                <Users size={36} style={{ marginBottom: '0.75rem' }} />
                <div style={{ fontWeight: 600, color: '#4b5563' }}>No officers found</div>
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); }}`}</style>
    </div>
  );
}
