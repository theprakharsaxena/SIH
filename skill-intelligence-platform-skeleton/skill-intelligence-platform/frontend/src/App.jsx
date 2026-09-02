import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import LearnerDashboard from './pages/LearnerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import QuizInterface from './components/QuizInterface';
import {
  fetchOfficers,
  fetchOfficerDetails,
  fetchGapAnalysis,
  fetchRecommendations,
  fetchWorkforceReadiness,
  fetchWorkforceHeatmap,
  fetchAdminStats,
} from './services/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('learner');
  const [officers, setOfficers] = useState([]);
  const [selectedOfficer, setSelectedOfficer] = useState(null);
  const [gapData, setGapData] = useState(null);
  const [recsData, setRecsData] = useState(null);

  // Admin Data
  const [readinessData, setReadinessData] = useState(null);
  const [heatmapData, setHeatmapData] = useState(null);
  const [statsData, setStatsData] = useState(null);

  const [loading, setLoading] = useState(true);

  // Initial load
  useEffect(() => {
    async function loadInitialData() {
      setLoading(true);
      try {
        const offList = await fetchOfficers();
        setOfficers(offList);

        if (offList && offList.length > 0) {
          const defaultOff = offList[0];
          setSelectedOfficer(defaultOff);
          await loadOfficerData(defaultOff.id, defaultOff.role_code || 'SSO');
        }

        // Load admin data
        const [readiness, heatmap, stats] = await Promise.all([
          fetchWorkforceReadiness(),
          fetchWorkforceHeatmap(),
          fetchAdminStats(),
        ]);
        setReadinessData(readiness);
        setHeatmapData(heatmap);
        setStatsData(stats);
      } catch (err) {
        console.error('Failed to load initial data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadInitialData();
  }, []);

  const loadOfficerData = async (officerId, roleCode = 'SSO', profileText = null) => {
    try {
      const payload = profileText ? { profile_text: profileText, role_code: roleCode } : null;
      const [gaps, recs] = await Promise.all([
        fetchGapAnalysis(officerId, payload),
        fetchRecommendations(officerId, 10),
      ]);
      setGapData(gaps);
      setRecsData(recs);
    } catch (err) {
      console.error('Failed to load officer data:', err);
    }
  };

  const handleSelectOfficer = async (off) => {
    setSelectedOfficer(off);
    await loadOfficerData(off.id, off.role_code || 'SSO');
  };

  const handleRefreshData = async (officerId, profileText, roleCode) => {
    await loadOfficerData(officerId, roleCode, profileText);
  };

  const handleSelectCourse = (course) => {
    setActiveTab('mcq');
  };

  const handleQuizCompleted = async (result) => {
    if (selectedOfficer) {
      await loadOfficerData(selectedOfficer.id, selectedOfficer.role_code || 'SSO');
      const [readiness, heatmap, stats] = await Promise.all([
        fetchWorkforceReadiness(),
        fetchWorkforceHeatmap(),
        fetchAdminStats(),
      ]);
      setReadinessData(readiness);
      setHeatmapData(heatmap);
      setStatsData(stats);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-main)', color: 'white' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '48px', height: '48px', border: '3px solid rgba(59,130,246,0.3)', borderTopColor: '#3B82F6', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem auto' }}></div>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Loading MoSPI Skill Intelligence Platform...</h2>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        selectedOfficer={selectedOfficer}
        officers={officers}
        onSelectOfficer={handleSelectOfficer}
      />

      <main style={{ flex: 1, maxWidth: '1280px', width: '100%', margin: '0 auto', padding: '1.5rem 1.5rem 3rem 1.5rem' }}>
        {activeTab === 'learner' && (
          <LearnerDashboard
            selectedOfficer={selectedOfficer}
            gapData={gapData}
            recsData={recsData}
            onRefreshData={handleRefreshData}
            onSelectCourse={handleSelectCourse}
          />
        )}

        {activeTab === 'mcq' && (
          <QuizInterface
            selectedOfficer={selectedOfficer}
            onQuizCompleted={handleQuizCompleted}
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

      <footer style={{ borderTop: '1px solid var(--border-subtle)', padding: '1rem', textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
        AI-Enabled Skill Intelligence & Learning Platform for India's Official Statistical System • MoSPI DIID (SIH 2026 PS 26101)
      </footer>
    </div>
  );
}
