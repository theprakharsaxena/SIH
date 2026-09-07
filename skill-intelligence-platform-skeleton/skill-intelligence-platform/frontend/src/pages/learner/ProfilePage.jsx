import React, { useState } from 'react';
import { User, Mail, Briefcase, GraduationCap, Phone, Save, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { updateMe } from '../../services/api';

const NAVY = '#1a3a6b';
const ORANGE = '#e8720a';

const ROLES = [
  { code: 'JSO', name: 'Junior Statistical Officer' },
  { code: 'SSO', name: 'Senior Statistical Officer' },
  { code: 'DS', name: 'Deputy Director of Statistics' },
  { code: 'DD', name: 'Deputy Director' },
  { code: 'AD', name: 'Assistant Director' },
  { code: 'DIR', name: 'Director' },
];

const DEPARTMENTS = [
  'MoSPI - DIID', 'MoSPI - Field Operations', 'MoSPI - CSO', 'MoSPI - NSO',
  'NIC', 'DPIIT', 'Ministry of Finance', 'Ministry of Agriculture',
  'Ministry of Health', 'Ministry of Education', 'Other',
];

function Field({ label, icon: Icon, children }) {
  return (
    <div>
      <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600, color: NAVY, fontSize: '0.875rem', marginBottom: '0.4rem' }}>
        <Icon size={14} /> {label}
      </label>
      {children}
    </div>
  );
}

