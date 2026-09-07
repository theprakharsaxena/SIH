import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Eye, EyeOff, Lock, Mail, AlertCircle, BrainCircuit } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const NAVY = '#1a3a6b';
const ORANGE = '#e8720a';

export default function AdminLogin() {
  const [email, setEmail]     = useState('admin@mospi.gov.in');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]   = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await login(email, password);
      if (!data.is_admin) {
        setError('Access denied. This portal is for administrators only.');
        return;
      }
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err?.response?.data?.detail || 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #0f2347 0%, #1a3a6b 50%, #0f2347 100%)',
      fontFamily: "'Inter', sans-serif", padding: '1rem',
    }}>
      {/* Decorative background circles */}
      <div style={{ position: 'fixed', top: '-100px', right: '-100px', width: '400px', height: '400px', borderRadius: '50%', background: 'rgba(232,114,10,0.08)', pointerEvents: 'none' }} />
      <div style={{ position: 'fixed', bottom: '-80px', left: '-80px', width: '300px', height: '300px', borderRadius: '50%', background: 'rgba(255,255,255,0.04)', pointerEvents: 'none' }} />

      <div style={{ width: '100%', maxWidth: '420px', position: 'relative' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '72px', height: '72px', background: 'rgba(255,255,255,0.1)', borderRadius: '20px', marginBottom: '1rem', border: '1px solid rgba(255,255,255,0.15)' }}>
            <Shield size={32} color={ORANGE} />
          </div>
          <h1 style={{ color: 'white', fontFamily: "'Poppins', sans-serif", fontWeight: 800, fontSize: '1.5rem', marginBottom: '0.3rem' }}>
            Admin Portal
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.875rem' }}>
            MoSPI Skill Intelligence Platform — Workforce Analytics
          </p>
        </div>

        {/* Form card */}
        <div style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(12px)', borderRadius: '20px', padding: '2rem', border: '1px solid rgba(255,255,255,0.12)', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
          {error && (
            <div style={{ background: 'rgba(220,38,38,0.15)', border: '1px solid rgba(220,38,38,0.3)', borderRadius: '10px', padding: '0.75rem 1rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#fca5a5', fontSize: '0.875rem' }}>
              <AlertCircle size={16} /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontWeight: 600, color: 'rgba(255,255,255,0.8)', fontSize: '0.875rem', marginBottom: '0.4rem' }}>
                Admin Email
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.4)' }} />
                <input
                  type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="admin@mospi.gov.in" required
                  style={{ width: '100%', padding: '0.75rem 0.75rem 0.75rem 2.5rem', background: 'rgba(255,255,255,0.08)', border: '1.5px solid rgba(255,255,255,0.15)', borderRadius: '10px', color: 'white', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }}
                  onFocus={e => e.target.style.borderColor = ORANGE}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.15)'}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: 600, color: 'rgba(255,255,255,0.8)', fontSize: '0.875rem', marginBottom: '0.4rem' }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.4)' }} />
                <input
                  type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••" required
                  style={{ width: '100%', padding: '0.75rem 2.5rem 0.75rem 2.5rem', background: 'rgba(255,255,255,0.08)', border: '1.5px solid rgba(255,255,255,0.15)', borderRadius: '10px', color: 'white', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }}
                  onFocus={e => e.target.style.borderColor = ORANGE}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.15)'}
                />
                <button type="button" onClick={() => setShowPw(!showPw)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)', padding: 0 }}>
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} style={{ background: loading ? 'rgba(255,255,255,0.1)' : ORANGE, color: 'white', border: 'none', borderRadius: '10px', padding: '0.875rem', fontWeight: 700, fontSize: '0.95rem', cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginTop: '0.5rem', transition: 'background 0.2s' }}>
              {loading ? (
                <><span style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.8s linear infinite', display: 'inline-block' }} /> Signing in…</>
              ) : (
                <><Shield size={16} /> Sign in to Admin Portal</>
              )}
            </button>
          </form>

          <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'rgba(255,255,255,0.06)', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', fontWeight: 600, marginBottom: '0.3rem' }}>DEMO CREDENTIALS</div>
            <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.65)' }}>
              admin@mospi.gov.in / admin123
            </div>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <Link to="/login" style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', textDecoration: 'none' }}>
            ← Back to Learner Portal
          </Link>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); }} input::placeholder { color: rgba(255,255,255,0.3); }`}</style>
    </div>
  );
}
