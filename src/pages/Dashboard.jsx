import { useGSR } from '../store/useGSR.js';
import {
  ClipboardList, Leaf, CloudLightning,
  FileText, BarChart3, BookOpen, ArrowRight,
  CheckCircle, Circle, Zap, FlaskConical,
} from 'lucide-react';

const MODULES = [
  {
    id: 'intake',
    label: 'Project Intake',
    icon: ClipboardList,
    desc: 'Program type, phase, cleanup track, contaminants, remedy technologies',
    color: '#bd562d',
  },
  {
    id: 'bmps',
    label: 'BMP Selector',
    icon: Leaf,
    desc: '17 best management practices with RAWP-ready language blocks',
    color: '#96a153',
  },
  {
    id: 'sitewise',
    label: 'SiteWise™ Calculator',
    icon: FlaskConical,
    desc: 'Full EPA SiteWise™ v3.2 — 4-component lifecycle footprint analysis with PDF export',
    color: '#ba8748',
  },
  {
    id: 'climate',
    label: 'Climate Screener',
    icon: CloudLightning,
    desc: '6-hazard vulnerability wizard — determines if full CVA required',
    color: '#185676',
  },
  {
    id: 'rawp',
    label: 'RAWP Builder',
    icon: FileText,
    desc: 'Generate compliant GSR section text — copy or download',
    color: '#323e4c',
  },
  {
    id: 'fer',
    label: 'FER Tracker',
    icon: BarChart3,
    desc: 'Track planned vs. actual metrics for Final Engineering Report',
    color: '#955d86',
  },
  {
    id: 'library',
    label: 'Reference Library',
    icon: BookOpen,
    desc: 'DER-31, Part 375, SiteWise™, ITRC and all 2025 regulatory updates',
    color: '#7d8685',
  },
];

