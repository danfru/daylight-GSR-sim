import { useState, useEffect } from 'react';
import impactLogo from '../assets/impact-logo-2d.png';

// ─── Content ──────────────────────────────────────────────────────────────────

const PROBLEMS = [
  {
    tag: 'DER-31 (Dec 2025)',
    text: 'The revised GSR directive introduced four compliance pillars — footprint, climate, equity, nature — with no consultant playbook for NY BCP projects.',
  },
  {
    tag: '6 NYCRR Part 375',
    text: 'New regulations took effect December 31, 2025. Most firms are still running on pre-revision workflows that don\'t map to the new structure.',
  },
  {
    tag: 'BCP Application Rev. Oct 2025',
    text: 'Questions 5 & 6 now require explicit GSR documentation. The old approach of narrative-only responses no longer satisfies DEC review.',
  },
  {
    tag: 'SiteWise™ Footprint',
    text: 'The EPA SiteWise™ tool is a spreadsheet-based Excel workbook. Every project starts from scratch, manual entry, no NY-specific calibration.',
  },
  {
    tag: 'CVA & RAWP Language',
    text: 'Climate Vulnerability Assessments and GSR RAWP sections are written from scratch every engagement — no reusable framework, high error rate.',
  },
];

const MODULES = [
  {
    num: '01', label: 'Project Intake', color: '#bd562d',
    desc: 'Set your program type, cleanup phase, and Track 1/2/3 classification. The app uses this to gate every downstream module.',
    howto: 'Start here. Every project needs an Intake record before using other modules.',
  },
  {
    num: '02', label: 'BMP Selector', color: '#185676',
    desc: '17 green and sustainable remediation BMPs. Select applicable practices and get pre-drafted RAWP language blocks.',
    howto: 'Pick BMPs that apply to your remediation approach. Copy the language blocks into your RAWP draft.',
  },
  {
    num: '03', label: 'SiteWise™ Calculator', color: '#ba8748',
    desc: 'Full SiteWise™ v3.2 lifecycle GHG calculator. 4 components, all input categories including wells, treatment chemicals, and electric pumps.',
    howto: 'Enter inputs by component (RI, RD, RA, O&M). Download results for your RAWP Appendix.',
  },
  {
    num: '04', label: 'Climate Screener', color: '#96a153',
    desc: 'Six-hazard Climate Vulnerability Assessment wizard aligned to DER-31 §4.4. Outputs a determination and required documentation.',
    howto: 'Run the CVA for every project. The determination ("not vulnerable" / "vulnerable") must appear in your RAWP.',
  },
  {
    num: '05', label: 'RAWP Builder', color: '#323e4c',
    desc: 'Assembles a compliant GSR section from your Intake, BMPs, SiteWise results, and CVA. Ready to paste into your report.',
    howto: 'Run this after completing modules 01–04. Review output carefully — it\'s a starting point, not a final document.',
  },
  {
    num: '06', label: 'FER Tracker', color: '#955d86',
    desc: 'Track planned vs. actual GSR metrics across project milestones for Final Engineering Report compliance.',
    howto: 'Use during RA/O&M phases. Compare against your RAWP commitments and document variances.',
  },
  {
    num: '07', label: 'Reference Library', color: '#7d8685',
    desc: 'Searchable index of DER-31, 6 NYCRR Part 375, SiteWise™ documentation, and BCP application guidance.',
    howto: 'Look up regulatory citations and source documents when drafting or reviewing.',
  },
];

const CHECKS = [
  'I understand this tool is designed for New York BCP projects under DER-31 (2025) and 6 NYCRR Part 375.',
  'I will start with Project Intake (Module 01) before using other modules — it drives downstream behavior.',
  'I understand SiteWise™ Calculator results are estimates based on EPA v3.2 emission factors and should be verified against the official EPA SiteWise™ tool for final submissions.',
  'I understand RAWP Builder output is a starting-point draft. All GSR language must be reviewed by a licensed professional engineer or environmental scientist before submission.',
  'I acknowledge this is a decision-support tool (v1.0) and does not replace regulatory guidance or DEC review.',
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function StepBar({ step, total }) {
  return (
    <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} style={{
          height: 3,
          width: i === step ? 28 : 14,
          borderRadius: 2,
          background: i <= step ? '#ffffff' : 'rgba(255,255,255,0.35)',
          transition: 'all 0.3s ease',
        }} />
      ))}
      <span style={{
        fontFamily: 'var(--ie-font-body)',
        fontSize: 12,
        fontWeight: 600,
        color: 'rgba(255,255,255,0.8)',
        marginLeft: 6,
        letterSpacing: '0.04em',
      }}>
        {step + 1} / {total}
      </span>
    </div>
  );
}

