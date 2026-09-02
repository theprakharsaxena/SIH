import React, { useState } from 'react';
import { BookOpen, Upload, CheckCircle2, XCircle, ArrowRight, RefreshCw, FileText, Sparkles, Award } from 'lucide-react';
import { uploadMaterialAndGenerateMcqs, submitQuizAnswers } from '../services/api';

export default function QuizInterface({ selectedOfficer, onQuizCompleted }) {
  const [competencyCode, setCompetencyCode] = useState('OS-02'); // Default Sampling
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [assessmentData, setAssessmentData] = useState(null);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [quizResult, setQuizResult] = useState(null);

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      alert('Please select a learning material PDF, DOCX, or TXT file');
      return;
    }
    if (!selectedOfficer) {
      alert('Please select an officer first');
      return;
    }

    setLoading(true);
    setQuizResult(null);
    setSelectedAnswers({});

    try {
      const formData = new FormData();
      formData.append('officer_id', selectedOfficer.id);
      formData.append('competency_code', competencyCode);
      formData.append('total_questions', '5'); // 5 questions for fast demo
      formData.append('file', file);

      const res = await uploadMaterialAndGenerateMcqs(formData);
      setAssessmentData(res);
    } catch (err) {
      console.error(err);
      alert('MCQ generation failed: ' + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (qIndex, optionId) => {
    setSelectedAnswers((prev) => ({ ...prev, [qIndex]: optionId }));
  };

  const handleSubmitQuiz = async () => {
    if (!assessmentData) return;
    if (Object.keys(selectedAnswers).length < assessmentData.questions.length) {
      if (!confirm('You have unanswered questions. Submit anyway?')) return;
    }

    setSubmitting(true);
    try {
      const res = await submitQuizAnswers(
        assessmentData.assessment_id,
        selectedOfficer.id,
        selectedAnswers
      );
      setQuizResult(res);
      if (onQuizCompleted) onQuizCompleted(res);
    } catch (err) {
      console.error(err);
      alert('Quiz submission failed: ' + (err.response?.data?.detail || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Upload & MCQ Generation Card */}
      <div className="glass-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
          <Sparkles style={{ width: '20px', height: '20px', color: '#60A5FA' }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>RAG MCQ Engine & Closed-Loop Learning</h3>
        </div>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1.2rem' }}>
          Upload learning material (PDF/DOCX/TXT) → Generate source-grounded questions → Complete assessment → Recompute competency score dynamically.
        </p>

        {!assessmentData && (
          <form onSubmit={handleFileUpload} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', alignItems: 'end' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                Target Competency Code:
              </label>
              <select
                value={competencyCode}
                onChange={(e) => setCompetencyCode(e.target.value)}
                style={{ width: '100%', padding: '0.55rem', background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid var(--border-subtle)', borderRadius: '6px', fontSize: '0.85rem' }}
              >
                <option value="OS-02">OS-02 — Sampling Methodology</option>
                <option value="OS-01">OS-01 — Survey Design</option>
                <option value="TC-01">TC-01 — Python for Data Analysis</option>
                <option value="TC-07">TC-07 — GIS for Official Statistics</option>
                <option value="DG-02">DG-02 — Data Privacy (DPDP Act)</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                Select Material File (PDF/DOCX/TXT):
              </label>
              <input
                type="file"
                accept=".pdf,.docx,.txt"
                onChange={(e) => setFile(e.target.files[0])}
                style={{ width: '100%', padding: '0.45rem', background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid var(--border-subtle)', borderRadius: '6px', fontSize: '0.8rem' }}
              />
            </div>

            <button type="submit" className="btn-primary" disabled={loading} style={{ justifyContent: 'center', height: '40px' }}>
              {loading ? (
                <>
                  <RefreshCw className="spin" style={{ width: '16px', height: '16px' }} />
                  Extracting Text & Generating MCQs...
                </>
              ) : (
                <>
                  <Upload style={{ width: '16px', height: '16px' }} />
                  Generate Source-Grounded Quiz
                </>
              )}
            </button>
          </form>
        )}
      </div>

      {/* Live Quiz Interface */}
      {assessmentData && !quizResult && (
        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-subtle)' }}>
            <div>
              <h4 style={{ fontSize: '1rem', fontWeight: 600 }}>Active Assessment ({competencyCode})</h4>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                Questions generated directly from uploaded source excerpt
              </p>
            </div>
            <button onClick={() => setAssessmentData(null)} className="btn-secondary" style={{ padding: '0.3rem 0.75rem', fontSize: '0.75rem' }}>
              Reset / Upload New
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {assessmentData.questions.map((q, idx) => (
              <div key={idx} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-subtle)', padding: '1rem', borderRadius: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <strong style={{ fontSize: '0.9rem', color: '#93C5FD' }}>Q{idx + 1}. {q.question_text}</strong>
                  <span className="badge badge-igot" style={{ fontSize: '0.65rem' }}>{q.difficulty}</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.6rem', margin: '0.75rem 0' }}>
                  {q.options.map((opt) => {
                    const isSelected = selectedAnswers[idx] === opt.id;
                    return (
                      <button
                        key={opt.id}
                        onClick={() => handleSelectOption(idx, opt.id)}
                        style={{
                          textAlign: 'left',
                          padding: '0.6rem 0.8rem',
                          borderRadius: '6px',
                          border: isSelected ? '1px solid #3B82F6' : '1px solid var(--border-subtle)',
                          background: isSelected ? 'rgba(59, 130, 246, 0.2)' : 'rgba(255,255,255,0.03)',
                          color: isSelected ? '#60A5FA' : 'var(--text-primary)',
                          fontSize: '0.85rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                        }}
                      >
                        <strong style={{ opacity: 0.7 }}>{opt.id.toUpperCase()}.</strong> {opt.text}
                      </button>
                    );
                  })}
                </div>

                {q.source_excerpt_ref && (
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    📄 Source reference: {q.source_excerpt_ref}
                  </span>
                )}
              </div>
            ))}
          </div>

          <div style={{ marginTop: '1.5rem', textAlign: 'right' }}>
            <button onClick={handleSubmitQuiz} className="btn-primary" disabled={submitting}>
              {submitting ? 'Submitting & Updating Competency...' : 'Submit Answers & Trigger Closed Loop'}
              <ArrowRight style={{ width: '16px', height: '16px' }} />
            </button>
          </div>
        </div>
      )}

      {/* Closed Loop Results Card (THE MONEY MOMENT) */}
      {quizResult && (
        <div className="glass-card" style={{ borderLeft: '4px solid #10B981', background: 'rgba(16, 185, 129, 0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <Award style={{ width: '28px', height: '28px', color: '#34D399' }} />
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#34D399' }}>
                CLOSED LOOP TRIGGERED: Competency Score Updated!
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Assessment completed for <strong>{quizResult.competency_name} ({quizResult.competency_code})</strong>
              </p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '8px', textAlign: 'center' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Quiz Result Score</span>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#3B82F6' }}>
                {quizResult.score_percent}%
              </div>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                ({quizResult.questions_correct} / {quizResult.questions_total} correct)
              </span>
            </div>

            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '8px', textAlign: 'center' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Competency Score Change</span>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#34D399' }}>
                {quizResult.score_before} → {quizResult.score_after}
              </div>
              <span style={{ fontSize: '0.7rem', color: '#34D399', fontWeight: 600 }}>
                (+{quizResult.score_change} boost applied!)
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Next recommended courses and gap report have been updated dynamically!
            </span>
            <button onClick={() => setQuizResult(null)} className="btn-secondary">
              Take Another Quiz
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
