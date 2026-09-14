import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Target, Star, CheckCircle2, ArrowRight, Shield, Sparkles, Loader, Info, HelpCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { fetchGapAnalysis } from '../../services/api';

const NAVY = '#14343b';
const TERRACOTTA = '#c4713d';

const CALIBRATION_EXPLANATIONS = {
  'OS-01': 'Required for scientific sampling frame generation, primary data collection strategy, and non-sampling error reduction in national surveys.',
  'OS-02': 'Essential for multi-stage stratified cluster sampling, calculating design effects, and calibrating weighting factors for PLFS and ASI.',
  'OS-03': 'Required for quarterly GDP estimation, gross value added (GVA) calculations, and base-year index revision workflows in National Accounts.',
  'TC-01': 'Required for high-performance vectorized data transformations, web scraping microdata, and automated statistical pipelines using Pandas and NumPy.',
  'TC-03': 'Required for executing relational microdata queries, window functions, and joining large-scale survey datasets across division databases.',
  'DG-05': 'Critical for integrating data pipelines with MeghRaj Gov Cloud, API gateways, and Digital Public Infrastructure data sharing standards.',
  'TC-08': 'Necessary for designing operational executive dashboards, heatmaps, and dissemination infographics for MoSPI public portals.',
  'BM-01': 'Essential for guiding field survey teams, managing DQAD verification nodes, and maintaining statistical operational integrity.'
};

