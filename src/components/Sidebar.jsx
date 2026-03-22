import {
  ClipboardList,
  Leaf,
  Calculator,
  CloudLightning,
  FileText,
  BarChart3,
  BookOpen,
  ChevronRight,
} from 'lucide-react';
import { useGSR } from '../store/useGSR.js';

const MODULES = [
  { id: 'intake',    label: 'Project Intake',       icon: ClipboardList, step: 1 },
  { id: 'bmps',      label: 'BMP Selector',          icon: Leaf,          step: 2 },
  { id: 'footprint', label: 'Footprint Calculator',  icon: Calculator,    step: 3 },
  { id: 'climate',   label: 'Climate Screener',      icon: CloudLightning,step: 4 },
  { id: 'rawp',      label: 'RAWP Builder',           icon: FileText,      step: 5 },
  { id: 'fer',       label: 'FER Tracker',            icon: BarChart3,     step: 6 },
  { id: 'library',   label: 'Reference Library',     icon: BookOpen,      step: 7 },
];

export default function Sidebar() {
  const activeModule = useGSR((s) => s.activeModule);
  const setActiveModule = useGSR((s) => s.setActiveModule);
  const completionStatus = useGSR((s) => s.completionStatus)();

  return (
    <nav style={{
      width: 220,
      background: 'var(--ink)',
      borderRight: '1px solid var(--graphite)',
      position: 'fixed',
      top: 56,
      left: 0,
      bottom: 0,
      display: 'flex',
      flexDirection: 'column',
      padding: '16px 0',
      zIndex: 90,
      overflowY: 'auto',
    }}>
      {/* Section label */}
      <div style={{
        padding: '0 16px 12px',
        fontFamily: 'var(--font-mono)',
        fontSize: 10,
        color: 'var(--smoke)',
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        borderBottom: '1px solid var(--graphite)',
        marginBottom: 8,
      }}>
        Modules
      </div>

      {MODULES.map(({ id, label, icon: Icon, step }) => {
        const isActive = activeModule === id;
        const isDone = completionStatus[id];

        return (
          <button
            key={id}
            onClick={() => setActiveModule(id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '10px 16px',
              background: isActive ? 'rgba(245,197,24,0.08)' : 'none',
              border: 'none',
              borderLeft: isActive ? '3px solid var(--sunbeam)' : '3px solid transparent',
              cursor: 'pointer',
              textAlign: 'left',
              width: '100%',
              transition: 'background 0.15s',
            }}
          >
            {/* Step number / done indicator */}
            <div style={{
              width: 22,
              height: 22,
              borderRadius: '50%',
              background: isActive ? 'var(--sunbeam)' : isDone ? 'rgba(76,175,80,0.2)' : 'var(--graphite)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              fontSize: 10,
              fontFamily: 'var(--font-mono)',
              fontWeight: 700,
              color: isActive ? '#0D0D0D' : isDone ? 'var(--signal-green)' : 'var(--smoke)',
            }}>
              {isDone && !isActive ? '✓' : step}
            </div>

            {/* Icon + Label */}
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}>
                <Icon
                  size={14}
                  color={isActive ? 'var(--sunbeam)' : isDone ? 'var(--signal-green)' : 'var(--smoke)'}
                />
                <span style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: 13,
                  fontWeight: isActive ? 600 : 400,
                  color: isActive ? 'var(--bone)' : 'var(--smoke)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}>
                  {label}
                </span>
              </div>
            </div>

            {isActive && <ChevronRight size={12} color="var(--sunbeam)" />}
          </button>
        );
      })}

      {/* Footer regulatory note */}
      <div style={{ marginTop: 'auto', padding: '16px', borderTop: '1px solid var(--graphite)' }}>
        <p style={{ margin: 0, fontSize: 10, color: 'var(--smoke)', fontFamily: 'var(--font-mono)', lineHeight: 1.6 }}>
          NYSDEC DER-31<br />
          6 NYCRR Part 375<br />
          BCP App. Rev. Oct 2025
        </p>
      </div>
    </nav>
  );
}