function NavBtn({ onClick, disabled, children, primary }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        fontFamily: 'var(--ie-font-display)',
        fontSize: 13,
        fontWeight: 700,
        color: disabled ? 'var(--ie-text-tertiary)' : primary ? '#ffffff' : 'var(--ie-accent)',
        background: primary
          ? (disabled ? 'var(--ie-border)' : 'var(--ie-accent)')
          : 'transparent',
        border: primary ? 'none' : '1px solid rgba(189, 86, 45, 0.35)',
        borderRadius: 6,
        padding: primary ? '11px 32px' : '10px 22px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
        transition: 'all 0.15s',
        opacity: disabled ? 0.6 : 1,
      }}
      onMouseEnter={e => {
        if (!disabled && primary) e.currentTarget.style.background = 'var(--ie-accent-hover)';
      }}
      onMouseLeave={e => {
        if (!disabled && primary) e.currentTarget.style.background = 'var(--ie-accent)';
      }}
    >
      {children}
    </button>
  );
}

// ─── Screens ──────────────────────────────────────────────────────────────────

function ScreenPurpose() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>

      {/* Hero */}
      <div style={{ textAlign: 'center', paddingTop: 8 }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
          <img src={impactLogo} alt="Impact Environmental" style={{ height: 60, width: 'auto' }} />
        </div>
        <div style={{
          fontFamily: 'var(--ie-font-display)',
          fontSize: 11,
          fontWeight: 700,
          color: 'var(--ie-accent)',
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          marginBottom: 10,
        }}>
          GSR Compliance Suite
        </div>
        <div style={{
          fontFamily: 'var(--ie-font-display)',
          fontSize: 26,
          fontWeight: 800,
          color: 'var(--ie-text-heading)',
          maxWidth: 640,
          margin: '0 auto',
          lineHeight: 1.25,
          marginBottom: 12,
        }}>
          The first purpose-built compliance tool for New York BCP Green &amp; Sustainable Remediation.
        </div>
        <div style={{
          fontFamily: 'var(--ie-font-body)',
          fontSize: 15,
          color: 'var(--ie-text-secondary)',
          maxWidth: 600,
          margin: '0 auto',
          lineHeight: 1.7,
        }}>
          DER-31 (revised December 2025) and 6&nbsp;NYCRR&nbsp;Part&nbsp;375 require every BCP Remedial
          Action Work Plan to include a GSR analysis — footprint calculation, climate vulnerability
          assessment, BMP selection, and compliant narrative language. This tool automates that workflow.
        </div>
      </div>

      {/* Four pillars */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
        {[
          { label: 'Remedial Footprint', sub: 'SiteWise™ GHG Calc',  color: '#bd562d' },
          { label: 'Climate Resilience', sub: '6-Hazard CVA',         color: '#96a153' },
          { label: 'Community Equity',   sub: 'EJ & Engagement',       color: '#185676' },
          { label: 'Natural Resources',  sub: 'BMP Selection',         color: '#ba8748' },
        ].map(p => (
          <div key={p.label} style={{
            background: 'var(--ie-card)',
            border: `1px solid var(--ie-border)`,
            borderTop: `3px solid ${p.color}`,
            borderRadius: 8,
            padding: '16px 14px',
            textAlign: 'center',
          }}>
            <div style={{
              fontFamily: 'var(--ie-font-display)',
              fontWeight: 700,
              fontSize: 13,
              color: 'var(--ie-text-heading)',
              marginBottom: 4,
            }}>{p.label}</div>
            <div style={{
              fontFamily: 'var(--ie-font-body)',
              fontSize: 11,
              fontWeight: 600,
              color: p.color,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
            }}>{p.sub}</div>
          </div>
        ))}
      </div>

      <div style={{
        display: 'flex',
        gap: 12,
        background: 'rgba(189, 86, 45, 0.05)',
        border: '1px solid rgba(189, 86, 45, 0.2)',
        borderLeft: '3px solid var(--ie-accent)',
        borderRadius: '0 6px 6px 0',
        padding: '14px 20px',
        alignItems: 'flex-start',
      }}>
        <span style={{ fontFamily: 'var(--ie-font-body)', color: 'var(--ie-accent)', fontSize: 14, flexShrink: 0, fontWeight: 700 }}>▸</span>
        <span style={{ fontFamily: 'var(--ie-font-body)', fontSize: 14, color: 'var(--ie-text-primary)', lineHeight: 1.6 }}>
          <strong>Built by impact environmental consultants, for environmental consultants.</strong>{' '}
          Every module, input field, and output is designed around the actual BCP workflow — not a generic sustainability framework.
        </span>
      </div>
    </div>
  );
}

