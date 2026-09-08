import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, BarChart3, BrainCircuit, Shield, Users, TrendingUp, ArrowRight, CheckCircle } from 'lucide-react';

const NAVY = '#1a3a6b';
const ORANGE = '#e8720a';

const STATS = [
  { label: 'Government Officers', value: '2M+', icon: Users },
  { label: 'iGOT Courses', value: '1,500+', icon: BookOpen },
  { label: 'Competency Areas', value: '47', icon: BrainCircuit },
  { label: 'Ministries Covered', value: '90+', icon: Shield },
];

const FEATURES = [
  {
    icon: BrainCircuit,
    title: 'AI-Powered Gap Analysis',
    desc: 'Our AI analyses your profile and maps it against 35 competencies defined in the NKM Framework, instantly identifying your skill gaps.',
    color: '#3b82f6',
  },
  {
    icon: BookOpen,
    title: 'Personalised Course Recommendations',
    desc: 'Get curated courses from iGOT Karmayogi and NSSTA Training Calendar matched precisely to your role requirements and gaps.',
    color: ORANGE,
  },
  {
    icon: BarChart3,
    title: 'MCQ Competency Assessment',
    desc: 'Validate your knowledge with AI-generated assessments based on actual training material. Results update your competency profile automatically.',
    color: '#16a34a',
  },
  {
    icon: TrendingUp,
    title: 'Workforce Intelligence Dashboard',
    desc: 'Ministry administrators get a bird\'s-eye view of workforce readiness, competency heatmaps, and department-level insights.',
    color: '#8b5cf6',
  },
];