export default function CompetenciesPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [competencies, setCompetencies] = useState([]);
  const [selfRatings, setSelfRatings] = useState({});
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    loadData();
  }, [user?.id]);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchGapAnalysis(user.id, { role_code: user?.role_code || 'SSO' });
      const raw = data?.gaps || data?.competencies || [];
      
      const formatted = raw.slice(0, 6).map(item => {
        const code = item.competency_code || item.code || 'OS-01';
        const name = item.competency_name || item.name || 'Competency';
        const reqLevel = item.required_score || item.required_level || 4;
        const currentLevel = item.current_score || item.current_level || 2;
        const category = code.startsWith('OS') ? 'OFFICIAL STATISTICS' :
                         code.startsWith('TC') ? 'TECHNICAL' :
                         code.startsWith('DG') ? 'DIGITAL GOVERNANCE' : 'BEHAVIOURAL';
        
        return {
          code,
          name,
          category,
          requiredLevel: reqLevel >= 4 ? 'ADVANCED' : 'INTERMEDIATE',
          reqLevelNum: reqLevel,
          currentLevelNum: currentLevel,
          calibration: CALIBRATION_EXPLANATIONS[code] || 'Required for standard operational workflows and capacity framework standards.'
        };
      });

      setCompetencies(formatted);
      const initialRatings = {};
      formatted.forEach(c => {
        initialRatings[c.code] = Math.round(c.currentLevelNum) || 3;
      });
      setSelfRatings(initialRatings);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRatingChange = (code, rating) => {
    setSelfRatings(prev => ({ ...prev, [code]: rating }));
  };

  const handleSaveAndTest = () => {
    setSaved(true);
    setTimeout(() => {
      navigate('/dashboard/assessment');
    }, 600);
  };

  return (
    <div style={{ maxWidth: '1050px', margin: '0 auto', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      
      {/* Header Banner */}
      <div style={{
        background: `linear-gradient(135deg, ${NAVY} 0%, #1e4d56 100%)`,
        borderRadius: '16px', padding: '2rem 2.25rem', color: 'white', marginBottom: '1.75rem',
        boxShadow: '0 4px 18px rgba(20, 52, 59, 0.15)', border: '1px solid rgba(255,255,255,0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.4rem' }}>
          <span style={{ background: TERRACOTTA, color: 'white', padding: '0.2rem 0.65rem', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Lifecycle Step 2
          </span>
          <span style={{ background: 'rgba(255,255,255,0.15)', color: '#cbd5e1', padding: '0.2rem 0.65rem', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 700 }}>
            Mandate Cadre: {user?.role_code || 'SSO'}
          </span>
        </div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: '0.4rem 0', color: 'white', letterSpacing: '-0.02em' }}>
          AI Selected Target Competencies
        </h1>
        <p style={{ color: '#cbd5e1', fontSize: '0.925rem', maxWidth: '800px', lineHeight: 1.5 }}>
          The AI intelligence engine automatically maps your cadre role, division mandate, and current assignment to required statistical competencies. Provide your initial self-assessment below before proceeding to the AI Adaptive Assessment.
        </p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: '#94a3b8' }}>
          <Loader size={36} className="spin" style={{ marginBottom: '1rem', color: NAVY }} />
          <div style={{ fontWeight: 600, color: '#475569' }}>Mapping Role Competencies...</div>
        </div>
      ) : (
        <>
          {/* Competencies List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '2rem' }}>
            {competencies.map((comp, idx) => (
              <div key={comp.code} style={{
                background: 'white', borderRadius: '14px', border: '1px solid #e2e8f0',
                padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '0.85rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{
                      width: '32px', height: '32px', borderRadius: '8px', background: TERRACOTTA, color: 'white',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.85rem'
                    }}>
                      {idx + 1}
                    </div>
                    <div>
                      <h3 style={{ margin: 0, color: NAVY, fontSize: '1.1rem', fontWeight: 800 }}>
                        {comp.name}
                      </h3>
                      <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', letterSpacing: '0.05em' }}>
                        CODE: {comp.code}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <span style={{
                      background: comp.category === 'TECHNICAL' ? '#eff6ff' : comp.category === 'DIGITAL GOVERNANCE' ? '#f0fdf4' : '#fff7ed',
                      color: comp.category === 'TECHNICAL' ? '#1d4ed8' : comp.category === 'DIGITAL GOVERNANCE' ? '#15803d' : '#c2410c',
                      padding: '0.25rem 0.65rem', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 800
                    }}>
                      {comp.category}
                    </span>
                    <span style={{
                      background: NAVY, color: 'white', padding: '0.25rem 0.65rem', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 800
                    }}>
                      REQUIRED: {comp.requiredLevel}
                    </span>
                  </div>
                </div>

                {/* Role Calibration Block */}
                <div style={{
                  background: '#f8fafc', borderLeft: `3px solid ${TERRACOTTA}`, padding: '0.85rem 1rem',
                  borderRadius: '0 8px 8px 0', fontSize: '0.85rem', color: '#334155', marginBottom: '1.25rem', lineHeight: 1.5
                }}>
                  <strong style={{ color: NAVY }}>Role Calibration:</strong> {comp.calibration}
                </div>

                {/* Self Assessment Ratings Selector */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', borderTop: '1px solid #f1f5f9', paddingTop: '1rem' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: NAVY }}>
                    Self-Assessed Proficiency Rating:
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {[
                      { val: 1, label: 'Very Weak (1/5)' },
                      { val: 2, label: 'Weak (2/5)' },
                      { val: 3, label: 'Moderate (3/5)' },
                      { val: 4, label: 'Strong (4/5)' },
                      { val: 5, label: 'Very Strong (5/5)' }
                    ].map(star => {
                      const isSelected = selfRatings[comp.code] === star.val;
                      return (
                        <button
                          key={star.val}
                          onClick={() => handleRatingChange(comp.code, star.val)}
                          style={{
                            padding: '0.45rem 0.75rem', borderRadius: '8px', border: isSelected ? `2px solid ${TERRACOTTA}` : '1px solid #cbd5e1',
                            background: isSelected ? '#fff7ed' : 'white', color: isSelected ? TERRACOTTA : '#475569',
                            fontWeight: isSelected ? 800 : 600, fontSize: '0.78rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem'
                          }}
                        >
                          <Star size={13} fill={isSelected ? TERRACOTTA : 'none'} color={isSelected ? TERRACOTTA : '#94a3b8'} />
                          {star.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Action Footer */}
          <div style={{
            background: 'white', borderRadius: '14px', padding: '1.5rem 2rem', border: '1px solid #e2e8f0',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem'
          }}>
            <div>
              <div style={{ fontWeight: 800, color: NAVY, fontSize: '1rem' }}>Ready to Calibrate Demonstrated Ability?</div>
              <div style={{ fontSize: '0.825rem', color: '#64748b' }}>Proceeding will launch the 25-question adaptive AI assessment calibrated to your self-ratings.</div>
            </div>

            <button
              onClick={handleSaveAndTest}
              style={{
                background: TERRACOTTA, color: 'white', border: 'none', borderRadius: '10px', padding: '0.85rem 1.75rem',
                fontWeight: 800, fontSize: '0.95rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem',
                boxShadow: '0 4px 12px rgba(196, 113, 61, 0.3)'
              }}
            >
              {saved ? 'Saving Self-Ratings…' : 'Save Self-Ratings & Start AI Adaptive Assessment'} <ArrowRight size={18} />
            </button>
          </div>
        </>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); }}`}</style>
    </div>
  );
}
