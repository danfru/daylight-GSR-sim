import { useState } from 'react';
import {
  ClipboardList, Leaf, CloudLightning,
  FileText, BarChart3, BookOpen, LayoutDashboard, FlaskConical,
} from 'lucide-react';
import { useGSR } from '../store/useGSR.js';

const MODULES = [
  { id: 'dashboard',  label: 'Overview',               icon: LayoutDashboard, step: null },
  { id: 'intake',     label: 'Project Intake',          icon: ClipboardList,   step: 1 },
  { id: 'bmps',       label: 'BMP Selector',            icon: Leaf,            step: 2 },
  { id: 'sitewise',   label: 'SiteWise™ Calculator',    icon: FlaskConical,    step: 3 },
  { id: 'climate',    label: 'Climate Screener',        icon: CloudLightning,  step: 4 },
  { id: 'rawp',       label: 'RAWP Builder',            icon: FileText,        step: 5 },
  { id: 'fer',        label: 'FER Tracker',             icon: BarChart3,       step: 6 },
  { id: 'library',    label: 'Reference Library',       icon: BookOpen,        step: 7 },
];

function ProgressRing({ size, done, active }) {
  const r = (size - 4) / 2;
  const circ = 2 * Math.PI * r;
  const dash = done ? circ : 0;
  return (
    <svg
      width={size} height={size}
      style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}
    >
      <circle cx={size / 2} cy={size / 2} r={r}
        fill="none" stroke="var(--ie-border)" strokeWidth={1.5} />
      {done && (
        <circle cx={size / 2} cy={size / 2} r={r}
          fill="none"
          stroke={active ? 'var(--ie-accent)' : 'var(--ie-success)'}
          strokeWidth={1.5}
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: 'stroke-dasharray 0.5s ease' }}
        />
      )}
    </svg>
  );
}

export default function Sidebar() {
  const activeModule     = useGSR((s) => s.activeModule);
  const setActiveModule  = useGSR((s) => s.setActiveModule);
  const completionStatus = useGSR((s) => s.completionStatus)();
  const [hovered, setHovered] = useState(null);

  return (
    <nav style={{
      width: 68,
      background: 'var(--ie-card)',
      borderRight: '1px solid var(--ie-border)',
      position: 'fixed',
      top: 64,
      left: 0,
      bottom: 0,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      paddingTop: 12,
      paddingBottom: 16,
      zIndex: 90,
      gap: 4,
    }}>
      {MODULES.map(({ id, label, icon: Icon, step }) => {
        const isActive = activeModule === id;
        const isDone   = id !== 'dashboard' && completionStatus[id];
        const isHov    = hovered === id;
        const RingSize = 48;

        const iconColor = isActive ? 'var(--ie-accent)'
          : isDone  ? 'var(--ie-success)'
          : isHov   ? 'var(--ie-text-primary)'
          :           'var(--ie-text-tertiary)';

        return (
          <div
            key={id}
            style={{ position: 'relative', display: 'flex', alignItems: 'center' }}
            onMouseEnter={() => setHovered(id)}
            onMouseLeave={() => setHovered(null)}
          >
            {/* Tooltip */}
            {isHov && (
              <div style={{
                position: 'absolute',
                left: 62,
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'var(--ie-text-heading)',
                border: '1px solid var(--ie-border-strong)',
                borderRadius: 6,
                padding: '6px 12px',
                whiteSpace: 'nowrap',
                zIndex: 200,
                pointerEvents: 'none',
                boxShadow: 'var(--ie-shadow-2)',
              }}>
                <span style={{ fontSize: 12, color: 'var(--ie-text-inverse)', fontFamily: 'var(--ie-font-body)', fontWeight: 500 }}>
                  {step && (
                    <span style={{ color: 'var(--ie-text-tertiary)', marginRight: 6, fontFamily: 'var(--ie-font-mono)', fontSize: 10 }}>
                      {step}.
                    </span>
                  )}
                  {label}
                </span>
                <div style={{
                  position: 'absolute', left: -5, top: '50%', transform: 'translateY(-50%)',
                  width: 0, height: 0,
                  borderTop: '5px solid transparent',
                  borderBottom: '5px solid transparent',
                  borderRight: '5px solid var(--ie-text-heading)',
                }} />
              </div>
            )}

            <button
              onClick={() => setActiveModule(id)}
              style={{
                position: 'relative',
                width: RingSize,
                height: RingSize,
                borderRadius: '50%',
                background: isActive
                  ? 'rgba(189, 86, 45, 0.08)'
                  : isHov ? 'var(--ie-surface)' : 'transparent',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background 0.15s',
              }}
            >
              <ProgressRing size={RingSize} done={isDone} active={isActive} />
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 2,
                zIndex: 1,
              }}>
                <Icon
                  size={18}
                  color={iconColor}
                  strokeWidth={isActive ? 2.2 : 1.8}
                />
                {step && (
                  <span style={{
                    fontSize: 8,
                    fontFamily: 'var(--ie-font-mono)',
                    color: iconColor,
                    lineHeight: 1,
                    fontWeight: 700,
                    letterSpacing: '0.04em',
                  }}>
                    {isDone && !isActive ? '✓' : `0${step}`}
                  </span>
                )}
              </div>
            </button>
          </div>
        );
      })}

      {/* Bottom reg hint */}
      <div style={{
        marginTop: 'auto',
        textAlign: 'center',
        paddingTop: 12,
        borderTop: '1px solid var(--ie-border)',
        width: '100%',
      }}>
        <div style={{
          fontSize: 7,
          fontFamily: 'var(--ie-font-mono)',
          color: 'var(--ie-text-tertiary)',
          letterSpacing: '0.06em',
          lineHeight: 1.8,
          fontWeight: 600,
        }}>
          DER<br />-31
        </div>
      </div>
    </nav>
  );
}
