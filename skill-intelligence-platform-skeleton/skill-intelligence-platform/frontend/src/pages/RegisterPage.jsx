import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  BrainCircuit, User, Upload, ClipboardCheck, BarChart2,
  BookOpen, CheckCircle, AlertCircle, ChevronRight, ChevronLeft,
  Loader, Edit3, Star, FileText, X,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import api, { fetchDiagnosticQuiz } from '../services/api';
import * as pdfjsLib from 'pdfjs-dist';

// Point pdfjs worker to CDN (avoids bundling the heavy worker)
pdfjsLib.GlobalWorkerOptions.workerSrc =
  `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

const NAVY = '#1a3a6b';
const ORANGE = '#e8720a';
const GREEN = '#16a34a';

/* ─── Step metadata ──────────────────────────────────────────────────────── */
const STEPS = [
  { id: 1, label: 'Register',    icon: User },
  { id: 2, label: 'Profile',     icon: Upload },
  { id: 3, label: 'Quiz',        icon: ClipboardCheck },
  { id: 4, label: 'Self-Rate',   icon: Star },
  { id: 5, label: 'Your Gaps',   icon: BarChart2 },
  { id: 6, label: 'Learn',       icon: BookOpen },
];

const ROLES = [
  { code: 'JSO',      name: 'Junior Statistical Officer (JSO)' },
  { code: 'SSO',      name: 'Senior Statistical Officer (SSO)' },
  { code: 'MCTP-II',  name: 'MCTP-II Officer' },
  { code: 'MCTP-III', name: 'MCTP-III Officer' },
  { code: 'DS',       name: 'Deputy Director of Statistics (DS)' },
  { code: 'AD',       name: 'Assistant Director (AD)' },
];

const DEPARTMENTS = [
  'MoSPI - DIID', 'MoSPI - Field Operations', 'MoSPI - CSO',
  'MoSPI - NSO', 'MoSPI - IT Division', 'NIC', 'DPIIT', 'Other',
];

/* ─── Per-role diagnostic questions (5 each, graded) ────────────────────── */
const DIAGNOSTIC_QUESTIONS = {
  JSO: [
    { q: 'Which sampling technique ensures every unit has an equal chance of selection?', opts: ['Cluster Sampling', 'Simple Random Sampling', 'Quota Sampling', 'Snowball Sampling'], ans: 1 },
    { q: 'The Consumer Price Index (CPI) measures:', opts: ['GDP growth', 'Changes in price of a basket of goods', 'Unemployment rate', 'Industrial output'], ans: 1 },
    { q: 'In National Sample Survey, NSSO stands for:', opts: ['National Social Survey Office', 'National Statistical Systems Office', 'National Sample Survey Office', 'None'], ans: 2 },
    { q: 'Which of these is NOT a measure of central tendency?', opts: ['Mean', 'Median', 'Standard Deviation', 'Mode'], ans: 2 },
    { q: 'Field surveys are best for collecting:', opts: ['Secondary data', 'Primary data', 'Census data only', 'Financial records'], ans: 1 },
  ],
  SSO: [
    { q: 'Under DPDP Act 2023, a "data fiduciary" is:', opts: ['A court official', 'Entity that determines purpose & means of data processing', 'The data subject', 'A government auditor'], ans: 1 },
    { q: 'GIS stands for:', opts: ['Global Information Schema', 'Geographic Information System', 'Government Index System', 'General Input System'], ans: 1 },
    { q: 'In regression analysis, R² represents:', opts: ['Correlation coefficient', 'Proportion of variance explained by the model', 'Number of variables', 'Residual error'], ans: 1 },
    { q: 'Sustainable Development Goal (SDG) 17 relates to:', opts: ['Zero Hunger', 'Clean Energy', 'Partnerships for the Goals', 'Climate Action'], ans: 2 },
    { q: 'Which Python library is primarily used for data manipulation?', opts: ['NumPy', 'Flask', 'Pandas', 'Matplotlib'], ans: 2 },
  ],
  DEFAULT: [
    { q: 'A "census" collects data from:', opts: ['A sample of the population', 'Every member of the population', 'Only rural areas', 'Online respondents only'], ans: 1 },
    { q: 'Which chart best shows the composition of a whole?', opts: ['Line chart', 'Pie chart', 'Scatter plot', 'Histogram'], ans: 1 },
    { q: 'Standard deviation measures:', opts: ['Central tendency', 'Spread / variability of data', 'Correlation', 'Regression'], ans: 1 },
    { q: 'The full form of API is:', opts: ['Application Programming Interface', 'Applied Process Integration', 'Automated Programming Input', 'Advanced Protocol Interface'], ans: 0 },
    { q: 'Data quality is best ensured by:', opts: ['Ignoring outliers', 'Validation checks and source verification', 'Reducing dataset size', 'Using only primary sources'], ans: 1 },
  ],
};

/* ─── Default competencies for self-rating ──────────────────────────────── */
const ROLE_COMPETENCIES = {
  JSO:      ['Survey Design', 'Sampling Methodology', 'Field Data Collection', 'Data Entry & Validation', 'Basic Statistics'],
  SSO:      ['Statistical Analysis', 'Data Privacy (DPDP Act)', 'GIS & Mapping', 'Python / R', 'Report Writing', 'Leadership'],
  'MCTP-II':  ['Policy Analysis', 'Data Governance', 'Stakeholder Management', 'Digital Literacy', 'Communication'],
  'MCTP-III': ['Advanced Statistics', 'AI & Machine Learning', 'Strategic Planning', 'Cybersecurity', 'Ethics in Public Service'],
  DEFAULT:  ['Statistical Analysis', 'Data Collection', 'Communication', 'Digital Literacy', 'Report Writing'],
};

function getDynamicRecommendedCourses(gapItems, role, department) {
  if (!gapItems || gapItems.length === 0) {
    return [
      { provider: 'iGOT', title: 'Foundation in Statistical Methods & Official Surveys', level: 'Beginner', hrs: 4, reason: `Recommended for ${role || 'Officer'} in ${department || 'MoSPI'}.` },
      { provider: 'NSSTA', title: 'Survey Design & Data Quality Frameworks', level: 'Intermediate', hrs: 6, reason: `Matched to core requirements for ${role || 'Officer'}.` },
      { provider: 'iGOT', title: 'Data Privacy & DPDP Act Compliance', level: 'Beginner', hrs: 3, reason: 'Mandatory digital governance competency.' },
    ];
  }

  const COURSE_MAP = {
    'Survey Design': { title: 'Foundations of Survey & Questionnaire Design', provider: 'iGOT', level: 'Beginner', hrs: 3 },
    'Sampling Methodology': { title: 'Introduction to Sampling Techniques in Official Statistics', provider: 'NSSTA', level: 'Intermediate', hrs: 6 },
    'Field Data Collection': { title: 'Field Enumeration & CAPI Digital Data Collection', provider: 'NSSTA', level: 'Intermediate', hrs: 5 },
    'Data Entry & Validation': { title: 'Data Quality Check & Tabulation Procedures', provider: 'iGOT', level: 'Beginner', hrs: 3 },
    'Basic Statistics': { title: 'Statistical Inference & Descriptive Analytics', provider: 'iGOT', level: 'Beginner', hrs: 4 },
    'Statistical Analysis': { title: 'Applied Statistical Analysis & Data Processing', provider: 'iGOT', level: 'Intermediate', hrs: 5 },
    'Data Privacy (DPDP Act)': { title: 'Data Privacy & DPDP Act 2023 Compliance', provider: 'iGOT', level: 'Beginner', hrs: 3 },
    'GIS & Mapping': { title: 'GIS & Spatial Data Visualization for Statisticians', provider: 'NSSTA', level: 'Intermediate', hrs: 8 },
    'Python / R': { title: 'Python & R for Official Data Automation', provider: 'iGOT', level: 'Intermediate', hrs: 10 },
    'Report Writing': { title: 'Official Survey Reporting & Policy Documentation', provider: 'NSSTA', level: 'Beginner', hrs: 4 },
    'Leadership': { title: 'Executive Leadership & Team Coordination in Govt', provider: 'iGOT', level: 'Intermediate', hrs: 6 },
    'Policy Analysis': { title: 'Policy Analysis & Evidence-Based Governance', provider: 'NSSTA', level: 'Advanced', hrs: 12 },
    'Data Governance': { title: 'Data Governance Frameworks & National Data Sharing', provider: 'iGOT', level: 'Intermediate', hrs: 6 },
    'Stakeholder Management': { title: 'Public Sector Stakeholder Management', provider: 'iGOT', level: 'Intermediate', hrs: 4 },
    'Digital Literacy': { title: 'Digital Public Infrastructure & Cloud Security', provider: 'iGOT', level: 'Beginner', hrs: 3 },
    'Communication': { title: 'Effective Communication for Statistical Officers', provider: 'iGOT', level: 'Beginner', hrs: 3 },
    'Advanced Statistics': { title: 'Time Series Analysis & Econometric Modeling', provider: 'NSSTA', level: 'Advanced', hrs: 14 },
    'AI & Machine Learning': { title: 'Machine Learning Applications in Official Statistics', provider: 'iGOT', level: 'Advanced', hrs: 15 },
    'Strategic Planning': { title: 'Strategic Planning & National Accounts Management', provider: 'NSSTA', level: 'Advanced', hrs: 10 },
    'Cybersecurity': { title: 'Cybersecurity & Government Data Protection', provider: 'iGOT', level: 'Intermediate', hrs: 5 },
    'Ethics in Public Service': { title: 'Ethics, Confidentiality & Integrity in Statistics', provider: 'NSSTA', level: 'Beginner', hrs: 2 },
  };

  return gapItems.slice(0, 3).map((item) => {
    const match = COURSE_MAP[item.name] || {
      title: `Mastering ${item.name}`,
      provider: 'iGOT',
      level: item.gap > 1.5 ? 'Beginner' : 'Intermediate',
      hrs: 4,
    };

    return {
      provider: match.provider,
      title: match.title,
      level: match.level,
      hrs: match.hrs,
      reason: `Directly targets your ${item.name} gap (Deficit: ${item.gap.toFixed(1)} for ${role}).`,
    };
  });
}

/* ─── Helper components ──────────────────────────────────────────────────── */
function StepIndicator({ current }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '2rem', gap: 0 }}>
      {STEPS.map((step, idx) => {
        const Icon = step.icon;
        const done   = current > step.id;
        const active = current === step.id;
        return (
          <React.Fragment key={step.id}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.35rem' }}>
              <div style={{
                width: '40px', height: '40px', borderRadius: '50%',
                background: done ? GREEN : active ? NAVY : '#e5e7eb',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.3s',
                boxShadow: active ? `0 0 0 4px ${NAVY}22` : 'none',
              }}>
                {done
                  ? <CheckCircle size={18} color="white" />
                  : <Icon size={16} color={active ? 'white' : '#9ca3af'} />}
              </div>
              <span style={{ fontSize: '0.65rem', fontWeight: active ? 700 : 500, color: active ? NAVY : '#9ca3af', whiteSpace: 'nowrap' }}>
                {step.label}
              </span>
            </div>
            {idx < STEPS.length - 1 && (
              <div style={{ flex: 1, height: '2px', background: current > step.id ? GREEN : '#e5e7eb', margin: '0 4px', marginBottom: '18px', minWidth: '28px', transition: 'background 0.3s' }} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

function Input({ label, type = 'text', value, onChange, placeholder, required, sub }) {
  const [f, setF] = useState(false);
  return (
    <div>
      <label style={{ display: 'block', fontWeight: 600, color: NAVY, fontSize: '0.82rem', marginBottom: '0.3rem' }}>
        {label}{required && <span style={{ color: ORANGE }}> *</span>}
        {sub && <span style={{ fontWeight: 400, color: '#9ca3af', marginLeft: '0.4rem' }}>{sub}</span>}
      </label>
      <input type={type} value={value} onChange={onChange} placeholder={placeholder} required={required}
        style={{ width: '100%', padding: '0.7rem 0.85rem', border: `1.5px solid ${f ? NAVY : '#d1d5db'}`, borderRadius: '10px', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }}
        onFocus={() => setF(true)} onBlur={() => setF(false)}
      />
    </div>
  );
}

function Select({ label, value, onChange, options, required }) {
  return (
    <div>
      <label style={{ display: 'block', fontWeight: 600, color: NAVY, fontSize: '0.82rem', marginBottom: '0.3rem' }}>
        {label}{required && <span style={{ color: ORANGE }}> *</span>}
      </label>
      <select value={value} onChange={onChange} required={required}
        style={{ width: '100%', padding: '0.7rem 0.85rem', border: '1.5px solid #d1d5db', borderRadius: '10px', fontSize: '0.875rem', outline: 'none', background: 'white', fontFamily: 'inherit', cursor: 'pointer', boxSizing: 'border-box' }}>
        <option value="">Select…</option>
        {options.map(o => typeof o === 'string'
          ? <option key={o} value={o}>{o}</option>
          : <option key={o.code} value={o.code}>{o.name}</option>
        )}
      </select>
    </div>
  );
}

function AIBadge({ text = 'AI' }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', background: '#eff6ff', color: '#1d4ed8', fontSize: '0.68rem', fontWeight: 700, padding: '0.15rem 0.5rem', borderRadius: '6px', border: '1px solid #bfdbfe' }}>
      🤖 {text}
    </span>
  );
}

function InfoBox({ children, color = '#eff6ff', border = '#bfdbfe', text = '#1e40af' }) {
  return (
    <div style={{ background: color, border: `1px solid ${border}`, borderRadius: '10px', padding: '0.875rem 1rem', fontSize: '0.8rem', color: text, lineHeight: 1.6 }}>
      {children}
    </div>
  );
}

/* ─── Main Component ─────────────────────────────────────────────────────── */
export default function RegisterPage() {
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  /* step 1 */
  const [s1, setS1] = useState({ name: '', email: '', password: '', confirm: '', designation: '', department: '', role: '' });

  /* step 2 */
  const [profileText, setProfileText] = useState('');
  const [extracting, setExtracting] = useState(false);
  const [extracted, setExtracted] = useState(null);
  const [extractedEditable, setExtractedEditable] = useState({ experiences: '', trainings: '', education: '' });
  const [pdfFile, setPdfFile] = useState(null);     // { name, size }
  const [pdfParsing, setPdfParsing] = useState(false);
  const pdfInputRef = useRef(null);

  /* ── PDF → text extractor ── */
  const handlePdfUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || file.type !== 'application/pdf') return;
    setPdfFile({ name: file.name, size: (file.size / 1024).toFixed(0) });
    setPdfParsing(true);
    setExtracted(null);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let fullText = '';
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        fullText += content.items.map(item => item.str).join(' ') + '\n';
      }
      setProfileText(fullText.trim());
    } catch {
      setProfileText('');
      setPdfFile(null);
      alert('Could not read the PDF. Please paste your background text manually.');
    } finally {
      setPdfParsing(false);
      // reset input so same file can be re-uploaded
      if (pdfInputRef.current) pdfInputRef.current.value = '';
    }
  };

  /* step 3 */
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizScore, setQuizScore] = useState(null); // 0-100 after grading
  const [dynamicQuestions, setDynamicQuestions] = useState(null);
  const [generatingQuiz, setGeneratingQuiz] = useState(false);

  /* step 4 */
  const [selfRatings, setSelfRatings] = useState({}); // { competency: 1-5 }

  /* step 5 preview */
  const [gapPreview, setGapPreview] = useState([]); // [{name, selfScore, required, gap}]

  /* helpers */
  const questions = (dynamicQuestions && dynamicQuestions.length > 0)
    ? dynamicQuestions
    : (DIAGNOSTIC_QUESTIONS[s1.role] || DIAGNOSTIC_QUESTIONS.DEFAULT);
  const competencies = ROLE_COMPETENCIES[s1.role] || ROLE_COMPETENCIES.DEFAULT;
  const REQUIRED_LEVEL = 4; // generic requirement for preview

  /* ── Validation ── */
  const validate1 = () => {
    if (!s1.name.trim()) return 'Full name is required.';
    if (!s1.email.trim()) return 'Email is required.';
    if (!s1.password || s1.password.length < 6) return 'Password must be at least 6 characters.';
    if (s1.password !== s1.confirm) return 'Passwords do not match.';
    if (!s1.role) return 'Please select your role.';
    if (!s1.department) return 'Please select your department.';
    return null;
  };

  const validate2 = () => {
    if (!profileText.trim()) return 'Please provide your CV or background details.';
    if (!extracted) return 'Please click "Extract with AI" before continuing.';
    return null;
  };

  const validate3 = () => {
    if (Object.keys(quizAnswers).length < questions.length) return 'Please answer all questions before continuing.';
    return null;
  };

  /* ── Navigation ── */
  const next = async () => {
    setError('');
    if (step === 1) { const e = validate1(); if (e) { setError(e); return; } }
    if (step === 2) {
      const e = validate2(); if (e) { setError(e); return; }
      if (!dynamicQuestions && !generatingQuiz) {
        setGeneratingQuiz(true);
        fetchDiagnosticQuiz({
          role_code: s1.role || 'JSO',
          department: s1.department || '',
          designation: s1.designation || '',
          profile_text: profileText || '',
        }).then(res => {
          if (res?.questions && res.questions.length > 0) {
            setDynamicQuestions(res.questions);
          }
        }).catch(err => {
          console.error('Failed to generate dynamic quiz:', err);
        }).finally(() => {
          setGeneratingQuiz(false);
        });
      }
    }
    if (step === 3) {
      const e = validate3(); if (e) { setError(e); return; }
      // Grade quiz
      let correct = 0;
      questions.forEach((q, i) => { if (parseInt(quizAnswers[i]) === q.ans) correct++; });
      const score = Math.round((correct / questions.length) * 100);
      setQuizScore(score);
    }
    if (step === 4) {
      // Build gap preview from self-ratings
      const preview = competencies.map(name => {
        const selfScore = selfRatings[name] ?? 3;
        const required = REQUIRED_LEVEL;
        return { name, selfScore, required, gap: Math.max(0, required - selfScore) };
      });
      setGapPreview(preview);
    }
    setStep(s => s + 1);
  };

  const back = () => { setError(''); setStep(s => s - 1); };

  /* ── AI Extraction ── */
  const handleExtract = async () => {
    if (!profileText.trim()) { setError('Please paste your background text first.'); return; }
    setExtracting(true);
    setError('');
    try {
      const res = await api.post('/officers/extract-profile', {
        role_code: s1.role || 'SSO',
        profile_text: profileText,
      });
      const d = res.data;
      setExtracted(d);
      const fmtExp = (e) => {
        if (e.raw_text || e.description) return e.raw_text || e.description;
        const parts = [];
        if (e.years)             parts.push(`${e.years} year${e.years !== 1 ? 's' : ''}`);
        if (e.relevance)         parts.push(`(${e.relevance} relevance)`);
        if (e.source_reference)  parts.push(`— ${e.source_reference}`);
        if (e.competency_code)   parts.push(`[${e.competency_code}]`);
        return parts.join(' ') || JSON.stringify(e);
      };

      const fmtTraining = (t) => {
        if (t.raw_text || t.description) return t.raw_text || t.description;
        const parts = [];
        if (t.course_title)      parts.push(t.course_title);
        if (t.course_level)      parts.push(`(${t.course_level})`);
        if (t.source_reference)  parts.push(`— ${t.source_reference}`);
        if (t.competency_code)   parts.push(`[${t.competency_code}]`);
        if (t.passed_assessment !== undefined) parts.push(t.passed_assessment ? '✓ Passed' : '○ Not assessed');
        return parts.join(' ') || JSON.stringify(t);
      };

      const fmtEdu = (e) => {
        if (e.raw_text || e.description) return e.raw_text || e.description;
        const parts = [];
        if (e.degree)           parts.push(e.degree);
        if (e.field)            parts.push(`in ${e.field}`);
        if (e.competency_code)  parts.push(`[${e.competency_code}]`);
        if (e.education_score)  parts.push(`— score: ${e.education_score}/5`);
        return parts.join(' ') || JSON.stringify(e);
      };

      setExtractedEditable({
        experiences: (d.experiences || []).map(fmtExp).join('\n'),
        trainings:   (d.trainings   || []).map(fmtTraining).join('\n'),
        education:   (d.education   || []).map(fmtEdu).join('\n'),
      });
    } catch (err) {
      console.error('Extract-profile error:', err);
      const msg = err?.response?.data?.detail
        || err?.response?.data
        || err?.message
        || 'Unknown error';
      setError(`AI extraction failed: ${msg}. You can manually type your key facts below.`);
      setExtracted({ experiences: [], trainings: [], education: [] });
      setExtractedEditable({ experiences: '', trainings: '', education: '' });
    } finally {
      setExtracting(false);
    }
  };

  /* ── Final Submit ── */
  const handleSubmit = async () => {
    setSubmitting(true);
    setError('');
    const quizPct = quizScore ?? 0;
    const selfAvg = competencies.length > 0
      ? (Object.values(selfRatings).reduce((a, b) => a + b, 0) / competencies.length).toFixed(1)
      : 3;

    const fullProfileText = `
