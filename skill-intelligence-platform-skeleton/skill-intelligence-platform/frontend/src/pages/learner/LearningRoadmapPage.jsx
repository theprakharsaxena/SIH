import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Clock, Target, ArrowRight, Award, Sparkles } from 'lucide-react';
import LearningPathRoadmap from '../../components/LearningPathRoadmap';

const NAVY = '#14343b';
const TERRACOTTA = '#c4713d';

export default function LearningRoadmapPage() {
  const navigate = useNavigate();

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
            Lifecycle Step 6
          </span>
          <span style={{ background: 'rgba(255,255,255,0.15)', color: '#cbd5e1', padding: '0.2rem 0.65rem', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 700 }}>
            Prioritized Capacity Building
          </span>
        </div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: '0.4rem 0', color: 'white', letterSpacing: '-0.02em' }}>
          Personalized Learning Roadmap
        </h1>
        <p style={{ color: '#cbd5e1', fontSize: '0.925rem', maxWidth: '800px', lineHeight: 1.5 }}>
          Your AI-generated capacity building trajectory, prioritized by deficit severity, operational risk, and estimated learning hours.
        </p>
      </div>

      {/* Embedded Learning Path Component */}
      <div style={{ background: 'white', borderRadius: '16px', padding: '1.75rem', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)', marginBottom: '1.75rem' }}>
        <LearningPathRoadmap />
      </div>

      {/* Footer Navigation */}
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button onClick={() => navigate('/dashboard/recommendations')} style={{ background: TERRACOTTA, color: 'white', border: 'none', borderRadius: '10px', padding: '0.85rem 2rem', fontWeight: 800, fontSize: '0.95rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          Proceed to iGOT / NSSTA Recommendations (Step 7) <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}
