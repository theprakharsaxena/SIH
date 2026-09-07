import React, { useState } from 'react';
import { Upload, RefreshCw, ArrowRight, Award, CheckCircle2, XCircle, BookOpen, Loader, RotateCcw } from 'lucide-react';
import { uploadMaterialAndGenerateMcqs, submitQuizAnswers } from '../services/api';

const NAVY = '#1a3a6b';
const ORANGE = '#e8720a';
const GREEN = '#16a34a';

const COMPETENCY_OPTIONS = [
  { value: 'OS-01', label: 'OS-01 — Survey Design' },
  { value: 'OS-02', label: 'OS-02 — Sampling Methodology' },
  { value: 'OS-03', label: 'OS-03 — National Accounts (GDP/GVA)' },
  { value: 'OS-08', label: 'OS-08 — SDG Indicator Framework' },
  { value: 'OS-10', label: 'OS-10 — Statistical Data Quality' },
  { value: 'TC-01', label: 'TC-01 — Python for Data Analysis' },
  { value: 'TC-07', label: 'TC-07 — GIS for Official Statistics' },
  { value: 'TC-09', label: 'TC-09 — AI & Machine Learning' },
  { value: 'DG-01', label: 'DG-01 — Cybersecurity' },
  { value: 'DG-02', label: 'DG-02 — Data Privacy (DPDP Act)' },
  { value: 'BM-01', label: 'BM-01 — Leadership' },
  { value: 'BM-04', label: 'BM-04 — Ethics in Public Service' },
];

