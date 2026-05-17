import { AlertTriangle, CheckCircle, Info, XCircle, ChevronDown, ChevronUp, HelpCircle, BookOpen } from 'lucide-react';
import { useState } from 'react';

// ─── Field / Label ───────────────────────────────────────────────────────────

export function Field({ label, hint, error, required, children, className = '' }) {
  return (
    <div className={`field ${className}`}>
      {label && (
        <label className="field-label">
          {label}
          {required && <span style={{ color: 'var(--ie-accent)', marginLeft: 4 }}>*</span>}
        </label>
      )}
      {children}
      {hint && !error && <p className="field-hint">{hint}</p>}
      {error && <p className="field-hint" style={{ color: 'var(--ie-error)' }}>{error}</p>}
    </div>
  );
}

// ─── Select ──────────────────────────────────────────────────────────────────

export function Select({ value, onChange, options, placeholder = 'Select…', disabled = false }) {
  return (
    <select
      className="form-input"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
    >
      {placeholder && <option key="_placeholder" value="">{placeholder}</option>}
      {options.map((opt) =>
        typeof opt === 'string'
          ? <option key={opt} value={opt}>{opt}</option>
          : <option key={opt.value} value={opt.value}>{opt.label}</option>
      )}
    </select>
  );
}

// ─── Input ───────────────────────────────────────────────────────────────────

export function Input({ type = 'text', value, onChange, placeholder, min, max, step, disabled = false, className = '' }) {
  return (
    <input
      className={`form-input ${className}`}
      type={type}
      value={value ?? ''}
      onChange={(e) => {
        const val = type === 'number' ? (e.target.value === '' ? '' : Number(e.target.value)) : e.target.value;
        onChange(val);
      }}
      placeholder={placeholder}
      min={min}
      max={max}
      step={step}
      disabled={disabled}
    />
  );
}

// ─── Textarea ────────────────────────────────────────────────────────────────

export function Textarea({ value, onChange, placeholder, rows = 4, disabled = false }) {
  return (
    <textarea
      className="form-input"
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      disabled={disabled}
      style={{ resize: 'vertical', minHeight: `${rows * 1.6}em` }}
    />
  );
}

// ─── Toggle ──────────────────────────────────────────────────────────────────

export function Toggle({ checked, onChange, label, disabled = false }) {
  return (
    <label className="toggle-wrapper" style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: disabled ? 'not-allowed' : 'pointer' }}>
      <div className={`toggle ${checked ? 'toggle-on' : ''}`} onClick={() => !disabled && onChange(!checked)}>
        <div className="toggle-knob" />
      </div>
      {label && <span style={{ color: 'var(--ie-text-primary)', fontSize: 14 }}>{label}</span>}
    </label>
  );
}

// ─── InfoBox ─────────────────────────────────────────────────────────────────

export function InfoBox({ type = 'info', title, children }) {
  const icons = {
    info:    <Info size={16} />,
    warning: <AlertTriangle size={16} />,
    error:   <XCircle size={16} />,
    success: <CheckCircle size={16} />,
  };
  return (
    <div className={`info-box info-box-${type}`}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
        <span style={{ flexShrink: 0, marginTop: 1 }}>{icons[type]}</span>
        <div>
          {title && <strong style={{ display: 'block', marginBottom: 4 }}>{title}</strong>}
          {children}
        </div>
      </div>
    </div>
  );
}

// ─── MetricCard ──────────────────────────────────────────────────────────────

export function MetricCard({ label, value, unit, sublabel, highlight = false, className = '' }) {
  return (
    <div className={`metric-card ${highlight ? 'metric-card-highlight' : ''} ${className}`}>
      <div className="metric-value">
        {value ?? '—'}
        {unit && <span className="metric-unit">{unit}</span>}
      </div>
      <div className="metric-label">{label}</div>
      {sublabel && <div className="metric-sublabel">{sublabel}</div>}
    </div>
  );
}

// ─── Badge ───────────────────────────────────────────────────────────────────

export function Badge({ children, color = 'default', size = 'sm' }) {
  const colorMap = {
    default: { bg: 'var(--ie-surface)',              color: 'var(--ie-text-secondary)' },
    green:   { bg: 'rgba(150, 161, 83, 0.12)',       color: '#4d6617' },
    amber:   { bg: 'rgba(229, 167, 36, 0.12)',       color: '#7a5500' },
    red:     { bg: 'rgba(189, 86, 45, 0.10)',        color: 'var(--ie-accent)' },
    gold:    { bg: 'rgba(189, 86, 45, 0.08)',        color: 'var(--ie-accent)' },
    blue:    { bg: 'rgba(24, 86, 118, 0.10)',        color: '#185676' },
  };
  const c = colorMap[color] || colorMap.default;
  return (
    <span style={{
      background: c.bg,
      color: c.color,
      borderRadius: 4,
      padding: size === 'sm' ? '2px 8px' : '4px 12px',
      fontSize: size === 'sm' ? 11 : 13,
      fontWeight: 600,
      fontFamily: 'var(--ie-font-body)',
      letterSpacing: '0.03em',
      display: 'inline-block',
    }}>
      {children}
    </span>
  );
}