const HOW_IT_WORKS = [
  { step: '01', title: 'Create Your Account', desc: 'Sign up with your official email and complete a quick profile survey (takes 3 min).' },
  { step: '02', title: 'AI Profile Analysis', desc: 'Our AI extracts competencies from your work experience and educational background.' },
  { step: '03', title: 'Get Your Learning Plan', desc: 'View your personalised skill gaps and receive tailored course recommendations.' },
  { step: '04', title: 'Take Assessments', desc: 'Validate your skills with AI-generated MCQs and watch your readiness score grow.' },
];

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div style={{ fontFamily: "'Inter', 'Segoe UI', sans-serif", background: '#f8fafc', minHeight: '100vh' }}>

      {/* ── Navbar ── */}
      <nav style={{
        background: NAVY, padding: '0 2rem',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        height: '64px', position: 'sticky', top: 0, zIndex: 100,
        boxShadow: '0 2px 20px rgba(0,0,0,0.15)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: '36px', height: '36px', background: ORANGE, borderRadius: '8px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <BrainCircuit size={20} color="white" />
          </div>
          <div>
            <div style={{ color: 'white', fontWeight: 800, fontSize: '0.95rem', lineHeight: 1.2 }}>
              MoSPI Skill Intelligence
            </div>
            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.65rem' }}>
              Powered by iGOT Karmayogi
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <button
            onClick={() => navigate('/admin/login')}
            style={{
              color: 'rgba(255,255,255,0.7)', background: 'transparent', border: 'none',
              cursor: 'pointer', fontSize: '0.85rem', fontWeight: 500, padding: '0.4rem 0.8rem',
            }}
          >
            Admin Portal
          </button>
          <button
            onClick={() => navigate('/login')}
            style={{
              color: 'white', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.25)',
              cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, padding: '0.5rem 1.1rem',
              borderRadius: '8px',
            }}
          >
            Sign In
          </button>
          <button
            onClick={() => navigate('/register')}
            style={{
              color: 'white', background: ORANGE, border: 'none',
              cursor: 'pointer', fontSize: '0.85rem', fontWeight: 700, padding: '0.5rem 1.2rem',
              borderRadius: '8px',
            }}
          >
            Get Started →
          </button>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section style={{
        background: `linear-gradient(135deg, ${NAVY} 0%, #0f2347 60%, #1a2e5a 100%)`,
        padding: '5rem 2rem',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Decorative circles */}
        <div style={{ position: 'absolute', top: '-80px', right: '-80px', width: '300px', height: '300px', borderRadius: '50%', background: 'rgba(232,114,10,0.08)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-60px', left: '-60px', width: '240px', height: '240px', borderRadius: '50%', background: 'rgba(255,255,255,0.04)', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', maxWidth: '800px', margin: '0 auto' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            background: 'rgba(232,114,10,0.15)', border: '1px solid rgba(232,114,10,0.3)',
            color: '#fb923c', padding: '0.4rem 1rem', borderRadius: '20px',
            fontSize: '0.8rem', fontWeight: 600, marginBottom: '1.5rem',
          }}>
            🏆 SIH 2026 — Problem Statement 26101
          </div>
          <h1 style={{
            color: 'white', fontSize: 'clamp(2rem, 5vw, 3.2rem)', fontWeight: 900,
            lineHeight: 1.2, marginBottom: '1.5rem', fontFamily: "'Poppins', sans-serif",
          }}>
            AI-Powered Skill Intelligence<br />
            <span style={{ color: ORANGE }}>for India's Statistical Workforce</span>
          </h1>
          <p style={{
            color: 'rgba(255,255,255,0.7)', fontSize: '1.1rem', lineHeight: 1.7,
            marginBottom: '2.5rem', maxWidth: '600px', margin: '0 auto 2.5rem',
          }}>
            Identify competency gaps, get personalised course recommendations from iGOT Karmayogi,
            and validate your skills — all powered by AI.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => navigate('/register')}
              style={{
                background: ORANGE, color: 'white', border: 'none',
                padding: '0.9rem 2rem', borderRadius: '10px',
                fontWeight: 700, fontSize: '1rem', cursor: 'pointer',
                boxShadow: '0 4px 20px rgba(232,114,10,0.4)',
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                transition: 'transform 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
            >
              Start Your Learning Journey <ArrowRight size={18} />
            </button>
            <button
              onClick={() => navigate('/login')}
              style={{
                background: 'rgba(255,255,255,0.1)', color: 'white',
                border: '1.5px solid rgba(255,255,255,0.3)',
                padding: '0.9rem 2rem', borderRadius: '10px',
                fontWeight: 600, fontSize: '1rem', cursor: 'pointer',
              }}
            >
              Sign In to Dashboard
            </button>
          </div>
        </div>
      </section>

      {/* ── Stats Bar ── */}
      <section style={{
        background: 'white', borderBottom: '1px solid #e5e7eb',
        padding: '2rem',
        boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
      }}>
        <div style={{
          maxWidth: '900px', margin: '0 auto',
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem',
        }}>
          {STATS.map(({ label, value, icon: Icon }) => (
            <div key={label} style={{ textAlign: 'center' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.5rem' }}>
                <Icon size={28} color={ORANGE} />
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 900, color: NAVY, fontFamily: "'Poppins', sans-serif" }}>
                {value}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#6b7280', fontWeight: 500 }}>{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section style={{ padding: '5rem 2rem', background: '#f8fafc' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, color: NAVY, fontFamily: "'Poppins', sans-serif" }}>
              Everything you need to grow
            </h2>
            <p style={{ color: '#6b7280', marginTop: '0.75rem', fontSize: '1rem' }}>
              Built for India's official statistical workforce, aligned to the National Knowledge Mission Framework
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
            {FEATURES.map(({ icon: Icon, title, desc, color }) => (
              <div key={title} style={{
                background: 'white', borderRadius: '16px', padding: '2rem',
                border: '1px solid #e5e7eb', boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                transition: 'box-shadow 0.2s, transform 0.2s',
              }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.1)'; e.currentTarget.style.transform = 'translateY(-3px)'; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.06)'; e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                <div style={{
                  width: '52px', height: '52px', borderRadius: '14px',
                  background: color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: '1.25rem',
                }}>
                  <Icon size={26} color={color} />
                </div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: NAVY, marginBottom: '0.6rem' }}>
                  {title}
                </h3>
                <p style={{ color: '#6b7280', fontSize: '0.9rem', lineHeight: 1.7 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section style={{ padding: '5rem 2rem', background: 'white' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, color: NAVY, fontFamily: "'Poppins', sans-serif" }}>
              How It Works
            </h2>
            <p style={{ color: '#6b7280', marginTop: '0.5rem' }}>Four simple steps to your personalised learning journey</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem' }}>
            {HOW_IT_WORKS.map(({ step, title, desc }) => (
              <div key={step} style={{ textAlign: 'center' }}>
                <div style={{
                  width: '56px', height: '56px', borderRadius: '50%',
                  background: `linear-gradient(135deg, ${NAVY}, #2451a3)`,
                  color: 'white', fontWeight: 900, fontSize: '1.1rem',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 1rem', fontFamily: "'Poppins', sans-serif",
                }}>
                  {step}
                </div>
                <h4 style={{ fontWeight: 700, color: NAVY, marginBottom: '0.5rem', fontSize: '0.95rem' }}>{title}</h4>
                <p style={{ color: '#6b7280', fontSize: '0.83rem', lineHeight: 1.6 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{
        background: `linear-gradient(135deg, ${NAVY}, #0f2347)`,
        padding: '4rem 2rem', textAlign: 'center',
      }}>
        <h2 style={{ color: 'white', fontSize: '1.8rem', fontWeight: 800, fontFamily: "'Poppins', sans-serif", marginBottom: '1rem' }}>
          Ready to accelerate your career?
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '2rem', fontSize: '1rem' }}>
          Join thousands of government officers already building their skills on iGOT Karmayogi.
        </p>
        <button
          onClick={() => navigate('/register')}
          style={{
            background: ORANGE, color: 'white', border: 'none',
            padding: '0.9rem 2.5rem', borderRadius: '10px',
            fontWeight: 700, fontSize: '1rem', cursor: 'pointer',
            boxShadow: '0 4px 20px rgba(232,114,10,0.4)',
          }}
        >
          Create Free Account →
        </button>
      </section>

      {/* ── Footer ── */}
      <footer style={{ background: '#0f1923', color: 'rgba(255,255,255,0.5)', padding: '2rem', textAlign: 'center', fontSize: '0.8rem', lineHeight: 1.7 }}>
        <div style={{ color: 'rgba(255,255,255,0.8)', fontWeight: 600, marginBottom: '0.4rem' }}>
          MoSPI AI Skill Intelligence Platform
        </div>
        Ministry of Statistics & Programme Implementation • Government of India • SIH 2026 — Problem Statement 26101
        <br />
        Integrated with iGOT Karmayogi Ecosystem • NSSTA Training Calendar • Powered by Enterprise AI Engine
      </footer>
    </div>
  );
}
