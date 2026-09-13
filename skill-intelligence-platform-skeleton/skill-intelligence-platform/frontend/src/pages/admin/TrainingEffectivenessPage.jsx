import React, { useEffect, useState } from 'react';
import { fetchTrainingEffectiveness } from '../../services/api';
import { TrendingUp, BookOpen, CheckCircle, Award, RefreshCw, BarChart2 } from 'lucide-react';

const NAVY = '#1a3a6b';
const ORANGE = '#e8720a';

export default function TrainingEffectivenessPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchTrainingEffectiveness();
      setData(res.courses || []);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch training effectiveness metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const totalEnrollments = data ? data.reduce((acc, c) => acc + (c.enrollments || 0), 0) : 0;
  const totalCompletions = data ? data.reduce((acc, c) => acc + (c.completed || 0), 0) : 0;
  const avgCompletionRate = data && data.length && totalEnrollments > 0
    ? (totalCompletions / totalEnrollments * 100).toFixed(1)
    : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '1200px', margin: '0 auto', padding: '0.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid #e5e7eb', paddingBottom: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <TrendingUp size={28} color={NAVY} />
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: NAVY, margin: 0 }}>Training Effectiveness & Impact</h1>
          </div>
          <p style={{ fontSize: '0.85rem', color: '#4b5563', marginTop: '0.3rem' }}>
            Pre- vs. Post-Course score shifts and capacity building outcome analytics across MoSPI training modules.
          </p>
        </div>
        <button
          onClick={loadData}
          disabled={loading}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.55rem 1.1rem',
            background: NAVY, color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer',
            fontSize: '0.85rem', fontWeight: 600, opacity: loading ? 0.6 : 1, transition: 'background 0.2s',
          }}
        >
          <RefreshCw size={16} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
          Refresh Data
        </button>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
        <div style={{ background: 'white', borderRadius: '12px', padding: '1.25rem', border: '1px solid #e5e7eb', boxShadow: '0 2px 6px rgba(0,0,0,0.04)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '0.75rem', background: '#eef2fb', borderRadius: '10px', color: NAVY }}>
            <BookOpen size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Active Courses</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#111827' }}>{data ? data.length : 0}</div>
          </div>
        </div>

        <div style={{ background: 'white', borderRadius: '12px', padding: '1.25rem', border: '1px solid #e5e7eb', boxShadow: '0 2px 6px rgba(0,0,0,0.04)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '0.75rem', background: '#e0e7ff', borderRadius: '10px', color: '#4338ca' }}>
            <BarChart2 size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Enrollments</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#111827' }}>{totalEnrollments}</div>
          </div>
        </div>

        <div style={{ background: 'white', borderRadius: '12px', padding: '1.25rem', border: '1px solid #e5e7eb', boxShadow: '0 2px 6px rgba(0,0,0,0.04)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '0.75rem', background: '#dcfce7', borderRadius: '10px', color: '#15803d' }}>
            <CheckCircle size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Completions</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#111827' }}>{totalCompletions}</div>
          </div>
        </div>

        <div style={{ background: 'white', borderRadius: '12px', padding: '1.25rem', border: '1px solid #e5e7eb', boxShadow: '0 2px 6px rgba(0,0,0,0.04)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '0.75rem', background: '#fef3c7', borderRadius: '10px', color: '#b45309' }}>
            <Award size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Avg Completion Rate</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#111827' }}>{avgCompletionRate}%</div>
          </div>
        </div>
      </div>

      {/* Main Table Container */}
      <div style={{ background: 'white', borderRadius: '14px', border: '1px solid #e5e7eb', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', overflow: 'hidden' }}>
        <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #e5e7eb', background: '#f9fafb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#1f2937', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <TrendingUp size={18} color={ORANGE} /> Course Pre/Post Competency Shift Register
          </h2>
          <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>Updated in real-time based on assessment evaluations</span>
        </div>

        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#6b7280' }}>
            <RefreshCw size={28} color={NAVY} style={{ animation: 'spin 1s linear infinite', marginBottom: '0.5rem' }} />
            <div>Evaluating competency score shifts...</div>
          </div>
        ) : error ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#dc2626', fontWeight: 600 }}>{error}</div>
        ) : !data || data.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#6b7280' }}>No course training effectiveness data available.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ background: '#f3f4f6', color: '#374151', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  <th style={{ padding: '0.75rem 1.25rem' }}>Course Title & Provider</th>
                  <th style={{ padding: '0.75rem 1.25rem' }}>Target Competencies</th>
                  <th style={{ padding: '0.75rem 1.25rem', textAlign: 'center' }}>Enrollment & Completion</th>
                  <th style={{ padding: '0.75rem 1.25rem', textAlign: 'center' }}>Avg Pre-Score</th>
                  <th style={{ padding: '0.75rem 1.25rem', textAlign: 'center' }}>Avg Post-Score</th>
                  <th style={{ padding: '0.75rem 1.25rem', textAlign: 'center' }}>Competency Shift</th>
                </tr>
              </thead>
              <tbody>
                {data.map((c, i) => (
                  <tr key={c.course_id || i} style={{ borderBottom: '1px solid #f3f4f6', transition: 'background 0.15s' }}>
                    <td style={{ padding: '1rem 1.25rem' }}>
                      <div style={{ fontWeight: 700, color: '#111827' }}>{c.course_title}</div>
                      <span style={{ display: 'inline-block', marginTop: '0.25rem', fontSize: '0.7rem', fontWeight: 700, color: NAVY, background: '#eef2fb', padding: '0.15rem 0.5rem', borderRadius: '4px', textTransform: 'uppercase' }}>
                        {c.provider_type || 'iGOT'}
                      </span>
                    </td>
                    <td style={{ padding: '1rem 1.25rem' }}>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                        {Array.isArray(c.tagged_competencies) ? (
                          c.tagged_competencies.map((comp, idx) => (
                            <span key={idx} style={{ fontSize: '0.72rem', background: '#f3f4f6', color: '#374151', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
                              {comp}
                            </span>
                          ))
                        ) : (
                          <span style={{ fontSize: '0.72rem', background: '#f3f4f6', color: '#374151', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
                            {c.tagged_competencies}
                          </span>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: '1rem 1.25rem', textAlign: 'center' }}>
                      <div style={{ fontWeight: 700, color: '#111827' }}>
                        {c.completed} / {c.enrollments}
                      </div>
                      <div style={{ width: '100%', background: '#e5e7eb', borderRadius: '10px', height: '6px', marginTop: '0.35rem', overflow: 'hidden' }}>
                        <div style={{ width: `${Math.min(c.completion_rate_pct || 0, 100)}%`, background: NAVY, height: '100%', borderRadius: '10px' }} />
                      </div>
                      <span style={{ fontSize: '0.72rem', color: '#6b7280', marginTop: '0.2rem', display: 'block' }}>{c.completion_rate_pct}% completed</span>
                    </td>
                    <td style={{ padding: '1rem 1.25rem', textAlign: 'center', fontWeight: 600, color: '#4b5563' }}>
                      {c.avg_pre_score} / 5.0
                    </td>
                    <td style={{ padding: '1rem 1.25rem', textAlign: 'center', fontWeight: 700, color: '#111827' }}>
                      {c.avg_post_score} / 5.0
                    </td>
                    <td style={{ padding: '1rem 1.25rem', textAlign: 'center' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', fontWeight: 800, color: '#065f46', background: '#d1fae5', padding: '0.3rem 0.65rem', borderRadius: '20px' }}>
                        <TrendingUp size={14} />
                        {c.competency_score_shift}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
