import React, { useState, useEffect } from 'react';
import {
  Sparkles, TrendingUp, ShieldCheck, AlertCircle, FileText, CheckCircle,
  Loader, RefreshCw, Edit3, Save, Info
} from 'lucide-react';
import {
  fetchFutureReadinessSignals,
  updateFutureReadinessSignal,
  suggestFutureReadinessSignal
} from '../../services/api';

const NAVY = '#1a3a6b';
const ORANGE = '#e8720a';

export default function FutureReadinessPage() {
  const [signals, setSignals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [documentText, setDocumentText] = useState('');
  const [extracting, setExtracting] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState(null);
  const [editingCode, setEditingCode] = useState(null);
  const [editTag, setEditTag] = useState('Rising');
  const [editNote, setEditNote] = useState('');
  const [savingCode, setSavingCode] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadSignals();
  }, []);

  const loadSignals = async () => {
    setLoading(true);
    try {
      const data = await fetchFutureReadinessSignals();
      setSignals(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleRunAiAssistant = async () => {
    if (!documentText.trim()) return;
    setExtracting(true);
    setAiSuggestions(null);
    try {
      const res = await suggestFutureReadinessSignal(documentText);
      setAiSuggestions(res);
    } catch (e) {
      console.error(e);
    } finally {
      setExtracting(false);
    }
  };

  const handleApproveSignal = async (code, tag, note) => {
    setSavingCode(code);
    try {
      await updateFutureReadinessSignal(code, {
        future_readiness_tag: tag,
        future_readiness_note: note,
      });
      setMessage(`✓ Approved and updated signal for ${code}`);
      setTimeout(() => setMessage(''), 3000);
      await loadSignals();
    } catch (e) {
      console.error(e);
    } finally {
      setSavingCode(null);
    }
  };

  const startEdit = (sig) => {
    setEditingCode(sig.code);
    setEditTag(sig.future_readiness_tag || 'Rising');
    setEditNote(sig.future_readiness_note || '');
  };

  const saveEdit = async (code) => {
    await handleApproveSignal(code, editTag, editNote);
    setEditingCode(null);
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      {/* Title */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: NAVY, fontFamily: 'Poppins, sans-serif', margin: 0 }}>
          🏛️ Future-Readiness Signals & AI Assistant
        </h2>
        <p style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '0.25rem' }}>
          Sourced institutional priority trend signals curated from official MoSPI policy, NSSTA syllabus updates, and gazette notices.
        </p>
      </div>

      {message && (
        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#15803d', padding: '0.75rem 1rem', borderRadius: '10px', fontSize: '0.85rem', fontWeight: 700, marginBottom: '1.25rem' }}>
          {message}
        </div>
      )}

      {/* ── Section 1: AI Signal Assistant Panel ── */}
      <div style={{ background: 'white', borderRadius: '16px', padding: '1.5rem', border: '1px solid #e2e8f0', boxShadow: '0 4px 16px rgba(0,0,0,0.04)', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#f5f3ff', border: '1px solid #ddd6fe', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Sparkles size={18} color="#7c3aed" />
          </div>
          <div>
            <div style={{ fontWeight: 800, color: NAVY, fontSize: '1rem', fontFamily: 'Poppins, sans-serif' }}>
              🤖 AI Signal Assistant (Human-in-the-Loop Curation)
            </div>
            <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
              Paste a policy document, tender notice, or syllabus excerpt. AI will extract touched competencies and draft trend notes for your approval.
            </div>
          </div>
        </div>

        <textarea
          value={documentText}
          onChange={e => setDocumentText(e.target.value)}
          rows={4}
          placeholder={`Paste text excerpt here...\nExample: "MoSPI strategy document 2025 emphasizes mandatory GIS mapping modules for all statistical cadres and integration of Data Privacy safeguards under DPDP Act 2023..."`}
          style={{ width: '100%', padding: '0.75rem 0.85rem', border: '1.5px solid #cbd5e1', borderRadius: '10px', fontSize: '0.82rem', fontFamily: 'inherit', resize: 'vertical', outline: 'none', boxSizing: 'border-box', marginTop: '0.75rem', marginBottom: '0.75rem' }}
        />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
            💡 AI suggests signals — Admin holds final approval before updating workforce targets.
          </span>
          <button
            onClick={handleRunAiAssistant}
            disabled={extracting || !documentText.trim()}
            style={{
              background: (extracting || !documentText.trim()) ? '#94a3b8' : '#7c3aed',
              color: 'white', border: 'none', borderRadius: '8px', padding: '0.55rem 1.25rem',
              fontWeight: 700, fontSize: '0.82rem', cursor: (extracting || !documentText.trim()) ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', gap: '0.4rem'
            }}
          >
            {extracting ? <><Loader size={14} style={{ animation: 'spin 1s linear infinite' }} /> Processing Document…</> : <><Sparkles size={14} /> Analyse & Draft Signals</>}
          </button>
        </div>

        {/* AI Suggestions Results */}
        {aiSuggestions && (
          <div style={{ marginTop: '1.25rem', background: '#f5f3ff', border: '1.5px solid #ddd6fe', borderRadius: '12px', padding: '1.25rem' }}>
            <div style={{ fontWeight: 700, color: '#5b21b6', fontSize: '0.875rem', marginBottom: '0.4rem' }}>
              📋 AI Extraction Summary:
            </div>
            <div style={{ fontSize: '0.82rem', color: '#4c1d95', marginBottom: '1rem', lineHeight: 1.5 }}>
              {aiSuggestions.document_summary || 'Extracted competency trend signals from source text.'}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {(aiSuggestions.suggested_signals || []).map((sig, idx) => (
                <div key={idx} style={{ background: 'white', borderRadius: '10px', padding: '0.85rem 1rem', border: '1px solid #e9d5ff', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                      <span style={{ fontSize: '0.72rem', fontWeight: 800, color: NAVY, background: '#e2e8f0', padding: '0.15rem 0.5rem', borderRadius: '4px', fontFamily: 'monospace' }}>{sig.competency_code}</span>
                      <span style={{ fontWeight: 700, color: NAVY, fontSize: '0.875rem' }}>{sig.competency_name}</span>
                      <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#7c3aed', background: '#f3e8ff', padding: '0.15rem 0.5rem', borderRadius: '6px' }}>
                        Tag: {sig.suggested_tag} ({sig.confidence} Confidence)
                      </span>
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#475569', lineHeight: 1.4 }}>
                      📌 <strong>Sourced Note:</strong> {sig.reason_note}
                    </div>
                  </div>

                  <button
                    onClick={() => handleApproveSignal(sig.competency_code, sig.suggested_tag, sig.reason_note)}
                    disabled={savingCode === sig.competency_code}
                    style={{ background: '#16a34a', color: 'white', border: 'none', borderRadius: '8px', padding: '0.45rem 0.95rem', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                  >
                    {savingCode === sig.competency_code ? <Loader size={12} style={{ animation: 'spin 1s linear infinite' }} /> : <CheckCircle size={13} />}
                    Approve & Save Signal
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Section 2: Management Table of Sourced Signals ── */}
      <div style={{ background: 'white', borderRadius: '16px', padding: '1.5rem', border: '1px solid #e2e8f0', boxShadow: '0 2px 10px rgba(0,0,0,0.04)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1rem', color: NAVY, fontFamily: 'Poppins, sans-serif' }}>
              Institutional Future-Readiness Signals Repository
            </div>
            <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.15rem' }}>
              Manage Rising vs Stable competency priorities and their audit justification notes
            </div>
          </div>
          <button onClick={loadSignals} style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '0.45rem 0.85rem', fontSize: '0.78rem', fontWeight: 600, color: NAVY, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <RefreshCw size={13} /> Refresh
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
            <Loader size={32} style={{ animation: 'spin 1s linear infinite', marginBottom: '0.5rem' }} />
            <div>Loading signals...</div>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: NAVY, fontWeight: 700 }}>
                  <th style={{ padding: '0.75rem 1rem' }}>Code</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Competency</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Category</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Tag</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Sourced Justification Note</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {signals.map(sig => {
                  const isEditing = editingCode === sig.code;
                  const isRising = sig.future_readiness_tag === 'Rising';

                  return (
                    <tr key={sig.code} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '0.75rem 1rem', fontWeight: 800, color: NAVY, fontFamily: 'monospace' }}>{sig.code}</td>
                      <td style={{ padding: '0.75rem 1rem', fontWeight: 700, color: NAVY }}>{sig.name}</td>
                      <td style={{ padding: '0.75rem 1rem', color: '#64748b' }}>{sig.domain_category || 'Domain'}</td>

                      <td style={{ padding: '0.75rem 1rem' }}>
                        {isEditing ? (
                          <select value={editTag} onChange={e => setEditTag(e.target.value)} style={{ padding: '0.3rem', borderRadius: '6px', fontSize: '0.78rem' }}>
                            <option value="Rising">🔴 Rising</option>
                            <option value="Stable">🟡 Stable</option>
                          </select>
                        ) : (
                          <span style={{ fontSize: '0.75rem', fontWeight: 800, padding: '0.2rem 0.6rem', borderRadius: '12px', background: isRising ? '#fee2e2' : '#fef3c7', color: isRising ? '#dc2626' : '#d97706', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                            {isRising ? '🔴 Rising Priority' : '🟡 Stable Baseline'}
                          </span>
                        )}
                      </td>

                      <td style={{ padding: '0.75rem 1rem', color: '#334155', maxWidth: '380px' }}>
                        {isEditing ? (
                          <textarea value={editNote} onChange={e => setEditNote(e.target.value)} rows={2} style={{ width: '100%', padding: '0.4rem', fontSize: '0.78rem', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                        ) : (
                          sig.future_readiness_note || 'Standard institutional competency requirement.'
                        )}
                      </td>

                      <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                        {isEditing ? (
                          <button onClick={() => saveEdit(sig.code)} style={{ background: '#16a34a', color: 'white', border: 'none', borderRadius: '6px', padding: '0.35rem 0.75rem', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                            <Save size={12} /> Save
                          </button>
                        ) : (
                          <button onClick={() => startEdit(sig)} style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '0.35rem 0.75rem', fontSize: '0.75rem', fontWeight: 600, color: NAVY, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                            <Edit3 size={12} /> Edit
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); }}`}</style>
    </div>
  );
}
