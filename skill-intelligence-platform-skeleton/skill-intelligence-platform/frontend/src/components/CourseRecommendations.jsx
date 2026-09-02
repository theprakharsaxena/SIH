import React from 'react';
import { Sparkles, Clock, BookOpen, ExternalLink, Award } from 'lucide-react';

export default function CourseRecommendations({ recommendations, onSelectCourse }) {
  if (!recommendations || recommendations.length === 0) {
    return (
      <div className="glass-card" style={{ textAlign: 'center', padding: '2rem' }}>
        <Sparkles style={{ width: '32px', height: '32px', color: '#60A5FA', margin: '0 auto 0.5rem auto' }} />
        <h4 style={{ fontSize: '1rem', fontWeight: 600 }}>No gaps identified!</h4>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>You meet or exceed all required competency levels for your role.</p>
      </div>
    );
  }

  return (
    <div className="glass-card">
      <div style={{ marginBottom: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sparkles style={{ width: '18px', height: '18px', color: '#60A5FA' }} />
            <h3 style={{ fontSize: '1.05rem', fontWeight: 600 }}>AI Recommended Pathways (Explainable)</h3>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            Ranked by gap severity, role priority, level match, and historical learning
          </p>
        </div>
        <span className="badge badge-igot">{recommendations.length} Courses Found</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
        {recommendations.map((rec) => {
          const isIgot = rec.provider_type === 'iGOT';

          return (
            <div
              key={rec.course_id}
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '10px',
                padding: '1rem',
                display: 'flex',
                flexDirection: 'column',
                justify: 'space-between',
                gap: '0.75rem',
                transition: 'transform 0.2s, border-color 0.2s',
              }}
              className="course-card"
            >
              <div>
                {/* Header badges */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span className={`badge ${isIgot ? 'badge-igot' : 'badge-nssta'}`}>
                    {rec.provider_type} {isIgot ? 'Karmayogi' : 'Academy'}
                  </span>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#34D399' }}>
                    {(rec.relevance_score * 100).toFixed(0)}% Relevance
                  </span>
                </div>

                {/* Course Title */}
                <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'white', lineHeight: '1.3', marginBottom: '0.4rem' }}>
                  {rec.course_title}
                </h4>

                {/* Meta tags */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                    <Clock style={{ width: '12px', height: '12px' }} /> {rec.duration_hours}h
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                    <BookOpen style={{ width: '12px', height: '12px' }} /> {rec.level}
                  </span>
                  <span>{rec.delivery_mode}</span>
                </div>

                {/* Competency target */}
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                  Target: <strong style={{ color: '#60A5FA' }}>{rec.competency_code} ({rec.competency_name})</strong>
                </div>

                {/* Reasoning box */}
                <div style={{ background: 'rgba(59, 130, 246, 0.08)', borderLeft: '3px solid #3B82F6', padding: '0.5rem 0.75rem', borderRadius: '4px', fontSize: '0.75rem', color: '#D1D5DB' }}>
                  <p style={{ margin: 0, fontStyle: 'italic' }}>
                    "{rec.reason_text}"
                  </p>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => onSelectCourse && onSelectCourse(rec)}
                className="btn-secondary"
                style={{ width: '100%', justifyContent: 'center', padding: '0.5rem', fontSize: '0.8rem' }}
              >
                <Award style={{ width: '14px', height: '14px' }} />
                Generate RAG Quiz from Material
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
