import React from 'react';
import { Shield, BarChart3, UserCheck, BookOpen, FileText, Sparkles } from 'lucide-react';

export default function Header({ activeTab, setActiveTab, selectedOfficer, officers, onSelectOfficer }) {
  return (
    <header style={{ borderBottom: '1px solid var(--border-subtle)', background: 'rgba(11, 15, 25, 0.8)', backdropFilter: 'blur(12px)', position: 'sticky', top: 0, zIndex: 50 }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0.8rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        
        {/* Branding */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 15px rgba(59, 130, 246, 0.4)' }}>
            <Shield style={{ width: '22px', height: '22px', color: 'white' }} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h1 style={{ fontSize: '1.15rem', fontWeight: 700, letterSpacing: '-0.02em', background: 'linear-gradient(90deg, #FFFFFF, #9CA3AF)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                MoSPI Skill Intelligence Engine
              </h1>
              <span className="badge badge-igot" style={{ fontSize: '0.65rem' }}>SIH 2026</span>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              India's Official Statistical System • iGOT & NSSTA Integration Layer
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div style={{ display: 'flex', background: 'rgba(255, 255, 255, 0.05)', padding: '4px', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
          <button
            onClick={() => setActiveTab('learner')}
            className={activeTab === 'learner' ? 'btn-primary' : 'btn-secondary'}
            style={{ padding: '0.4rem 0.9rem', fontSize: '0.85rem' }}
          >
            <UserCheck style={{ width: '16px', height: '16px' }} />
            Learner Dashboard
          </button>
          <button
            onClick={() => setActiveTab('mcq')}
            className={activeTab === 'mcq' ? 'btn-primary' : 'btn-secondary'}
            style={{ padding: '0.4rem 0.9rem', fontSize: '0.85rem' }}
          >
            <BookOpen style={{ width: '16px', height: '16px' }} />
            RAG MCQ Engine (Closed Loop)
          </button>
          <button
            onClick={() => setActiveTab('admin')}
            className={activeTab === 'admin' ? 'btn-primary' : 'btn-secondary'}
            style={{ padding: '0.4rem 0.9rem', fontSize: '0.85rem' }}
          >
            <BarChart3 style={{ width: '16px', height: '16px' }} />
            Workforce Heatmap
          </button>
        </div>

        {/* Officer Selector */}
        {officers && officers.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Officer:</span>
            <select
              value={selectedOfficer?.id || ''}
              onChange={(e) => {
                const off = officers.find(o => o.id === e.target.value);
                if (off) onSelectOfficer(off);
              }}
              style={{
                background: 'rgba(17, 24, 39, 0.9)',
                color: 'white',
                border: '1px solid var(--border-subtle)',
                borderRadius: '6px',
                padding: '0.4rem 0.75rem',
                fontSize: '0.85rem',
                outline: 'none',
              }}
            >
              {officers.map(o => (
                <option key={o.id} value={o.id}>
                  {o.full_name} ({o.role_code})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
    </header>
  );
}
