import { Activity, AlertTriangle, Zap, Moon, Sun } from 'lucide-react';
import { useGSR } from '../store/useGSR.js';
import { useSiteWise } from '../store/useSiteWise.js';
import { useTheme } from '../store/useTheme.js';
import impactLogo from '../assets/impact-logo-2d.png';

export default function Header() {
  const project         = useGSR((s) => s.project);
  const climate         = useGSR((s) => s.climate);
  const setActiveModule = useGSR((s) => s.setActiveModule);
  const swResults       = useSiteWise((s) => s.results);
  const { isDark, toggle } = useTheme();

  const hasFootprint = !!swResults;
  const co2e         = swResults?.netTotal?.co2e;
  const climateLevel = climate.result?.level;

  const climateColor = {
    high:     'var(--ie-error)',
    moderate: 'var(--ie-warning)',
    low:      'var(--ie-success)',
  }[climateLevel] || 'var(--ie-text-secondary)';

  return (
    <header style={{
      height: 64,
      background: 'var(--ie-card)',
      borderBottom: '1px solid var(--ie-border)',
      display: 'flex',
      alignItems: 'center',
      padding: '0 16px 0 0',
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 100,
      boxShadow: 'var(--ie-shadow-1)',
    }}>

      {/* Logo zone — aligns with sidebar icon rail */}
      <div
        onClick={() => setActiveModule('dashboard')}
        style={{
          width: 68,
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          flexShrink: 0,
          borderRight: '1px solid var(--ie-border)',
          background: 'var(--ie-accent)',
        }}
      >
        <img
          src={impactLogo}
          alt="Impact Environmental"
          style={{ height: 34, width: 'auto', filter: 'brightness(0) invert(1)' }}
        />
      </div>

      {/* App identity */}
      <div
        onClick={() => setActiveModule('dashboard')}
        style={{ cursor: 'pointer', marginLeft: 20, marginRight: 24, flexShrink: 0 }}
      >
        <div style={{
          fontFamily: 'var(--ie-font-display)',
          fontSize: 15,
          fontWeight: 800,
          color: 'var(--ie-text-heading)',
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          lineHeight: 1.2,
        }}>
          GSR Simulator
        </div>
        <div style={{
          fontFamily: 'var(--ie-font-body)',
          fontSize: 11,
          color: 'var(--ie-text-secondary)',
          letterSpacing: '0.04em',
          marginTop: 2,
          lineHeight: 1,
          fontWeight: 500,
        }}>
          NYSDEC BCP · DER-31 · 6 NYCRR Part 375
        </div>
      </div>

      {/* Divider */}
      <div style={{ width: 1, height: 28, background: 'var(--ie-border)', marginRight: 20, flexShrink: 0 }} />

      {/* Active project pill */}
      {project.projectName && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          background: 'rgba(189, 86, 45, 0.05)',
          border: '1px solid rgba(189, 86, 45, 0.2)',
          borderRadius: 6,
          padding: '5px 12px 5px 10px',
          marginRight: 16,
          flexShrink: 0,
        }}>
          <span style={{ position: 'relative', width: 7, height: 7, flexShrink: 0 }}>
            <span style={{
              position: 'absolute', inset: 0,
              borderRadius: '50%',
              background: 'var(--ie-success)',
              opacity: 0.4,
              animation: 'pulse-ring 2s ease-out infinite',
            }} />
            <span style={{
              position: 'absolute', inset: '1px',
              borderRadius: '50%',
              background: 'var(--ie-success)',
            }} />
          </span>
          <span style={{
            fontFamily: 'var(--ie-font-body)',
            fontSize: 13,
            fontWeight: 600,
            color: 'var(--ie-text-primary)',
            maxWidth: 240,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            {project.projectName}
          </span>
          {project.phase && (
            <span style={{
              fontFamily: 'var(--ie-font-body)',
              fontSize: 11,
              fontWeight: 600,
              color: 'var(--ie-text-secondary)',
              background: 'var(--ie-surface)',
              borderRadius: 3,
              padding: '2px 6px',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}>
              {project.phase}
            </span>
          )}
        </div>
      )}

      {/* Live metrics strip */}
      {hasFootprint && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 0,
          marginLeft: project.projectName ? 0 : 'auto',
          background: 'var(--ie-surface)',
          border: '1px solid var(--ie-border)',
          borderRadius: 6,
          overflow: 'hidden',
        }}>
          <LiveMetric
            icon={<Activity size={11} />}
            label="CO₂e"
            value={co2e?.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            unit="MT"
            color="var(--ie-accent)"
          />
          <div style={{ width: 1, height: 28, background: 'var(--ie-border)' }} />
          <LiveMetric
            label="MMBTU"
            value={swResults?.netTotal?.energy_mmbtu?.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            unit=""
            color="var(--ie-bronze)"
          />
          <div style={{ width: 1, height: 28, background: 'var(--ie-border)' }} />
          <LiveMetric
            label="NOx"
            value={swResults?.netTotal?.nox?.toFixed(3)}
            unit="MT"
            color="var(--ie-blue-sapphire)"
          />
          {climateLevel && (
            <>
              <div style={{ width: 1, height: 28, background: 'var(--ie-border)' }} />
              <div style={{ padding: '0 14px', display: 'flex', alignItems: 'center', gap: 5 }}>
                {climateLevel === 'high'
                  ? <AlertTriangle size={11} color={climateColor} />
                  : <Zap size={11} color={climateColor} />}
                <span style={{
                  fontSize: 12,
                  fontFamily: 'var(--ie-font-body)',
                  fontWeight: 700,
                  color: climateColor,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                }}>
                  {climateLevel}
                </span>
              </div>
            </>
          )}
        </div>
      )}

      {/* Right edge: reg tag + theme toggle */}
      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
        {!hasFootprint && (
          <span style={{
            fontFamily: 'var(--ie-font-body)',
            fontSize: 11,
            fontWeight: 600,
            color: 'var(--ie-text-tertiary)',
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
          }}>
            DER-31 · Part 375 · BCP Oct 2025
          </span>
        )}

        {/* Theme toggle */}
        <button
          onClick={toggle}
          title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          style={{
            width: 34,
            height: 34,
            borderRadius: 8,
            border: '1px solid var(--ie-border)',
            background: 'var(--ie-surface)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            transition: 'background 0.15s, border-color 0.15s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--ie-card-alt)';
            e.currentTarget.style.borderColor = 'var(--ie-border-strong)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'var(--ie-surface)';
            e.currentTarget.style.borderColor = 'var(--ie-border)';
          }}
        >
          {isDark
            ? <Sun size={15} color="var(--ie-warning)" strokeWidth={2} />
            : <Moon size={15} color="var(--ie-text-secondary)" strokeWidth={2} />
          }
        </button>
      </div>
    </header>
  );
}

function LiveMetric({ icon, label, value, unit, color }) {
  return (
    <div style={{
      padding: '0 14px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      height: 40,
      minWidth: 70,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 3, marginBottom: 1 }}>
        {icon && <span style={{ color }}>{icon}</span>}
        <span style={{
          fontSize: 10,
          color: 'var(--ie-text-secondary)',
          fontFamily: 'var(--ie-font-body)',
          fontWeight: 600,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
        }}>
          {label}
        </span>
      </div>
      <div style={{
        fontFamily: 'var(--ie-font-mono)',
        fontSize: 13,
        fontWeight: 700,
        color,
        lineHeight: 1,
      }}>
        {value ?? '—'}
        {unit && <span style={{ fontSize: 9, color: 'var(--ie-text-tertiary)', marginLeft: 3, fontWeight: 400 }}>{unit}</span>}
      </div>
    </div>
  );
}
