import React, { useEffect, useState, useRef } from 'react';
import { fetchReferenceMaterials, uploadReferenceMaterialFile, fetchMaterialDetails } from '../../services/api';
import { FileText, Upload, RefreshCw, BookOpen, CheckCircle, FilePlus, Loader, Eye, X, HelpCircle, Layers } from 'lucide-react';

const NAVY = '#1a3a6b';
const ORANGE = '#e8720a';

export default function ReferenceMaterialsPage() {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState(null);
  const [roleCode, setRoleCode] = useState('JSO');
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const fileInputRef = useRef(null);

  // Inspection modal state
  const [activeMaterial, setActiveMaterial] = useState(null);
  const [inspecting, setInspecting] = useState(false);
  const [materialDetails, setMaterialDetails] = useState(null);
  const [activeTab, setActiveTab] = useState('chunks'); // 'chunks' | 'questions'

  const loadMaterials = async () => {
    setLoading(true);
    try {
      const data = await fetchReferenceMaterials();
      setMaterials(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMaterials();
  }, []);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setErrorMsg('');
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setErrorMsg('Please select a physical file (PDF, DOCX, or TXT) to upload.');
      return;
    }

    setUploading(true);
    setErrorMsg('');
    setMsg('');

    try {
      const res = await uploadReferenceMaterialFile(selectedFile, roleCode);
      setMsg(res.message || `Successfully uploaded baseline reference document '${selectedFile.name}'!`);
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      setTimeout(() => setMsg(''), 4000);
      await loadMaterials();
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to upload file. Please ensure it is a valid document.');
    } finally {
      setUploading(false);
    }
  };

  const handleInspectMaterial = async (mat) => {
    setActiveMaterial(mat);
    setInspecting(true);
    setMaterialDetails(null);
    try {
      const res = await fetchMaterialDetails(mat.id);
      setMaterialDetails(res);
    } catch (e) {
      console.error(e);
    } finally {
      setInspecting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '1200px', margin: '0 auto', padding: '0.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid #e5e7eb', paddingBottom: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <FileText size={28} color={NAVY} />
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: NAVY, margin: 0 }}>Reference Material & Course Management</h1>
          </div>
          <p style={{ fontSize: '0.85rem', color: '#4b5563', marginTop: '0.3rem' }}>
            Upload baseline reference documents (PDF/DOCX/TXT) per role or course content used for RAG diagnostic & post-course assessment question generation.
          </p>
        </div>
        <button
          onClick={loadMaterials}
          disabled={loading}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.55rem 1.1rem',
            background: NAVY, color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer',
            fontSize: '0.85rem', fontWeight: 600, opacity: loading ? 0.6 : 1, transition: 'background 0.2s',
          }}
        >
          <RefreshCw size={16} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
          Refresh List
        </button>
      </div>

      {msg && (
        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#15803d', padding: '0.75rem 1rem', borderRadius: '10px', fontSize: '0.85rem', fontWeight: 700 }}>
          {msg}
        </div>
      )}

      {errorMsg && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '0.75rem 1rem', borderRadius: '10px', fontSize: '0.85rem', fontWeight: 700 }}>
          {errorMsg}
        </div>
      )}

      {/* Upload Box */}
      <div style={{ background: 'white', borderRadius: '14px', border: '1px solid #e5e7eb', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 700, color: NAVY, margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Upload size={18} color={ORANGE} /> Upload Baseline Reference Document File
        </h2>

        <form onSubmit={handleUploadSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
            <div style={{ flex: 1, minWidth: '280px' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#374151', marginBottom: '0.4rem' }}>
                Select Document File (PDF, DOCX, TXT)
              </label>
              <div style={{ border: '2px dashed #cbd5e1', borderRadius: '10px', padding: '1rem', textAlign: 'center', background: '#f8fafc', cursor: 'pointer' }} onClick={() => fileInputRef.current?.click()}>
                <FilePlus size={28} color={NAVY} style={{ margin: '0 auto 0.4rem auto', display: 'block' }} />
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: NAVY }}>
                  {selectedFile ? selectedFile.name : 'Click to select a file from your computer'}
                </div>
                <div style={{ fontSize: '0.72rem', color: '#6b7280', marginTop: '0.2rem' }}>
                  {selectedFile ? `${(selectedFile.size / 1024).toFixed(1)} KB` : 'Supports .pdf, .docx, .txt documents'}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.docx,.doc,.txt"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />
              </div>
            </div>

            <div style={{ width: '220px' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#374151', marginBottom: '0.4rem' }}>
                Target Cadre Role
              </label>
              <select
                value={roleCode}
                onChange={e => setRoleCode(e.target.value)}
                style={{ width: '100%', padding: '0.65rem 0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem', background: 'white' }}
              >
                <option value="JSO">Junior Statistical Officer (JSO)</option>
                <option value="SSO">Senior Statistical Officer (SSO)</option>
                <option value="MCTP-II">Mid-Career Training II (MCTP-II)</option>
                <option value="MCTP-III">Mid-Career Training III (MCTP-III)</option>
              </select>
              <span style={{ fontSize: '0.7rem', color: '#6b7280', marginTop: '0.3rem', display: 'block' }}>
                Links material as provenance for pre-assessment RAG generator.
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="submit"
              disabled={uploading || !selectedFile}
              style={{
                padding: '0.65rem 1.5rem', background: NAVY, color: 'white', border: 'none',
                borderRadius: '8px', fontWeight: 700, fontSize: '0.85rem', cursor: (uploading || !selectedFile) ? 'not-allowed' : 'pointer',
                opacity: (uploading || !selectedFile) ? 0.6 : 1, display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              }}
            >
              {uploading ? (
                <><Loader size={16} style={{ animation: 'spin 1s linear infinite' }} /> Uploading & Chunking Document...</>
              ) : (
                <><Upload size={16} /> Upload Reference Document</>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Materials List */}
      <div style={{ background: 'white', borderRadius: '14px', border: '1px solid #e5e7eb', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', overflow: 'hidden' }}>
        <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #e5e7eb', background: '#f9fafb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#1f2937', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <BookOpen size={18} color={NAVY} /> Registered Materials Library
          </h2>
          <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>Provenanced source material for AI assessment generation</span>
        </div>

        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#6b7280' }}>Loading materials library...</div>
        ) : materials.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#6b7280' }}>No reference materials registered yet.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ background: '#f3f4f6', color: '#374151', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  <th style={{ padding: '0.75rem 1.25rem' }}>Filename</th>
                  <th style={{ padding: '0.75rem 1.25rem' }}>Context</th>
                  <th style={{ padding: '0.75rem 1.25rem' }}>Uploaded By</th>
                  <th style={{ padding: '0.75rem 1.25rem' }}>Registered At</th>
                  <th style={{ padding: '0.75rem 1.25rem', textAlign: 'center' }}>Inspect Chunks & MCQs</th>
                </tr>
              </thead>
              <tbody>
                {materials.map((m) => (
                  <tr key={m.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '1rem 1.25rem', fontWeight: 700, color: '#111827' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <FileText size={16} color={NAVY} /> {m.filename}
                      </div>
                    </td>
                    <td style={{ padding: '1rem 1.25rem' }}>
                      <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '0.15rem 0.5rem', borderRadius: '4px', background: m.context === 'role_baseline' ? '#eef2fb' : '#f3f4f6', color: NAVY }}>
                        {m.context === 'role_baseline' ? 'Role Baseline Reference' : (m.context === 'course_linked' ? 'Course Linked Material' : 'Standalone Upload')}
                      </span>
                    </td>
                    <td style={{ padding: '1rem 1.25rem', color: '#4b5563', fontSize: '0.8rem' }}>{m.uploaded_by || 'Admin'}</td>
                    <td style={{ padding: '1rem 1.25rem', color: '#6b7280', fontSize: '0.8rem' }}>
                      {m.uploaded_at ? new Date(m.uploaded_at).toLocaleString() : 'N/A'}
                    </td>
                    <td style={{ padding: '1rem 1.25rem', textAlign: 'center' }}>
                      <button
                        onClick={() => handleInspectMaterial(m)}
                        style={{
                          fontSize: '0.75rem', fontWeight: 700, color: NAVY, background: '#eef2fb',
                          border: '1px solid #c7d2fe', padding: '0.3rem 0.75rem', borderRadius: '6px', cursor: 'pointer',
                          display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                        }}
                      >
                        <Eye size={13} /> View Chunks & MCQs
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Inspection Modal ── */}
      {activeMaterial && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ background: 'white', borderRadius: '16px', width: '100%', maxWidth: '850px', maxHeight: '85vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            
            {/* Modal Header */}
            <div style={{ padding: '1.25rem 1.5rem', background: NAVY, color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <FileText size={18} /> {activeMaterial.filename}
                </div>
                <div style={{ fontSize: '0.75rem', opacity: 0.8, marginTop: '0.15rem' }}>Document Chunks & Baseline Question Provenance</div>
              </div>
              <button onClick={() => setActiveMaterial(null)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>
                <X size={22} />
              </button>
            </div>

            {/* Tabs Bar */}
            <div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb', background: '#f8fafc', padding: '0 1.5rem' }}>
              <button
                onClick={() => setActiveTab('chunks')}
                style={{
                  padding: '0.75rem 1.25rem', border: 'none', background: 'none', cursor: 'pointer',
                  fontWeight: 700, fontSize: '0.85rem', color: activeTab === 'chunks' ? NAVY : '#6b7280',
                  borderBottom: activeTab === 'chunks' ? `3px solid ${NAVY}` : '3px solid transparent',
                  display: 'flex', alignItems: 'center', gap: '0.4rem',
                }}
              >
                <Layers size={16} /> Extracted Text Chunks ({materialDetails?.chunks_count || 0})
              </button>

              <button
                onClick={() => setActiveTab('questions')}
                style={{
                  padding: '0.75rem 1.25rem', border: 'none', background: 'none', cursor: 'pointer',
                  fontWeight: 700, fontSize: '0.85rem', color: activeTab === 'questions' ? NAVY : '#6b7280',
                  borderBottom: activeTab === 'questions' ? `3px solid ${NAVY}` : '3px solid transparent',
                  display: 'flex', alignItems: 'center', gap: '0.4rem',
                }}
              >
                <HelpCircle size={16} /> Generated Baseline Questions ({materialDetails?.generated_questions?.length || 0})
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1 }}>
              {inspecting ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>
                  <Loader size={32} color={NAVY} style={{ animation: 'spin 1s linear infinite', marginBottom: '0.5rem' }} />
                  <div>Extracting document text chunks and generating baseline questions...</div>
                </div>
              ) : activeTab === 'chunks' ? (
                /* Chunks View */
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {!materialDetails?.chunks || materialDetails.chunks.length === 0 ? (
                    <div style={{ textAlign: 'center', color: '#6b7280', padding: '2rem' }}>No text chunks extracted from this file.</div>
                  ) : (
                    materialDetails.chunks.map((c) => (
                      <div key={c.chunk_number} style={{ background: '#f8fafc', borderRadius: '10px', padding: '1rem', border: '1px solid #e2e8f0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: 800, color: NAVY, background: '#e0e7ff', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
                            Chunk #{c.chunk_number}
                          </span>
                          <span style={{ fontSize: '0.72rem', color: '#6b7280' }}>{c.character_count} chars</span>
                        </div>
                        <p style={{ fontSize: '0.82rem', color: '#334155', margin: 0, lineHeight: 1.5, fontFamily: 'monospace' }}>
                          "{c.text}"
                        </p>
                      </div>
                    ))
                  )}
                </div>
              ) : (
                /* Questions View */
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  {!materialDetails?.generated_questions || materialDetails.generated_questions.length === 0 ? (
                    <div style={{ textAlign: 'center', color: '#6b7280', padding: '2rem' }}>No questions generated from file chunks.</div>
                  ) : (
                    materialDetails.generated_questions.map((q, idx) => (
                      <div key={idx} style={{ background: '#f9fafb', borderRadius: '12px', padding: '1.25rem', border: '1px solid #e5e7eb' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.5rem' }}>
                          <div style={{ fontWeight: 700, color: '#111827', fontSize: '0.9rem' }}>
                            Q{idx + 1}. {q.question_text}
                          </div>
                          <span style={{ fontSize: '0.7rem', fontWeight: 800, color: NAVY, background: '#eef2fb', padding: '0.15rem 0.55rem', borderRadius: '4px', whiteSpace: 'nowrap' }}>
                            {q.source_excerpt_ref || 'Source Chunk'}
                          </span>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', margin: '0.75rem 0' }}>
                          {(q.options || []).map((opt) => {
                            const isCorrect = opt.id === q.correct_option_id;
                            return (
                              <div
                                key={opt.id}
                                style={{
                                  padding: '0.5rem 0.75rem', borderRadius: '6px', fontSize: '0.8rem',
                                  background: isCorrect ? '#dcfce7' : 'white',
                                  border: isCorrect ? '1px solid #86efac' : '1px solid #cbd5e1',
                                  color: isCorrect ? '#166534' : '#374151',
                                  fontWeight: isCorrect ? 700 : 400,
                                }}
                              >
                                <strong>({opt.id.toUpperCase()})</strong> {opt.text}
                              </div>
                            );
                          })}
                        </div>

                        {q.explanation && (
                          <div style={{ fontSize: '0.78rem', color: '#4b5563', background: '#f3f4f6', padding: '0.5rem 0.75rem', borderRadius: '6px' }}>
                            <strong>Source Explanation:</strong> {q.explanation}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div style={{ padding: '1rem 1.5rem', background: '#f8fafc', borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={() => setActiveMaterial(null)} style={{ background: NAVY, color: 'white', border: 'none', padding: '0.55rem 1.25rem', borderRadius: '8px', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}>
                Close Preview
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
