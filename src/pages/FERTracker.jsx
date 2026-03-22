import { useState } from 'react';
import { BarChart3, Plus, Trash2, TrendingUp } from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { useGSR } from '../store/useGSR.js';
import { fmtMetric } from '../utils/gsrCalculations.js';
import { SectionHeader, Card, InfoBox, MetricCard, Field, Input, Select, Textarea, Button, Badge, DataTable, Divider } from '../components/ui.jsx';

const PHASE_OPTIONS = [
  { value: 'rawp_submission', label: 'RAWP Submission' },
  { value: 'remedial_construction', label: 'Remedial Construction' },
  { value: 'treatment_ops', label: 'Treatment Operations' },
  { value: 'monitoring', label: 'Groundwater Monitoring' },
  { value: 'site_closeout', label: 'Site Closeout / COC' },
  { value: 'other', label: 'Other' },
];

function emptyActual() {
  return { date: '', phase: '', co2e: '', nox: '', sox: '', pm10: '', mmbtu: '', notes: '' };
}

export default function FERTracker() {
  const fer = useGSR((s) => s.fer);
  const setFERPlanned = useGSR((s) => s.setFERPlanned);
  const addFERActual = useGSR((s) => s.addFERActual);
  const updateFERActual = useGSR((s) => s.updateFERActual);
  const deleteFERActual = useGSR((s) => s.deleteFERActual);
  const footprint = useGSR((s) => s.footprint);

  const [newEntry, setNewEntry] = useState(emptyActual());
  const [showAddForm, setShowAddForm] = useState(false);

  // Pre-fill from footprint calculator if available
  function prefillFromFootprint() {
    if (footprint.results?.summary) {
      const s = footprint.results.summary;
      setFERPlanned({
        co2e:  s.co2e,
        nox:   s.nox,
        sox:   s.sox,
        pm10:  s.pm10,
        mmbtu: s.totalMmbtu,
      });
    }
  }

  function submitActual() {
    if (!newEntry.date || !newEntry.phase) return;
    addFERActual({
      ...newEntry,
      co2e:  newEntry.co2e  ? Number(newEntry.co2e)  : null,
      nox:   newEntry.nox   ? Number(newEntry.nox)   : null,
      sox:   newEntry.sox   ? Number(newEntry.sox)   : null,
      pm10:  newEntry.pm10  ? Number(newEntry.pm10)  : null,
      mmbtu: newEntry.mmbtu ? Number(newEntry.mmbtu) : null,
    });
    setNewEntry(emptyActual());
    setShowAddForm(false);
  }

  // Compute cumulative actuals
  const cumulative = fer.actuals.reduce((acc, a) => ({
    co2e:  (acc.co2e  || 0) + (a.co2e  || 0),
    nox:   (acc.nox   || 0) + (a.nox   || 0),
    sox:   (acc.sox   || 0) + (a.sox   || 0),
    pm10:  (acc.pm10  || 0) + (a.pm10  || 0),
    mmbtu: (acc.mmbtu || 0) + (a.mmbtu || 0),
  }), {});

  const pctUsed = (metric) => {
    const plan = fer.planned[metric];
    const act  = cumulative[metric];
    if (!plan || !act) return null;
    return Math.round((act / plan) * 100);
  };

  // Chart data — actuals over time
  const chartData = fer.actuals
    .slice()
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .map((a) => ({
      date: a.date,
      co2e: a.co2e || 0,
      mmbtu: a.mmbtu || 0,
    }));

  const tableColumns = [
    { key: 'date',  label: 'Date',   width: 110 },
    { key: 'phase', label: 'Phase',  render: (v) => PHASE_OPTIONS.find((p) => p.value === v)?.label || v },
    { key: 'co2e',  label: 'CO₂e (MT)',  align: 'right', render: (v) => v?.toFixed(2) ?? '—' },
    { key: 'nox',   label: 'NOx (MT)',   align: 'right', render: (v) => v?.toFixed(4) ?? '—' },
    { key: 'sox',   label: 'SOx (MT)',   align: 'right', render: (v) => v?.toFixed(4) ?? '—' },
    { key: 'pm10',  label: 'PM10 (MT)',  align: 'right', render: (v) => v?.toFixed(4) ?? '—' },
    { key: 'mmbtu', label: 'MMBTU',      align: 'right', render: (v) => v?.toFixed(1) ?? '—' },
    {
      key: 'id', label: '', width: 40,
      render: (v, row) => (
        <button
          onClick={() => deleteFERActual(row.id)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--smoke)', padding: 4 }}
        >
          <Trash2 size={13} />
        </button>
      ),
    },
  ];

  return (
    <div>
      <SectionHeader
        title="FER Tracker"
        subtitle="Track planned vs. actual GSR metrics for Final Engineering Report"
        icon={BarChart3}
      />

      <InfoBox type="info" title="FER GSR Metrics Requirement">
        The Final Engineering Report (FER) must include a comparison of planned vs. actual environmental
        footprint metrics per DER-31 §5.1. This tracker generates the documentation needed for FER submission.
      </InfoBox>

      {/* Planned baseline */}
      <Card style={{ marginTop: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h3 style={{ margin: 0, fontSize: 13, color: 'var(--smoke)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Planned Baseline (RAWP)
          </h3>
          {footprint.results && (
            <Button variant="ghost" size="sm" onClick={prefillFromFootprint}>
              ↓ Import from Footprint Calculator
            </Button>
          )}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12 }}>
          {[
            { key: 'co2e',  label: 'CO₂e (MT CO₂e)' },
            { key: 'nox',   label: 'NOx (MT)' },
            { key: 'sox',   label: 'SOx (MT)' },
            { key: 'pm10',  label: 'PM10 (MT)' },
            { key: 'mmbtu', label: 'Total Energy (MMBTU)' },
          ].map(({ key, label }) => (
            <Field key={key} label={label}>
              <Input
                type="number"
                value={fer.planned[key] ?? ''}
                onChange={(v) => setFERPlanned({ [key]: v === '' ? null : Number(v) })}
                placeholder="—"
                step="0.01"
              />
            </Field>
          ))}
        </div>
      </Card>

      {/* Summary comparison */}
      {fer.actuals.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, marginTop: 16 }}>
          {[
            { key: 'co2e',  label: 'CO₂e',  unit: 'MT' },
            { key: 'nox',   label: 'NOx',   unit: 'MT' },
            { key: 'sox',   label: 'SOx',   unit: 'MT' },
            { key: 'pm10',  label: 'PM10',  unit: 'MT' },
            { key: 'mmbtu', label: 'Energy',unit: 'MMBTU' },
          ].map(({ key, label, unit }) => {
            const pct = pctUsed(key);
            const over = pct !== null && pct > 100;
            return (
              <MetricCard
                key={key}
                label={label}
                value={cumulative[key]?.toFixed(key === 'co2e' || key === 'mmbtu' ? 1 : 4) ?? '—'}
                unit={unit}
                sublabel={pct !== null ? `${pct}% of planned${over ? ' ⚠️' : ''}` : 'No baseline set'}
                highlight={over}
              />
            );
          })}
        </div>
      )}

      {/* Chart */}
      {chartData.length > 1 && (
        <Card style={{ marginTop: 16 }}>
          <h3 style={{ margin: '0 0 14px', fontSize: 13, color: 'var(--smoke)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>
            Emissions Over Time
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--graphite)" />
              <XAxis dataKey="date" tick={{ fill: 'var(--smoke)', fontSize: 11 }} />
              <YAxis yAxisId="left"  tick={{ fill: 'var(--smoke)', fontSize: 11 }} />
              <YAxis yAxisId="right" orientation="right" tick={{ fill: 'var(--smoke)', fontSize: 11 }} />
              <Tooltip contentStyle={{ background: 'var(--ink)', border: '1px solid var(--graphite)' }} />
              <Legend />
              <Line yAxisId="left"  type="monotone" dataKey="co2e"  name="CO₂e (MT)"   stroke="var(--sunbeam)"      strokeWidth={2} dot={{ fill: 'var(--sunbeam)' }} />
              <Line yAxisId="right" type="monotone" dataKey="mmbtu" name="Energy (MMBTU)" stroke="var(--signal-green)" strokeWidth={2} dot={{ fill: 'var(--signal-green)' }} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* Actuals table */}
      <Card style={{ marginTop: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <h3 style={{ margin: 0, fontSize: 13, color: 'var(--smoke)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>
            Actual Entries ({fer.actuals.length})
          </h3>
          <Button variant="primary" size="sm" icon={Plus} onClick={() => setShowAddForm(!showAddForm)}>
            Add Entry
          </Button>
        </div>

        {/* Add entry form */}
        {showAddForm && (
          <div style={{ background: 'var(--elevated)', borderRadius: 8, padding: 16, marginBottom: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
              <Field label="Date" required>
                <Input type="date" value={newEntry.date} onChange={(v) => setNewEntry((p) => ({ ...p, date: v }))} />
              </Field>
              <Field label="Phase" required>
                <Select value={newEntry.phase} onChange={(v) => setNewEntry((p) => ({ ...p, phase: v }))} options={PHASE_OPTIONS} placeholder="Select phase…" />
              </Field>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10, marginBottom: 12 }}>
              {['co2e','nox','sox','pm10','mmbtu'].map((k) => (
                <Field key={k} label={k.toUpperCase()}>
                  <Input type="number" value={newEntry[k]} onChange={(v) => setNewEntry((p) => ({ ...p, [k]: v }))} step="0.01" placeholder="—" />
                </Field>
              ))}
            </div>
            <Field label="Notes">
              <Input value={newEntry.notes} onChange={(v) => setNewEntry((p) => ({ ...p, notes: v }))} placeholder="Phase description, observations…" />
            </Field>
            <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
              <Button variant="primary" size="sm" onClick={submitActual}>Save Entry</Button>
              <Button variant="ghost" size="sm" onClick={() => { setShowAddForm(false); setNewEntry(emptyActual()); }}>Cancel</Button>
            </div>
          </div>
        )}

        <DataTable columns={tableColumns} rows={fer.actuals} emptyMessage="No entries yet — add your first actual measurement above." />
      </Card>
    </div>
  );
}
