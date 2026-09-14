import React from 'react';
import { ShieldCheck, Cpu, Database, Lock, Server, Layers, Award, FileCode, CheckCircle2, ArrowRight } from 'lucide-react';

const NAVY = '#14343b';
const TERRACOTTA = '#c4713d';

export default function ArchitecturePage() {
  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0.5rem 0' }}>
      {/* Banner */}
      <div style={{
        background: `linear-gradient(135deg, ${NAVY} 0%, #1e4d56 100%)`,
        borderRadius: '16px', padding: '2rem 2.5rem', color: 'white', marginBottom: '2rem',
        boxShadow: '0 4px 20px rgba(20, 52, 59, 0.15)', border: '1px solid rgba(255,255,255,0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
          <span style={{ background: TERRACOTTA, color: 'white', padding: '0.2rem 0.65rem', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Official Governance Architecture
          </span>
          <span style={{ background: 'rgba(255,255,255,0.15)', color: '#93c5fd', padding: '0.2rem 0.65rem', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 700 }}>
            DPDP Act 2023 & MoSPI Framework Compliant
          </span>
        </div>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, margin: '0.5rem 0', letterSpacing: '-0.02em', color: 'white' }}>
          SankhyaSetu System & AI Governance Layer
        </h1>
        <p style={{ color: '#cbd5e1', fontSize: '0.95rem', maxWidth: '800px', lineHeight: 1.5 }}>
          An institutional AI competency intelligence architecture sitting above the national learning ecosystem (iGOT Karmayogi Bharat & NSSTA Greater Noida). Designed for official statistical officers across ISS, SSS, and State DES cadres.
        </p>
      </div>

      {/* Architecture Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        
        {/* Card 1 */}
        <div style={{ background: 'white', borderRadius: '14px', padding: '1.5rem', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <div style={{ width: '40px', height: '40px', background: 'rgba(196, 113, 61, 0.1)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Cpu size={22} color={TERRACOTTA} />
            </div>
            <div>
              <h3 style={{ margin: 0, color: NAVY, fontSize: '1.05rem', fontWeight: 700 }}>AI Competency Pipeline</h3>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Deterministic + Generative Dual Layer</span>
            </div>
          </div>
          <ul style={{ margin: 0, paddingLeft: '1.25rem', color: '#334155', fontSize: '0.875rem', lineHeight: 1.7 }}>
            <li>Role-aware competency selection & dynamic self-vs-actual calibration</li>
            <li>Paragraph-aware chunking with numeric consistency verifiers</li>
            <li>Whitelisted Python AST statistical formula validator</li>
            <li>Passage-blind depth validator for generic question filtering</li>
          </ul>
        </div>

        {/* Card 2 */}
        <div style={{ background: 'white', borderRadius: '14px', padding: '1.5rem', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <div style={{ width: '40px', height: '40px', background: 'rgba(20, 52, 59, 0.1)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShieldCheck size={22} color={NAVY} />
            </div>
            <div>
              <h3 style={{ margin: 0, color: NAVY, fontSize: '1.05rem', fontWeight: 700 }}>Security & DPDP Compliance</h3>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Government Data Privacy Standards</span>
            </div>
          </div>
          <ul style={{ margin: 0, paddingLeft: '1.25rem', color: '#334155', fontSize: '0.875rem', lineHeight: 1.7 }}>
            <li>Digital Personal Data Protection (DPDP) Act 2023 compliant data boundaries</li>
            <li>Strict Role-Based Access Control (RBAC) between Officials & Admins</li>
            <li>Read-only officer dossier inspection for Department Heads</li>
            <li>Encrypted JWT authentication with zero third-party telemetry leak</li>
          </ul>
        </div>

        {/* Card 3 */}
        <div style={{ background: 'white', borderRadius: '14px', padding: '1.5rem', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <div style={{ width: '40px', height: '40px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Layers size={22} color="#10b981" />
            </div>
            <div>
              <h3 style={{ margin: 0, color: NAVY, fontSize: '1.05rem', fontWeight: 700 }}>iGOT & NSSTA Integration</h3>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>National Capacity Building Network</span>
            </div>
          </div>
          <ul style={{ margin: 0, paddingLeft: '1.25rem', color: '#334155', fontSize: '0.875rem', lineHeight: 1.7 }}>
            <li>Deep-link recommendation engine to verified iGOT Karmayogi modules</li>
            <li>Direct linkage to NSSTA Greater Noida capacity building programmes</li>
            <li>Explainable AI recommendation rationales matching official mandates</li>
            <li>Post-learning PDF handbook upload with concept extraction quizzes</li>
          </ul>
        </div>

      </div>

      {/* Pipeline Diagram Box */}
      <div style={{ background: 'white', borderRadius: '16px', padding: '1.75rem', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)', marginBottom: '2rem' }}>
        <h3 style={{ margin: '0 0 1rem 0', color: NAVY, fontSize: '1.1rem', fontWeight: 800 }}>
          End-to-End Competency Intelligence Lifecycle Flow
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem', textAlign: 'center' }}>
          {[
            { step: '1', title: 'Officer Profile', desc: 'Cadre & Assignment' },
            { step: '2', title: 'AI Competencies', desc: 'Target Levels' },
            { step: '3', title: 'Adaptive Test', desc: 'Operational Scenario' },
            { step: '4', title: 'Demonstrated Level', desc: 'Self vs Actual' },
            { step: '5', title: 'Skill Gap & Risk', desc: 'Operational Impact' },
            { step: '6', title: 'Roadmap & Hours', desc: 'Priority Scoring' },
            { step: '7', title: 'iGOT / NSSTA', desc: 'Official Deep Link' },
            { step: '8', title: 'Evaluation Quiz', desc: 'Document Grounded' }
          ].map((item, idx) => (
            <div key={idx} style={{ background: '#f8fafc', padding: '0.85rem 0.5rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <div style={{ width: '26px', height: '26px', background: TERRACOTTA, color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.4rem', fontWeight: 800, fontSize: '0.75rem' }}>
                {item.step}
              </div>
              <div style={{ fontWeight: 700, color: NAVY, fontSize: '0.78rem', lineHeight: 1.2 }}>{item.title}</div>
              <div style={{ fontSize: '0.68rem', color: '#64748b', marginTop: '0.2rem' }}>{item.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
