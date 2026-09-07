import React from 'react';
import {
  BrainCircuit, BookOpen, BarChart3, Award, Users,
  BookMarked, TrendingUp, ArrowRight, CheckCircle, Sparkles,
  GraduationCap, Target, Lightbulb, FileText
} from 'lucide-react';

const NAVY = '#1a3a6b';
const ORANGE = '#e8720a';

function StatBox({ number, label, icon: Icon, color = NAVY }) {
  return (
    <div style={{ flex: 1, textAlign: 'center', padding: '1rem', borderRight: '1px solid rgba(255,255,255,0.15)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
        <Icon style={{ width: '18px', height: '18px', color: '#f59e0b' }} />
        <span style={{ fontSize: '1.6rem', fontWeight: 800, color: 'white', fontFamily: 'Poppins, sans-serif' }}>{number}</span>
      </div>
      <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.75)', fontWeight: 500 }}>{label}</div>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, desc, color = '#eef2fb', iconBg = NAVY }) {
  return (
    <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(26,58,107,0.2)' }}>
        <Icon style={{ width: '24px', height: '24px', color: 'white' }} />
      </div>
      <div>
        <div style={{ fontWeight: 700, color: NAVY, fontSize: '1rem', fontFamily: 'Poppins, sans-serif', marginBottom: '0.35rem' }}>{title}</div>
        <div style={{ fontSize: '0.85rem', color: '#6b7280', lineHeight: 1.6 }}>{desc}</div>
      </div>
    </div>
  );
}

function StepCard({ num, title, desc }) {
  return (
    <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
      <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: NAVY, color: 'white', fontWeight: 800, fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontFamily: 'Poppins, sans-serif' }}>
        {num}
      </div>
      <div>
        <div style={{ fontWeight: 700, color: NAVY, fontSize: '0.95rem', marginBottom: '0.25rem' }}>{title}</div>
        <div style={{ fontSize: '0.82rem', color: '#6b7280', lineHeight: 1.6 }}>{desc}</div>
      </div>
    </div>
  );
}

