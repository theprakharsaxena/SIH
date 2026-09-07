import React, { useState } from 'react';
import {
  BookOpen, Clock, Star, CheckCircle, PlayCircle, Lock, ArrowRight,
  Sparkles, Award, ShieldCheck, ChevronRight, Info, Layers, RefreshCw,
  ExternalLink, BarChart2, Target, CheckSquare, Square
} from 'lucide-react';

const NAVY = '#1a3a6b';
const ORANGE = '#e8720a';

/**
 * Helper to organize courses into 3 logical sequential phases based on level & gap severity
 */
function buildSequentialPath(recommendations) {
  if (!recommendations || recommendations.length === 0) return [];

  // Sort recs by relevance & severity
  const recs = [...recommendations];

  // Group into 3 phases:
  // Phase 1: Beginner / Critical Gaps (Foundational prerequisites)
  // Phase 2: Intermediate / Moderate Gaps (Core domain competency)
  // Phase 3: Advanced / Specialization (Governance & Leadership)

  const phase1 = recs.filter(r => r.level === 'Beginner' || r.gap_severity === 'critical');
  const phase2 = recs.filter(r => r.level === 'Intermediate' || (r.gap_severity === 'moderate' && r.level !== 'Beginner'));
  const phase3 = recs.filter(r => r.level === 'Advanced' || (r.gap_severity === 'proficient' && r.level !== 'Beginner'));

  // Ensure every phase has at least 1-2 items if available
  const resultPhases = [
    {
      step: 1,
      phaseId: 'foundation',
      title: 'Phase 1: Foundational Core & Critical Skill Gaps',
      badge: 'Step 1 · Start Here',
      subtitle: 'Build mandatory prerequisites and resolve critical role competency deficits.',
      color: '#2563eb',
      bgColor: '#eff6ff',
      borderColor: '#bfdbfe',
      iconColor: '#1d4ed8',
      courses: phase1.length > 0 ? phase1 : recs.slice(0, 2),
    },
    {
      step: 2,
      phaseId: 'mastery',
      title: 'Phase 2: Core Competency & Analytical Mastery',
      badge: 'Step 2 · Core Advancement',
      subtitle: 'Apply domain-specific analytical frameworks and official statistics workflows.',
      color: '#d97706',
      bgColor: '#fffbeb',
      borderColor: '#fde68a',
      iconColor: '#b45309',
      courses: phase2.length > 0 ? phase2 : recs.slice(2, 4),
    },
    {
      step: 3,
      phaseId: 'governance',
      title: 'Phase 3: Strategic Leadership & Digital Governance',
      badge: 'Step 3 · Executive Specialization',
      subtitle: 'Master data protection (DPDP Act 2023), DPI infrastructure, and senior policy management.',
      color: '#7c3aed',
      bgColor: '#f5f3ff',
      borderColor: '#ddd6fe',
      iconColor: '#6d28d9',
      courses: phase3.length > 0 ? phase3 : recs.slice(4),
    }
  ];

  // Remove duplicate courses across phases if any
  const seenIds = new Set();
  resultPhases.forEach(phase => {
    phase.courses = phase.courses.filter(c => {
      const id = c.course_id || c.id || c.course_title;
      if (seenIds.has(id)) return false;
      seenIds.add(id);
      return true;
    });
  });

  // If phase 3 is empty, put remaining courses from recs
  if (resultPhases[2].courses.length === 0) {
    const leftover = recs.filter(c => !seenIds.has(c.course_id || c.id || c.course_title));
    resultPhases[2].courses = leftover.length > 0 ? leftover : [recs[recs.length - 1]];
  }

  return resultPhases.filter(p => p.courses.length > 0);
}

// Generate realistic syllabus modules for a course
function getCourseSyllabus(course) {
  const title = course.course_title || 'Course';
  return [
    { title: `Module 1: Fundamentals of ${course.competency_name || 'Competency'}`, hours: Math.round(course.duration_hours * 0.3) || 3, completed: false },
    { title: `Module 2: Practical Applications & MoSPI Guidelines`, hours: Math.round(course.duration_hours * 0.4) || 4, completed: false },
    { title: `Module 3: Case Studies & Final Assessment`, hours: Math.round(course.duration_hours * 0.3) || 3, completed: false },
  ];
}

