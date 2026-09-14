import React, { useState } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import {
  BrainCircuit, LayoutDashboard, BookOpen, ClipboardCheck,
  User, LogOut, ChevronLeft, Menu, Bell, TrendingUp, Sparkles, Search, ChevronRight, Building2
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const NAVY = '#1a3a6b';
const ORANGE = '#d97706';

const NAV_ITEMS = [
  { path: '/dashboard', label: 'My Dashboard', icon: LayoutDashboard },
  { path: '/dashboard/courses', label: 'Learning Paths', icon: BookOpen },
  { path: '/dashboard/assessment', label: 'Competency Assessments', icon: ClipboardCheck },
  { path: '/dashboard/progress', label: 'Progress Trajectory', icon: TrendingUp },
  { path: '/dashboard/future-readiness', label: 'Future Readiness', icon: Sparkles },
  { path: '/dashboard/profile', label: 'Officer Profile', icon: User },
];

export default function LearnerLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const sidebarWidth = collapsed ? '72px' : '250px';
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
            border: '1px solid #334155', margin: collapsed ? '0 auto' : '0'
          }}>
            <BrainCircuit size={20} color="#38bdf8" />
          </div>
          {!collapsed && (
            <div>
              <div style={{ color: '#f8fafc', fontWeight: 800, fontSize: '0.9rem', letterSpacing: '-0.01em', lineHeight: 1.2 }}>SankhyaSetu</div>
              <div style={{ color: '#94a3b8', fontSize: '0.68rem', fontWeight: 500 }}>MoSPI Competency Layer</div>
            </div>
          )}
        </div>

        {/* Navigation Items */}
        <nav style={{ flex: 1, padding: '1rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          {!collapsed && (
            <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '0.25rem 0.5rem', marginBottom: '0.25rem' }}>
              Competency Workspace
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
                  background: active ? 'rgba(56, 189, 248, 0.12)' : 'transparent',
                  color: active ? '#38bdf8' : '#94a3b8',
                  fontWeight: active ? 600 : 500, fontSize: '0.85rem',
                  transition: 'all 0.15s', whiteSpace: 'nowrap',
                }}
                onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
                onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}
              >
                <Icon size={18} style={{ flexShrink: 0, color: active ? '#38bdf8' : '#64748b' }} />
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
              <div style={{ fontSize: '0.72rem', color: '#38bdf8', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.15rem' }}>
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
          flexShrink: 0, boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03)'
        }}>
          <button
            onClick={() => setCollapsed(!collapsed)}
            style={{ background: 'none', border: '1px solid #e2e8f0', borderRadius: '6px', cursor: 'pointer', color: '#475569', padding: '0.35rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            {collapsed ? <Menu size={18} /> : <ChevronLeft size={18} />}
          </button>

          {/* Breadcrumb Navigation */}
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.825rem', color: '#64748b', fontWeight: 500 }}>MoSPI Officer Portal</span>
            <ChevronRight size={14} color="#94a3b8" />
            <span style={{ fontSize: '0.875rem', fontWeight: 700, color: NAVY }}>
              {currentNav?.label || 'Dashboard'}
            </span>
          </div>

          {/* Status Pill */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#f1f5f9', padding: '0.35rem 0.85rem', borderRadius: '20px', border: '1px solid #e2e8f0' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#16a34a' }}></span>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#334155' }}>
              Cadre Level: {user?.role_code || 'JSO'}
            </span>
          </div>

          <button style={{ background: 'none', border: '1px solid #e2e8f0', borderRadius: '6px', cursor: 'pointer', color: '#64748b', padding: '0.45rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Bell size={18} />
          </button>

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
    </div>
  );
}

