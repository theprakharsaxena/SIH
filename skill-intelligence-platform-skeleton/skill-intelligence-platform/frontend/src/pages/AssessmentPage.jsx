import React from 'react';
import { ArrowLeft, Award } from 'lucide-react';
import QuizInterface from '../components/QuizInterface';

const NAVY = '#1a3a6b';
const ORANGE = '#e8720a';

export default function AssessmentPage({ selectedOfficer, onQuizCompleted, onGoBack }) {
  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '2rem 1.5rem' }}>

      {/* Page header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.35rem' }}>
            <button
              onClick={onGoBack}
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', fontSize: '0.85rem', fontWeight: 600, padding: '0.3rem 0' }}
            >
              <ArrowLeft style={{ width: '16px', height: '16px' }} /> Back to Dashboard
            </button>
          </div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: NAVY, fontFamily: 'Poppins, sans-serif', marginBottom: '0.25rem' }}>
            AI-Powered Assessment
          </h1>
          <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
            Upload a learning material to generate MCQs. Your score updates your competency profile instantly.
          </p>
        </div>

        {selectedOfficer && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'white', padding: '0.85rem 1.25rem', borderRadius: '14px', border: '1px solid #e5e7eb', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: NAVY, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '1rem' }}>
              {selectedOfficer.full_name.charAt(0)}
            </div>
            <div>
              <div style={{ fontWeight: 700, color: NAVY, fontSize: '0.875rem' }}>{selectedOfficer.full_name}</div>
              <div style={{ fontSize: '0.72rem', color: '#6b7280' }}>{selectedOfficer.designation} · {selectedOfficer.role_code}</div>
            </div>
          </div>
        )}
      </div>

      {/* How it works strip */}
      <div style={{ display: 'flex', gap: '0', marginBottom: '1.75rem', background: 'white', borderRadius: '14px', border: '1px solid #e5e7eb', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        {[
          { step: '1', title: 'Pick Competency', desc: 'Select the domain to be assessed', bg: '#eef2fb' },
          { step: '2', title: 'Upload Material', desc: 'PDF, DOCX, or TXT learning resource', bg: '#fff7ed' },
          { step: '3', title: 'AI Generates MCQs', desc: 'DeepSeek reads and creates 5 questions', bg: '#f0fdf4' },
          { step: '4', title: 'Score Updates Live', desc: 'Your competency score closes the loop', bg: '#fdf4ff' },
        ].map((s, i) => (
          <div key={i} style={{ flex: 1, padding: '1rem 1.25rem', background: s.bg, borderRight: i < 3 ? '1px solid #e5e7eb' : 'none' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 900, color: NAVY, fontFamily: 'Poppins, sans-serif', opacity: 0.15, lineHeight: 1, marginBottom: '0.3rem' }}>{s.step}</div>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: NAVY, marginBottom: '0.2rem' }}>{s.title}</div>
            <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>{s.desc}</div>
          </div>
        ))}
      </div>

      {/* Quiz Component */}
      <QuizInterface
        selectedOfficer={selectedOfficer}
        onQuizCompleted={onQuizCompleted}
      />
    </div>
  );
}
