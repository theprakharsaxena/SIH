import React, { useState, useEffect } from 'react';
import {
  Sparkles, TrendingUp, ShieldCheck, AlertCircle, FileText, CheckCircle2,
  Loader, RefreshCw, Edit3, Save, Info
} from 'lucide-react';
import {
  fetchFutureReadinessSignals,
  updateFutureReadinessSignal,
  suggestFutureReadinessSignal
} from '../../services/api';

const NAVY = '#1a3a6b';
const ORANGE = '#d97706';

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
      setMessage(`Approved and updated signal for ${code}`);
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
    <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
      {/* Title */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.35rem', fontWeight: 800, color: NAVY, letterSpacing: '-0.02em', margin: 0 }}>
          Institutional Future-Readiness Signals
        </h1>
        <p style={{ fontSize: '0.825rem', color: '#64748b', marginTop: '0.25rem' }}>
          Curate priority trend signals from official MoSPI policy, NSSTA syllabus updates, and gazette notices.
        </p>
      </div>

      {message && (
        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#15803d', padding: '0.75rem 1rem', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CheckCircle2 size={16} /> {message}
        </div>
      )}

      {/* ── Section 1: Signal Assistant Panel ── */}
      <div style={{ background: 'white', borderRadius: '10px', padding: '1.5rem', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '6px', background: '#f5f3ff', border: '1px solid #ddd6fe', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Sparkles size={18} color="#7c3aed" />
          </div>
          <div>
            <div style={{ fontWeight: 800, color: NAVY, fontSize: '0.95rem' }}>
              Institutional Document Signal Assistant
            </div>
            <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
              Paste a policy document or syllabus excerpt to extract touched competencies and draft trend notes for executive approval.
            </div>
          </div>
        </div>

        <textarea
          value={documentText}
          onChange={e => setDocumentText(e.target.value)}
          rows={4}
          placeholder={`Paste text excerpt here...\nExample: "MoSPI strategy document 2025 emphasizes mandatory GIS mapping modules for all statistical cadres and integration of Data Privacy safeguards under DPDP Act 2023..."`}
          style={{ width: '100%', padding: '0.75rem 0.85rem', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.825rem', fontFamily: 'inherit', resize: 'vertical', outline: 'none', boxSizing: 'border-box', marginTop: '0.75rem', marginBottom: '0.75rem' }}
        />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
            Suggested signals require administrator approval before updating workforce targets.
          </span>
          <button
            onClick={handleRunAiAssistant}
            disabled={extracting || !documentText.trim()}
            className="btn-accent"
          >
            {extracting ? <><Loader size={14} className="spin" /> Processing Document...</> : <><Sparkles size={14} /> Analyze & Draft Signals</>}
          </button>
        </div>

        {/* Suggestions Results */}
        {aiSuggestions && (
          <div style={{ marginTop: '1.25rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1.25rem' }}>
            <div style={{ fontWeight: 700, color: NAVY, fontSize: '0.875rem', marginBottom: '0.4rem' }}>
              Extraction Summary:
            </div>
            <div style={{ fontSize: '0.82rem', color: '#475569', marginBottom: '1rem', lineHeight: 1.5 }}>
              {aiSuggestions.document_summary || 'Extracted competency trend signals from source text.'}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {(aiSuggestions.suggested_signals || []).map((sig, idx) => (
                <div key={idx} style={{ background: 'white', borderRadius: '6px', padding: '0.85rem 1rem', border: '1px solid #cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                      <span style={{ fontSize: '0.72rem', fontWeight: 800, color: NAVY, background: '#e2e8f0', padding: '0.15rem 0.5rem', borderRadius: '4px', fontFamily: 'monospace' }}>{sig.competency_code}</span>
                      <span style={{ fontWeight: 700, color: NAVY, fontSize: '0.875rem' }}>{sig.competency_name}</span>
                      <span className="badge badge-amber">
                        Tag: {sig.suggested_tag} ({sig.confidence} Confidence)
                      </span>
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#475569', lineHeight: 1.4 }}>
                      <strong>Sourced Note:</strong> {sig.reason_note}
                    </div>
                  </div>

                  <button
                    onClick={() => handleApproveSignal(sig.competency_code, sig.suggested_tag, sig.reason_note)}
                    disabled={savingCode === sig.competency_code}
                    className="btn-primary"
                    style={{ padding: '0.4rem 0.85rem', fontSize: '0.78rem' }}
                  >
                    {savingCode === sig.competency_code ? <Loader size={12} className="spin" /> : <CheckCircle2 size={13} />}
                    Approve & Save
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Section 2: Management Table of Sourced Signals ── */}
      <div className="data-table-container">
        <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: NAVY }}>Institutional Signals Repository</h3>
            <p style={{ fontSize: '0.775rem', color: '#64748b' }}>Manage Rising vs Stable competency priorities and audit justification notes</p>
          </div>
          <button onClick={loadSignals} className="btn-outline" style={{ padding: '0.4rem 0.75rem', fontSize: '0.78rem' }}>
            <RefreshCw size={13} /> Refresh
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
            <Loader size={32} className="spin" style={{ marginBottom: '0.5rem', color: NAVY }} />
            <div>Loading signals...</div>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Competency</th>
                <th>Category</th>
                <th>Tag Status</th>
                <th>Sourced Justification Note</th>
                <th style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {signals.map(sig => {
                const isEditing = editingCode === sig.code;
                const isRising = sig.future_readiness_tag === 'Rising';

                return (
                  <tr key={sig.code}>
                    <td style={{ fontWeight: 700, color: NAVY, fontFamily: 'monospace', fontSize: '0.825rem' }}>{sig.code}</td>
                    <td style={{ fontWeight: 600, color: '#1e293b' }}>{sig.name}</td>
                    <td style={{ color: '#64748b', fontSize: '0.8rem' }}>{sig.domain_category || 'Domain'}</td>

                    <td>
                      {isEditing ? (
                        <select value={editTag} onChange={e => setEditTag(e.target.value)} style={{ padding: '0.3rem', borderRadius: '4px', fontSize: '0.78rem', border: '1px solid #cbd5e1' }}>
                          <option value="Rising">Rising Priority</option>
                          <option value="Stable">Stable Baseline</option>
                        </select>
                      ) : (
                        <span className={isRising ? 'badge badge-red' : 'badge badge-slate'}>
                          {isRising ? 'Rising Priority' : 'Stable Baseline'}
                        </span>
                      )}
                    </td>

                    <td style={{ color: '#334155', maxWidth: '380px', fontSize: '0.825rem' }}>
                      {isEditing ? (
                        <textarea value={editNote} onChange={e => setEditNote(e.target.value)} rows={2} style={{ width: '100%', padding: '0.4rem', fontSize: '0.78rem', borderRadius: '4px', border: '1px solid #cbd5e1' }} />
                      ) : (
                        sig.future_readiness_note || 'Standard institutional competency requirement.'
                      )}
                    </td>

                    <td style={{ textAlign: 'right' }}>
                      {isEditing ? (
                        <button onClick={() => saveEdit(sig.code)} className="btn-primary" style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}>
                          <Save size={12} /> Save
                        </button>
                      ) : (
                        <button onClick={() => startEdit(sig)} className="btn-outline" style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}>
                          <Edit3 size={12} /> Edit
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); }}`}</style>
    </div>
  );
}
