import { useState } from 'react';
import { Calculator, Play, Info } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import { useGSR } from '../store/useGSR.js';
import { REMEDY_TECHNOLOGIES } from '../utils/gsrData.js';
import {
  calcProjectFootprint, calcBMPReductions, fmtMetric, checkSignificanceThreshold,
} from '../utils/gsrCalculations.js';
import {
  SectionHeader, Card, InfoBox, MetricCard, Field, Input, Select, Badge, Button, Divider, ProgressBar,
} from '../components/ui.jsx';

const TECH_OPTIONS = [
  { value: 'none', label: 'No active treatment system' },
  ...REMEDY_TECHNOLOGIES.map((t) => ({ value: t.id, label: t.name })),
];

const METRIC_BARS = [
  { key: 'co2e',  label: 'CO₂e (MT)',   color: '#F5C518' },
  { key: 'nox',   label: 'NOx (MT)',    color: '#E8A317' },
  { key: 'sox',   label: 'SOx (MT)',    color: '#FF9F0A' },
  { key: 'pm10',  label: 'PM10 (MT)',   color: '#4CAF50' },
];

export default function FootprintCalculator() {
  const footprint = useGSR((s) => s.footprint);
  const setFootprintInput = useGSR((s) => s.setFootprintInput);
  const setFootprintResults = useGSR((s) => s.setFootprintResults);
  const selectedBMPs = useGSR((s) => s.selectedBMPs);

  const [showBreakdown, setShowBreakdown] = useState(false);

  function runCalc() {
    const result = calcProjectFootprint({
      excavationCY:           footprint.excavationCY,
      transportMiles:         footprint.transportMiles,
      treatmentTech:          footprint.treatmentTech,
      treatmentDays:          footprint.treatmentDays,
      treatmentFlowGPM:       footprint.treatmentFlowGPM,
      monitoringRounds:       footprint.monitoringRounds,
      monitoringWellCount:    footprint.monitoringWellCount,
      equipmentHoursOverride: footprint.equipmentHoursOverride,
    });
    setFootprintResults(result);
  }

  const results = footprint.results;
  const bmpResult = results && selectedBMPs.length > 0
    ? calcBMPReductions(results, selectedBMPs)
    : null;
  const threshold = results ? checkSignificanceThreshold(results.summary.co2e) : null;

  // Chart data
  const chartData = results ? METRIC_BARS.map(({ key, label, color }) => ({
    label,
    baseline: results.summary[key] ?? 0,
    projected: bmpResult ? bmpResult.projected[key] ?? 0 : null,
    color,
  })) : [];

  // Breakdown rows
  const breakdown = results?.breakdown ?? {};
  const brkRows = [
    { label: 'Excavation', ...breakdown.excavation, kwh: 0 },
    { label: 'Transport',  ...breakdown.transport,  kwh: 0 },
    { label: 'Treatment',  ...breakdown.treatment },
    { label: 'Monitoring', ...breakdown.monitoring },
  ];

  return (
    <div>
      <SectionHeader
        title="Footprint Calculator"
        subtitle="SiteWise™-calibrated GHG, energy, and air emissions calculator"
        icon={Calculator}
      />

      <InfoBox type="info" title="SiteWise™ Methodology">
        Emission factors are calibrated to the EPA SiteWise™ tool (SURF library). Results are
        suitable for inclusion in RAWP footprint analysis per DER-31 §4.2. For final RAWP
        submission, verify with SiteWise™ directly.
      </InfoBox>

      <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: 20, marginTop: 20 }}>
        {/* Inputs */}
        <Card>
          <h3 style={{ margin: '0 0 16px', fontSize: 13, color: 'var(--smoke)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Project Parameters
          </h3>

          <Divider label="EXCAVATION &amp; TRANSPORT" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Field label="Soil Volume to Excavate / Remove" hint="Cubic yards (CY)">
              <Input
                type="number"
                value={footprint.excavationCY}
                onChange={(v) => setFootprintInput({ excavationCY: v })}
                min={0}
                placeholder="e.g., 5000"
              />
            </Field>
            <Field label="Haul Distance (one-way)" hint="Miles to disposal facility">
              <Input
                type="number"
                value={footprint.transportMiles}
                onChange={(v) => setFootprintInput({ transportMiles: v })}
                min={1}
                placeholder="e.g., 20"
              />
            </Field>
            <Field label="Equipment Hours Override" hint="Leave blank to auto-calculate">
              <Input
                type="number"
                value={footprint.equipmentHoursOverride ?? ''}
                onChange={(v) => setFootprintInput({ equipmentHoursOverride: v === '' ? null : v })}
                min={0}
                placeholder="Auto"
              />
            </Field>
          </div>

          <Divider label="TREATMENT SYSTEM" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Field label="Treatment Technology">
              <Select
                value={footprint.treatmentTech}
                onChange={(v) => setFootprintInput({ treatmentTech: v })}
                options={TECH_OPTIONS}
              />
            </Field>
            {footprint.treatmentTech !== 'none' && (
              <>
                <Field label="Operating Duration" hint="Days">
                  <Input
                    type="number"
                    value={footprint.treatmentDays}
                    onChange={(v) => setFootprintInput({ treatmentDays: v })}
                    min={0}
                    placeholder="e.g., 365"
                  />
                </Field>
                <Field label="Flow Rate" hint="GPM (for pump & treat / air stripping)">
                  <Input
                    type="number"
                    value={footprint.treatmentFlowGPM}
                    onChange={(v) => setFootprintInput({ treatmentFlowGPM: v })}
                    min={0}
                    placeholder="e.g., 10"
                  />
                </Field>
              </>
            )}
          </div>

          <Divider label="MONITORING" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Field label="Monitoring Rounds" hint="Annual rounds">
              <Input
                type="number"
                value={footprint.monitoringRounds}
                onChange={(v) => setFootprintInput({ monitoringRounds: v })}
                min={0}
                max={52}
                placeholder="4"
              />
            </Field>
            <Field label="Monitoring Wells">
              <Input
                type="number"
                value={footprint.monitoringWellCount}
                onChange={(v) => setFootprintInput({ monitoringWellCount: v })}
                min={0}
                placeholder="6"
              />
            </Field>
          </div>

          <Button
            variant="primary"
            icon={Play}
            onClick={runCalc}
            style={{ width: '100%', marginTop: 20 }}
          >
            Calculate Footprint
          </Button>
        </Card>

        {/* Results */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {!results ? (
            <Card style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300, flexDirection: 'column', gap: 12, color: 'var(--smoke)' }}>
              <Calculator size={40} style={{ opacity: 0.3 }} />
              <p style={{ margin: 0, fontSize: 14 }}>Enter project parameters and click Calculate</p>
            </Card>
          ) : (
            <>
              {/* Significance threshold */}
              {threshold && (
                <div style={{
                  background: threshold.level === 'major' ? 'rgba(229,57,53,0.08)' : threshold.level === 'significant' ? 'rgba(255,159,10,0.08)' : 'rgba(76,175,80,0.08)',
                  border: `1px solid var(--${threshold.color})`,
                  borderRadius: 8,
                  padding: '12px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                }}>
                  <Info size={16} color={`var(--${threshold.color})`} />
                  <span style={{ fontSize: 13, color: 'var(--bone)' }}>
                    <strong>{threshold.label}</strong> — {threshold.requiresDetail ? 'Detailed footprint analysis required per DER-31' : 'Standard footprint documentation sufficient'}
                  </span>
                </div>
              )}

              {/* Summary metrics */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                <MetricCard label="GHG Emissions" value={results.summary.co2e?.toLocaleString()} unit="MT CO₂e" highlight />
                <MetricCard label="Total Energy"   value={results.summary.totalMmbtu?.toLocaleString()} unit="MMBTU" />
                <MetricCard label="NOx"            value={fmtMetric(results.summary.nox, 'MT')} />
                <MetricCard label="SOx"            value={fmtMetric(results.summary.sox, 'MT')} />
                <MetricCard label="PM10"           value={fmtMetric(results.summary.pm10, 'MT')} />
                <MetricCard label="Diesel Used"    value={results.summary.totalDieselGallons?.toLocaleString()} unit="gal" />
              </div>

              {/* BMP reduction comparison */}
              {bmpResult && (
                <Card>
                  <h3 style={{ margin: '0 0 12px', fontSize: 13, color: 'var(--smoke)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>
                    BMP Reduction Potential ({selectedBMPs.length} BMPs applied)
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 16 }}>
                    <div>
                      <p style={{ margin: '0 0 4px', fontSize: 12, color: 'var(--smoke)' }}>CO₂e Reduction</p>
                      <ProgressBar value={bmpResult.reductionPct.co2e} color="green" />
                      <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--signal-green)' }}>
                        −{fmtMetric(bmpResult.reductions.co2e, 'MT')} ({bmpResult.reductionPct.co2e}%)
                      </p>
                    </div>
                    <div>
                      <p style={{ margin: '0 0 4px', fontSize: 12, color: 'var(--smoke)' }}>NOx Reduction</p>
                      <ProgressBar value={bmpResult.reductionPct.nox} color="green" />
                      <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--signal-green)' }}>
                        −{fmtMetric(bmpResult.reductions.nox, 'MT')} ({bmpResult.reductionPct.nox}%)
                      </p>
                    </div>
                    <div>
                      <p style={{ margin: '0 0 4px', fontSize: 12, color: 'var(--smoke)' }}>Energy Reduction</p>
                      <ProgressBar value={bmpResult.reductionPct.mmbtu} color="green" />
                      <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--signal-green)' }}>
                        −{fmtMetric(bmpResult.reductions.mmbtu, 'MMBTU')} ({bmpResult.reductionPct.mmbtu}%)
                      </p>
                    </div>
                  </div>

                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={chartData} barGap={4}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--graphite)" />
                      <XAxis dataKey="label" tick={{ fill: 'var(--smoke)', fontSize: 11 }} />
                      <YAxis tick={{ fill: 'var(--smoke)', fontSize: 11 }} />
                      <Tooltip
                        contentStyle={{ background: 'var(--ink)', border: '1px solid var(--graphite)', borderRadius: 6 }}
                        labelStyle={{ color: 'var(--bone)' }}
                      />
                      <Bar dataKey="baseline" name="Baseline" fill="var(--graphite)" radius={[3,3,0,0]}>
                        {chartData.map((d, i) => <Cell key={i} fill={d.color} opacity={0.6} />)}
                      </Bar>
                      <Bar dataKey="projected" name="With BMPs" fill="var(--signal-green)" radius={[3,3,0,0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </Card>
              )}

              {/* Breakdown toggle */}
              <Button variant="ghost" size="sm" onClick={() => setShowBreakdown(!showBreakdown)}>
                {showBreakdown ? 'Hide' : 'Show'} Source Breakdown
              </Button>

              {showBreakdown && (
                <Card>
                  <h3 style={{ margin: '0 0 14px', fontSize: 13, color: 'var(--smoke)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>
                    Emission Sources
                  </h3>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                    <thead>
                      <tr>
                        {['Source','Diesel (gal)','kWh','MMBTU','Details'].map((h) => (
                          <th key={h} style={{ padding: '6px 10px', textAlign: 'left', color: 'var(--smoke)', fontSize: 11, fontFamily: 'var(--font-mono)', borderBottom: '1px solid var(--graphite)' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {brkRows.map((row) => (
                        <tr key={row.label} style={{ borderBottom: '1px solid var(--elevated)' }}>
                          <td style={{ padding: '8px 10px', color: 'var(--bone)', fontWeight: 500 }}>{row.label}</td>
                          <td style={{ padding: '8px 10px', fontFamily: 'var(--font-mono)', color: 'var(--smoke)' }}>{row.gallons?.toLocaleString() ?? '—'}</td>
                          <td style={{ padding: '8px 10px', fontFamily: 'var(--font-mono)', color: 'var(--smoke)' }}>{row.kwh?.toLocaleString() ?? '—'}</td>
                          <td style={{ padding: '8px 10px', fontFamily: 'var(--font-mono)', color: 'var(--smoke)' }}>{row.mmbtu?.toLocaleString() ?? '—'}</td>
                          <td style={{ padding: '8px 10px', color: 'var(--smoke)', fontSize: 12 }}>
                            {row.label === 'Excavation' && `${row.cy?.toLocaleString()} CY · ${row.hours} hrs`}
                            {row.label === 'Transport'  && `${row.loads} loads · ${row.totalMiles?.toLocaleString()} mi`}
                            {row.label === 'Treatment'  && `${row.days} days · ${row.tech}`}
                            {row.label === 'Monitoring' && `${row.rounds} rounds · ${row.wells} wells`}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </Card>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
