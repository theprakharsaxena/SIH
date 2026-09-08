import React, { useState, useEffect } from 'react';
import { Search, Users, ChevronUp, ChevronDown, Loader, Shield, Trash2, AlertTriangle } from 'lucide-react';
import { fetchAdminOfficers, deleteAdminOfficer } from '../../services/api';

const NAVY = '#1a3a6b';
const ORANGE = '#e8720a';

export default function OfficersPage() {
  const [data, setData] = useState({ officers: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState('full_name');
  const [sortDir, setSortDir] = useState('asc');
  const [deletingId, setDeletingId] = useState(null);
  const [officerToDelete, setOfficerToDelete] = useState(null);
  const [statusMsg, setStatusMsg] = useState(null);

  useEffect(() => {
    fetchAdminOfficers(0, 100)
      .then(d => setData(d))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleDeleteConfirm = async () => {
    if (!officerToDelete) return;
    const target = officerToDelete;
    setDeletingId(target.id);
    setStatusMsg(null);
    try {
      await deleteAdminOfficer(target.id);
      setData(prev => ({
        total: Math.max(0, prev.total - 1),
        officers: prev.officers.filter(o => o.id !== target.id),
      }));
      setStatusMsg({ type: 'success', text: `Officer "${target.full_name}" has been deleted successfully.` });
    } catch (err) {
      console.error(err);
      setStatusMsg({ type: 'error', text: err?.response?.data?.detail || 'Failed to delete officer. Please try again.' });
    } finally {
      setDeletingId(null);
      setOfficerToDelete(null);
    }
  };

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
            All Officers & Learners
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

      {statusMsg && (
        <div style={{
          background: statusMsg.type === 'success' ? '#f0fdf4' : '#fef2f2',
          border: `1px solid ${statusMsg.type === 'success' ? '#bbf7d0' : '#fecaca'}`,
          borderRadius: '10px', padding: '0.75rem 1rem', marginBottom: '1.25rem',
          color: statusMsg.type === 'success' ? '#166534' : '#dc2626', fontSize: '0.875rem', fontWeight: 600
        }}>
          {statusMsg.text}
        </div>
      )}

      {/* Confirmation Modal */}
      {officerToDelete && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem'
        }}>
          <div style={{
            background: 'white', borderRadius: '16px', padding: '1.75rem', width: '100%', maxWidth: '440px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)', border: '1px solid #e2e8f0'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', color: '#dc2626' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <AlertTriangle size={20} color="#dc2626" />
              </div>
              <div>
                <h3 style={{ fontWeight: 800, color: NAVY, margin: 0, fontSize: '1.1rem' }}>Delete Learner Account?</h3>
                <span style={{ fontSize: '0.78rem', color: '#64748b' }}>This action is permanent and cannot be undone.</span>
              </div>
            </div>

            <div style={{ background: '#f8fafc', padding: '0.85rem', borderRadius: '10px', border: '1px solid #e2e8f0', marginBottom: '1.25rem', fontSize: '0.85rem', color: '#334155' }}>
              <div><strong>Name:</strong> {officerToDelete.full_name}</div>
              <div><strong>Email:</strong> {officerToDelete.email}</div>
              <div><strong>Role:</strong> {officerToDelete.role_code || 'N/A'}</div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button
                onClick={() => setOfficerToDelete(null)}
                style={{ padding: '0.6rem 1.1rem', borderRadius: '8px', border: '1px solid #cbd5e1', background: 'white', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', color: '#475569' }}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={deletingId === officerToDelete.id}
                style={{ padding: '0.6rem 1.25rem', borderRadius: '8px', border: 'none', background: '#dc2626', color: 'white', fontWeight: 700, fontSize: '0.85rem', cursor: deletingId ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              >
                {deletingId ? <><Loader size={14} style={{ animation: 'spin 1s linear infinite' }} /> Deleting…</> : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

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
                  <th style={{ ...thStyle, cursor: 'default', textAlign: 'center' }}>Action</th>
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
                      <td style={{ padding: '0.9rem 1rem', textAlign: 'center' }}>
                        <button
                          onClick={() => setOfficerToDelete(off)}
                          title="Delete learner account"
                          style={{
                            background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626',
                            borderRadius: '8px', padding: '0.4rem 0.65rem', fontSize: '0.75rem', fontWeight: 700,
                            cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
                            transition: 'all 0.15s ease'
                          }}
                          onMouseEnter={e => { e.currentTarget.style.background = '#dc2626'; e.currentTarget.style.color = 'white'; }}
                          onMouseLeave={e => { e.currentTarget.style.background = '#fef2f2'; e.currentTarget.style.color = '#dc2626'; }}
                        >
                          <Trash2 size={13} /> Delete
                        </button>
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