export default function HomePage({ stats, readinessData, onNavigate, selectedOfficer }) {
  const totalOfficers   = stats?.total_officers      ?? 4;
  const totalCourses    = stats?.total_courses       ?? 50;
  const totalComps      = stats?.total_competencies  ?? 35;
  const totalRoles      = stats?.total_roles         ?? 4;
  const readinessPct    = readinessData?.overall_workforce_readiness_pct ?? 0;

  return (
    <div>

      {/* ── HERO ── */}
      <section style={{ background: '#f5ead8', padding: '3rem 2rem 2.5rem' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', alignItems: 'center' }}>

          {/* Left */}
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: '#fff3e0', color: ORANGE, padding: '0.35rem 1rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 700, marginBottom: '1.25rem', border: '1px solid #ffe0b2' }}>
              <Sparkles style={{ width: '14px', height: '14px' }} />
              SIH 2026 · Problem Statement 26101
            </div>

            <h1 style={{ fontSize: '2.4rem', fontWeight: 800, color: NAVY, fontFamily: 'Poppins, sans-serif', lineHeight: 1.2, marginBottom: '1rem' }}>
              AI-Enabled Skill<br />
              <span style={{ color: ORANGE }}>Intelligence Platform</span><br />
              for MoSPI Officials
            </h1>

            <p style={{ fontSize: '1rem', color: '#4b5563', lineHeight: 1.7, marginBottom: '1.75rem', maxWidth: '520px' }}>
              India's first AI-powered competency gap analysis engine for statistical officials. 
              Integrated with <strong>iGOT Karmayogi</strong> and <strong>NSSTA</strong> to identify 
              skill gaps, recommend training, and track learning progress in real time.
            </p>

            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <button
                onClick={() => onNavigate('learner')}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: ORANGE, color: 'white', fontWeight: 700, padding: '0.75rem 1.75rem', borderRadius: '30px', border: 'none', cursor: 'pointer', fontSize: '0.95rem', boxShadow: '0 4px 14px rgba(232,114,10,0.35)', transition: 'all 0.2s' }}
              >
                View My Dashboard <ArrowRight style={{ width: '18px', height: '18px' }} />
              </button>
              <button
                onClick={() => onNavigate('mcq')}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'white', color: NAVY, fontWeight: 700, padding: '0.75rem 1.75rem', borderRadius: '30px', border: `2px solid ${NAVY}`, cursor: 'pointer', fontSize: '0.95rem', transition: 'all 0.2s' }}
              >
                Take Assessment <Award style={{ width: '18px', height: '18px' }} />
              </button>
            </div>

            {selectedOfficer && (
              <div style={{ marginTop: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.85rem', color: '#4b5563' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: NAVY, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 700 }}>
                  {selectedOfficer.full_name.charAt(0)}
                </div>
                <span>Logged in as <strong>{selectedOfficer.full_name}</strong> · {selectedOfficer.role_code} · {selectedOfficer.department}</span>
              </div>
            )}
          </div>

          {/* Right: Quick stats card */}
          <div>
            <div style={{ background: 'white', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 12px 40px rgba(26,58,107,0.12)', border: '1px solid #e5e7eb' }}>
              <div style={{ background: NAVY, padding: '1.25rem 1.5rem', color: 'white' }}>
                <div style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '1.1rem' }}>Platform at a Glance</div>
                <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)', marginTop: '0.2rem' }}>Live data from your MoSPI workspace</div>
              </div>

              <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {[
                  { label: 'Statistical Officials', value: totalOfficers, icon: Users, color: NAVY },
                  { label: 'Domain Competencies Tracked', value: totalComps, icon: Target, color: '#7c3aed' },
                  { label: 'Courses (iGOT + NSSTA)', value: totalCourses, icon: BookOpen, color: '#0891b2' },
                  { label: 'MoSPI Roles Covered', value: totalRoles, icon: GraduationCap, color: ORANGE },
                ].map(item => (
                  <div key={item.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem', background: '#f9fafb', borderRadius: '10px', border: '1px solid #f3f4f6' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: item.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <item.icon style={{ width: '18px', height: '18px', color: 'white' }} />
                      </div>
                      <span style={{ fontSize: '0.875rem', color: '#4b5563', fontWeight: 500 }}>{item.label}</span>
                    </div>
                    <span style={{ fontSize: '1.5rem', fontWeight: 800, color: NAVY, fontFamily: 'Poppins, sans-serif' }}>{item.value}</span>
                  </div>
                ))}

                {/* Workforce readiness meter */}
                <div style={{ padding: '0.75rem 1rem', background: '#eef2fb', borderRadius: '10px', border: `1px solid #c7d7f0` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.82rem', fontWeight: 700, color: NAVY }}>Workforce Readiness Index</span>
                    <span style={{ fontSize: '1.1rem', fontWeight: 800, color: ORANGE, fontFamily: 'Poppins, sans-serif' }}>{readinessPct.toFixed(1)}%</span>
                  </div>
                  <div style={{ height: '8px', background: '#c7d7f0', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${readinessPct}%`, height: '100%', background: `linear-gradient(90deg, ${NAVY}, #2451a3)`, borderRadius: '4px', transition: 'width 0.8s ease' }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── NAVY STATS BAR ── */}
      <div style={{ background: NAVY }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'stretch', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            <StatBox number="35" label="PS-Mandated Competencies" icon={Target} />
            <StatBox number="50"  label="iGOT + NSSTA Courses"   icon={BookOpen} />
            <StatBox number="4"   label="MoSPI Service Roles"     icon={GraduationCap} />
            <StatBox number="140" label="Role-Competency Links"   icon={TrendingUp} />
            <StatBox number="AI"  label="Powered Gap Analysis"    icon={BrainCircuit} />
          </div>
        </div>
      </div>

      {/* ── HOW IT WORKS ── */}
      <section style={{ padding: '3rem 2rem', background: 'white' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: '#fff3e0', color: ORANGE, padding: '0.3rem 1rem', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 700, marginBottom: '0.75rem' }}>
              <Lightbulb style={{ width: '13px', height: '13px' }} />
              Simple 3-Step Process
            </div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: NAVY, fontFamily: 'Poppins, sans-serif', marginBottom: '0.5rem' }}>
              How It Works
            </h2>
            <p style={{ color: '#6b7280', fontSize: '0.9rem', maxWidth: '500px', margin: '0 auto' }}>
              Our AI engine turns your profile text into a personalised training roadmap in seconds
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem' }}>
            {[
              {
                num: 1,
                title: 'Upload Your Profile',
                desc: 'Paste your CV or service record. Our AI extracts years of experience, certifications, and training history automatically — no forms to fill.',
                icon: FileText,
                color: '#eef2fb',
              },
              {
                num: 2,
                title: 'AI Identifies Your Gaps',
                desc: 'We compare your actual skills against MoSPI role requirements using our 5-factor scoring engine. Every gap comes with a clear explanation of why it matters.',
                icon: Target,
                color: '#fff3e0',
              },
              {
                num: 3,
                title: 'Get Personalised Courses',
                desc: 'Receive ranked recommendations from iGOT Karmayogi and NSSTA training calendar, matched exactly to close your highest-priority gaps first.',
                icon: GraduationCap,
                color: '#f0fdf4',
              },
            ].map(step => (
              <div key={step.num} style={{ background: step.color, borderRadius: '16px', padding: '2rem', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: '1rem', right: '1rem', fontSize: '4rem', fontWeight: 900, color: 'rgba(26,58,107,0.06)', fontFamily: 'Poppins, sans-serif', lineHeight: 1 }}>{step.num}</div>
                <div style={{ width: '48px', height: '48px', background: NAVY, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                  <step.icon style={{ width: '24px', height: '24px', color: 'white' }} />
                </div>
                <div style={{ fontWeight: 700, color: NAVY, fontSize: '1.05rem', fontFamily: 'Poppins, sans-serif', marginBottom: '0.5rem' }}>{step.title}</div>
                <div style={{ fontSize: '0.855rem', color: '#4b5563', lineHeight: 1.7 }}>{step.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── KEY FEATURES ── */}
      <section style={{ padding: '3rem 2rem', background: '#f5ead8' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: NAVY, fontFamily: 'Poppins, sans-serif', marginBottom: '0.4rem' }}>
              Platform Features
            </h2>
            <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>Everything your statistical workforce needs to upskill effectively</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem' }}>
            <FeatureCard
              icon={BrainCircuit}
              title="AI Gap Analysis"
              desc="Deterministic 5-factor scoring across all 35 MoSPI competency domains with full audit trail."
              iconBg={NAVY}
            />
            <FeatureCard
              icon={BookOpen}
              title="iGOT Integration"
              desc="Courses matched from iGOT Karmayogi and NSSTA Training Calendar with relevance scoring."
              iconBg="#0891b2"
            />
            <FeatureCard
              icon={Award}
              title="MCQ Assessment"
              desc="Upload PDF materials and generate adaptive MCQs. Scores update your competency profile instantly."
              iconBg={ORANGE}
            />
            <FeatureCard
              icon={BarChart3}
              title="Workforce Analytics"
              desc="Org-level heatmaps, readiness indices, and target-role simulations for HR managers."
              iconBg="#7c3aed"
            />
          </div>
        </div>
      </section>

      {/* ── COMPETENCY DOMAINS ── */}
      <section style={{ padding: '3rem 2rem', background: 'white' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: NAVY, fontFamily: 'Poppins, sans-serif', marginBottom: '0.4rem' }}>
            Competency Framework
          </h2>
          <p style={{ color: '#6b7280', fontSize: '0.9rem', marginBottom: '2rem' }}>
            35 competencies across 4 domains, grounded in the PS-mandated MoSPI skill framework
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem' }}>
            {[
              { label: 'Statistical', count: 12, codes: 'OS-01 to OS-12', color: NAVY, desc: 'Survey Design, Sampling, GDP, Price Stats, SDGs, Data Quality…' },
              { label: 'Technical',   count: 12, codes: 'TC-01 to TC-12', color: '#0891b2', desc: 'Python, R, SQL, GIS, AI/ML, Cloud, APIs, Data Visualization…' },
              { label: 'Digital Governance', count: 5, codes: 'DG-01 to DG-05', color: '#7c3aed', desc: 'Cybersecurity, Data Privacy, Digital Signatures, GovCloud, DPI…' },
              { label: 'Behavioural & Managerial', count: 6, codes: 'BM-01 to BM-06', color: ORANGE, desc: 'Leadership, Communication, Project Mgmt, Ethics, Decision Making…' },
            ].map(d => (
              <div key={d.label} style={{ borderRadius: '14px', overflow: 'hidden', border: '1px solid #e5e7eb', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                <div style={{ background: d.color, padding: '1rem 1.25rem', color: 'white' }}>
                  <div style={{ fontWeight: 800, fontSize: '2rem', fontFamily: 'Poppins, sans-serif', lineHeight: 1 }}>{d.count}</div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem', marginTop: '0.25rem' }}>{d.label}</div>
                  <div style={{ fontSize: '0.72rem', opacity: 0.8, marginTop: '0.1rem' }}>{d.codes}</div>
                </div>
                <div style={{ background: 'white', padding: '1rem 1.25rem', fontSize: '0.8rem', color: '#4b5563', lineHeight: 1.6 }}>
                  {d.desc}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ padding: '3.5rem 2rem', background: NAVY }}>
        <div style={{ maxWidth: '700px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'white', fontFamily: 'Poppins, sans-serif', marginBottom: '0.75rem' }}>
            Ready to close your skill gaps?
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '1rem', marginBottom: '2rem', lineHeight: 1.7 }}>
            Start with your personalized dashboard to see exactly where you stand across all 35 MoSPI competencies.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => onNavigate('learner')}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: ORANGE, color: 'white', fontWeight: 700, padding: '0.85rem 2rem', borderRadius: '30px', border: 'none', cursor: 'pointer', fontSize: '1rem', boxShadow: '0 4px 16px rgba(232,114,10,0.5)' }}
            >
              My Learning Dashboard <ArrowRight style={{ width: '18px', height: '18px' }} />
            </button>
            <button
              onClick={() => onNavigate('admin')}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.12)', color: 'white', fontWeight: 700, padding: '0.85rem 2rem', borderRadius: '30px', border: '2px solid rgba(255,255,255,0.3)', cursor: 'pointer', fontSize: '1rem' }}
            >
              Workforce Analytics <BarChart3 style={{ width: '18px', height: '18px' }} />
            </button>
          </div>
        </div>
      </section>

    </div>
  );
}
