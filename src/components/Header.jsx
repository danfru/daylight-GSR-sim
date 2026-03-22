import { Sun, Leaf } from 'lucide-react';
import { useGSR } from '../store/useGSR.js';

export default function Header() {
  const project = useGSR((s) => s.project);

  return (
    <header style={{
      height: 56,
      background: 'var(--ink)',
      borderBottom: '1px solid var(--graphite)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 24px',
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 100,
    }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 32,
          height: 32,
          borderRadius: 8,
          background: 'var(--sunbeam)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <Sun size={18} color="#0D0D0D" strokeWidth={2.5} />
        </div>
        <div>
          <div style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 700,
            fontSize: 15,
            color: 'var(--bone)',
            lineHeight: 1.2,
          }}>
            Daylight Labs
          </div>
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            color: 'var(--smoke)',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
          }}>
            GSR Simulator
          </div>
        </div>
      </div>

      {/* Active project indicator */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {project.projectName ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--graphite)', borderRadius: 6, padding: '5px 12px' }}>
            <Leaf size={13} color="var(--signal-green)" />
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 13, color: 'var(--bone)', maxWidth: 280, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {project.projectName}
            </span>
            {project.siteId && (
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--smoke)' }}>
                #{project.siteId}
              </span>
            )}
          </div>
        ) : (
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--smoke)', background: 'var(--graphite)', borderRadius: 6, padding: '5px 12px' }}>
            No project loaded
          </span>
        )}

        {/* Regulatory tag */}
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 10,
          color: 'var(--sunbeam)',
          background: 'rgba(245,197,24,0.08)',
          border: '1px solid rgba(245,197,24,0.2)',
          borderRadius: 4,
          padding: '3px 8px',
          letterSpacing: '0.06em',
        }}>
          DER-31 · Part 375
        </div>
      </div>
    </header>
  );
}