export default function QuizInterface({ selectedOfficer, onQuizCompleted }) {
  const [competencyCode, setCompetencyCode] = useState('OS-02');
  const [file, setFile]                     = useState(null);
  const [loading, setLoading]               = useState(false);
  const [assessmentData, setAssessmentData] = useState(null);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [submitting, setSubmitting]         = useState(false);
  const [quizResult, setQuizResult]         = useState(null);

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!file) { alert('Please select a learning material file (PDF, DOCX, or TXT)'); return; }
    if (!selectedOfficer) { alert('Please select an officer first'); return; }
    setLoading(true);
    setQuizResult(null);
    setSelectedAnswers({});
    try {
      const formData = new FormData();
      formData.append('officer_id', selectedOfficer.id);
      formData.append('competency_code', competencyCode);
      formData.append('total_questions', '5');
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

  const handleSubmitQuiz = async () => {
    if (!assessmentData) return;
    if (Object.keys(selectedAnswers).length < assessmentData.questions.length) {
      if (!confirm('You have unanswered questions. Submit anyway?')) return;
    }
    setSubmitting(true);
    try {
      const res = await submitQuizAnswers(assessmentData.assessment_id, selectedOfficer.id, selectedAnswers);
      setQuizResult(res);
      if (onQuizCompleted) onQuizCompleted(res);
    } catch (err) {
      console.error(err);
      alert('Submission failed: ' + (err.response?.data?.detail || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  const answeredCount = Object.keys(selectedAnswers).length;
  const totalQ = assessmentData?.questions?.length ?? 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* Upload Form */}
      {!assessmentData && !quizResult && (
        <div style={{ background: 'white', borderRadius: '16px', padding: '2rem', border: '1px solid #e5e7eb', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: NAVY, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <BookOpen style={{ width: '22px', height: '22px', color: 'white' }} />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '1.1rem', color: NAVY, fontFamily: 'Poppins, sans-serif' }}>Generate Assessment from Learning Material</div>
              <div style={{ fontSize: '0.78rem', color: '#6b7280' }}>AI reads your uploaded document and creates source-grounded questions</div>
            </div>
          </div>

          <div style={{ height: '1px', background: '#f3f4f6', margin: '1.25rem 0' }} />

          <form onSubmit={handleFileUpload} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

            {/* Competency selector */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#4b5563', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Select Competency to Assess
              </label>
              <select
                value={competencyCode}
                onChange={e => setCompetencyCode(e.target.value)}
                style={{ width: '100%', padding: '0.7rem 1rem', border: '1.5px solid #e5e7eb', borderRadius: '10px', fontSize: '0.9rem', fontFamily: 'inherit', outline: 'none', color: NAVY, fontWeight: 600, background: 'white', cursor: 'pointer' }}
              >
                {COMPETENCY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>

            {/* File upload */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#4b5563', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Upload Learning Material
              </label>
              <div
                style={{ border: `2px dashed ${file ? GREEN : '#d1d5db'}`, borderRadius: '12px', padding: '1.5rem', textAlign: 'center', background: file ? '#f0fdf4' : '#f9fafb', cursor: 'pointer', transition: 'all 0.2s' }}
                onClick={() => document.getElementById('file-input').click()}
              >
                <input id="file-input" type="file" accept=".pdf,.docx,.txt" onChange={e => setFile(e.target.files[0])} style={{ display: 'none' }} />
                {file ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: GREEN }}>
                    <CheckCircle2 style={{ width: '20px', height: '20px' }} />
                    <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{file.name}</span>
                    <span style={{ color: '#6b7280', fontSize: '0.8rem' }}>({(file.size / 1024).toFixed(0)} KB)</span>
                  </div>
                ) : (
                  <div style={{ color: '#6b7280' }}>
                    <Upload style={{ width: '28px', height: '28px', margin: '0 auto 0.5rem', color: '#9ca3af' }} />
                    <div style={{ fontWeight: 600, fontSize: '0.875rem', color: '#4b5563' }}>Click to upload PDF, DOCX, or TXT</div>
                    <div style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>Textbooks, policy documents, NSSTA study materials…</div>
                  </div>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={!file || loading}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', background: !file || loading ? '#9ca3af' : NAVY, color: 'white', fontWeight: 700, padding: '0.85rem', borderRadius: '12px', border: 'none', cursor: !file || loading ? 'not-allowed' : 'pointer', fontSize: '0.95rem', transition: 'all 0.2s' }}
            >
              {loading ? (
                <><Loader style={{ width: '18px', height: '18px', animation: 'spin 1s linear infinite' }} /> Reading document &amp; generating questions…</>
              ) : (
                <><Upload style={{ width: '18px', height: '18px' }} /> Generate AI Assessment (5 MCQs)</>
              )}
            </button>
          </form>
        </div>
      )}

      {/* Active Quiz */}
      {assessmentData && !quizResult && (
        <div style={{ background: 'white', borderRadius: '16px', padding: '2rem', border: '1px solid #e5e7eb', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          {/* Quiz header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid #f3f4f6', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div>
              <div style={{ fontWeight: 800, fontSize: '1.1rem', color: NAVY, fontFamily: 'Poppins, sans-serif' }}>
                Active Assessment — {competencyCode}
              </div>
              <div style={{ fontSize: '0.78rem', color: '#6b7280', marginTop: '0.15rem' }}>
                {answeredCount} of {totalQ} questions answered
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '4px' }}>
                {Array.from({ length: totalQ }).map((_, i) => (
                  <div key={i} style={{ width: '28px', height: '6px', borderRadius: '3px', background: selectedAnswers[i] ? NAVY : '#e5e7eb' }} />
                ))}
              </div>
              <button onClick={() => { setAssessmentData(null); setFile(null); }} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: '#f9fafb', border: '1.5px solid #e5e7eb', color: '#4b5563', padding: '0.45rem 0.9rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}>
                <RotateCcw style={{ width: '14px', height: '14px' }} /> Reset
              </button>
            </div>
          </div>

          {/* Questions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {assessmentData.questions.map((q, idx) => (
              <div key={idx} style={{ border: selectedAnswers[idx] ? `2px solid ${NAVY}` : '1px solid #e5e7eb', borderRadius: '12px', padding: '1.25rem', background: selectedAnswers[idx] ? '#eef2fb' : '#fafafa', transition: 'all 0.2s' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: NAVY, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 700, flexShrink: 0 }}>
                      {idx + 1}
                    </div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 600, color: NAVY, lineHeight: 1.5 }}>{q.question_text}</div>
                  </div>
                  <span style={{ fontSize: '0.72rem', background: q.difficulty === 'Easy' ? '#f0fdf4' : q.difficulty === 'Medium' ? '#fffbeb' : '#fef2f2', color: q.difficulty === 'Easy' ? GREEN : q.difficulty === 'Medium' ? '#d97706' : '#dc2626', padding: '0.15rem 0.55rem', borderRadius: '10px', fontWeight: 600, flexShrink: 0 }}>
                    {q.difficulty}
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
                  {q.options.map(opt => {
                    const isSelected = selectedAnswers[idx] === opt.id;
                    return (
                      <button
                        key={opt.id}
                        onClick={() => setSelectedAnswers(prev => ({ ...prev, [idx]: opt.id }))}
                        style={{ textAlign: 'left', padding: '0.7rem 0.9rem', borderRadius: '8px', border: isSelected ? `2px solid ${NAVY}` : '1.5px solid #e5e7eb', background: isSelected ? NAVY : 'white', color: isSelected ? 'white' : '#1f2937', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'all 0.15s', fontWeight: isSelected ? 600 : 400 }}
                      >
                        <span style={{ width: '22px', height: '22px', borderRadius: '50%', border: `1.5px solid ${isSelected ? 'rgba(255,255,255,0.5)' : '#d1d5db'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.72rem', fontWeight: 700, flexShrink: 0, background: isSelected ? 'rgba(255,255,255,0.15)' : 'transparent', color: isSelected ? 'white' : '#6b7280' }}>
                          {opt.id.toUpperCase()}
                        </span>
                        {opt.text}
                      </button>
                    );
                  })}
                </div>

                {q.source_excerpt_ref && (
                  <div style={{ marginTop: '0.75rem', fontSize: '0.72rem', color: '#9ca3af', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    📄 Source ref: {q.source_excerpt_ref}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Submit */}
          <div style={{ marginTop: '1.75rem', display: 'flex', justifyContent: 'flex-end' }}>
            <button
              onClick={handleSubmitQuiz}
              disabled={submitting}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: submitting ? '#9ca3af' : ORANGE, color: 'white', fontWeight: 700, padding: '0.85rem 2rem', borderRadius: '30px', border: 'none', cursor: submitting ? 'not-allowed' : 'pointer', fontSize: '0.95rem', boxShadow: submitting ? 'none' : '0 4px 14px rgba(232,114,10,0.4)' }}
            >
              {submitting ? <><Loader style={{ width: '18px', height: '18px', animation: 'spin 1s linear infinite' }} /> Submitting &amp; Updating Score…</> : <>Submit Answers <ArrowRight style={{ width: '18px', height: '18px' }} /></>}
            </button>
          </div>
        </div>
      )}

      {/* Quiz Result — Closed Loop */}
      {quizResult && (
        <div style={{ background: 'white', borderRadius: '16px', padding: '2rem', border: `2px solid ${GREEN}`, boxShadow: '0 4px 20px rgba(22,163,74,0.15)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#f0fdf4', border: `3px solid ${GREEN}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Award style={{ width: '28px', height: '28px', color: GREEN }} />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '1.2rem', color: GREEN, fontFamily: 'Poppins, sans-serif' }}>
                Assessment Complete! Closed Loop Triggered ✓
              </div>
              <div style={{ fontSize: '0.82rem', color: '#6b7280', marginTop: '0.2rem' }}>
                Competency score for <strong>{quizResult.competency_name} ({quizResult.competency_code})</strong> has been updated
              </div>
            </div>
          </div>

          {/* Score cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ background: '#eef2fb', borderRadius: '12px', padding: '1.25rem', textAlign: 'center' }}>
              <div style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 600, marginBottom: '0.35rem' }}>Quiz Score</div>
              <div style={{ fontSize: '2rem', fontWeight: 900, color: NAVY, fontFamily: 'Poppins, sans-serif', lineHeight: 1 }}>{quizResult.score_percent}%</div>
              <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>{quizResult.questions_correct} / {quizResult.questions_total} correct</div>
            </div>
            <div style={{ background: '#f0fdf4', borderRadius: '12px', padding: '1.25rem', textAlign: 'center' }}>
              <div style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 600, marginBottom: '0.35rem' }}>Score Change</div>
              <div style={{ fontSize: '2rem', fontWeight: 900, color: GREEN, fontFamily: 'Poppins, sans-serif', lineHeight: 1 }}>
                {quizResult.score_before} → {quizResult.score_after}
              </div>
              <div style={{ fontSize: '0.75rem', color: GREEN, marginTop: '0.25rem', fontWeight: 700 }}>+{quizResult.score_change} boost</div>
            </div>
            <div style={{ background: '#fff7ed', borderRadius: '12px', padding: '1.25rem', textAlign: 'center' }}>
              <div style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 600, marginBottom: '0.35rem' }}>Competency Domain</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: ORANGE, fontFamily: 'Poppins, sans-serif', lineHeight: 1.2 }}>{quizResult.competency_code}</div>
              <div style={{ fontSize: '0.72rem', color: '#6b7280', marginTop: '0.25rem' }}>{quizResult.competency_name}</div>
            </div>
          </div>

          <div style={{ background: '#f0fdf4', borderRadius: '10px', padding: '1rem', marginBottom: '1.25rem', fontSize: '0.85rem', color: GREEN, fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', borderLeft: `4px solid ${GREEN}` }}>
            <CheckCircle2 style={{ width: '18px', height: '18px', flexShrink: 0 }} />
            Your gap analysis and course recommendations have been updated. Go to My Dashboard to see the updated competency scores.
          </div>

          <button
            onClick={() => { setQuizResult(null); setAssessmentData(null); setFile(null); setSelectedAnswers({}); }}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#f9fafb', border: '1.5px solid #e5e7eb', color: NAVY, fontWeight: 700, padding: '0.65rem 1.5rem', borderRadius: '30px', cursor: 'pointer', fontSize: '0.875rem' }}
          >
            <RotateCcw style={{ width: '16px', height: '16px' }} /> Take Another Assessment
          </button>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
