/**
 * Daylight Labs UI Component Library
 * Reusable primitives for the GSR Simulator
 */

import { AlertTriangle, CheckCircle, Info, XCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

// ─── Field / Label ───────────────────────────────────────────────────────────

export function Field({ label, hint, error, required, children, className = '' }) {
  return (
    <div className={`field ${className}`}>
      {label && (
        <label className="field-label">
          {label}
          {required && <span style={{ color: 'var(--sunbeam)', marginLeft: 4 }}>*</span>}
        </label>
      )}
      {children}
      {hint && !error && <p className="field-hint">{hint}</p>}
      {error && <p className="field-hint" style={{ color: 'var(--alert-red)' }}>{error}</p>}
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
      {placeholder && <option value="">{placeholder}</option>}
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
      {label && <span style={{ color: 'var(--bone)', fontSize: 14 }}>{label}</span>}
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
    default: { bg: 'var(--elevated)', color: 'var(--smoke)' },
    green:   { bg: 'rgba(76,175,80,0.15)', color: 'var(--signal-green)' },
    amber:   { bg: 'rgba(255,159,10,0.15)', color: 'var(--alert-amber)' },
    red:     { bg: 'rgba(229,57,53,0.15)', color: 'var(--alert-red)' },
    gold:    { bg: 'rgba(245,197,24,0.15)', color: 'var(--sunbeam)' },
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
      fontFamily: 'var(--font-mono)',
      letterSpacing: '0.03em',
      display: 'inline-block',
    }}>
      {children}
    </span>
  );
}

// ─── ProgressBar ─────────────────────────────────────────────────────────────

export function ProgressBar({ value, max = 100, color = 'sunbeam', label, showPct = true }) {
  const pct = Math.min(Math.max((value / max) * 100, 0), 100);
  const colorMap = {
    sunbeam: 'var(--sunbeam)',
    green:   'var(--signal-green)',
    amber:   'var(--alert-amber)',
    red:     'var(--alert-red)',
  };
  return (
    <div>
      {(label || showPct) && (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 12, color: 'var(--smoke)' }}>
          {label && <span>{label}</span>}
          {showPct && <span>{pct.toFixed(0)}%</span>}
        </div>
      )}
      <div className="progress-bar">
        <div
          className="progress-fill"
          style={{ width: `${pct}%`, background: colorMap[color] || colorMap.sunbeam }}
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
        {checked && <CheckCircle size={14} />}
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
          {Icon && <Icon size={20} color="var(--sunbeam)" />}
          <h2 style={{ margin: 0, fontSize: 18, fontFamily: 'var(--font-display)', color: 'var(--bone)' }}>{title}</h2>
        </div>
        {action}
      </div>
      {subtitle && <p style={{ margin: '6px 0 0 30px', color: 'var(--smoke)', fontSize: 13 }}>{subtitle}</p>}
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
          color: 'var(--bone)', fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 600,
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {title}
          {badge && badge}
        </span>
        {open ? <ChevronUp size={16} color="var(--smoke)" /> : <ChevronDown size={16} color="var(--smoke)" />}
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
    <div style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--smoke)' }}>
      {Icon && <Icon size={40} style={{ marginBottom: 16, opacity: 0.4 }} />}
      <h3 style={{ margin: '0 0 8px', color: 'var(--bone)', fontSize: 16 }}>{title}</h3>
      {description && <p style={{ margin: '0 0 20px', fontSize: 13 }}>{description}</p>}
      {action}
    </div>
  );
}

// ─── DataTable ───────────────────────────────────────────────────────────────

export function DataTable({ columns, rows, emptyMessage = 'No data' }) {
  if (!rows || rows.length === 0) {
    return <p style={{ color: 'var(--smoke)', fontSize: 13, textAlign: 'center', padding: '24px 0' }}>{emptyMessage}</p>;
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

// ─── Divider ─────────────────────────────────────────────────────────────────

export function Divider({ label }) {
  if (!label) return <hr style={{ border: 'none', borderTop: '1px solid var(--graphite)', margin: '20px 0' }} />;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0' }}>
      <div style={{ flex: 1, height: 1, background: 'var(--graphite)' }} />
      <span style={{ color: 'var(--smoke)', fontSize: 11, fontFamily: 'var(--font-mono)', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{label}</span>
      <div style={{ flex: 1, height: 1, background: 'var(--graphite)' }} />
    </div>
  );
}
