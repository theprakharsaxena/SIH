import React, { useState } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import {
  BrainCircuit, LayoutDashboard, BookOpen, ClipboardCheck,
  User, LogOut, ChevronLeft, Menu, Bell, TrendingUp, Sparkles, Search, ChevronRight, Building2,
  Bot, X, CheckCircle, ShieldCheck, HelpCircle, Layers, UserCheck
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const NAVY = '#14343b';
const AMBER = '#c4713d';

const NAV_ITEMS = [
  { path: '/dashboard', label: '1. Officer Dashboard', icon: LayoutDashboard },
  { path: '/dashboard/courses', label: '2. Learning Pathway', icon: BookOpen },
  { path: '/dashboard/assessment', label: '3. Diagnostic Quiz', icon: ClipboardCheck },
  { path: '/dashboard/progress', label: '4. Progress Trajectory', icon: TrendingUp },
  { path: '/dashboard/future-readiness', label: '5. Future Readiness', icon: Sparkles },
  { path: '/dashboard/profile', label: '6. Officer Profile', icon: User },
];

const DEMO_PERSONAS = [
  { id: '1', name: 'Arjun Reddy', role_code: 'SSO', department: 'DQAD Kolkata', role_name: 'Senior Statistical Officer' },
  { id: '2', name: 'Ananya Sharma', role_code: 'JSO', department: 'Field Operations Delhi', role_name: 'Junior Statistical Officer' },
  { id: '3', name: 'Priya Nair', role_code: 'MCTP-II', department: 'National Accounts Division', role_name: 'Mid-Career Officer' },
  { id: 'admin', name: 'StatForge Master Admin', role_code: 'ADMIN', department: 'MoSPI HQ New Delhi', role_name: 'Master Administrator', is_admin: true }
];

export default function LearnerLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [showPersonaMenu, setShowPersonaMenu] = useState(false);
  const [showCounselor, setShowCounselor] = useState(false);
  const { user, login, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleSwitchPersona = (persona) => {
    if (persona.is_admin) {
      navigate('/admin/dashboard');
    } else {
      login({
        id: persona.id,
        email: `${persona.name.toLowerCase().replace(' ', '.')}@mospi.gov.in`,
        full_name: persona.name,
        role_code: persona.role_code,
        department: persona.department,
        designation: persona.role_name
      });
      setShowPersonaMenu(false);
      navigate('/dashboard');
    }
  };

  const sidebarWidth = collapsed ? '72px' : '260px';
  const currentNav = NAV_ITEMS.find(n => n.path === location.pathname);

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: "'Plus Jakarta Sans', sans-serif", background: '#f8fafc' }}>

      {/* ── Sidebar ── */}
      <aside style={{
        width: sidebarWidth, background: '#0f172a', display: 'flex', flexDirection: 'column',
        transition: 'width 0.2s ease-in-out', overflow: 'hidden', flexShrink: 0,
        borderRight: '1px solid #1e293b'
      }}>
        {/* Header Logo */}
        <div style={{
          padding: collapsed ? '1.25rem 0' : '1.25rem 1.25rem',
          display: 'flex', alignItems: 'center', gap: '0.85rem',
          borderBottom: '1px solid #1e293b', minHeight: '64px'
        }}>
          <div style={{
            width: '36px', height: '36px', background: NAVY, borderRadius: '8px',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            border: '1px solid #c4713d', margin: collapsed ? '0 auto' : '0'
          }}>
            <BrainCircuit size={20} color="#f59e0b" />
          </div>
          {!collapsed && (
            <div>
              <div style={{ color: '#f8fafc', fontWeight: 800, fontSize: '0.925rem', letterSpacing: '-0.01em', lineHeight: 1.2 }}>
                SankhyaSetu <span style={{ fontSize: '0.65rem', color: '#c4713d', background: 'rgba(196,113,61,0.15)', padding: '0.1rem 0.35rem', borderRadius: '4px' }}>v2.0</span>
              </div>
              <div style={{ color: '#94a3b8', fontSize: '0.68rem', fontWeight: 500 }}>MoSPI Competency Engine</div>
            </div>
          )}
        </div>

        {/* Numbered Pipeline Navigation Items */}
        <nav style={{ flex: 1, padding: '1rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          {!collapsed && (
            <div style={{ fontSize: '0.65rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '0.25rem 0.5rem', marginBottom: '0.25rem' }}>
              Competency Pipeline
            </div>
          )}
          {NAV_ITEMS.map(({ path, label, icon: Icon }) => {
            const active = location.pathname === path;
            return (
              <button
                key={path}
                onClick={() => navigate(path)}
                title={collapsed ? label : undefined}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.75rem',
                  padding: collapsed ? '0.75rem' : '0.65rem 0.85rem',
                  justifyContent: collapsed ? 'center' : 'flex-start',
                  borderRadius: '6px', border: 'none', cursor: 'pointer',
                  background: active ? 'rgba(196, 113, 61, 0.15)' : 'transparent',
                  color: active ? '#f59e0b' : '#94a3b8',
                  fontWeight: active ? 700 : 500, fontSize: '0.835rem',
                  transition: 'all 0.15s', whiteSpace: 'nowrap',
                }}
                onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
                onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}
              >
                <Icon size={18} style={{ flexShrink: 0, color: active ? '#f59e0b' : '#64748b' }} />
                {!collapsed && <span>{label}</span>}
              </button>
            );
          })}
        </nav>

        {/* User Card & Logout */}
        <div style={{ padding: '0.75rem', borderTop: '1px solid #1e293b', background: '#090d16' }}>
          {!collapsed && user && (
            <div style={{ padding: '0.75rem', background: '#1e293b', borderRadius: '8px', marginBottom: '0.5rem', border: '1px solid #334155' }}>
              <div style={{ fontSize: '0.825rem', fontWeight: 700, color: '#f8fafc', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user.full_name}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#f59e0b', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.15rem' }}>
                <Building2 size={12} /> {user.role_code || 'Officer'} · {user.department?.split(' - ')[0] || 'MoSPI'}
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            title="Sign Out"
            style={{
              display: 'flex', alignItems: 'center', gap: '0.6rem',
              padding: '0.6rem 0.75rem', justifyContent: collapsed ? 'center' : 'flex-start',
              borderRadius: '6px', border: 'none', cursor: 'pointer',
              background: 'transparent', color: '#94a3b8',
              width: '100%', fontSize: '0.825rem', fontWeight: 600,
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.color = '#f87171'; e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.background = 'transparent'; }}
          >
            <LogOut size={16} />
            {!collapsed && 'Sign Out'}
          </button>
        </div>
      </aside>

      {/* ── Main Area ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* Top Header */}
        <header style={{
          height: '64px', background: 'white', borderBottom: '1px solid #e2e8f0',
          display: 'flex', alignItems: 'center', padding: '0 1.75rem', gap: '1.25rem',
          flexShrink: 0, boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03)', position: 'relative'
        }}>
          <button
            onClick={() => setCollapsed(!collapsed)}
            style={{ background: 'none', border: '1px solid #e2e8f0', borderRadius: '6px', cursor: 'pointer', color: '#475569', padding: '0.35rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            {collapsed ? <Menu size={18} /> : <ChevronLeft size={18} />}
          </button>

          {/* Breadcrumb Navigation */}
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.825rem', color: '#64748b', fontWeight: 500 }}>SankhyaSetu Portal</span>
            <ChevronRight size={14} color="#94a3b8" />
            <span style={{ fontSize: '0.875rem', fontWeight: 700, color: NAVY }}>
              {currentNav?.label || 'Dashboard'}
            </span>
          </div>

          {/* 1-CLICK DEMO PERSONA SWITCHER */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowPersonaMenu(!showPersonaMenu)}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.4rem', background: '#fef3c7',
                border: '1px solid #fde68a', color: '#92400e', padding: '0.35rem 0.85rem',
                borderRadius: '20px', fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer'
              }}
            >
              <UserCheck size={14} /> Persona: {user?.full_name?.split(' ')[0] || 'Demo'} ({user?.role_code || 'JSO'})
            </button>

            {showPersonaMenu && (
              <div style={{
                position: 'absolute', right: 0, top: '45px', background: 'white',
                borderRadius: '10px', boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
                border: '1px solid #cbd5e1', width: '280px', zIndex: 9999, padding: '0.5rem'
              }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#64748b', padding: '0.4rem 0.6rem', textTransform: 'uppercase' }}>
                  Switch Demo Persona (SIH Profiles)
                </div>
                {DEMO_PERSONAS.map(p => (
                  <button
                    key={p.id}
                    onClick={() => handleSwitchPersona(p)}
                    style={{
                      width: '100%', textAlign: 'left', padding: '0.55rem 0.65rem',
                      borderRadius: '6px', border: 'none', background: user?.full_name === p.name ? '#eef2fb' : 'transparent',
                      cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '0.1rem',
                      marginBottom: '0.2rem'
                    }}
                  >
                    <div style={{ fontSize: '0.825rem', fontWeight: 700, color: NAVY }}>{p.name}</div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{p.role_name} · {p.department}</div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div style={{
            width: '36px', height: '36px', borderRadius: '6px',
            background: NAVY, display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer',
          }}>
            {user?.full_name?.[0]?.toUpperCase() || 'O'}
          </div>
        </header>

        {/* Page Content */}
        <main style={{ flex: 1, overflowY: 'auto', padding: '1.75rem' }}>
          <Outlet />
        </main>
      </div>

      {/* ── FLOATING AI SKILL COUNSELOR WIDGET ── */}
      <div style={{ position: 'fixed', bottom: '1.5rem', right: '1.5rem', zIndex: 9999 }}>
        {!showCounselor ? (
          <button
            onClick={() => setShowCounselor(true)}
            style={{
              background: 'linear-gradient(135deg, #14343b 0%, #1b3a4b 100%)',
              color: 'white', border: '2px solid #c4713d', borderRadius: '30px',
              padding: '0.65rem 1.25rem', fontWeight: 800, fontSize: '0.85rem',
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem',
              boxShadow: '0 8px 24px rgba(20, 52, 59, 0.3)'
            }}
          >
            <Bot size={18} color="#f59e0b" /> AI Skill Counselor ✨
          </button>
        ) : (
          <div style={{
            background: 'white', borderRadius: '14px', border: '1px solid #cbd5e1',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)', width: '360px', overflow: 'hidden'
          }}>
            <div style={{ background: '#14343b', color: 'white', padding: '1rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Bot size={20} color="#f59e0b" />
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.9rem' }}>AI Skill Counselor</div>
                  <div style={{ fontSize: '0.7rem', opacity: 0.8 }}>MoSPI Career Guidance Engine</div>
                </div>
              </div>
              <button onClick={() => setShowCounselor(false)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: '1.25rem', fontSize: '0.835rem', color: '#334155', lineHeight: 1.5 }}>
              <p style={{ margin: '0 0 0.85rem 0' }}>
                Hello <strong>{user?.full_name}</strong>! Based on your current cadre assignment ({user?.role_code || 'SSO'}), your primary competency deficit is <strong>Sampling Methodology & Data Quality</strong>.
              </p>
              <div style={{ background: '#f8fafc', padding: '0.85rem', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '0.85rem' }}>
                <strong style={{ color: NAVY }}>Counselor Recommendation:</strong> Complete <i>NSSTA Two-Stage Stratified Sampling Guide</i> to boost your verified evidence score by <strong>+1.5 Pts</strong>.
              </div>
              <button
                onClick={() => {
                  setShowCounselor(false);
                  navigate('/dashboard/courses');
                }}
                style={{
                  width: '100%', background: '#c4713d', color: 'white', border: 'none',
                  borderRadius: '6px', padding: '0.6rem', fontWeight: 800, cursor: 'pointer'
                }}
              >
                Go to Recommended Courses →
              </button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}