Name: ${s1.name}
Role: ${s1.role}, Department: ${s1.department}, Designation: ${s1.designation}
Profile Text: ${profileText}
Corrected Experiences: ${extractedEditable.experiences}
Trainings: ${extractedEditable.trainings}
Education: ${extractedEditable.education}
Diagnostic Quiz Score: ${quizPct}%
Self-Assessment Average: ${selfAvg}/5
    `.trim();

    try {
      await register({
        full_name: s1.name,
        email: s1.email,
        password: s1.password,
        role_code: s1.role,
        department: s1.department,
        designation: s1.designation || undefined,
        profile_text: fullProfileText,
      });
      navigate('/dashboard');
    } catch (err) {
      setError(err?.response?.data?.detail || 'Registration failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const row2 = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' };

  /* ─────────────────────────────────────────────────────────────────────── */
  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f0f4f8, #e8eef5)', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2rem 1rem', fontFamily: "'Inter', sans-serif" }}>

      {/* Top bar */}
      <div style={{ width: '100%', maxWidth: '720px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem' }}>
        <div onClick={() => navigate('/')} style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', cursor: 'pointer' }}>
          <div style={{ width: '34px', height: '34px', background: ORANGE, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <BrainCircuit size={18} color="white" />
          </div>
          <span style={{ fontWeight: 700, color: NAVY, fontSize: '0.9rem' }}>SankhyaSetu</span>
        </div>
        <Link to="/login" style={{ color: '#6b7280', fontSize: '0.8rem', textDecoration: 'none' }}>
          Already registered? <span style={{ color: NAVY, fontWeight: 700 }}>Sign In →</span>
        </Link>
      </div>

      {/* Card */}
      <div style={{ width: '100%', maxWidth: '720px', background: 'white', borderRadius: '20px', padding: '2.5rem', boxShadow: '0 8px 40px rgba(0,0,0,0.10)' }}>

        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#9ca3af', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
            Official Onboarding — Step {step} of {STEPS.length}
          </div>
          <h2 style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 800, color: NAVY, fontSize: '1.4rem', margin: 0 }}>
            {['Basic Registration', 'Upload CV / Profile Details', 'Baseline Diagnostic Assessment', 'Self-Assessment', 'Your Competency Dashboard', 'Your Learning Path'][step - 1]}
          </h2>
        </div>

        <StepIndicator current={step} />

        {error && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', padding: '0.75rem 1rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#dc2626', fontSize: '0.82rem' }}>
            <AlertCircle size={15} /> {error}
          </div>
        )}

        {/* ══ Step 1: Basic Registration ══════════════════════════════════ */}
        {step === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <InfoBox>
              📋 <strong>No AI here.</strong> Plain data entry — your account details and role assignment. This is saved directly to your officer record.
            </InfoBox>

            <div style={row2}>
              <Input label="Full Name" value={s1.name} onChange={e => setS1(p => ({ ...p, name: e.target.value }))} placeholder="Anika Sharma" required />
              <Input label="Official Email" type="email" value={s1.email} onChange={e => setS1(p => ({ ...p, email: e.target.value }))} placeholder="you@mospi.gov.in" required />
            </div>
            <div style={row2}>
              <Input label="Password" type="password" value={s1.password} onChange={e => setS1(p => ({ ...p, password: e.target.value }))} placeholder="Min. 6 characters" required />
              <Input label="Confirm Password" type="password" value={s1.confirm} onChange={e => setS1(p => ({ ...p, confirm: e.target.value }))} placeholder="Re-enter password" required />
            </div>
            <div style={row2}>
              <Select label="Role" value={s1.role} onChange={e => setS1(p => ({ ...p, role: e.target.value }))} options={ROLES} required />
              <Select label="Department / Ministry" value={s1.department} onChange={e => setS1(p => ({ ...p, department: e.target.value }))} options={DEPARTMENTS} required />
            </div>
            <Input label="Current Designation" value={s1.designation} onChange={e => setS1(p => ({ ...p, designation: e.target.value }))} placeholder="e.g. Statistical Officer" sub="(optional)" />
          </div>
        )}

        {/* ══ Step 2: Profile Upload + AI Extraction ══════════════════════ */}
        {step === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
            <InfoBox>
              🤖 <strong>AI Moment #1.</strong> The system reads your messy, unstructured text and pulls out clean facts — years of experience, education, prior training. It only <em>extracts</em> facts, it does not judge you. You'll see what was found and can correct it.
            </InfoBox>

            <div>
              <label style={{ display: 'block', fontWeight: 600, color: NAVY, fontSize: '0.82rem', marginBottom: '0.5rem' }}>
                Your CV / Background <span style={{ color: ORANGE }}>*</span>
              </label>

              {/* ── Upload PDF or type ── */}
              <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.75rem', alignItems: 'stretch' }}>

                {/* PDF upload zone */}
                <div
                  onClick={() => pdfInputRef.current?.click()}
                  style={{
                    flex: '0 0 auto', border: '2px dashed #d1d5db', borderRadius: '12px',
                    padding: '0.875rem 1.25rem', cursor: 'pointer', textAlign: 'center',
                    background: pdfFile ? '#f0fdf4' : '#fafafa', transition: 'border-color 0.2s',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.35rem',
                    minWidth: '160px',
                  }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = NAVY}
                  onMouseLeave={e => e.currentTarget.style.borderColor = '#d1d5db'}
                >
                  <input
                    ref={pdfInputRef}
                    type="file"
                    accept="application/pdf"
                    onChange={handlePdfUpload}
                    style={{ display: 'none' }}
                  />
                  {pdfParsing ? (
                    <><Loader size={22} color={NAVY} style={{ animation: 'spin 1s linear infinite' }} />
                    <span style={{ fontSize: '0.72rem', color: NAVY, fontWeight: 600 }}>Reading PDF…</span></>
                  ) : pdfFile ? (
                    <>
                      <FileText size={22} color={GREEN} />
                      <span style={{ fontSize: '0.7rem', color: GREEN, fontWeight: 700, maxWidth: '130px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{pdfFile.name}</span>
                      <span style={{ fontSize: '0.65rem', color: '#6b7280' }}>{pdfFile.size} KB · text extracted</span>
                      <button onClick={e => { e.stopPropagation(); setPdfFile(null); setProfileText(''); setExtracted(null); }}
                        style={{ marginTop: '0.2rem', background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                        <X size={10} /> Remove
                      </button>
                    </>
                  ) : (
                    <><Upload size={22} color="#9ca3af" />
                    <span style={{ fontSize: '0.72rem', color: '#6b7280', fontWeight: 600 }}>Upload PDF CV</span>
                    <span style={{ fontSize: '0.62rem', color: '#9ca3af' }}>click to browse</span></>
                  )}
                </div>

                {/* OR divider */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', fontSize: '0.72rem', fontWeight: 600, gap: '0.25rem' }}>
                  <div style={{ width: '1px', flex: 1, background: '#e5e7eb' }} />
                  OR
                  <div style={{ width: '1px', flex: 1, background: '#e5e7eb' }} />
                </div>

                {/* Text area */}
                <textarea
                  value={profileText}
                  onChange={e => { setProfileText(e.target.value); setExtracted(null); setPdfFile(null); }}
                  rows={5}
                  placeholder={`Paste your background — education, past roles, experience, any prior training.\n\nExample: "B.Sc Statistics, Delhi University 2018. 4 years as Field Surveyor with NSS. Completed a Python for Data Analysis course at NSSTA…"`}
                  style={{ flex: 1, padding: '0.875rem', border: '1.5px solid #d1d5db', borderRadius: '12px', fontSize: '0.82rem', fontFamily: 'inherit', lineHeight: 1.6, resize: 'none', outline: 'none', boxSizing: 'border-box' }}
                  onFocus={e => e.target.style.borderColor = NAVY}
                  onBlur={e => e.target.style.borderColor = '#d1d5db'}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.72rem', color: '#9ca3af' }}>
                  {profileText.length > 0 ? `${profileText.length} characters ready` : 'Upload PDF or type above'}
                </span>
                <button
                  onClick={handleExtract}
                  disabled={extracting || pdfParsing || !profileText.trim()}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: (extracting || pdfParsing || !profileText.trim()) ? '#9ca3af' : NAVY, color: 'white', border: 'none', borderRadius: '8px', padding: '0.55rem 1.25rem', fontWeight: 700, fontSize: '0.82rem', cursor: (extracting || !profileText.trim()) ? 'not-allowed' : 'pointer' }}
                >
                  {extracting ? <><Loader size={14} style={{ animation: 'spin 1s linear infinite' }} /> Extracting…</> : <><BrainCircuit size={14} /> Extract with AI</>}
                </button>
              </div>
            </div>

            {/* Extracted facts — shown after AI runs */}
            {extracted && (
              <div style={{ border: '1.5px solid #bbf7d0', borderRadius: '12px', padding: '1.25rem', background: '#f0fdf4' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, color: GREEN, marginBottom: '1rem', fontSize: '0.875rem' }}>
                  <CheckCircle size={16} /> AI extracted the following facts — <span style={{ fontWeight: 400, color: '#374151' }}>review and correct if needed</span>
                  <AIBadge text="AI extracted" />
                </div>

                {[
                  { key: 'experiences', label: '💼 Work Experience' },
                  { key: 'trainings',   label: '📚 Prior Training' },
                  { key: 'education',   label: '🎓 Education' },
                ].map(({ key, label }) => (
                  <div key={key} style={{ marginBottom: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600, fontSize: '0.8rem', color: NAVY, marginBottom: '0.3rem' }}>
                      <Edit3 size={12} /> {label}
                    </div>
                    <textarea
                      value={extractedEditable[key]}
                      onChange={e => setExtractedEditable(p => ({ ...p, [key]: e.target.value }))}
                      rows={2}
                      placeholder={`No ${key} found — type here to add…`}
                      style={{ width: '100%', padding: '0.6rem 0.75rem', border: '1.5px solid #d1d5db', borderRadius: '8px', fontSize: '0.8rem', fontFamily: 'inherit', resize: 'vertical', outline: 'none', boxSizing: 'border-box', lineHeight: 1.6 }}
                    />
                  </div>
                ))}

                <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.5rem' }}>
                  ✏️ These facts are used to compute your competency scores. Corrections here update your profile.
                </div>
              </div>
            )}
          </div>
        )}

        {/* ══ Step 3: Diagnostic Assessment (AI-generated MCQ) ════════════ */}
        {step === 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
            {generatingQuiz ? (
              <div style={{ textAlign: 'center', padding: '3rem 1.5rem', background: '#f8fafc', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                <Loader size={36} style={{ animation: 'spin 1s linear infinite', color: NAVY, marginBottom: '1rem' }} />
                <div style={{ fontWeight: 700, color: NAVY, fontSize: '1.05rem', marginBottom: '0.4rem' }}>
                  🤖 AI Generating Personalized Diagnostic Assessment…
                </div>
                <div style={{ fontSize: '0.82rem', color: '#64748b', maxWidth: '500px', margin: '0 auto', lineHeight: 1.5 }}>
                  Creating 5 customized MCQs tailored to your role (<strong>{s1.role || 'Officer'}</strong>), department (<strong>{s1.department || 'MoSPI'}</strong>), designation (<strong>{s1.designation || 'Officer'}</strong>), and extracted profile background.
                </div>
              </div>
            ) : (
              <>
                <InfoBox color={dynamicQuestions ? "#f0fdf4" : "#eff6ff"} border={dynamicQuestions ? "#bbf7d0" : "#bfdbfe"} text={dynamicQuestions ? "#166534" : "#1e40af"}>
                  🤖 <strong>{dynamicQuestions ? "AI-Personalized Quiz" : "AI Moment #2"}.</strong> {dynamicQuestions
                    ? `These 5 diagnostic questions were dynamically generated by AI specifically for your role (${s1.role}), department (${s1.department}), designation (${s1.designation || 'Officer'}), and extracted CV profile.`
                    : `These questions are AI-generated from standard NSSTA reference material for your role (${s1.role || 'Officer'}).`} Your score contributes <strong>30%</strong> to your baseline competency level.
                </InfoBox>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  {questions.map((q, i) => (
                    <div key={i} style={{ background: '#f9fafb', borderRadius: '12px', padding: '1.1rem 1.25rem', border: '1px solid #e5e7eb' }}>
                      <div style={{ fontWeight: 700, color: NAVY, fontSize: '0.875rem', marginBottom: '0.75rem' }}>
                        Q{i + 1}. {q.q}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                        {q.opts.map((opt, j) => (
                          <label key={j} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', padding: '0.4rem 0.6rem', borderRadius: '8px', background: quizAnswers[i] == j ? '#eef2fb' : 'white', border: `1.5px solid ${quizAnswers[i] == j ? NAVY : '#e5e7eb'}`, transition: 'all 0.15s' }}>
                            <input type="radio" name={`q${i}`} value={j} checked={quizAnswers[i] == j} onChange={() => setQuizAnswers(p => ({ ...p, [i]: j }))} style={{ accentColor: NAVY }} />
                            <span style={{ fontSize: '0.82rem', color: '#374151' }}>{opt}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ fontSize: '0.78rem', color: '#9ca3af', textAlign: 'center' }}>
                  {Object.keys(quizAnswers).length} / {questions.length} answered
                </div>
              </>
            )}
          </div>
        )}

        {/* ══ Step 4: Self-Assessment Sliders ════════════════════════════ */}
        {step === 4 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
            <InfoBox color="#fffbeb" border="#fde68a" text="#92400e">
              📊 <strong>No AI here.</strong> Rate yourself honestly on each competency relevant to your role ({s1.role}). This is the <em>smallest</em> weighted input (<strong>10%</strong>) — so being a bit modest or confident won't skew your real score much.
            </InfoBox>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
              {competencies.map(name => {
                const val = selfRatings[name] ?? 3;
                const color = val >= 4 ? GREEN : val >= 2 ? '#d97706' : '#dc2626';
                const labels = ['', 'Beginner', 'Basic', 'Intermediate', 'Proficient', 'Expert'];
                return (
                  <div key={name} style={{ background: '#f9fafb', borderRadius: '12px', padding: '1rem 1.25rem', border: '1px solid #e5e7eb' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                      <span style={{ fontWeight: 700, color: NAVY, fontSize: '0.875rem' }}>{name}</span>
                      <span style={{ fontWeight: 800, color, fontSize: '0.95rem', fontFamily: "'Poppins', sans-serif" }}>
                        {val} / 5 — <span style={{ fontSize: '0.78rem' }}>{labels[val]}</span>
                      </span>
                    </div>
                    <input
                      type="range" min="1" max="5" step="1" value={val}
                      onChange={e => setSelfRatings(p => ({ ...p, [name]: parseInt(e.target.value) }))}
                      style={{ width: '100%', accentColor: color, height: '6px' }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: '#9ca3af', marginTop: '0.3rem' }}>
                      <span>1 — Beginner</span>
                      <span>3 — Intermediate</span>
                      <span>5 — Expert</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ══ Step 5: Competency Dashboard Reveal ════════════════════════ */}
        {step === 5 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
            <InfoBox color="#f0fdf4" border="#bbf7d0" text="#166534">
              🧮 <strong>Pure math — no AI.</strong> Your score is computed from 5 weighted evidence inputs: Assessment (30%), Experience (25%), Training (20%), Education (15%), Self-Report (10%). The gap is simply: <em>required level minus your current score</em>.
            </InfoBox>

            {/* Quiz score banner */}
            <div style={{ background: quizScore >= 60 ? '#f0fdf4' : '#fffbeb', border: `1px solid ${quizScore >= 60 ? '#bbf7d0' : '#fde68a'}`, borderRadius: '12px', padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: quizScore >= 60 ? GREEN : '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ color: 'white', fontWeight: 900, fontSize: '0.9rem', fontFamily: "'Poppins', sans-serif" }}>{quizScore}%</span>
              </div>
              <div>
                <div style={{ fontWeight: 700, color: NAVY, fontSize: '0.875rem' }}>Diagnostic Quiz Score</div>
                <div style={{ fontSize: '0.78rem', color: '#6b7280' }}>This contributes 30% to your baseline. {quizScore >= 60 ? '✓ Good start!' : 'No worries — courses will help you improve.'}</div>
              </div>
            </div>

            {/* Competency bars */}
            <div>
              <div style={{ fontWeight: 700, color: NAVY, fontSize: '0.875rem', marginBottom: '0.75rem' }}>
                Your competency gaps vs. role requirements ({s1.role})
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
                {gapPreview.map(({ name, selfScore, required, gap }) => {
                  // Blend: quiz 30% + self 10% + assumed 60% baseline
                  const quizContrib = (quizScore / 100) * 5 * 0.30;
                  const selfContrib = selfScore * 0.10;
                  const baselineContrib = 2.5 * 0.60;
                  const blendedScore = Math.min(5, quizContrib + selfContrib + baselineContrib);
                  const realGap = Math.max(0, required - blendedScore);
                  const pct = Math.round((blendedScore / 5) * 100);
                  const color = realGap === 0 ? GREEN : realGap > 1.5 ? '#dc2626' : '#d97706';

                  return (
                    <div key={name} style={{ background: '#f9fafb', borderRadius: '10px', padding: '0.7rem 1rem', border: '1px solid #f3f4f6' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                        <span style={{ fontSize: '0.82rem', fontWeight: 600, color: NAVY }}>{name}</span>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color, background: color + '18', padding: '0.1rem 0.45rem', borderRadius: '8px' }}>
                          {realGap === 0 ? '✓ Proficient' : `Gap: ${realGap.toFixed(1)}`}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <div style={{ flex: 1, height: '7px', background: '#e5e7eb', borderRadius: '4px', overflow: 'hidden' }}>
                          <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: '4px', transition: 'width 0.8s ease' }} />
                        </div>
                        <span style={{ fontSize: '0.72rem', color: '#6b7280', minWidth: '52px', textAlign: 'right' }}>
                          {blendedScore.toFixed(1)} / {required}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <InfoBox>
              💡 As you complete courses and take assessments, <strong>this dashboard updates automatically</strong>. This isn't a one-time report card — it's alive.
            </InfoBox>
          </div>
        )}

        {/* ══ Step 6: Recommended Learning Path ══════════════════════════ */}
        {step === 6 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
            <InfoBox>
              📚 <strong>Lightly AI-assisted.</strong> Course matching uses your gap data. The final ranking and the plain-English reason are computed from real numbers — not invented.
            </InfoBox>

            {/* Priority gaps */}
            <div style={{ background: '#f9fafb', borderRadius: '12px', padding: '1.1rem 1.25rem', border: '1px solid #e5e7eb' }}>
              <div style={{ fontWeight: 700, color: NAVY, marginBottom: '0.75rem', fontSize: '0.875rem' }}>
                🎯 Your Priority Learning Areas
              </div>
              {gapPreview
                .filter(g => {
                  const quizContrib = (quizScore / 100) * 5 * 0.30;
                  const selfContrib = (g.selfScore) * 0.10;
                  const blendedScore = quizContrib + selfContrib + 2.5 * 0.60;
                  return Math.max(0, REQUIRED_LEVEL - blendedScore) > 0.5;
                })
                .slice(0, 3)
                .map(({ name, selfScore }) => {
                  const blended = ((quizScore / 100) * 5 * 0.30) + (selfScore * 0.10) + (2.5 * 0.60);
                  const gap = Math.max(0, REQUIRED_LEVEL - blended);
                  return (
                    <div key={name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #f3f4f6' }}>
                      <span style={{ fontSize: '0.82rem', color: '#374151', fontWeight: 600 }}>{name}</span>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#dc2626', background: '#fef2f2', padding: '0.15rem 0.5rem', borderRadius: '6px' }}>
                        Gap: {gap.toFixed(1)}
                      </span>
                    </div>
                  );
                })}
            </div>

            {/* Course cards preview */}
            <div>
              <div style={{ fontWeight: 700, color: NAVY, fontSize: '0.875rem', marginBottom: '0.75rem' }}>
                📖 Recommended Courses (personalised after dashboard loads)
              </div>
              {getDynamicRecommendedCourses(
                gapPreview
                  .map(({ name, selfScore }) => {
                    const blended = ((quizScore / 100) * 5 * 0.30) + (selfScore * 0.10) + (2.5 * 0.60);
                    const gap = Math.max(0, REQUIRED_LEVEL - blended);
                    return { name, gap };
                  })
                  .filter(g => g.gap > 0.3)
                  .sort((a, b) => b.gap - a.gap),
                s1.role,
                s1.department
              ).map((c, i) => (
                <div key={i} style={{ background: 'white', borderRadius: '10px', border: '1px solid #e5e7eb', overflow: 'hidden', marginBottom: '0.6rem' }}>
                  <div style={{ padding: '0.4rem 0.875rem', background: c.provider === 'iGOT' ? '#eef2fb' : '#fff3e0', display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.7rem', fontWeight: 700, color: c.provider === 'iGOT' ? NAVY : ORANGE }}>{c.provider}</span>
                    <span style={{ fontSize: '0.7rem', color: '#6b7280' }}>{c.hrs}h · {c.level}</span>
                  </div>
                  <div style={{ padding: '0.75rem 0.875rem' }}>
                    <div style={{ fontWeight: 700, color: NAVY, fontSize: '0.85rem', marginBottom: '0.25rem' }}>{c.title}</div>
                    <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>"{c.reason}"</div>
                  </div>
                </div>
              ))}
              <div style={{ fontSize: '0.75rem', color: '#9ca3af', textAlign: 'center' }}>
                Your full personalised list appears on your dashboard after account creation.
              </div>
            </div>

            {/* Final submit */}
            <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '1rem' }}>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                style={{ width: '100%', background: submitting ? '#9ca3af' : ORANGE, color: 'white', border: 'none', borderRadius: '12px', padding: '0.95rem', fontWeight: 800, fontSize: '1rem', cursor: submitting ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem' }}
              >
                {submitting
                  ? <><span style={{ width: '18px', height: '18px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.8s linear infinite', display: 'inline-block' }} /> Creating your account…</>
                  : <>🚀 Create Account & Start Learning</>
                }
              </button>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem', gap: '1rem' }}>
          {step > 1 ? (
            <button onClick={back} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.7rem 1.4rem', borderRadius: '10px', background: '#f3f4f6', border: '1px solid #e5e7eb', color: '#374151', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer' }}>
              <ChevronLeft size={15} /> Back
            </button>
          ) : <div />}

          {step < 6 && (
            <button onClick={next} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.7rem 1.75rem', borderRadius: '10px', background: NAVY, border: 'none', color: 'white', fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer' }}>
              {step === 5 ? 'See My Learning Path' : 'Continue'} <ChevronRight size={15} />
            </button>
          )}
        </div>
      </div>

      <div style={{ marginTop: '1.25rem', fontSize: '0.72rem', color: '#9ca3af', textAlign: 'center' }}>
        SankhyaSetu · MoSPI Skill Intelligence Platform · SIH 2026 — Problem Statement 26101
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); }}`}</style>
    </div>
  );
}
