import React, { useState } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import {
  BrainCircuit, LayoutDashboard, BookOpen, ClipboardCheck,
  User, LogOut, ChevronLeft, Menu, Bell, TrendingUp, Sparkles, Search, ChevronRight, Building2, MessageSquare, Bot, X
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { switchDemoPersona } from '../services/api';

const NAVY = '#14343b';
const TERRACOTTA = '#c4713d';

const LIFECYCLE_STEPS = [
  { step: 1, path: '/dashboard/profile', label: '1. Officer Profile', stageName: 'Step 1 · Officer Profile', icon: User },
  { step: 2, path: '/dashboard/competencies', label: '2. AI Selected Competencies', stageName: 'Step 2 · Competency Matrix', icon: LayoutDashboard },
  { step: 3, path: '/dashboard/assessment', label: '3. AI Adaptive Test', stageName: 'Step 3 · Diagnostic Test', icon: ClipboardCheck },
  { step: 4, path: '/dashboard/demonstrated', label: '4. Demonstrated Levels', stageName: 'Step 4 · Demonstrated Evidence', icon: LayoutDashboard },
  { step: 5, path: '/dashboard/gaps', label: '5. Skill Gap Analysis', stageName: 'Step 5 · Skill Gap Diagnosis', icon: LayoutDashboard },
  { step: 6, path: '/dashboard/roadmap', label: '6. Learning Roadmap', stageName: 'Step 6 · Learning Roadmap', icon: BookOpen },
  { step: 7, path: '/dashboard/recommendations', label: '7. iGOT / NSSTA Recommendations', stageName: 'Step 7 · Provider Recs', icon: BookOpen },
  { step: 8, path: '/dashboard/progress', label: '8. Progress Evaluation', stageName: 'Step 8 · Trajectory Log', icon: TrendingUp },
];

export default function LearnerLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [showCounselor, setShowCounselor] = useState(false);
  const [counselorInput, setCounselorInput] = useState('');
  const [counselorChat, setCounselorChat] = useState([
    { sender: 'bot', text: 'Namaste Officer! I am your AI Competency Counselor. Ask me about your priority skill gaps, target role readiness, or recommended NSSTA/iGOT modules.' }
  ]);

  const { user, logout, refreshUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handlePersonaSwitch = async (e) => {
    const roleCode = e.target.value;
    if (roleCode === 'ADMIN') {
      navigate('/admin/login');
      return;
    }
    try {
      const data = await switchDemoPersona(roleCode);
      if (data?.access_token) {
        localStorage.setItem('sip_token', data.access_token);
        await refreshUser();
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Failed to switch demo persona:', err);
    }
  };

  const handleSendMessage = () => {
    if (!counselorInput.trim()) return;
    const userText = counselorInput;
    setCounselorChat(prev => [...prev, { sender: 'user', text: userText }]);
    setCounselorInput('');

    setTimeout(() => {
      let reply = `Based on your official profile (${user?.role_code || 'Officer'}), your highest priority deficit is Sampling & Data Quality. I recommend completing the 10-hour NSSTA module in Step 6.`;
      if (userText.toLowerCase().includes('gdp') || userText.toLowerCase().includes('national accounts')) {
        reply = "National Accounts (OS-03) requires Target Level 4.0 for SSO promotion. Enroll in the NSSTA Advanced GDP Compilation course.";
      } else if (userText.toLowerCase().includes('python') || userText.toLowerCase().includes('sql')) {
        reply = "Technical computing skills (TC-01 & TC-03) are required for CAPI automated pipeline processing. Complete the hands-on lab in Phase 2.";
      }
      setCounselorChat(prev => [...prev, { sender: 'bot', text: reply }]);
    }, 600);
  };

  const sidebarWidth = collapsed ? '72px' : '260px';
  const currentStepObj = LIFECYCLE_STEPS.find(s => s.path === location.pathname) || LIFECYCLE_STEPS[5];

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: "'Plus Jakarta Sans', sans-serif", background: '#f8fafc' }}>

      {/* ── 4. Persistent Sidebar with 8-Step Lifecycle ── */}
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
            border: '1.5px solid #c4713d', margin: collapsed ? '0 auto' : '0'
          }}>
            <BrainCircuit size={20} color="#f59e0b" />
          </div>
          {!collapsed && (
            <div>
              <div style={{ color: '#f8fafc', fontWeight: 800, fontSize: '0.925rem', letterSpacing: '-0.01em', lineHeight: 1.2 }}>
                SankhyaSetu
              </div>
              <div style={{ color: '#94a3b8', fontSize: '0.68rem', fontWeight: 600 }}>
                MoSPI Competency Layer
              </div>
            </div>
          )}
        </div>

        {/* User Persona Card */}
        {!collapsed && user && (
          <div style={{ padding: '0.85rem 1rem', background: 'rgba(20, 52, 59, 0.4)', borderBottom: '1px solid #1e293b' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#c4713d', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Active Officer Mandate
            </div>
            <div style={{ fontSize: '0.875rem', fontWeight: 800, color: 'white', marginTop: '0.15rem' }}>
              {user.full_name || 'Arjun Reddy'}
            </div>
            <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '0.1rem' }}>
              {user.designation || 'Senior Statistical Officer'} · {user.role_code || 'SSO'}
            </div>
          </div>
        )}

        {/* 8-Step Competency Lifecycle Navigation */}
        <nav style={{ flex: 1, padding: '0.75rem 0.65rem', display: 'flex', flexDirection: 'column', gap: '0.25rem', overflowY: 'auto' }}>
          {!collapsed && (
            <div style={{ fontSize: '0.65rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '0.25rem 0.5rem', marginBottom: '0.2rem' }}>
              Competency Lifecycle
            </div>
          )}
          {LIFECYCLE_STEPS.map((item) => {
            const active = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <button
                key={item.step}
                onClick={() => navigate(item.path)}
                title={collapsed ? item.label : undefined}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.65rem',
                  padding: collapsed ? '0.75rem' : '0.55rem 0.75rem',
                  justifyContent: collapsed ? 'center' : 'flex-start',
                  borderRadius: '6px', border: 'none', cursor: 'pointer',
                  background: active ? 'rgba(196, 113, 61, 0.18)' : 'transparent',
                  color: active ? '#f59e0b' : '#94a3b8',
                  fontWeight: active ? 700 : 500, fontSize: '0.8rem',
                  transition: 'all 0.15s', whiteSpace: 'nowrap',
                }}
                onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
                onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}
              >
                <Icon size={16} style={{ flexShrink: 0, color: active ? '#f59e0b' : '#64748b' }} />
                {!collapsed && <span>{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* Footer info & Logout */}
        <div style={{ padding: '0.75rem', borderTop: '1px solid #1e293b', background: '#090d16' }}>
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
          display: 'flex', alignItems: 'center', padding: '0 1.5rem', gap: '1rem',
          flexShrink: 0, boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03)'
        }}>
          <button
            onClick={() => setCollapsed(!collapsed)}
            style={{ background: 'none', border: '1px solid #e2e8f0', borderRadius: '6px', cursor: 'pointer', color: '#475569', padding: '0.35rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            {collapsed ? <Menu size={18} /> : <ChevronLeft size={18} />}
          </button>

          {/* Breadcrumb Navigation */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.825rem', color: '#64748b', fontWeight: 600 }}>MoSPI Officer Portal</span>
            <ChevronRight size={14} color="#94a3b8" />
          </div>

          {/* ── 3. TOP STAGE PILL INDICATOR ── */}
          <div style={{
            background: '#14343b', color: '#f59e0b', padding: '0.35rem 0.85rem',
            borderRadius: '20px', fontSize: '0.78rem', fontWeight: 800, border: '1px solid #c4713d'
          }}>
            {currentStepObj.stageName}
          </div>

          {/* ── 45. DEMO PERSONA SWITCHER DROPDOWN ── */}
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
              Switch Persona:
            </span>
            <select
              value={user?.role_code || 'SSO'}
              onChange={handlePersonaSwitch}
              style={{
                padding: '0.35rem 0.65rem', borderRadius: '6px', border: '1px solid #cbd5e1',
                fontSize: '0.78rem', fontWeight: 700, color: NAVY, background: '#f8fafc', cursor: 'pointer'
              }}
            >
              <option value="SSO">Arjun Reddy (SSO - Data Quality)</option>
              <option value="JSO">Ananya Sharma (JSO - Field Survey)</option>
              <option value="MCTP-II">Rahul Verma (MCTP-II - Governance)</option>
              <option value="MCTP-III">Priya Nair (MCTP-III - Econometrics)</option>
              <option value="ADMIN">Department Head (Admin Portal)</option>
            </select>
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
        <main style={{ flex: 1, overflowY: 'auto', padding: '1.75rem', position: 'relative' }}>
          <Outlet />

          {/* ── 5. FLOATING AI COUNSELOR WIDGET (🤖 AI Counselor ✨) ── */}
          <div style={{ position: 'fixed', bottom: '1.5rem', right: '1.5rem', zIndex: 9999 }}>
            {!showCounselor ? (
              <button
                onClick={() => setShowCounselor(true)}
                style={{
                  background: 'linear-gradient(135deg, #14343b 0%, #1b3a4b 100%)',
                  color: '#f59e0b', border: '2px solid #c4713d', borderRadius: '30px',
                  padding: '0.75rem 1.35rem', fontWeight: 800, fontSize: '0.875rem',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem',
                  boxShadow: '0 8px 24px rgba(20, 52, 59, 0.3)'
                }}
              >
                <Bot size={18} color="#f59e0b" /> AI Counselor ✨
              </button>
            ) : (
              <div style={{
                width: '340px', background: 'white', borderRadius: '14px',
                border: '1.5px solid #14343b', boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
                display: 'flex', flexDirection: 'column', overflow: 'hidden'
              }}>
                <div style={{ background: '#14343b', color: 'white', padding: '0.85rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800, fontSize: '0.875rem', color: '#f59e0b' }}>
                    <Bot size={18} /> AI Competency Counselor
                  </div>
                  <button onClick={() => setShowCounselor(false)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>
                    <X size={18} />
                  </button>
                </div>

                <div style={{ height: '220px', overflowY: 'auto', padding: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.65rem', background: '#f8fafc' }}>
                  {counselorChat.map((msg, idx) => (
                    <div key={idx} style={{
                      alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                      background: msg.sender === 'user' ? '#14343b' : 'white',
                      color: msg.sender === 'user' ? 'white' : '#334155',
                      padding: '0.55rem 0.75rem', borderRadius: '8px', fontSize: '0.78rem',
                      maxWidth: '85%', border: msg.sender === 'user' ? 'none' : '1px solid #cbd5e1',
                      lineHeight: 1.4
                    }}>
                      {msg.text}
                    </div>
                  ))}
                </div>

                <div style={{ padding: '0.65rem', background: 'white', borderTop: '1px solid #e2e8f0', display: 'flex', gap: '0.4rem' }}>
                  <input
                    type="text"
                    value={counselorInput}
                    onChange={e => setCounselorInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Ask counselor..."
                    style={{ flex: 1, padding: '0.45rem 0.65rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.78rem', outline: 'none' }}
                  />
                  <button onClick={handleSendMessage} style={{ background: TERRACOTTA, color: 'white', border: 'none', borderRadius: '6px', padding: '0.45rem 0.75rem', fontSize: '0.78rem', fontWeight: 800, cursor: 'pointer' }}>
                    Send
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}