function ScreenChallenge() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <div style={{
          fontFamily: 'var(--ie-font-body)',
          fontSize: 11,
          fontWeight: 700,
          color: 'var(--ie-accent)',
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          marginBottom: 8,
        }}>
          The Challenge
        </div>
        <div style={{
          fontFamily: 'var(--ie-font-display)',
          fontSize: 20,
          color: 'var(--ie-text-heading)',
          fontWeight: 700,
          lineHeight: 1.3,
          maxWidth: 700,
        }}>
          Why GSR compliance is difficult for BCP practitioners right now
        </div>
        <div style={{
          fontFamily: 'var(--ie-font-body)',
          fontSize: 14,
          color: 'var(--ie-text-secondary)',
          marginTop: 8,
          lineHeight: 1.6,
        }}>
          The December 2025 regulatory changes created a compliance gap. Here's what most firms are running into:
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {PROBLEMS.map((p, i) => (
          <div key={i} style={{
            display: 'flex',
            gap: 16,
            background: 'var(--ie-card)',
            border: '1px solid var(--ie-border)',
            borderLeft: '3px solid var(--ie-accent)',
            borderRadius: '0 6px 6px 0',
            padding: '14px 18px',
            alignItems: 'flex-start',
          }}>
            <div style={{
              fontFamily: 'var(--ie-font-mono)',
              fontSize: 10,
              color: 'var(--ie-accent)',
              flexShrink: 0,
              marginTop: 2,
              letterSpacing: '0.04em',
              fontWeight: 700,
            }}>
              {String(i + 1).padStart(2, '0')}
            </div>
            <div>
              <div style={{
                fontFamily: 'var(--ie-font-display)',
                fontSize: 13,
                fontWeight: 700,
                color: 'var(--ie-text-heading)',
                letterSpacing: '0.02em',
                marginBottom: 4,
              }}>{p.tag}</div>
              <div style={{
                fontFamily: 'var(--ie-font-body)',
                fontSize: 13,
                color: 'var(--ie-text-primary)',
                lineHeight: 1.6,
              }}>{p.text}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ScreenHowTo() {
  const [active, setActive] = useState(0);
  const mod = MODULES[active];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <div style={{
          fontFamily: 'var(--ie-font-body)',
          fontSize: 11,
          fontWeight: 700,
          color: 'var(--ie-accent)',
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          marginBottom: 8,
        }}>
          How To Use This App
        </div>
        <div style={{
          fontFamily: 'var(--ie-font-display)',
          fontSize: 20,
          color: 'var(--ie-text-heading)',
          fontWeight: 700,
          lineHeight: 1.3,
        }}>
          Seven modules. One workflow. Always start with Project Intake.
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: 14 }}>
        {/* Module list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {MODULES.map((m, i) => (
            <button
              key={m.num}
              onClick={() => setActive(i)}
              style={{
                display: 'flex',
                gap: 12,
                alignItems: 'center',
                padding: '9px 12px',
                borderRadius: 6,
                border: i === active
                  ? `1px solid rgba(189, 86, 45, 0.3)`
                  : '1px solid var(--ie-border)',
                background: i === active ? 'rgba(189, 86, 45, 0.06)' : 'var(--ie-card)',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.15s',
              }}
            >
              <span style={{
                fontFamily: 'var(--ie-font-mono)',
                fontSize: 10,
                fontWeight: 700,
                color: i === active ? 'var(--ie-accent)' : 'var(--ie-text-tertiary)',
                flexShrink: 0,
              }}>{m.num}</span>
              <span style={{
                fontFamily: 'var(--ie-font-body)',
                fontSize: 13,
                fontWeight: i === active ? 600 : 400,
                color: i === active ? 'var(--ie-text-heading)' : 'var(--ie-text-primary)',
              }}>{m.label}</span>
              {i === 0 && (
                <span style={{
                  marginLeft: 'auto',
                  fontFamily: 'var(--ie-font-body)',
                  fontSize: 10,
                  fontWeight: 700,
                  color: 'var(--ie-accent)',
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                }}>START</span>
              )}
            </button>
          ))}
        </div>

        {/* Module detail */}
        <div style={{
          background: 'var(--ie-card)',
          border: `1px solid var(--ie-border)`,
          borderTop: `3px solid ${mod.color}`,
          borderRadius: 8,
          padding: '22px 22px',
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
        }}>
          <div>
            <div style={{
              fontFamily: 'var(--ie-font-body)',
              fontSize: 10,
              fontWeight: 700,
              color: mod.color,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              marginBottom: 6,
            }}>Module {mod.num}</div>
            <div style={{
              fontFamily: 'var(--ie-font-display)',
              fontSize: 18,
              color: 'var(--ie-text-heading)',
              fontWeight: 700,
              marginBottom: 8,
            }}>{mod.label}</div>
            <div style={{
              fontFamily: 'var(--ie-font-body)',
              fontSize: 13,
              color: 'var(--ie-text-primary)',
              lineHeight: 1.7,
            }}>{mod.desc}</div>
          </div>

          <div style={{
            background: 'var(--ie-surface)',
            border: `1px solid var(--ie-border)`,
            borderRadius: 6,
            padding: '12px 14px',
          }}>
            <div style={{
              fontFamily: 'var(--ie-font-body)',
              fontSize: 10,
              fontWeight: 700,
              color: mod.color,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              marginBottom: 5,
            }}>How To Use</div>
            <div style={{
              fontFamily: 'var(--ie-font-body)',
              fontSize: 13,
              color: 'var(--ie-text-primary)',
              lineHeight: 1.6,
            }}>{mod.howto}</div>
          </div>

          <div style={{ display: 'flex', gap: 8, marginTop: 'auto' }}>
            {active > 0 && (
              <button onClick={() => setActive(a => a - 1)} style={{
                fontFamily: 'var(--ie-font-body)',
                fontSize: 12,
                fontWeight: 600,
                color: 'var(--ie-text-secondary)',
                background: 'var(--ie-surface)',
                border: '1px solid var(--ie-border)',
                borderRadius: 4,
                padding: '6px 14px',
                cursor: 'pointer',
              }}>← Prev</button>
            )}
            {active < MODULES.length - 1 && (
              <button onClick={() => setActive(a => a + 1)} style={{
                fontFamily: 'var(--ie-font-body)',
                fontSize: 12,
                fontWeight: 600,
                color: '#ffffff',
                background: mod.color,
                border: 'none',
                borderRadius: 4,
                padding: '6px 14px',
                cursor: 'pointer',
              }}>Next Module →</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ScreenAcknowledge({ onEnter }) {
  const [checked, setChecked] = useState(new Array(CHECKS.length).fill(false));
  const allChecked = checked.every(Boolean);

  function toggle(i) {
    setChecked(prev => prev.map((v, idx) => idx === i ? !v : v));
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <div style={{
          fontFamily: 'var(--ie-font-body)',
          fontSize: 11,
          fontWeight: 700,
          color: 'var(--ie-accent)',
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          marginBottom: 8,
        }}>
          Before You Begin
        </div>
        <div style={{
          fontFamily: 'var(--ie-font-display)',
          fontSize: 20,
          color: 'var(--ie-text-heading)',
          fontWeight: 700,
          lineHeight: 1.3,
        }}>
          Confirm you understand how to use this tool responsibly.
        </div>
        <div style={{
          fontFamily: 'var(--ie-font-body)',
          fontSize: 14,
          color: 'var(--ie-text-secondary)',
          marginTop: 6,
          lineHeight: 1.6,
        }}>
          Check each box to acknowledge before entering the application.
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {CHECKS.map((text, i) => (
          <button
            key={i}
            onClick={() => toggle(i)}
            style={{
              display: 'flex',
              gap: 14,
              alignItems: 'flex-start',
              background: checked[i] ? 'rgba(150, 161, 83, 0.06)' : 'var(--ie-card)',
              border: checked[i] ? '1px solid rgba(150, 161, 83, 0.35)' : '1px solid var(--ie-border)',
              borderRadius: 6,
              padding: '12px 16px',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.15s',
              width: '100%',
            }}
          >
            <div style={{
              width: 20,
              height: 20,
              borderRadius: 4,
              border: checked[i] ? '2px solid #96a153' : '2px solid var(--ie-border-strong)',
              background: checked[i] ? '#96a153' : 'transparent',
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginTop: 1,
              transition: 'all 0.15s',
            }}>
              {checked[i] && (
                <svg width="11" height="9" viewBox="0 0 11 9" fill="none">
                  <path d="M1 4.5L4 7.5L10 1" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </div>
            <span style={{
              fontFamily: 'var(--ie-font-body)',
              fontSize: 13,
              color: checked[i] ? 'var(--ie-text-heading)' : 'var(--ie-text-primary)',
              lineHeight: 1.6,
              transition: 'color 0.15s',
            }}>{text}</span>
          </button>
        ))}
      </div>

      {/* Progress count */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{
          fontFamily: 'var(--ie-font-body)',
          fontSize: 13,
          fontWeight: 600,
          color: allChecked ? '#96a153' : 'var(--ie-text-secondary)',
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
        }}>
          {checked.filter(Boolean).length} / {CHECKS.length} confirmed
        </div>
        <div style={{ flex: 1, height: 4, background: 'var(--ie-surface)', borderRadius: 2, overflow: 'hidden' }}>
          <div style={{
            width: `${(checked.filter(Boolean).length / CHECKS.length) * 100}%`,
            height: '100%',
            background: allChecked ? '#96a153' : 'var(--ie-accent)',
            borderRadius: 2,
            transition: 'width 0.25s ease',
          }} />
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <NavBtn primary disabled={!allChecked} onClick={onEnter}>
          {allChecked ? 'Enter Application' : 'Check all boxes to continue'}
        </NavBtn>
      </div>

      <div style={{
        fontFamily: 'var(--ie-font-body)',
        fontSize: 11,
        fontWeight: 600,
        color: 'var(--ie-text-tertiary)',
        textAlign: 'center',
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
      }}>
        Impact Environmental · GSR Simulator v1.0 · 2026
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

const STEPS = [
  { id: 'purpose',   label: 'Purpose'    },
  { id: 'challenge', label: 'Challenge'  },
  { id: 'howto',     label: 'How To Use' },
  { id: 'agree',     label: 'Confirm'    },
];

export default function SplashScreen({ onEnter }) {
  const [step, setStep]       = useState(0);
  const [visible, setVisible] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [animDir, setAnimDir] = useState(1);
  const [animKey, setAnimKey] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 60);
    return () => clearTimeout(t);
  }, []);

  function goNext() {
    setAnimDir(1);
    setAnimKey(k => k + 1);
    setStep(s => s + 1);
  }

  function goBack() {
    setAnimDir(-1);
    setAnimKey(k => k + 1);
    setStep(s => s - 1);
  }

  function handleEnter() {
    setLeaving(true);
    setTimeout(onEnter, 320);
  }

  const isLast = step === STEPS.length - 1;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 9000,
      background: 'var(--ie-bg)',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      opacity: leaving ? 0 : visible ? 1 : 0,
      transition: 'opacity 0.32s ease',
    }}>

      {/* ── Top bar ─────────────────────────────────────────────────────────── */}
      <div style={{
        background: 'var(--ie-accent)',
        padding: '10px 32px',
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        flexShrink: 0,
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          backgroundImage: 'repeating-linear-gradient(45deg, rgba(255,255,255,0.07) 0px, rgba(255,255,255,0.07) 4px, transparent 4px, transparent 14px)',
        }} />
        <img src={impactLogo} alt="Impact Environmental" style={{ height: 28, width: 'auto', filter: 'brightness(0) invert(1)', flexShrink: 0, position: 'relative' }} />
        <div style={{
          fontFamily: 'var(--ie-font-display)',
          fontSize: 13,
          fontWeight: 800,
          color: '#ffffff',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          position: 'relative',
        }}>GSR Simulator</div>
        <div style={{
          fontFamily: 'var(--ie-font-body)',
          fontSize: 12,
          color: 'rgba(255,255,255,0.7)',
          letterSpacing: '0.04em',
          position: 'relative',
        }}>Onboarding</div>
        <div style={{ marginLeft: 'auto', position: 'relative' }}>
          <StepBar step={step} total={STEPS.length} />
        </div>
      </div>

      {/* ── Step tab nav ─────────────────────────────────────────────────────── */}
      <div style={{
        borderBottom: '1px solid var(--ie-border)',
        padding: '0 40px',
        display: 'flex',
        gap: 0,
        flexShrink: 0,
        background: 'var(--ie-card)',
      }}>
        {STEPS.map((s, i) => (
          <div key={s.id} style={{
            fontFamily: 'var(--ie-font-body)',
            fontSize: 13,
            fontWeight: 600,
            color: i === step ? 'var(--ie-accent)' : i < step ? 'var(--ie-bronze)' : 'var(--ie-text-tertiary)',
            padding: '10px 20px',
            borderBottom: i === step ? '2px solid var(--ie-accent)' : '2px solid transparent',
            letterSpacing: '0.03em',
            cursor: i < step ? 'pointer' : 'default',
            transition: 'all 0.15s',
            display: 'flex',
            alignItems: 'center',
            gap: 7,
          }}
          onClick={() => { if (i < step) { setAnimDir(-1); setAnimKey(k=>k+1); setStep(i); } }}
          >
            {i < step && (
              <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                <path d="M1 4L3.5 6.5L9 1" stroke="var(--ie-bronze)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
            {s.label}
          </div>
        ))}
      </div>

      {/* ── Screen content ───────────────────────────────────────────────────── */}
      <div style={{
        flex: 1,
        overflow: 'auto',
        padding: '36px 40px 24px',
        background: 'var(--ie-bg)',
      }}>
        <div
          key={animKey}
          style={{
            maxWidth: 900,
            margin: '0 auto',
            animation: `splashSlide${animDir > 0 ? 'In' : 'Back'} 0.22s ease forwards`,
          }}
        >
          {step === 0 && <ScreenPurpose />}
          {step === 1 && <ScreenChallenge />}
          {step === 2 && <ScreenHowTo />}
          {step === 3 && <ScreenAcknowledge onEnter={handleEnter} />}
        </div>
      </div>

      {/* ── Bottom nav ───────────────────────────────────────────────────────── */}
      {!isLast && (
        <div style={{
          borderTop: '1px solid var(--ie-border)',
          padding: '14px 40px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexShrink: 0,
          background: 'var(--ie-card)',
        }}>
          <NavBtn onClick={goBack} disabled={step === 0}>
            ← Back
          </NavBtn>
          <div style={{
            fontFamily: 'var(--ie-font-body)',
            fontSize: 11,
            fontWeight: 600,
            color: 'var(--ie-text-tertiary)',
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
          }}>
            DER-31 · 6 NYCRR Part 375 · BCP Oct 2025
          </div>
          <NavBtn primary onClick={goNext}>
            {step === STEPS.length - 2 ? 'Final Step →' : 'Next →'}
          </NavBtn>
        </div>
      )}

      <style>{`
        @keyframes splashSlideIn {
          from { opacity: 0; transform: translateX(20px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes splashSlideBack {
          from { opacity: 0; transform: translateX(-20px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}
