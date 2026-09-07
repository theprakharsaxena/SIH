import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import LearnerDashboard from './pages/LearnerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import AssessmentPage from './pages/AssessmentPage';
import {
  fetchOfficers,
  fetchGapAnalysis,
  fetchRecommendations,
  fetchWorkforceReadiness,
  fetchWorkforceHeatmap,
  fetchAdminStats,
} from './services/api';
import { BrainCircuit } from 'lucide-react';

const NAVY = '#1a3a6b';

export default function App() {
  const [activeTab, setActiveTab]           = useState('home');
  const [officers, setOfficers]             = useState([]);
  const [selectedOfficer, setSelectedOfficer] = useState(null);
  const [gapData, setGapData]               = useState(null);
  const [recsData, setRecsData]             = useState(null);
  const [readinessData, setReadinessData]   = useState(null);
  const [heatmapData, setHeatmapData]       = useState(null);
  const [statsData, setStatsData]           = useState(null);
  const [loading, setLoading]               = useState(true);
  const [officerLoading, setOfficerLoading] = useState(false);

  /* ─── initial load ─── */
  useEffect(() => {
    async function init() {
      setLoading(true);
      try {
        const offList = await fetchOfficers();
        setOfficers(offList);
        if (offList?.length > 0) {
          const first = offList[0];
          setSelectedOfficer(first);
          await loadOfficerData(first.id, first.role_code || 'SSO');
        }
        const [r, h, s] = await Promise.all([
          fetchWorkforceReadiness(),
          fetchWorkforceHeatmap(),
          fetchAdminStats(),
        ]);
        setReadinessData(r); setHeatmapData(h); setStatsData(s);
      } catch (err) {
        console.error('Init error:', err);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  const loadOfficerData = async (id, roleCode = 'SSO', profileText = null) => {
    setOfficerLoading(true);
    try {
      const payload = profileText ? { profile_text: profileText, role_code: roleCode } : null;
      const [gaps, recs] = await Promise.all([
        fetchGapAnalysis(id, payload),
        fetchRecommendations(id, 10),
      ]);
      setGapData(gaps);
      setRecsData(recs);
    } catch (err) {
      console.error('Officer data error:', err);
    } finally {
      setOfficerLoading(false);
    }
  };

  const handleSelectOfficer = async (off) => {
    setSelectedOfficer(off);
    await loadOfficerData(off.id, off.role_code || 'SSO');
  };

  const handleRefreshData = async (officerId, profileText, roleCode) => {
    await loadOfficerData(officerId, roleCode, profileText);
    const [r, h, s] = await Promise.all([
      fetchWorkforceReadiness(), fetchWorkforceHeatmap(), fetchAdminStats(),
    ]);
    setReadinessData(r); setHeatmapData(h); setStatsData(s);
  };

  const handleQuizCompleted = async () => {
    if (selectedOfficer) {
      await loadOfficerData(selectedOfficer.id, selectedOfficer.role_code || 'SSO');
      const [r, h, s] = await Promise.all([
        fetchWorkforceReadiness(), fetchWorkforceHeatmap(), fetchAdminStats(),
      ]);
      setReadinessData(r); setHeatmapData(h); setStatsData(s);
    }
  };

  /* ─── Loading splash ─── */
  if (loading) {
    return (
      <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', background: '#f5ead8', flexDirection: 'column', gap: '1.5rem' }}>
        <div style={{ width: '64px', height: '64px', background: `linear-gradient(135deg, ${NAVY}, #2451a3)`, borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 30px rgba(26,58,107,0.3)' }}>
          <BrainCircuit style={{ width: '36px', height: '36px', color: 'white' }} />
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '1.3rem', fontWeight: 800, color: NAVY, fontFamily: 'Poppins, sans-serif', marginBottom: '0.3rem' }}>
            MoSPI Skill Intelligence Platform
          </div>
          <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Loading your AI-powered capacity building platform…</div>
        </div>
        <div style={{ width: '48px', height: '48px', border: `3px solid rgba(26,58,107,0.15)`, borderTopColor: NAVY, borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#f5ead8' }}>
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        selectedOfficer={selectedOfficer}
        officers={officers}
        onSelectOfficer={handleSelectOfficer}
      />

      <main style={{ flex: 1 }}>
        {activeTab === 'home' && (
          <HomePage
            stats={statsData}
            readinessData={readinessData}
            onNavigate={setActiveTab}
            selectedOfficer={selectedOfficer}
          />
        )}

        {activeTab === 'learner' && (
          <LearnerDashboard
            selectedOfficer={selectedOfficer}
            gapData={gapData}
            recsData={recsData}
            onRefreshData={handleRefreshData}
            onGoAssessment={() => setActiveTab('mcq')}
            officerLoading={officerLoading}
          />
        )}

        {activeTab === 'mcq' && (
          <AssessmentPage
            selectedOfficer={selectedOfficer}
            onQuizCompleted={handleQuizCompleted}
            onGoBack={() => setActiveTab('learner')}
          />
        )}

        {activeTab === 'admin' && (
          <AdminDashboard
            readinessData={readinessData}
            heatmapData={heatmapData}
            statsData={statsData}
          />
        )}
      </main>

      {/* Footer */}
      <footer style={{ background: NAVY, color: 'rgba(255,255,255,0.7)', textAlign: 'center', padding: '1.25rem', fontSize: '0.78rem', lineHeight: 1.6 }}>
        <div style={{ marginBottom: '0.3rem', color: 'rgba(255,255,255,0.9)', fontWeight: 600 }}>
          MoSPI AI Skill Intelligence Platform
        </div>
        Ministry of Statistics & Programme Implementation • Government of India • SIH 2026 Problem Statement 26101
        <br />
        <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.72rem' }}>Integrated with iGOT Karmayogi Ecosystem • NSSTA Training Calendar • Powered by Novita AI (DeepSeek)</span>
      </footer>
    </div>
  );
}
