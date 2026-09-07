import React, { useState } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import {
  Shield, LayoutDashboard, Users, BarChart3, ClipboardList,
  LogOut, Menu, ChevronLeft, Bell, BrainCircuit,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const NAVY = '#1a3a6b';
const ORANGE = '#e8720a';
const SIDEBAR_DARK = '#0f1e3d';

const NAV_ITEMS = [
  { path: '/admin/dashboard', label: 'Overview', icon: LayoutDashboard },
  { path: '/admin/officers', label: 'Officers', icon: Users },
  { path: '/admin/heatmap', label: 'Skill Heatmap', icon: BarChart3 },
  { path: '/admin/assessments', label: 'Assessments', icon: ClipboardList },
];

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: "'Inter', 'Segoe UI', sans-serif", background: '#f0f4f8' }}>

      {/* Sidebar */}
      <aside style={{
        width: collapsed ? '72px' : '240px', background: SIDEBAR_DARK, flexShrink: 0,
        display: 'flex', flexDirection: 'column', transition: 'width 0.3s',
        overflow: 'hidden', boxShadow: '4px 0 20px rgba(0,0,0,0.2)',
      }}>
        <div style={{ padding: collapsed ? '1.25rem 0' : '1.25rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', borderBottom: '1px solid rgba(255,255,255,0.06)', minHeight: '64px' }}>
          <div style={{ width: '36px', height: '36px', background: ORANGE, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, margin: collapsed ? '0 auto' : '0' }}>
            <Shield size={18} color="white" />
          </div>
          {!collapsed && (
            <div>
              <div style={{ color: 'white', fontWeight: 800, fontSize: '0.85rem' }}>Admin Portal</div>
              <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.62rem' }}>MoSPI SIP</div>
            </div>
          )}
        </div>

        <nav style={{ flex: 1, padding: '1rem 0.5rem', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
          {NAV_ITEMS.map(({ path, label, icon: Icon }) => {
            const active = location.pathname === path;
            return (
              <button key={path} onClick={() => navigate(path)} title={collapsed ? label : undefined}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.75rem',
                  padding: collapsed ? '0.75rem' : '0.75rem 0.85rem',
                  justifyContent: collapsed ? 'center' : 'flex-start',
                  borderRadius: '10px', border: 'none', cursor: 'pointer',
                  background: active ? `rgba(232,114,10,0.15)` : 'transparent',
                  color: active ? ORANGE : 'rgba(255,255,255,0.55)',
                  fontWeight: active ? 700 : 500, fontSize: '0.875rem',
                  transition: 'all 0.2s', whiteSpace: 'nowrap',
                  borderLeft: active ? `3px solid ${ORANGE}` : '3px solid transparent',
                }}
                onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
                onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}
              >
                <Icon size={18} style={{ flexShrink: 0 }} />
                {!collapsed && <span>{label}</span>}
              </button>
            );
          })}
        </nav>

        <div style={{ padding: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          {!collapsed && user && (
            <div style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', marginBottom: '0.5rem' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: ORANGE, marginBottom: '0.15rem' }}>ADMIN</div>
              <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.full_name}</div>
            </div>
          )}
          <button onClick={handleLogout} title="Sign Out"
            style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.6rem', justifyContent: collapsed ? 'center' : 'flex-start', borderRadius: '8px', border: 'none', cursor: 'pointer', background: 'transparent', color: 'rgba(255,255,255,0.4)', width: '100%', fontSize: '0.825rem', transition: 'color 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.color = '#f87171'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}
          >
            <LogOut size={16} />
            {!collapsed && 'Sign Out'}
          </button>
        </div>
      </aside>

      {/* Main */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <header style={{ height: '64px', background: 'white', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', padding: '0 1.5rem', gap: '1rem', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', flexShrink: 0 }}>
          <button onClick={() => setCollapsed(!collapsed)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}>
            {collapsed ? <Menu size={20} /> : <ChevronLeft size={20} />}
          </button>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, color: NAVY, fontSize: '0.95rem' }}>
              {NAV_ITEMS.find(n => n.path === location.pathname)?.label || 'Admin Portal'}
            </div>
            <div style={{ fontSize: '0.72rem', color: '#9ca3af' }}>Workforce Intelligence Dashboard</div>
          </div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: '#fef3c7', color: '#92400e', padding: '0.3rem 0.75rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700 }}>
            <Shield size={13} /> ADMIN
          </div>
          <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: `linear-gradient(135deg, ${ORANGE}, #c45d05)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '0.9rem' }}>
            {user?.full_name?.[0]?.toUpperCase() || 'A'}
          </div>
        </header>

        <main style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
