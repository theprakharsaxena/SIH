import React, { useState } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import {
  BrainCircuit, LayoutDashboard, BookOpen, ClipboardCheck,
  User, LogOut, ChevronLeft, Menu, Bell,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';


const NAVY = '#1a3a6b';
const ORANGE = '#e8720a';

const NAV_ITEMS = [
  { path: '/dashboard', label: 'My Dashboard', icon: LayoutDashboard },
  { path: '/dashboard/courses', label: 'My Courses', icon: BookOpen },
  { path: '/dashboard/assessment', label: 'Take Assessment', icon: ClipboardCheck },
  { path: '/dashboard/profile', label: 'My Profile', icon: User },
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

  const sidebarWidth = collapsed ? '72px' : '240px';

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: "'Inter', 'Segoe UI', sans-serif", background: '#f0f4f8' }}>

      {/* ── Sidebar ── */}
      <aside style={{
        width: sidebarWidth, background: NAVY, display: 'flex', flexDirection: 'column',
        transition: 'width 0.3s', overflow: 'hidden', flexShrink: 0,
        boxShadow: '4px 0 20px rgba(0,0,0,0.15)',
      }}>
        {/* Logo area */}
        <div style={{ padding: collapsed ? '1.25rem 0' : '1.25rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', borderBottom: '1px solid rgba(255,255,255,0.1)', minHeight: '64px' }}>
          <div style={{ width: '36px', height: '36px', background: ORANGE, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, margin: collapsed ? '0 auto' : '0' }}>
            <BrainCircuit size={18} color="white" />
          </div>
          {!collapsed && (
            <div>
              <div style={{ color: 'white', fontWeight: 800, fontSize: '0.85rem', lineHeight: 1.2 }}>MoSPI SIP</div>
              <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.62rem' }}>Skill Intelligence</div>
            </div>
          )}
        </div>

        {/* Nav items */}
        <nav style={{ flex: 1, padding: '1rem 0.5rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          {NAV_ITEMS.map(({ path, label, icon: Icon }) => {
            const active = location.pathname === path;
            return (
              <button
                key={path}
                onClick={() => navigate(path)}
                title={collapsed ? label : undefined}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.75rem',
                  padding: collapsed ? '0.75rem' : '0.75rem 0.85rem',
                  justifyContent: collapsed ? 'center' : 'flex-start',
                  borderRadius: '10px', border: 'none', cursor: 'pointer',
                  background: active ? 'rgba(255,255,255,0.15)' : 'transparent',
                  color: active ? 'white' : 'rgba(255,255,255,0.6)',
                  fontWeight: active ? 700 : 500, fontSize: '0.875rem',
                  transition: 'all 0.2s', whiteSpace: 'nowrap',
                  borderLeft: active ? `3px solid ${ORANGE}` : '3px solid transparent',
                }}
                onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
                onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}
              >
                <Icon size={18} style={{ flexShrink: 0 }} />
                {!collapsed && <span>{label}</span>}
              </button>
            );
          })}
        </nav>

        {/* User + logout */}
        <div style={{ padding: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          {!collapsed && user && (
            <div style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.08)', borderRadius: '10px', marginBottom: '0.5rem' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'white', marginBottom: '0.15rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user.full_name}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user.role_code} · {user.department?.split(' - ')[0] || 'MoSPI'}
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            title="Sign Out"
            style={{
              display: 'flex', alignItems: 'center', gap: '0.6rem',
              padding: '0.6rem', justifyContent: collapsed ? 'center' : 'flex-start',
              borderRadius: '8px', border: 'none', cursor: 'pointer',
              background: 'transparent', color: 'rgba(255,255,255,0.5)',
              width: '100%', fontSize: '0.825rem',
              transition: 'color 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.color = '#f87171'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.5)'}
          >
            <LogOut size={16} />
            {!collapsed && 'Sign Out'}
          </button>
        </div>
      </aside>

      {/* ── Main area ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* Top bar */}
        <header style={{
          height: '64px', background: 'white', borderBottom: '1px solid #e5e7eb',
          display: 'flex', alignItems: 'center', padding: '0 1.5rem', gap: '1rem',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)', flexShrink: 0,
        }}>
          <button
            onClick={() => setCollapsed(!collapsed)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', padding: '0.25rem' }}
          >
            {collapsed ? <Menu size={20} /> : <ChevronLeft size={20} />}
          </button>

          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, color: NAVY, fontSize: '0.95rem' }}>
              {NAV_ITEMS.find(n => n.path === location.pathname)?.label || 'Learner Portal'}
            </div>
            <div style={{ fontSize: '0.72rem', color: '#9ca3af' }}>
              {user?.department || 'MoSPI'} · {user?.role_code || 'Officer'}
            </div>
          </div>

          <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', position: 'relative' }}>
            <Bell size={20} />
          </button>

          <div style={{
            width: '36px', height: '36px', borderRadius: '50%',
            background: `linear-gradient(135deg, ${NAVY}, #2451a3)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer',
          }}>
            {user?.full_name?.[0]?.toUpperCase() || 'U'}
          </div>
        </header>

        {/* Page content */}
        <main style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