// ─── ProgressBar ─────────────────────────────────────────────────────────────

export function ProgressBar({ value, max = 100, color = 'sinopia', label, showPct = true }) {
  const pct = Math.min(Math.max((value / max) * 100, 0), 100);
  const colorMap = {
    sinopia: 'var(--ie-accent)',
    sunbeam: 'var(--ie-accent)',
    green:   '#96a153',
    amber:   '#e5a724',
    red:     'var(--ie-error)',
  };
  return (
    <div>
      {(label || showPct) && (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 12, color: 'var(--ie-text-secondary)' }}>
          {label && <span>{label}</span>}
          {showPct && <span>{pct.toFixed(0)}%</span>}
        </div>
      )}
      <div className="progress-bar">
        <div
          className="progress-fill"
          style={{ width: `${pct}%`, background: colorMap[color] || colorMap.sinopia }}
        />
      </div>
    </div>
  );
}

// ─── CheckItem ───────────────────────────────────────────────────────────────

export function CheckItem({ checked, onChange, children, disabled = false }) {
  return (
    <label className={`check-item ${checked ? 'checked' : ''}`} style={{ cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.5 : 1 }}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => !disabled && onChange(e.target.checked)}
        style={{ display: 'none' }}
      />
      <span className="check-box">
        {checked && <CheckCircle size={14} color="#ffffff" />}
      </span>
      <span>{children}</span>
    </label>
  );
}

// ─── SectionHeader ───────────────────────────────────────────────────────────

export function SectionHeader({ title, subtitle, icon: Icon, action }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {Icon && <Icon size={20} color="var(--ie-accent)" />}
          <h2 style={{ margin: 0, fontSize: 18, fontFamily: 'var(--ie-font-display)', color: 'var(--ie-text-heading)', fontWeight: 700 }}>{title}</h2>
        </div>
        {action}
      </div>
      {subtitle && <p style={{ margin: '6px 0 0 30px', color: 'var(--ie-text-secondary)', fontSize: 13 }}>{subtitle}</p>}
    </div>
  );
}

// ─── Card ────────────────────────────────────────────────────────────────────

export function Card({ children, className = '', style = {} }) {
  return (
    <div className={`card ${className}`} style={style}>
      {children}
    </div>
  );
}

// ─── Collapsible ─────────────────────────────────────────────────────────────

export function Collapsible({ title, defaultOpen = false, children, badge }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="card" style={{ padding: 0 }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 18px', background: 'none', border: 'none', cursor: 'pointer',
          color: 'var(--ie-text-primary)', fontFamily: 'var(--ie-font-display)', fontSize: 14, fontWeight: 600,
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {title}
          {badge && badge}
        </span>
        {open ? <ChevronUp size={16} color="var(--ie-text-secondary)" /> : <ChevronDown size={16} color="var(--ie-text-secondary)" />}
      </button>
      {open && (
        <div style={{ padding: '0 18px 16px' }}>
          {children}
        </div>
      )}
    </div>
  );
}

// ─── EmptyState ──────────────────────────────────────────────────────────────

export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--ie-text-secondary)' }}>
      {Icon && <Icon size={40} style={{ marginBottom: 16, opacity: 0.35, color: 'var(--ie-text-tertiary)' }} />}
      <h3 style={{ margin: '0 0 8px', color: 'var(--ie-text-primary)', fontSize: 16 }}>{title}</h3>
      {description && <p style={{ margin: '0 0 20px', fontSize: 13 }}>{description}</p>}
      {action}
    </div>
  );
}

// ─── DataTable ───────────────────────────────────────────────────────────────

