import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { BrainCircuit, Eye, EyeOff, Mail, Lock, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const NAVY = '#1a3a6b';
const ORANGE = '#e8720a';

export default function LoginPage() {
  const [email, setEmail]     = useState('');
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
      if (data.is_admin) {
        navigate('/admin/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err?.response?.data?.detail || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex',
      background: 'linear-gradient(135deg, #f0f4f8 0%, #e8eef5 100%)',
    }}>
      {/* Left panel */}
      <div style={{
        flex: '0 0 420px', background: `linear-gradient(160deg, ${NAVY} 0%, #0f2347 100%)`,
        display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
        padding: '3rem', color: 'white', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: '-80px', right: '-60px', width: '240px', height: '240px', borderRadius: '50%', background: 'rgba(232,114,10,0.12)' }} />
        <div style={{ position: 'absolute', bottom: '-60px', left: '-40px', width: '180px', height: '180px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />

        <div style={{ position: 'relative', textAlign: 'center' }}>
          <div style={{
            width: '72px', height: '72px', background: ORANGE, borderRadius: '20px',
            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem',
            boxShadow: '0 8px 30px rgba(232,114,10,0.4)',
          }}>
            <BrainCircuit size={36} color="white" />
          </div>
          <h1 style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 800, fontSize: '1.6rem', lineHeight: 1.3, marginBottom: '1rem' }}>
            MoSPI Skill<br />Intelligence Platform
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.9rem', lineHeight: 1.7 }}>
            AI-powered competency gap analysis and personalised learning for India's statistical workforce.
          </p>
          <div style={{ marginTop: '2.5rem', padding: '1.25rem', background: 'rgba(255,255,255,0.08)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.12)', textAlign: 'left' }}>
            <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)', marginBottom: '0.5rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Powered by
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {['iGOT Karmayogi', 'NSSTA Training Calendar', 'Novita AI (DeepSeek V4)'].map(s => (
                <div key={s} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'rgba(255,255,255,0.8)' }}>
                  <span style={{ color: ORANGE }}>✦</span> {s}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right panel — Login form */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div style={{ width: '100%', maxWidth: '420px' }}>
          <div style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 800, color: NAVY, fontSize: '1.75rem', marginBottom: '0.3rem' }}>
              Welcome back 👋
            </h2>
            <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>
              Sign in to your learning portal
            </p>
          </div>

          {error && (
            <div style={{
              background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px',
              padding: '0.75rem 1rem', marginBottom: '1.25rem',
              display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#dc2626', fontSize: '0.875rem',
            }}>
              <AlertCircle size={16} /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
            <div>
              <label style={{ display: 'block', fontWeight: 600, color: NAVY, fontSize: '0.875rem', marginBottom: '0.4rem' }}>
                Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@mospi.gov.in"
                  required
                  style={{
                    width: '100%', padding: '0.75rem 0.75rem 0.75rem 2.5rem',
                    border: '1.5px solid #d1d5db', borderRadius: '10px',
                    fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box',
                    transition: 'border-color 0.2s',
                    fontFamily: 'inherit',
                  }}
                  onFocus={e => e.target.style.borderColor = NAVY}
                  onBlur={e => e.target.style.borderColor = '#d1d5db'}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: 600, color: NAVY, fontSize: '0.875rem', marginBottom: '0.4rem' }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Your password"
                  required
                  style={{
                    width: '100%', padding: '0.75rem 2.5rem 0.75rem 2.5rem',
                    border: '1.5px solid #d1d5db', borderRadius: '10px',
                    fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box',
                    fontFamily: 'inherit',
                  }}
                  onFocus={e => e.target.style.borderColor = NAVY}
                  onBlur={e => e.target.style.borderColor = '#d1d5db'}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: 0 }}
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                background: loading ? '#9ca3af' : NAVY, color: 'white', border: 'none',
                padding: '0.85rem', borderRadius: '10px', fontWeight: 700, fontSize: '0.95rem',
                cursor: loading ? 'not-allowed' : 'pointer', marginTop: '0.5rem',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                transition: 'background 0.2s',
              }}
            >
              {loading ? (
                <>
                  <span style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.4)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.8s linear infinite', display: 'inline-block' }} />
                  Signing in…
                </>
              ) : 'Sign In'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: '#6b7280' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: ORANGE, fontWeight: 700, textDecoration: 'none' }}>
              Register here
            </Link>
          </div>

          <div style={{ textAlign: 'center', marginTop: '0.75rem', fontSize: '0.8rem', color: '#9ca3af' }}>
            Are you an admin?{' '}
            <Link to="/admin/login" style={{ color: '#6b7280', fontWeight: 600, textDecoration: 'none' }}>
              Admin Portal →
            </Link>
          </div>

          <div style={{ marginTop: '2rem', padding: '1rem', background: '#f9fafb', borderRadius: '10px', border: '1px solid #e5e7eb' }}>
            <div style={{ fontSize: '0.75rem', color: '#9ca3af', fontWeight: 600, marginBottom: '0.4rem' }}>DEMO ACCOUNTS</div>
            <div style={{ fontSize: '0.8rem', color: '#6b7280', lineHeight: 1.6 }}>
              <strong>Learner:</strong> anika.sharma@mospi.gov.in (any password)<br />
              <strong>Admin:</strong> admin@mospi.gov.in / admin123
            </div>
          </div>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); }}`}</style>
    </div>
  );
}
