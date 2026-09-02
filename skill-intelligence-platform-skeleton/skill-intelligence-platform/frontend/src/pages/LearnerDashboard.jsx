import React, { useState } from 'react';
import CompetencyRadar from '../components/CompetencyRadar';
import GapCards from '../components/GapCards';
import CourseRecommendations from '../components/CourseRecommendations';
import { extractProfileLLM, getDemoProfileText } from '../services/api';
import { Sparkles, RefreshCw, FileText, User } from 'lucide-react';

export default function LearnerDashboard({ selectedOfficer, gapData, recsData, onRefreshData, onSelectCourse }) {
  const [profileText, setProfileText] = useState('');
  const [extracting, setExtracting] = useState(false);

  const handleLoadSampleCV = async () => {
    try {
      const res = await getDemoProfileText();
      setProfileText(res.sample_text);
    } catch (e) {
      console.error(e);
    }
  };

  const handleExtractAndAnalyze = async (e) => {
    e.preventDefault();
    if (!profileText.trim()) return;
    setExtracting(true);
    try {
      await onRefreshData(selectedOfficer.id, profileText, selectedOfficer.role_code || 'SSO');
    } catch (err) {
      console.error(err);
      alert('Analysis failed: ' + err.message);
    } finally {
      setExtracting(false);
    }
  };

  const gaps = gapData?.gaps || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Officer Summary Header Card */}
      <div className="glass-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'linear-gradient(135deg, #3B82F6, #06B6D4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontWeight: 'bold' }}>
            {selectedOfficer?.full_name ? selectedOfficer.full_name.charAt(0) : 'O'}
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>
              {selectedOfficer?.full_name || 'Officer Profile'}
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              {selectedOfficer?.designation || 'Statistical Officer'} • Role Target: <strong style={{ color: '#93C5FD' }}>{selectedOfficer?.role_code || 'SSO'}</strong> • {selectedOfficer?.department || 'MoSPI'}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', fontSize: '0.85rem' }}>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Assigned Role</span>
            <div style={{ fontWeight: 700, color: '#3B82F6' }}>{selectedOfficer?.role_code || 'SSO'}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Overall Readiness</span>
            <div style={{ fontWeight: 700, color: '#34D399' }}>{gapData?.overall_readiness_pct || 0}%</div>
          </div>
        </div>
      </div>

      {/* Grid Layout: Radar Chart (left) & Gap Summary Cards (right) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
        <CompetencyRadar gaps={gaps} />
        <GapCards gaps={gaps} />
      </div>

      {/* LLM Unstructured Profile Extractor Box */}
      <div className="glass-card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sparkles style={{ width: '18px', height: '18px', color: '#60A5FA' }} />
            <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>LLM Profile Evidence Extractor (Novita AI DeepSeek)</h3>
          </div>
          <button onClick={handleLoadSampleCV} className="btn-secondary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}>
            <FileText style={{ width: '14px', height: '14px' }} /> Load Sample MoSPI Officer Profile
          </button>
        </div>

        <form onSubmit={handleExtractAndAnalyze}>
          <textarea
            rows={4}
            value={profileText}
            onChange={(e) => setProfileText(e.target.value)}
            placeholder="Paste raw unstructured CV, designation details, work experience, or past trainings here... (LLM extracts evidence facts, deterministic engine assigns scores)"
            style={{
              width: '100%',
              padding: '0.75rem',
              background: 'rgba(0,0,0,0.3)',
              color: 'white',
              border: '1px solid var(--border-subtle)',
              borderRadius: '8px',
              fontSize: '0.85rem',
              fontFamily: 'inherit',
              marginBottom: '0.75rem',
              resize: 'vertical',
            }}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" className="btn-primary" disabled={extracting || !profileText.trim()}>
              {extracting ? (
                <>
                  <RefreshCw className="spin" style={{ width: '16px', height: '16px' }} />
                  Extracting Facts & Computing Gaps...
                </>
              ) : (
                <>
                  <Sparkles style={{ width: '16px', height: '16px' }} />
                  Extract Evidence & Run Gap Engine
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Course Recommendations */}
      <CourseRecommendations
        recommendations={recsData?.recommendations || []}
        onSelectCourse={onSelectCourse}
      />
    </div>
  );
}
