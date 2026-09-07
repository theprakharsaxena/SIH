import React, { useState } from 'react';
import { BrainCircuit, Home, BookOpen, BarChart3, Award, ChevronDown, Shield } from 'lucide-react';

const NAVY = '#1a3a6b';
const ORANGE = '#e8720a';

export default function Header({ activeTab, setActiveTab, selectedOfficer, officers, onSelectOfficer }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const navItems = [
    { id: 'home',    label: 'Home',                icon: Home },
    { id: 'learner', label: 'My Dashboard',         icon: BookOpen },
    { id: 'mcq',     label: 'Take Assessment',      icon: Award },
    { id: 'admin',   label: 'Workforce Analytics',  icon: BarChart3 },
  ];

  return (
    <header style={{ position: 'sticky', top: 0, zIndex: 100 }}>

      {/* Top Gov Strip */}
      <div style={{ background: NAVY, padding: '0.35rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: 'rgba(255,255,255,0.75)' }}>
        <span>Ministry of Statistics & Programme Implementation (MoSPI) — Government of India</span>
        <span>SIH 2026 • Problem Statement 26101</span>
      </div>

      {/* Main Nav Bar */}
      <div style={{ background: 'white', borderBottom: '2px solid #e5e7eb', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0.7rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>

          {/* Brand */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexShrink: 0 }}>
            <div style={{ width: '44px', height: '44px', background: `linear-gradient(135deg, ${NAVY}, #2451a3)`, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(26,58,107,0.3)' }}>
              <BrainCircuit style={{ width: '24px', height: '24px', color: 'white' }} />
            </div>
            <div>
              <div style={{ fontSize: '1.05rem', fontWeight: 800, color: NAVY, fontFamily: 'Poppins, sans-serif', lineHeight: 1.15 }}>
                MoSPI Skill Intelligence
              </div>
              <div style={{ fontSize: '0.68rem', color: '#6b7280', fontWeight: 500 }}>
                iGOT Karmayogi Integration • AI-Powered Capacity Building
              </div>
            </div>
          </div>

          {/* Nav Links */}
          <nav style={{ display: 'flex', gap: '0.2rem', flex: 1, marginLeft: '0.5rem' }}>
            {navItems.map(item => {
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  style={{
                    padding: '0.5rem 1rem',
                    border: 'none',
                    background: active ? '#eef2fb' : 'transparent',
                    color: active ? NAVY : '#4b5563',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: active ? 700 : 500,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    borderBottom: active ? `2.5px solid ${ORANGE}` : '2.5px solid transparent',
                    transition: 'all 0.15s',
                    whiteSpace: 'nowrap',
                  }}
                >
                  <item.icon style={{ width: '15px', height: '15px' }} />
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Officer Picker */}
          {officers && officers.length > 0 && (
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                  padding: '0.45rem 0.9rem', border: '1.5px solid #e5e7eb',
                  borderRadius: '30px', background: '#fafafa', cursor: 'pointer',
                  fontSize: '0.85rem', fontWeight: 600, color: NAVY,
                }}
              >
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: `linear-gradient(135deg, ${NAVY}, #2451a3)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.78rem', fontWeight: 700, flexShrink: 0 }}>
                  {selectedOfficer?.full_name?.charAt(0) || 'U'}
                </div>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ maxWidth: '130px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '0.82rem', fontWeight: 700 }}>
                    {selectedOfficer?.full_name || 'Select Officer'}
                  </div>
                  <div style={{ fontSize: '0.68rem', color: '#6b7280' }}>{selectedOfficer?.role_code}</div>
                </div>
                <ChevronDown style={{ width: '14px', height: '14px', color: '#9ca3af' }} />
              </button>

              {dropdownOpen && (
                <>
                  <div onClick={() => setDropdownOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 150 }} />
                  <div style={{ position: 'absolute', right: 0, top: 'calc(100% + 10px)', background: 'white', borderRadius: '14px', boxShadow: '0 12px 32px rgba(0,0,0,0.15)', border: '1px solid #e5e7eb', minWidth: '260px', zIndex: 200, overflow: 'hidden' }}>
                    <div style={{ padding: '0.65rem 1rem', background: '#f9fafb', borderBottom: '1px solid #f3f4f6', fontSize: '0.75rem', color: '#6b7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Select Officer Profile
                    </div>
                    {officers.map(o => (
                      <button
                        key={o.id}
                        onClick={() => { onSelectOfficer(o); setDropdownOpen(false); }}
                        style={{
                          width: '100%', padding: '0.85rem 1rem', border: 'none',
                          background: selectedOfficer?.id === o.id ? '#eef2fb' : 'white',
                          cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.75rem',
                          textAlign: 'left',
                        }}
                      >
                        <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: `linear-gradient(135deg, ${NAVY}, #2451a3)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.875rem', fontWeight: 700, flexShrink: 0 }}>
                          {o.full_name.charAt(0)}
                        </div>
                        <div>
                          <div style={{ fontSize: '0.875rem', fontWeight: 700, color: NAVY }}>{o.full_name}</div>
                          <div style={{ fontSize: '0.72rem', color: '#6b7280' }}>{o.designation} • {o.role_code}</div>
                        </div>
                        {selectedOfficer?.id === o.id && <div style={{ marginLeft: 'auto', width: '8px', height: '8px', borderRadius: '50%', background: '#16a34a', flexShrink: 0 }} />}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