function HealthRing({ completedCount, total }) {
  const size = 140;
  const r = 60;
  const circ = 2 * Math.PI * r;
  const pct = completedCount / total;
  const dash = circ * pct;
  const gap = circ - dash;

  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size/2} cy={size/2} r={r}
        fill="none" stroke="var(--ie-border)" strokeWidth={6} />
      {pct > 0 && (
        <circle cx={size/2} cy={size/2} r={r}
          fill="none"
          stroke="url(#ringGrad)"
          strokeWidth={6}
          strokeDasharray={`${dash} ${gap}`}
          strokeLinecap="round"
        />
      )}
      <defs>
        <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#bd562d" />
          <stop offset="100%" stopColor="#96a153" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export default function Dashboard() {
  const project = useGSR((s) => s.project);
  const climate = useGSR((s) => s.climate);
  const selectedBMPs = useGSR((s) => s.selectedBMPs);
  const setActiveModule = useGSR((s) => s.setActiveModule);
  const completionStatus = useGSR((s) => s.completionStatus)();

  let swNetTotal = null;
  try {
    const sw = JSON.parse(localStorage.getItem('daylight-sitewise-store') || '{}');
    swNetTotal = sw?.state?.results?.netTotal || null;
  } catch {}

  const moduleKeys = ['intake','bmps','sitewise','climate','rawp','fer'];
  const completedCount = moduleKeys.filter((k) => completionStatus[k]).length;
  const total = moduleKeys.length;
  const hasProject = !!project.projectName;

  return (
    <div>
      {/* Hero strip */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: hasProject ? '1fr auto' : '1fr',
        gap: 24,
        marginBottom: 28,
        background: 'var(--ie-surface)',
        border: '1px solid var(--ie-border)',
        borderRadius: 12,
        padding: '28px 32px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Diagonal stripe overlay */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none', borderRadius: 12,
          backgroundImage: 'repeating-linear-gradient(45deg, rgba(84,48,26,0.03) 0px, rgba(84,48,26,0.03) 2px, transparent 2px, transparent 10px)',
        }} />

        <div style={{ position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <Zap size={13} color="var(--ie-accent)" />
            <span style={{ fontFamily: 'var(--ie-font-body)', fontSize: 10, fontWeight: 700, color: 'var(--ie-text-secondary)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              NYSDEC BCP · Green &amp; Sustainable Remediation
            </span>
          </div>

          {hasProject ? (
            <>
              <h1 style={{
                fontFamily: 'var(--ie-font-display)',
                fontSize: 26,
                fontWeight: 800,
                color: 'var(--ie-text-heading)',
                margin: '0 0 4px',
                lineHeight: 1.2,
              }}>
                {project.projectName}
              </h1>
              <p style={{ margin: '0 0 18px', color: 'var(--ie-text-secondary)', fontSize: 13 }}>
                {[project.programType, project.phase, project.region, project.county].filter(Boolean).join(' · ')}
              </p>
            </>
          ) : (
            <>
              <h1 style={{
                fontFamily: 'var(--ie-font-display)',
                fontSize: 26,
                fontWeight: 800,
                color: 'var(--ie-text-heading)',
                margin: '0 0 8px',
              }}>
                GSR Simulator
              </h1>
              <p style={{ margin: '0 0 20px', color: 'var(--ie-text-secondary)', fontSize: 14, maxWidth: 500, lineHeight: 1.6 }}>
                DER-31 · 6 NYCRR Part 375 · BCP Questions 5 &amp; 6 — start in Project Intake to configure your site.
              </p>
            </>
          )}

          {/* Quick metrics */}
          {swNetTotal && (
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {[
                { v: swNetTotal.co2e?.toLocaleString(undefined,{maximumFractionDigits:1}), u: 'MT CO₂e', c: '#bd562d' },
                { v: swNetTotal.energy_mmbtu?.toLocaleString(undefined,{maximumFractionDigits:0}), u: 'MMBTU', c: '#ba8748' },
                { v: swNetTotal.nox?.toFixed(3), u: 'MT NOx', c: '#185676' },
                { v: selectedBMPs.length, u: 'BMPs', c: '#96a153' },
              ].map(({ v, u, c }) => (
                <div key={u} style={{
                  background: 'var(--ie-card)',
                  border: '1px solid var(--ie-border)',
                  borderRadius: 6,
                  padding: '7px 12px',
                }}>
                  <div style={{ fontFamily: 'var(--ie-font-mono)', fontWeight: 700, fontSize: 16, color: c, lineHeight: 1 }}>
                    {v ?? '—'}
                    <span style={{ fontSize: 10, color: 'var(--ie-text-secondary)', marginLeft: 4, fontWeight: 400 }}>{u}</span>
                  </div>
                </div>
              ))}
              {climate.result && (
                <div style={{
                  background: 'var(--ie-card)',
                  border: `1px solid ${
                    climate.result.level === 'high' ? 'rgba(189,86,45,0.4)'
                    : climate.result.level === 'moderate' ? 'rgba(229,167,36,0.4)'
                    : 'rgba(150,161,83,0.4)'
                  }`,
                  borderRadius: 6,
                  padding: '7px 12px',
                }}>
                  <div style={{ fontFamily: 'var(--ie-font-mono)', fontWeight: 700, fontSize: 13, color:
                    climate.result.level === 'high' ? '#bd562d'
                    : climate.result.level === 'moderate' ? '#8a5f00'
                    : '#4d6617',
                  }}>
                    {climate.result.level.toUpperCase()}
                    <span style={{ fontSize: 10, color: 'var(--ie-text-secondary)', marginLeft: 5, fontWeight: 400 }}>climate</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {!hasProject && (
            <button
              onClick={() => setActiveModule('intake')}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                background: 'var(--ie-accent)', color: '#ffffff',
                border: 'none', borderRadius: 8,
                padding: '10px 20px', cursor: 'pointer',
                fontFamily: 'var(--ie-font-display)', fontWeight: 700, fontSize: 14,
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--ie-accent-hover)'}
              onMouseLeave={e => e.currentTarget.style.background = 'var(--ie-accent)'}
            >
              Start Project Intake
              <ArrowRight size={15} />
            </button>
          )}
        </div>

        {/* Progress ring */}
        {hasProject && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
            <div style={{ position: 'relative', width: 140, height: 140 }}>
              <HealthRing completedCount={completedCount} total={total} />
              <div style={{
                position: 'absolute', inset: 0,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              }}>
                <span style={{ fontFamily: 'var(--ie-font-mono)', fontSize: 28, fontWeight: 700, color: 'var(--ie-text-heading)', lineHeight: 1 }}>
                  {completedCount}
                </span>
                <span style={{ fontFamily: 'var(--ie-font-mono)', fontSize: 10, color: 'var(--ie-text-secondary)', letterSpacing: '0.06em' }}>
                  / {total} done
                </span>
              </div>
            </div>
            <div style={{ marginTop: 8, fontFamily: 'var(--ie-font-body)', fontWeight: 700, fontSize: 10, color: 'var(--ie-text-secondary)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              GSR Readiness
            </div>
          </div>
        )}
      </div>

      {/* Module grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: 10,
      }}>
        {MODULES.map(({ id, label, icon: Icon, desc, color }) => {
          const isDone = completionStatus[id];
          const isLib = id === 'library';

          return (
            <button
              key={id}
              onClick={() => setActiveModule(id)}
              style={{
                background: isDone ? `${color}08` : 'var(--ie-card)',
                border: `1px solid ${isDone ? color + '40' : 'var(--ie-border)'}`,
                borderRadius: 10,
                padding: '18px',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.15s ease',
                position: 'relative',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
                boxShadow: 'var(--ie-shadow-1)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.border = `1px solid ${color}60`;
                e.currentTarget.style.background = `${color}08`;
                e.currentTarget.style.boxShadow = `0 4px 12px ${color}18`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.border = `1px solid ${isDone ? color + '40' : 'var(--ie-border)'}`;
                e.currentTarget.style.background = isDone ? `${color}08` : 'var(--ie-card)';
                e.currentTarget.style.boxShadow = 'var(--ie-shadow-1)';
              }}
            >
              {/* Top accent bar */}
              <div style={{
                position: 'absolute', top: 0, left: 0, right: 0,
                height: 3, background: isDone ? color : 'var(--ie-border)',
                borderRadius: '10px 10px 0 0',
              }} />

              {/* Corner badge */}
              {isDone && !isLib && (
                <div style={{ position: 'absolute', top: 12, right: 12 }}>
                  <CheckCircle size={14} color={color} />
                </div>
              )}
              {!isDone && !isLib && (
                <div style={{ position: 'absolute', top: 12, right: 12 }}>
                  <Circle size={14} color="var(--ie-border-strong)" />
                </div>
              )}

              {/* Icon */}
              <div style={{
                width: 38, height: 38, borderRadius: 8,
                background: `${color}12`,
                border: `1px solid ${color}25`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginTop: 6,
              }}>
                <Icon size={17} color={color} strokeWidth={1.8} />
              </div>

              {/* Label + desc */}
              <div>
                <div style={{
                  fontFamily: 'var(--ie-font-display)',
                  fontWeight: 700,
                  fontSize: 14,
                  color: 'var(--ie-text-heading)',
                  marginBottom: 4,
                }}>
                  {label}
                </div>
                <div style={{
                  fontSize: 12,
                  color: 'var(--ie-text-secondary)',
                  lineHeight: 1.5,
                }}>
                  {desc}
                </div>
              </div>

              {/* Arrow */}
              <div style={{
                marginTop: 'auto',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                color: color,
                fontSize: 11,
                fontFamily: 'var(--ie-font-body)',
                fontWeight: 700,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
              }}>
                {isDone ? 'Revisit' : isLib ? 'Browse' : 'Open'}
                <ArrowRight size={11} />
              </div>
            </button>
          );
        })}
      </div>

      {/* Regulatory footer strip */}
      <div style={{
        marginTop: 28,
        padding: '12px 18px',
        background: 'var(--ie-surface)',
        border: '1px solid var(--ie-border)',
        borderRadius: 8,
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        flexWrap: 'wrap',
      }}>
        {[
          'NYSDEC DER-31 (2025)',
          '6 NYCRR Part 375 (eff. Dec 31 2025)',
          'BCP Application Rev. Oct 2025',
          'EPA SiteWise™ Methodology',
          'ITRC GSR Guidance',
        ].map((ref) => (
          <span key={ref} style={{
            fontFamily: 'var(--ie-font-body)',
            fontSize: 10,
            fontWeight: 600,
            color: 'var(--ie-text-tertiary)',
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
          }}>
            {ref}
          </span>
        ))}
      </div>
    </div>
  );
}
