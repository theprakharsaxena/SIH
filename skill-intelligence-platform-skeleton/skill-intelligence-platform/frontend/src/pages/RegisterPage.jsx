import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { BrainCircuit, User, Briefcase, GraduationCap, FileText, CheckCircle, AlertCircle, ChevronRight, ChevronLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const NAVY = '#1a3a6b';
const ORANGE = '#e8720a';

const DEPARTMENTS = [
  'MoSPI - DIID', 'MoSPI - Field Operations', 'MoSPI - CSO', 'MoSPI - NSO',
  'NIC', 'DPIIT', 'Ministry of Finance', 'Ministry of Agriculture',
  'Ministry of Health', 'Ministry of Education', 'Other',
];

const ROLES = [
  { code: 'JSO', name: 'Junior Statistical Officer (JSO)' },
  { code: 'SSO', name: 'Senior Statistical Officer (SSO)' },
  { code: 'DS', name: 'Deputy Director of Statistics (DS)' },
  { code: 'DD', name: 'Deputy Director (DD)' },
  { code: 'AD', name: 'Assistant Director (AD)' },
  { code: 'DIR', name: 'Director (DIR)' },
];

const QUALIFICATIONS = [
  "Bachelor's in Statistics", "Bachelor's in Mathematics", "Bachelor's in Economics",
  "Master's in Statistics", "Master's in Mathematics", "Master's in Economics",
  "M.Phil / PhD", "MCA / B.Tech", "MBA", "Other",
];

const SKILL_OPTIONS = [
  'Statistical Analysis', 'Data Visualization', 'SQL / Databases',
  'R / Python', 'GIS / Mapping', 'Machine Learning', 'Survey Design',
  'Data Quality', 'Public Policy', 'Project Management', 'Communication',
];

const STEPS = [
  { id: 1, label: 'Account', icon: User },
  { id: 2, label: 'Role', icon: Briefcase },
  { id: 3, label: 'Education', icon: GraduationCap },
  { id: 4, label: 'Experience', icon: FileText },
  { id: 5, label: 'Review', icon: CheckCircle },
];

function StepIndicator({ current }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '2.5rem', gap: 0 }}>
      {STEPS.map((step, idx) => {
        const Icon = step.icon;
        const done = current > step.id;
        const active = current === step.id;
        return (
          <React.Fragment key={step.id}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem' }}>
              <div style={{
                width: '44px', height: '44px', borderRadius: '50%',
                background: done ? '#16a34a' : active ? NAVY : '#e5e7eb',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.3s',
              }}>
                {done
                  ? <CheckCircle size={20} color="white" />
                  : <Icon size={18} color={active ? 'white' : '#9ca3af'} />
                }
              </div>
              <span style={{ fontSize: '0.7rem', fontWeight: active ? 700 : 500, color: active ? NAVY : '#9ca3af', whiteSpace: 'nowrap' }}>
                {step.label}
              </span>
            </div>
            {idx < STEPS.length - 1 && (
              <div style={{
                flex: 1, height: '2px', background: current > step.id ? '#16a34a' : '#e5e7eb',
                margin: '0 0.5rem', marginBottom: '1.5rem', transition: 'background 0.3s', minWidth: '40px',
              }} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

function InputField({ label, type = 'text', value, onChange, placeholder, required }) {
  const [focused, setFocused] = useState(false);
  return (
    <div>
      <label style={{ display: 'block', fontWeight: 600, color: NAVY, fontSize: '0.875rem', marginBottom: '0.4rem' }}>
        {label} {required && <span style={{ color: ORANGE }}>*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        style={{
          width: '100%', padding: '0.75rem',
          border: `1.5px solid ${focused ? NAVY : '#d1d5db'}`,
          borderRadius: '10px', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box',
          transition: 'border-color 0.2s', fontFamily: 'inherit',
        }}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
    </div>
  );
}

function SelectField({ label, value, onChange, options, placeholder, required }) {
  const [focused, setFocused] = useState(false);
  return (
    <div>
      <label style={{ display: 'block', fontWeight: 600, color: NAVY, fontSize: '0.875rem', marginBottom: '0.4rem' }}>
        {label} {required && <span style={{ color: ORANGE }}>*</span>}
      </label>
      <select
        value={value}
        onChange={onChange}
        required={required}
        style={{
          width: '100%', padding: '0.75rem',
          border: `1.5px solid ${focused ? NAVY : '#d1d5db'}`,
          borderRadius: '10px', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box',
          background: 'white', cursor: 'pointer', fontFamily: 'inherit',
        }}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      >
        <option value="">{placeholder || 'Select…'}</option>
        {options.map(opt => (
          typeof opt === 'string'
            ? <option key={opt} value={opt}>{opt}</option>
            : <option key={opt.code} value={opt.code}>{opt.name}</option>
        ))}
      </select>
    </div>
  );
}

export default function RegisterPage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPw, setShowPw] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  // Form state
  const [form, setForm] = useState({
    // Step 1
    full_name: '', email: '', password: '', confirm_pw: '',
    // Step 2
    role_code: '', department: '', designation: '', years_experience: '',
    // Step 3
    highest_qualification: '', field_of_study: '', university: '', graduation_year: '',
    // Step 4
    profile_text: '', selected_skills: [],
  });

  const update = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }));
  const toggleSkill = (skill) => {
    setForm(prev => ({
      ...prev,
      selected_skills: prev.selected_skills.includes(skill)
        ? prev.selected_skills.filter(s => s !== skill)
        : [...prev.selected_skills, skill],
    }));
  };

  const validateStep = () => {
    if (step === 1) {
      if (!form.full_name.trim()) return 'Full name is required.';
      if (!form.email.trim()) return 'Email is required.';
      if (!form.password) return 'Password is required.';
      if (form.password.length < 6) return 'Password must be at least 6 characters.';
      if (form.password !== form.confirm_pw) return 'Passwords do not match.';
    }
    if (step === 2) {
      if (!form.role_code) return 'Please select your role.';
      if (!form.department) return 'Please select your department.';
    }
    return null;
  };

  const next = () => {
    const err = validateStep();
    if (err) { setError(err); return; }
    setError('');
    setStep(s => s + 1);
  };

  const back = () => { setError(''); setStep(s => s - 1); };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      // Build profile text from all collected data
      const autoText = `
Name: ${form.full_name}
Role: ${form.role_code}, Department: ${form.department}
Designation: ${form.designation}
Years of Experience: ${form.years_experience}
Education: ${form.highest_qualification} in ${form.field_of_study} from ${form.university} (${form.graduation_year})
Self-assessed skills: ${form.selected_skills.join(', ')}
Work Experience & Context: ${form.profile_text}
      `.trim();

      await register({
        full_name: form.full_name,
        email: form.email,
        password: form.password,
        role_code: form.role_code,
        department: form.department,
        designation: form.designation || undefined,
        years_experience: form.years_experience ? parseInt(form.years_experience) : undefined,
        highest_qualification: form.highest_qualification || undefined,
        field_of_study: form.field_of_study || undefined,
        university: form.university || undefined,
        graduation_year: form.graduation_year ? parseInt(form.graduation_year) : undefined,
        profile_text: autoText,
      });
      navigate('/dashboard');
    } catch (err) {
      setError(err?.response?.data?.detail || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const rowStyle = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f0f4f8, #e8eef5)', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2rem 1rem', fontFamily: "'Inter', sans-serif" }}>

      {/* Top bar */}
      <div style={{ width: '100%', maxWidth: '680px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }} onClick={() => navigate('/')}>
          <div style={{ width: '36px', height: '36px', background: ORANGE, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <BrainCircuit size={18} color="white" />
          </div>
          <span style={{ fontWeight: 700, color: NAVY, fontSize: '0.95rem' }}>MoSPI Skill Intelligence</span>
        </div>
        <Link to="/login" style={{ color: '#6b7280', fontSize: '0.875rem', textDecoration: 'none' }}>
          Already registered? <span style={{ color: NAVY, fontWeight: 700 }}>Sign In</span>
        </Link>
      </div>

      {/* Card */}
      <div style={{ width: '100%', maxWidth: '680px', background: 'white', borderRadius: '20px', padding: '2.5rem', boxShadow: '0 8px 40px rgba(0,0,0,0.10)' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2 style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 800, color: NAVY, fontSize: '1.5rem', marginBottom: '0.3rem' }}>
            Create Your Account
          </h2>
          <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
            Step {step} of 5 — {STEPS[step - 1].label}
          </p>
        </div>

        <StepIndicator current={step} />

        {error && (
          <div style={{
            background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px',
            padding: '0.75rem 1rem', marginBottom: '1.5rem',
            display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#dc2626', fontSize: '0.875rem',
          }}>
            <AlertCircle size={16} /> {error}
          </div>
        )}

        {/* ── Step 1: Account ── */}
        {step === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={rowStyle}>
              <InputField label="Full Name" value={form.full_name} onChange={update('full_name')} placeholder="Anika Sharma" required />
              <InputField label="Official Email" type="email" value={form.email} onChange={update('email')} placeholder="you@mospi.gov.in" required />
            </div>
            <div style={rowStyle}>
              <div>
                <label style={{ display: 'block', fontWeight: 600, color: NAVY, fontSize: '0.875rem', marginBottom: '0.4rem' }}>
                  Password <span style={{ color: ORANGE }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPw ? 'text' : 'password'}
                    value={form.password}
                    onChange={update('password')}
                    placeholder="Min. 6 characters"
                    style={{ width: '100%', padding: '0.75rem', border: '1.5px solid #d1d5db', borderRadius: '10px', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }}
                  />
                  <button type="button" onClick={() => setShowPw(!showPw)} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}>
                    {showPw ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>
              <InputField label="Confirm Password" type={showPw ? 'text' : 'password'} value={form.confirm_pw} onChange={update('confirm_pw')} placeholder="Re-enter password" required />
            </div>
          </div>
        )}

        {/* ── Step 2: Role ── */}
        {step === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <SelectField label="Your Role" value={form.role_code} onChange={update('role_code')} options={ROLES} placeholder="Select your designation" required />
            <SelectField label="Department / Ministry" value={form.department} onChange={update('department')} options={DEPARTMENTS} placeholder="Select your department" required />
            <div style={rowStyle}>
              <InputField label="Current Designation (optional)" value={form.designation} onChange={update('designation')} placeholder="e.g. Statistical Officer" />
              <div>
                <label style={{ display: 'block', fontWeight: 600, color: NAVY, fontSize: '0.875rem', marginBottom: '0.4rem' }}>
                  Years of Experience
                </label>
                <input
                  type="range" min="0" max="40" value={form.years_experience || 0}
                  onChange={update('years_experience')}
                  style={{ width: '100%', accentColor: NAVY, marginTop: '0.75rem' }}
                />
                <div style={{ textAlign: 'center', fontWeight: 700, color: NAVY, fontSize: '1.1rem', marginTop: '0.25rem' }}>
                  {form.years_experience || 0} years
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Step 3: Education ── */}
        {step === 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={rowStyle}>
              <SelectField label="Highest Qualification" value={form.highest_qualification} onChange={update('highest_qualification')} options={QUALIFICATIONS} placeholder="Select qualification" />
              <InputField label="Field of Study" value={form.field_of_study} onChange={update('field_of_study')} placeholder="e.g. Statistics" />
            </div>
            <div style={rowStyle}>
              <InputField label="University / Institute" value={form.university} onChange={update('university')} placeholder="e.g. Delhi University" />
              <InputField label="Year of Graduation" type="number" value={form.graduation_year} onChange={update('graduation_year')} placeholder="e.g. 2015" />
            </div>
            <div style={{ padding: '1rem', background: '#f0f9ff', borderRadius: '10px', border: '1px solid #bae6fd', fontSize: '0.825rem', color: '#0369a1' }}>
              💡 This information helps our AI accurately map your academic competencies to the NKM Framework.
            </div>
          </div>
        )}

        {/* ── Step 4: Experience ── */}
        {step === 4 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontWeight: 600, color: NAVY, fontSize: '0.875rem', marginBottom: '0.4rem' }}>
                Work Experience & Current Role Description <span style={{ color: ORANGE }}>*</span>
              </label>
              <textarea
                value={form.profile_text}
                onChange={update('profile_text')}
                placeholder="Describe your current and past work responsibilities, projects, tools used, and key achievements. The more detail you provide, the more accurate your AI skill analysis will be.

Example: I work as a Statistical Officer in the DIID division. I handle data compilation from state agencies, conduct quality checks using Excel and SPSS, prepare annual reports on price indices, and have recently started learning Python for data automation..."
                rows={7}
                style={{
                  width: '100%', padding: '0.75rem', border: '1.5px solid #d1d5db',
                  borderRadius: '10px', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box',
                  fontFamily: 'inherit', lineHeight: 1.6, resize: 'vertical',
                }}
                onFocus={e => e.target.style.borderColor = NAVY}
                onBlur={e => e.target.style.borderColor = '#d1d5db'}
              />
              <div style={{ textAlign: 'right', fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.3rem' }}>
                {form.profile_text.length} characters
              </div>
            </div>
            <div>
              <label style={{ display: 'block', fontWeight: 600, color: NAVY, fontSize: '0.875rem', marginBottom: '0.75rem' }}>
                Self-assessed Skill Areas (select all that apply)
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {SKILL_OPTIONS.map(skill => (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => toggleSkill(skill)}
                    style={{
                      padding: '0.4rem 0.9rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600,
                      cursor: 'pointer', border: '1.5px solid',
                      background: form.selected_skills.includes(skill) ? NAVY : 'white',
                      color: form.selected_skills.includes(skill) ? 'white' : '#6b7280',
                      borderColor: form.selected_skills.includes(skill) ? NAVY : '#d1d5db',
                      transition: 'all 0.2s',
                    }}
                  >
                    {skill}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Step 5: Review ── */}
        {step === 5 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ padding: '1.25rem', background: '#f0fdf4', borderRadius: '12px', border: '1px solid #bbf7d0' }}>
              <CheckCircle size={20} color="#16a34a" style={{ marginBottom: '0.5rem' }} />
              <div style={{ fontWeight: 700, color: '#15803d', fontSize: '0.95rem' }}>Looking good! Please review your details.</div>
            </div>

            {[
              { heading: '👤 Account', items: [['Name', form.full_name], ['Email', form.email]] },
              { heading: '💼 Role', items: [['Role Code', form.role_code], ['Department', form.department], ['Experience', `${form.years_experience || 0} years`]] },
              { heading: '🎓 Education', items: [['Qualification', form.highest_qualification || '—'], ['Field', form.field_of_study || '—'], ['University', form.university || '—']] },
              { heading: '📝 Skills', items: [['Self-assessed', form.selected_skills.join(', ') || '—']] },
            ].map(({ heading, items }) => (
              <div key={heading} style={{ padding: '1rem', background: '#f9fafb', borderRadius: '10px', border: '1px solid #e5e7eb' }}>
                <div style={{ fontWeight: 700, color: NAVY, fontSize: '0.875rem', marginBottom: '0.6rem' }}>{heading}</div>
                {items.map(([label, val]) => (
                  <div key={label} style={{ display: 'flex', gap: '0.5rem', fontSize: '0.825rem', color: '#4b5563', marginBottom: '0.25rem' }}>
                    <span style={{ fontWeight: 600, minWidth: '120px', color: '#6b7280' }}>{label}:</span>
                    <span>{val}</span>
                  </div>
                ))}
              </div>
            ))}

            <div style={{ padding: '0.875rem 1rem', background: '#eff6ff', borderRadius: '10px', border: '1px solid #bfdbfe', fontSize: '0.825rem', color: '#1e40af' }}>
              🤖 After registration, our AI will analyse your profile and generate your personalised skill gap report and course recommendations automatically.
            </div>
          </div>
        )}

        {/* Navigation buttons */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem', gap: '1rem' }}>
          {step > 1 ? (
            <button
              onClick={back}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.4rem',
                padding: '0.75rem 1.5rem', borderRadius: '10px',
                background: '#f3f4f6', border: '1px solid #e5e7eb',
                color: '#374151', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer',
              }}
            >
              <ChevronLeft size={16} /> Back
            </button>
          ) : (
            <div />
          )}

          {step < 5 ? (
            <button
              onClick={next}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.4rem',
                padding: '0.75rem 1.75rem', borderRadius: '10px',
                background: NAVY, border: 'none',
                color: 'white', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer',
              }}
            >
              Next <ChevronRight size={16} />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.6rem',
                padding: '0.85rem 2rem', borderRadius: '10px',
                background: loading ? '#9ca3af' : ORANGE, border: 'none',
                color: 'white', fontWeight: 700, fontSize: '0.95rem',
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? (
                <>
                  <span style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.4)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.8s linear infinite', display: 'inline-block' }} />
                  Analysing Profile…
                </>
              ) : (
                <>🚀 Create Account & Start Learning</>
              )}
            </button>
          )}
        </div>
      </div>

      <div style={{ marginTop: '1.5rem', fontSize: '0.78rem', color: '#9ca3af', textAlign: 'center' }}>
        By registering, you agree to use this platform for official capacity-building purposes.
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); }}`}</style>
    </div>
  );
}