export default function LearningPathRoadmap({ recommendations, roleCode = 'MCTP-II', onStartAssessment }) {
  const [completedCourses, setCompletedCourses] = useState({});
  const [enrolledCourses, setEnrolledCourses] = useState({});
  const [activeCourseModal, setActiveCourseModal] = useState(null);
  const [viewMode, setViewMode] = useState('roadmap'); // 'roadmap' | 'grid'
  const [moduleChecks, setModuleChecks] = useState({});

  const phases = buildSequentialPath(recommendations);
  const totalCoursesCount = phases.reduce((acc, p) => acc + p.courses.length, 0);
  const totalHours = phases.reduce((acc, p) => acc + p.courses.reduce((sum, c) => sum + (c.duration_hours || 0), 0), 0);

  // Compute completed count
  const completedCount = Object.keys(completedCourses).filter(id => completedCourses[id]).length;
  const progressPct = totalCoursesCount > 0 ? Math.round((completedCount / totalCoursesCount) * 100) : 0;

  const toggleEnroll = (courseId) => {
    setEnrolledCourses(prev => ({
      ...prev,
      [courseId]: !prev[courseId]
    }));
  };

  const toggleComplete = (courseId) => {
    setCompletedCourses(prev => ({
      ...prev,
      [courseId]: !prev[courseId]
    }));
  };

  const toggleModule = (courseId, idx) => {
    const key = `${courseId}-${idx}`;
    setModuleChecks(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  if (!recommendations || recommendations.length === 0) {
    return (
      <div style={{ background: 'white', borderRadius: '16px', padding: '2.5rem', textAlign: 'center', border: '1px solid #e5e7eb' }}>
        <Sparkles style={{ width: '40px', height: '40px', color: ORANGE, margin: '0 auto 0.75rem' }} />
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: NAVY, marginBottom: '0.35rem' }}>Learning Path Generating</h3>
        <p style={{ color: '#6b7280', fontSize: '0.85rem' }}>Upload your profile to construct your personalised sequential learning roadmap.</p>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>

      {/* ── Learning Path Meta Header Banner ── */}
      <div style={{
        background: `linear-gradient(135deg, ${NAVY} 0%, #1e40af 100%)`,
        borderRadius: '16px',
        padding: '1.5rem 1.75rem',
        color: 'white',
        marginBottom: '1.75rem',
        boxShadow: '0 4px 20px rgba(26,58,107,0.15)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Subtle background graphic circle */}
        <div style={{ position: 'absolute', right: '-20px', top: '-20px', width: '180px', height: '180px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', pointerEvents: 'none' }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
              <span style={{ background: ORANGE, color: 'white', fontSize: '0.72rem', fontWeight: 800, padding: '0.2rem 0.6rem', borderRadius: '20px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                AI Guided Roadmap
              </span>
              <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.8)', fontWeight: 600 }}>
                {roleCode} Competency Pathway
              </span>
            </div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'white', margin: 0, fontFamily: 'Poppins, sans-serif' }}>
              🗺️ Personalized Sequential Learning Path
            </h2>
            <p style={{ fontSize: '0.83rem', color: 'rgba(255,255,255,0.85)', marginTop: '0.35rem', maxWidth: '650px', lineHeight: 1.5 }}>
              Courses are ordered logically: Complete prerequisites in Step 1 before advancing to domain mastery and executive governance in Step 3.
            </p>
          </div>

          {/* View mode toggle */}
          <div style={{ display: 'flex', gap: '0.4rem', background: 'rgba(255,255,255,0.12)', padding: '0.25rem', borderRadius: '30px', border: '1px solid rgba(255,255,255,0.2)' }}>
            <button
              onClick={() => setViewMode('roadmap')}
              style={{
                background: viewMode === 'roadmap' ? 'white' : 'transparent',
                color: viewMode === 'roadmap' ? NAVY : 'white',
                border: 'none',
                padding: '0.4rem 0.9rem',
                borderRadius: '20px',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                transition: 'all 0.2s'
              }}
            >
              <Layers size={13} /> Roadmap View
            </button>
            <button
              onClick={() => setViewMode('grid')}
              style={{
                background: viewMode === 'grid' ? 'white' : 'transparent',
                color: viewMode === 'grid' ? NAVY : 'white',
                border: 'none',
                padding: '0.4rem 0.9rem',
                borderRadius: '20px',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                transition: 'all 0.2s'
              }}
            >
              <BarChart2 size={13} /> Card Grid
            </button>
          </div>
        </div>

        {/* Learning Path Stats Bar */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', background: 'rgba(255,255,255,0.08)', borderRadius: '12px', padding: '1rem 1.25rem', border: '1px solid rgba(255,255,255,0.15)' }}>
          <div>
            <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>Total Duration</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'white', display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.15rem' }}>
              <Clock size={16} color="#fbbf24" /> {totalHours} Hours Total
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>Path Milestones</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'white', display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.15rem' }}>
              <BookOpen size={16} color="#60a5fa" /> {phases.length} Phases ({totalCoursesCount} Courses)
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>Path Completion</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#34d399', display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.15rem' }}>
              <CheckCircle size={16} color="#34d399" /> {progressPct}% Completed ({completedCount}/{totalCoursesCount})
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>Target Certificate</div>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fef08a', display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.2rem' }}>
              <Award size={16} color="#fef08a" /> NKM Certified Official
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div style={{ marginTop: '1rem' }}>
          <div style={{ height: '8px', background: 'rgba(255,255,255,0.2)', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{ width: `${progressPct}%`, height: '100%', background: '#34d399', borderRadius: '4px', transition: 'width 0.5s ease' }} />
          </div>
        </div>
      </div>

      {/* ── View 1: Roadmap Sequential Node Timeline View ── */}
      {viewMode === 'roadmap' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', position: 'relative' }}>

          {phases.map((phase, phaseIdx) => {
            const isPhaseUnlocked = phaseIdx === 0 || phases[phaseIdx - 1].courses.some(c => completedCourses[c.course_id || c.id || c.course_title]);

            return (
              <div key={phase.phaseId} style={{ position: 'relative' }}>

                {/* Vertical connecting line between phases */}
                {phaseIdx < phases.length - 1 && (
                  <div style={{
                    position: 'absolute',
                    left: '27px',
                    top: '60px',
                    bottom: '-40px',
                    width: '4px',
                    background: isPhaseUnlocked ? 'linear-gradient(to bottom, #3b82f6, #93c5fd)' : '#e5e7eb',
                    zIndex: 0,
                    borderRadius: '2px'
                  }} />
                )}

                {/* Phase Header Strip */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  marginBottom: '1.25rem',
                  position: 'relative',
                  zIndex: 1
                }}>
                  {/* Step Node Icon Circle */}
                  <div style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '50%',
                    background: isPhaseUnlocked ? phase.color : '#9ca3af',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justify: 'center',
                    fontWeight: 900,
                    fontSize: '1.2rem',
                    boxShadow: isPhaseUnlocked ? `0 4px 14px ${phase.color}40` : 'none',
                    flexShrink: 0,
                    border: '4px solid white'
                  }}>
                    {phaseIdx === 0 ? '01' : phaseIdx === 1 ? '02' : '03'}
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                      <span style={{ background: phase.bgColor, color: phase.color, border: `1px solid ${phase.borderColor}`, fontSize: '0.72rem', fontWeight: 800, padding: '0.2rem 0.65rem', borderRadius: '12px' }}>
                        {phase.badge}
                      </span>
                      {!isPhaseUnlocked && (
                        <span style={{ background: '#f3f4f6', color: '#6b7280', fontSize: '0.72rem', fontWeight: 700, padding: '0.2rem 0.65rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          <Lock size={12} /> Prerequisite Step 1 Required
                        </span>
                      )}
                    </div>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: NAVY, margin: '0.2rem 0 0.1rem 0', fontFamily: 'Poppins, sans-serif' }}>
                      {phase.title}
                    </h3>
                    <p style={{ fontSize: '0.8rem', color: '#6b7280', margin: 0 }}>{phase.subtitle}</p>
                  </div>
                </div>

                {/* Courses under this phase */}
                <div style={{ paddingLeft: '4rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {phase.courses.map((rec, courseIdx) => {
                    const cId = rec.course_id || rec.id || rec.course_title;
                    const isCompleted = !!completedCourses[cId];
                    const isEnrolled = !!enrolledCourses[cId];
                    const levelColor = rec.level === 'Beginner' ? '#16a34a' : rec.level === 'Intermediate' ? '#d97706' : '#7c3aed';

                    return (
                      <div
                        key={cId}
                        style={{
                          background: isCompleted ? '#f0fdf4' : 'white',
                          borderRadius: '14px',
                          border: isCompleted ? '1.5px solid #bbf7d0' : isEnrolled ? `1.5px solid ${phase.color}` : '1px solid #e5e7eb',
                          padding: '1.25rem',
                          boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
                          transition: 'all 0.2s ease',
                          position: 'relative'
                        }}
                      >
                        {/* Course Header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.65rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: rec.provider_type === 'iGOT' ? NAVY : ORANGE, background: rec.provider_type === 'iGOT' ? '#eef2fb' : '#fff3e0', padding: '0.15rem 0.55rem', borderRadius: '6px' }}>
                              {rec.provider_type} Karmayogi
                            </span>
                            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: levelColor, background: levelColor + '15', padding: '0.15rem 0.55rem', borderRadius: '6px' }}>
                              {rec.level} Level
                            </span>
                            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#16a34a', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                              <Star size={11} fill="#16a34a" /> {(rec.relevance_score * 100).toFixed(0)}% Match
                            </span>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            {isCompleted ? (
                              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#16a34a', background: '#dcfce7', padding: '0.25rem 0.65rem', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                <CheckCircle size={13} /> Completed
                              </span>
                            ) : isEnrolled ? (
                              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: phase.color, background: phase.bgColor, padding: '0.25rem 0.65rem', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                <PlayCircle size={13} /> In Progress
                              </span>
                            ) : (
                              <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#6b7280', background: '#f3f4f6', padding: '0.2rem 0.55rem', borderRadius: '12px' }}>
                                Step {phaseIdx + 1}.{courseIdx + 1}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Title & Competency Target */}
                        <h4 style={{ fontSize: '1rem', fontWeight: 800, color: NAVY, margin: '0 0 0.4rem 0', lineHeight: 1.4 }}>
                          {rec.course_title}
                        </h4>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.78rem', color: '#6b7280', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                            <Clock size={13} /> <strong>Duration:</strong> {rec.duration_hours} Hours
                          </span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                            <Target size={13} /> <strong>Competency:</strong> {rec.competency_name} ({rec.competency_code})
                          </span>
                          {rec.gap_addressed && (
                            <span style={{ color: '#dc2626', fontWeight: 700, background: '#fef2f2', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>
                              Bridges Gap: {rec.gap_addressed.toFixed(1)} Pts
                            </span>
                          )}
                        </div>

                        {/* Why first / Sequencing Reason */}
                        <div style={{ background: '#f8fafc', borderRadius: '8px', padding: '0.6rem 0.85rem', borderLeft: `3px solid ${phase.color}`, fontSize: '0.78rem', color: '#334155', marginBottom: '0.9rem', lineHeight: 1.5 }}>
                          <strong style={{ color: phase.color }}>Path Rationale: </strong>
                          {rec.reason_text?.replace('Recommended because: ', '') || `Foundational prerequisite module tailored for your role requirements.`}
                        </div>

                        {/* Action Buttons */}
                        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', alignItems: 'center' }}>
                          <button
                            onClick={() => toggleEnroll(cId)}
                            style={{
                              background: isEnrolled ? '#e2e8f0' : NAVY,
                              color: isEnrolled ? '#334155' : 'white',
                              border: 'none',
                              borderRadius: '8px',
                              padding: '0.45rem 1rem',
                              fontSize: '0.8rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.35rem'
                            }}
                          >
                            {isEnrolled ? '✓ Enrolled' : '🚀 Start Step / Enroll'}
                          </button>

                          <button
                            onClick={() => toggleComplete(cId)}
                            style={{
                              background: isCompleted ? '#dcfce7' : 'white',
                              color: isCompleted ? '#15803d' : '#475569',
                              border: '1.5px solid #cbd5e1',
                              borderRadius: '8px',
                              padding: '0.45rem 0.9rem',
                              fontSize: '0.8rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.35rem'
                            }}
                          >
                            <CheckCircle size={13} color={isCompleted ? '#15803d' : '#64748b'} />
                            {isCompleted ? 'Completed ✓' : 'Mark Completed'}
                          </button>

                          <button
                            onClick={() => setActiveCourseModal(rec)}
                            style={{
                              background: 'none',
                              color: ORANGE,
                              border: 'none',
                              fontSize: '0.8rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.25rem',
                              padding: '0.45rem 0.6rem',
                              marginLeft: 'auto'
                            }}
                          >
                            View Details & Modules <ChevronRight size={14} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* ── View 2: Card Grid View ── */}
      {viewMode === 'grid' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {phases.map((phase) => (
            <div key={phase.phaseId}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', borderBottom: `2px solid ${phase.borderColor}`, paddingBottom: '0.5rem' }}>
                <span style={{ background: phase.color, color: 'white', fontWeight: 800, padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.75rem' }}>
                  {phase.badge}
                </span>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: NAVY, margin: 0, fontFamily: 'Poppins, sans-serif' }}>
                  {phase.title}
                </h3>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
                {phase.courses.map((rec) => {
                  const cId = rec.course_id || rec.id || rec.course_title;
                  const isCompleted = !!completedCourses[cId];
                  return (
                    <div
                      key={cId}
                      style={{
                        background: 'white',
                        borderRadius: '14px',
                        border: '1px solid #e5e7eb',
                        padding: '1.25rem',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between'
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                          <span style={{ fontSize: '0.72rem', fontWeight: 700, color: NAVY, background: '#eef2fb', padding: '0.1rem 0.5rem', borderRadius: '6px' }}>{rec.provider_type}</span>
                          <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#16a34a' }}>{(rec.relevance_score * 100).toFixed(0)}% match</span>
                        </div>
                        <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: NAVY, marginBottom: '0.4rem' }}>{rec.course_title}</h4>
                        <p style={{ fontSize: '0.78rem', color: '#6b7280', marginBottom: '0.75rem' }}>Competency: {rec.competency_name}</p>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f3f4f6', paddingTop: '0.75rem', marginTop: '0.5rem' }}>
                        <span style={{ fontSize: '0.75rem', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <Clock size={12} /> {rec.duration_hours}h
                        </span>
                        <button
                          onClick={() => setActiveCourseModal(rec)}
                          style={{ background: NAVY, color: 'white', border: 'none', borderRadius: '6px', padding: '0.35rem 0.75rem', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Interactive Course Details Drawer / Modal ── */}
      {activeCourseModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(4px)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justify: 'center',
          padding: '1.5rem'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '20px',
            maxWidth: '620px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '2rem',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
            position: 'relative',
            animation: 'fadeIn 0.2s ease-out'
          }}>
            {/* Close button */}
            <button
              onClick={() => setActiveCourseModal(null)}
              style={{
                position: 'absolute',
                top: '1.25rem', right: '1.25rem',
                background: '#f1f5f9', border: 'none',
                width: '32px', height: '32px', borderRadius: '50%',
                fontWeight: 800, fontSize: '1rem', cursor: 'pointer', color: '#64748b'
              }}
            >
              ✕
            </button>

            {/* Modal Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <span style={{ background: '#eef2fb', color: NAVY, fontWeight: 800, fontSize: '0.75rem', padding: '0.2rem 0.6rem', borderRadius: '12px' }}>
                {activeCourseModal.provider_type} Karmayogi
              </span>
              <span style={{ background: '#fef3c7', color: '#b45309', fontWeight: 800, fontSize: '0.75rem', padding: '0.2rem 0.6rem', borderRadius: '12px' }}>
                {activeCourseModal.level} Level
              </span>
            </div>

            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: NAVY, margin: '0 0 0.5rem 0', fontFamily: 'Poppins, sans-serif' }}>
              {activeCourseModal.course_title}
            </h3>

            <div style={{ display: 'flex', gap: '1rem', fontSize: '0.82rem', color: '#64748b', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Clock size={14} /> {activeCourseModal.duration_hours} Hours Self-Paced</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Target size={14} /> {activeCourseModal.competency_name} ({activeCourseModal.competency_code})</span>
            </div>

            {/* AI Recommendation explanation */}
            <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '12px', padding: '1rem', marginBottom: '1.25rem' }}>
              <div style={{ fontWeight: 800, fontSize: '0.85rem', color: NAVY, marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Sparkles size={14} color={ORANGE} /> AI Competency Gap Analysis
              </div>
              <p style={{ fontSize: '0.8rem', color: '#334155', margin: 0, lineHeight: 1.5 }}>
                {activeCourseModal.reason_text || `This course is assigned to your roadmap to elevate your current skill proficiency level in ${activeCourseModal.competency_name} to meet official MoSPI role requirements.`}
              </p>
            </div>

            {/* Module Checklist */}
            <div style={{ marginBottom: '1.5rem' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: NAVY, marginBottom: '0.75rem', fontFamily: 'Poppins, sans-serif' }}>
                📖 Curriculum Modules ({activeCourseModal.duration_hours} Hours)
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {getCourseSyllabus(activeCourseModal).map((mod, idx) => {
                  const mKey = `${activeCourseModal.course_id || activeCourseModal.id || activeCourseModal.course_title}-${idx}`;
                  const isChecked = !!moduleChecks[mKey];
                  return (
                    <div
                      key={idx}
                      onClick={() => toggleModule(activeCourseModal.course_id || activeCourseModal.id || activeCourseModal.course_title, idx)}
                      style={{
                        padding: '0.75rem 1rem',
                        background: isChecked ? '#f0fdf4' : '#f8fafc',
                        borderRadius: '10px',
                        border: isChecked ? '1px solid #bbf7d0' : '1px solid #e2e8f0',
                        display: 'flex',
                        alignItems: 'center',
                        justify: 'space-between',
                        cursor: 'pointer'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        {isChecked ? <CheckSquare size={16} color="#16a34a" /> : <Square size={16} color="#94a3b8" />}
                        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: isChecked ? '#15803d' : '#334155' }}>
                          {mod.title}
                        </span>
                      </div>
                      <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>{mod.hours}h</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Modal Actions */}
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <a
                href="https://igotkarmayogi.gov.in"
                target="_blank"
                rel="noreferrer"
                style={{
                  flex: 1,
                  background: NAVY,
                  color: 'white',
                  textDecoration: 'none',
                  textAlign: 'center',
                  borderRadius: '10px',
                  padding: '0.75rem 1rem',
                  fontSize: '0.85rem',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem'
                }}
              >
                Launch on iGOT Karmayogi <ExternalLink size={14} />
              </a>

              {onStartAssessment && (
                <button
                  onClick={() => {
                    setActiveCourseModal(null);
                    onStartAssessment(activeCourseModal);
                  }}
                  style={{
                    background: ORANGE,
                    color: 'white',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '0.75rem 1.25rem',
                    fontSize: '0.85rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  <Award size={15} /> Take Diagnostic Assessment
                </button>
              )}
            </div>

          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: scale(0.96); } to { opacity: 1; transform: scale(1); } }
      `}</style>
    </div>
  );
}