export function DataTable({ columns, rows, emptyMessage = 'No data' }) {
  if (!rows || rows.length === 0) {
    return <p style={{ color: 'var(--ie-text-secondary)', fontSize: 13, textAlign: 'center', padding: '24px 0' }}>{emptyMessage}</p>;
  }
  return (
    <div className="data-table-wrapper">
      <table className="data-table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key} style={{ textAlign: col.align || 'left', width: col.width }}>
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={row.id ?? i}>
              {columns.map((col) => (
                <td key={col.key} style={{ textAlign: col.align || 'left' }}>
                  {col.render ? col.render(row[col.key], row) : row[col.key] ?? '—'}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Button ──────────────────────────────────────────────────────────────────

export function Button({ children, onClick, variant = 'primary', size = 'md', disabled = false, icon: Icon, type = 'button' }) {
  const sizeStyles = {
    sm: { padding: '6px 14px', fontSize: 12 },
    md: { padding: '10px 20px', fontSize: 14 },
    lg: { padding: '13px 28px', fontSize: 15 },
  };
  return (
    <button
      type={type}
      className={`btn btn-${variant}`}
      onClick={onClick}
      disabled={disabled}
      style={sizeStyles[size]}
    >
      {Icon && <Icon size={size === 'sm' ? 13 : 15} style={{ marginRight: 6 }} />}
      {children}
    </button>
  );
}

// ─── ModuleGuide ─────────────────────────────────────────────────────────────

export function ModuleGuide({ purpose, regulation, outcome, steps = [], tips = [] }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ marginBottom: 20 }}>
      {/* Always-visible context strip */}
      <div style={{
        display: 'flex', alignItems: 'flex-start', gap: 14,
        padding: '14px 18px',
        background: 'var(--ie-surface)',
        border: '1px solid var(--ie-border)',
        borderRadius: open ? '8px 8px 0 0' : 8,
        transition: 'border-radius 0.2s',
      }}>
        <BookOpen size={15} color="var(--ie-text-secondary)" style={{ marginTop: 2, flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <p style={{ margin: 0, fontSize: 13, color: 'var(--ie-text-primary)', lineHeight: 1.65 }}>
            {purpose}
          </p>
          {(regulation || outcome) && (
            <div style={{ display: 'flex', gap: 10, marginTop: 8, flexWrap: 'wrap' }}>
              {regulation && (
                <span style={{
                  fontFamily: 'var(--ie-font-mono)', fontSize: 9, color: 'var(--ie-accent)',
                  letterSpacing: '0.08em', textTransform: 'uppercase',
                  background: 'rgba(189, 86, 45, 0.08)', border: '1px solid rgba(189, 86, 45, 0.2)',
                  borderRadius: 4, padding: '2px 7px',
                }}>
                  {regulation}
                </span>
              )}
              {outcome && (
                <span style={{
                  fontFamily: 'var(--ie-font-mono)', fontSize: 9, color: '#4d6617',
                  letterSpacing: '0.08em', textTransform: 'uppercase',
                  background: 'rgba(150, 161, 83, 0.10)', border: '1px solid rgba(150, 161, 83, 0.25)',
                  borderRadius: 4, padding: '2px 7px',
                }}>
                  Output: {outcome}
                </span>
              )}
            </div>
          )}
        </div>
        <button
          onClick={() => setOpen(o => !o)}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            background: open ? 'rgba(189, 86, 45, 0.08)' : 'var(--ie-card)',
            border: `1px solid ${open ? 'rgba(189, 86, 45, 0.3)' : 'var(--ie-border)'}`,
            borderRadius: 6, padding: '5px 11px', cursor: 'pointer',
            color: open ? 'var(--ie-accent)' : 'var(--ie-text-secondary)',
            fontSize: 11, fontFamily: 'var(--ie-font-body)', fontWeight: 600, flexShrink: 0,
            transition: 'all 0.15s',
          }}
        >
          <HelpCircle size={12} />
          {open ? 'Hide guide' : 'How to use'}
          {open ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
        </button>
      </div>

      {/* Expandable guide body */}
      {open && (
        <div style={{
          background: 'var(--ie-card)',
          border: '1px solid var(--ie-border)',
          borderTop: 'none',
          borderRadius: '0 0 8px 8px',
          padding: '18px 20px',
        }}>
          {steps.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {steps.map((s, i) => (
                <div key={i} style={{ display: 'flex', gap: 12 }}>
                  <div style={{
                    width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
                    background: 'rgba(189, 86, 45, 0.08)', border: '1px solid rgba(189, 86, 45, 0.25)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'var(--ie-font-mono)', fontSize: 11, fontWeight: 700, color: 'var(--ie-accent)',
                  }}>
                    {s.icon || (i + 1)}
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ie-text-heading)',
                      fontFamily: 'var(--ie-font-display)', marginBottom: 2 }}>{s.title}</div>
                    <div style={{ fontSize: 12, color: 'var(--ie-text-secondary)', lineHeight: 1.6 }}>{s.detail}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
          {tips.length > 0 && (
            <div style={{
              marginTop: 16, padding: '10px 14px',
              background: 'rgba(24, 86, 118, 0.05)', border: '1px solid rgba(24, 86, 118, 0.15)',
              borderRadius: 7,
            }}>
              <div style={{ fontSize: 10, fontFamily: 'var(--ie-font-body)', fontWeight: 700,
                color: '#185676', letterSpacing: '0.07em', marginBottom: 7, textTransform: 'uppercase' }}>
                Tips &amp; Common Questions
              </div>
              {tips.map((tip, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 5 }}>
                  <span style={{ color: 'var(--ie-accent)', fontSize: 12, flexShrink: 0 }}>›</span>
                  <span style={{ fontSize: 12, color: 'var(--ie-text-primary)', lineHeight: 1.55 }}>{tip}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Divider ─────────────────────────────────────────────────────────────────

export function Divider({ label }) {
  if (!label) return <hr style={{ border: 'none', borderTop: '1px solid var(--ie-border)', margin: '20px 0' }} />;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0' }}>
      <div style={{ flex: 1, height: 1, background: 'var(--ie-border)' }} />
      <span style={{ color: 'var(--ie-text-secondary)', fontSize: 11, fontFamily: 'var(--ie-font-body)', fontWeight: 600,
        letterSpacing: '0.05em', whiteSpace: 'nowrap', textTransform: 'uppercase' }}>
        {label}
      </span>
      <div style={{ flex: 1, height: 1, background: 'var(--ie-border)' }} />
    </div>
  );
}