const inputStyle = {
  width: '100%', padding: '0.75rem', border: '1.5px solid #d1d5db',
  borderRadius: '10px', fontSize: '0.9rem', outline: 'none',
  boxSizing: 'border-box', fontFamily: 'inherit', transition: 'border-color 0.2s',
};

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    full_name: user?.full_name || '',
    designation: user?.designation || '',
    department: user?.department || '',
    phone: user?.phone || '',
    role_code: user?.role_code || 'SSO',
    years_experience: user?.years_experience || '',
    highest_qualification: user?.highest_qualification || '',
    field_of_study: user?.field_of_study || '',
    university: user?.university || '',
    graduation_year: user?.graduation_year || '',
  });

  const update = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }));

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSaved(false);
    try {
      await updateMe({
        ...form,
        years_experience: form.years_experience ? parseInt(form.years_experience) : undefined,
        graduation_year: form.graduation_year ? parseInt(form.graduation_year) : undefined,
      });
      refreshUser();
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err?.response?.data?.detail || 'Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const rowStyle = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' };

  return (
    <div style={{ maxWidth: '780px', margin: '0 auto' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 800, color: NAVY, fontSize: '1.4rem' }}>My Profile</h1>
        <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>Keep your profile up to date for better AI recommendations</p>
      </div>

      {/* Avatar card */}
      <div style={{ background: `linear-gradient(135deg, ${NAVY}, #2451a3)`, borderRadius: '16px', padding: '1.5rem 2rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', border: '3px solid rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 800, color: 'white', flexShrink: 0 }}>
          {user?.full_name?.[0]?.toUpperCase() || 'U'}
        </div>
        <div>
          <div style={{ fontWeight: 800, color: 'white', fontSize: '1.2rem' }}>{user?.full_name}</div>
          <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem', marginTop: '0.2rem' }}>{user?.email}</div>
          <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.8rem', marginTop: '0.15rem' }}>
            {user?.role_code} · {user?.department?.split(' - ')[0] || 'MoSPI'}
          </div>
        </div>
      </div>

      {/* Form */}
      <div style={{ background: 'white', borderRadius: '16px', padding: '2rem', border: '1px solid #e5e7eb', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        <div style={{ fontWeight: 700, color: NAVY, fontSize: '1rem', marginBottom: '1.25rem', fontFamily: "'Poppins', sans-serif" }}>
          Basic Information
        </div>

        {error && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', padding: '0.75rem 1rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#dc2626', fontSize: '0.875rem' }}>
            <AlertCircle size={16} /> {error}
          </div>
        )}

        {saved && (
          <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '0.75rem 1rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#16a34a', fontSize: '0.875rem' }}>
            <CheckCircle size={16} /> Profile saved successfully!
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={rowStyle}>
            <Field label="Full Name" icon={User}>
              <input value={form.full_name} onChange={update('full_name')} style={inputStyle} onFocus={e => e.target.style.borderColor = NAVY} onBlur={e => e.target.style.borderColor = '#d1d5db'} />
            </Field>
            <Field label="Phone (optional)" icon={Phone}>
              <input value={form.phone} onChange={update('phone')} placeholder="+91 98765 43210" style={inputStyle} onFocus={e => e.target.style.borderColor = NAVY} onBlur={e => e.target.style.borderColor = '#d1d5db'} />
            </Field>
          </div>

          <div style={rowStyle}>
            <Field label="Role" icon={Briefcase}>
              <select value={form.role_code} onChange={update('role_code')} style={{ ...inputStyle, background: 'white', cursor: 'pointer' }}>
                {ROLES.map(r => <option key={r.code} value={r.code}>{r.name}</option>)}
              </select>
            </Field>
            <Field label="Department" icon={Briefcase}>
              <select value={form.department} onChange={update('department')} style={{ ...inputStyle, background: 'white', cursor: 'pointer' }}>
                <option value="">Select…</option>
                {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </Field>
          </div>

          <div style={rowStyle}>
            <Field label="Designation" icon={Briefcase}>
              <input value={form.designation} onChange={update('designation')} placeholder="e.g. Statistical Officer" style={inputStyle} onFocus={e => e.target.style.borderColor = NAVY} onBlur={e => e.target.style.borderColor = '#d1d5db'} />
            </Field>
            <Field label="Years of Experience" icon={Briefcase}>
              <input type="number" value={form.years_experience} onChange={update('years_experience')} placeholder="e.g. 8" min="0" max="40" style={inputStyle} onFocus={e => e.target.style.borderColor = NAVY} onBlur={e => e.target.style.borderColor = '#d1d5db'} />
            </Field>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid #e5e7eb', margin: '0.5rem 0' }} />
          <div style={{ fontWeight: 700, color: NAVY, fontSize: '0.95rem', fontFamily: "'Poppins', sans-serif" }}>Education</div>

          <div style={rowStyle}>
            <Field label="Highest Qualification" icon={GraduationCap}>
              <input value={form.highest_qualification} onChange={update('highest_qualification')} placeholder="e.g. M.Sc. Statistics" style={inputStyle} onFocus={e => e.target.style.borderColor = NAVY} onBlur={e => e.target.style.borderColor = '#d1d5db'} />
            </Field>
            <Field label="Field of Study" icon={GraduationCap}>
              <input value={form.field_of_study} onChange={update('field_of_study')} placeholder="e.g. Statistics" style={inputStyle} onFocus={e => e.target.style.borderColor = NAVY} onBlur={e => e.target.style.borderColor = '#d1d5db'} />
            </Field>
          </div>

          <div style={rowStyle}>
            <Field label="University / Institute" icon={GraduationCap}>
              <input value={form.university} onChange={update('university')} placeholder="e.g. University of Delhi" style={inputStyle} onFocus={e => e.target.style.borderColor = NAVY} onBlur={e => e.target.style.borderColor = '#d1d5db'} />
            </Field>
            <Field label="Year of Graduation" icon={GraduationCap}>
              <input type="number" value={form.graduation_year} onChange={update('graduation_year')} placeholder="e.g. 2018" style={inputStyle} onFocus={e => e.target.style.borderColor = NAVY} onBlur={e => e.target.style.borderColor = '#d1d5db'} />
            </Field>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
            <button onClick={handleSave} disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: saving ? '#9ca3af' : NAVY, color: 'white', border: 'none', borderRadius: '10px', padding: '0.75rem 2rem', fontWeight: 700, fontSize: '0.9rem', cursor: saving ? 'not-allowed' : 'pointer' }}>
              {saving ? <><Loader size={16} style={{ animation: 'spin 1s linear infinite' }} /> Saving…</> : <><Save size={16} /> Save Changes</>}
            </button>
          </div>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); }}`}</style>
    </div>
  );
}
