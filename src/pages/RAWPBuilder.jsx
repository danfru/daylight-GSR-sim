import { useState } from 'react';
import { FileText, Copy, Download, CheckCircle } from 'lucide-react';
import { useGSR } from '../store/useGSR.js';
import { BMP_LIBRARY } from '../utils/gsrData.js';
import { generateRAWPText } from '../utils/gsrCalculations.js';
import { SectionHeader, Card, InfoBox, Badge, Button, MetricCard } from '../components/ui.jsx';

export default function RAWPBuilder() {
  const project = useGSR((s) => s.project);
  const footprint = useGSR((s) => s.footprint);
  const climate = useGSR((s) => s.climate);
  const selectedBMPs = useGSR((s) => s.selectedBMPs);

  const [copied, setCopied] = useState(false);
  const [activeSection, setActiveSection] = useState('all');

  const isReady = !!(project.projectName && footprint.results);
  const hasClimate = !!(climate.result);
  const bmpObjects = selectedBMPs.map((id) => BMP_LIBRARY.find((b) => b.id === id)).filter(Boolean);

  const rawpText = isReady
    ? generateRAWPText(project, footprint, selectedBMPs, climate.result)
    : null;

  function copyToClipboard() {
    if (rawpText) {
      navigator.clipboard.writeText(rawpText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  function downloadTxt() {
    if (!rawpText) return;
    const blob = new Blob([rawpText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.projectName || 'GSR-Plan'}_RAWP-GSR-Section.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const SECTIONS = [
    { id: 'all',       label: 'Full Document' },
    { id: 'intro',     label: '1. Introduction' },
    { id: 'footprint', label: '3. Footprint Analysis' },
    { id: 'bmps',      label: '4. Best Management Practices' },
    { id: 'climate',   label: '5. Climate Resiliency' },
  ];

  return (
    <div>
      <SectionHeader
        title="RAWP Builder"
        subtitle="Generate compliant GSR section language for your RAWP and FER"
        icon={FileText}
      />

      {/* Readiness check */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
        {[
          { label: 'Project Setup', done: !!(project.projectName && project.programType), mod: 'intake' },
          { label: 'BMPs Selected', done: selectedBMPs.length > 0, mod: 'bmps' },
          { label: 'Footprint Calc', done: !!(footprint.results), mod: 'footprint' },
          { label: 'Climate Screen', done: hasClimate, mod: 'climate' },
        ].map((item) => (
          <div key={item.label} style={{
            background: item.done ? 'rgba(76,175,80,0.08)' : 'var(--graphite)',
            border: `1px solid ${item.done ? 'rgba(76,175,80,0.3)' : 'var(--elevated)'}`,
            borderRadius: 8,
            padding: '12px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}>
            <CheckCircle size={16} color={item.done ? 'var(--signal-green)' : 'var(--smoke)'} />
            <span style={{ fontSize: 13, color: item.done ? 'var(--bone)' : 'var(--smoke)' }}>
              {item.label}
            </span>
          </div>
        ))}
      </div>

      {!isReady && (
        <InfoBox type="warning" title="Complete Required Modules First">
          Complete Project Intake (Module 1) and Footprint Calculator (Module 3) to generate RAWP text.
          Adding BMPs (Module 2) and Climate Screening (Module 4) will enrich the output.
        </InfoBox>
      )}

      {isReady && (
        <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 20 }}>
          {/* Left: section nav + BMP summary */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Card>
              <p style={{ margin: '0 0 10px', fontSize: 11, color: 'var(--smoke)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>
                Sections
              </p>
              {SECTIONS.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setActiveSection(s.id)}
                  style={{
                    display: 'block', width: '100%', textAlign: 'left', padding: '7px 10px',
                    background: activeSection === s.id ? 'rgba(245,197,24,0.08)' : 'none',
                    border: 'none', borderLeft: activeSection === s.id ? '2px solid var(--sunbeam)' : '2px solid transparent',
                    cursor: 'pointer', color: activeSection === s.id ? 'var(--bone)' : 'var(--smoke)',
                    fontSize: 13, borderRadius: '0 4px 4px 0', marginBottom: 2,
                  }}
                >
                  {s.label}
                </button>
              ))}
            </Card>

            {/* BMP list in RAWP */}
            {bmpObjects.length > 0 && (
              <Card>
                <p style={{ margin: '0 0 10px', fontSize: 11, color: 'var(--smoke)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>
                  BMPs in this RAWP ({bmpObjects.length})
                </p>
                {bmpObjects.map((bmp) => (
                  <div key={bmp.id} style={{ marginBottom: 8, paddingBottom: 8, borderBottom: '1px solid var(--elevated)' }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--bone)' }}>{bmp.title}</div>
                    <Badge color="gold">{bmp.impact} impact</Badge>
                  </div>
                ))}
              </Card>
            )}

            {/* Climate result summary */}
            {hasClimate && (
              <Card>
                <p style={{ margin: '0 0 8px', fontSize: 11, color: 'var(--smoke)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>
                  Climate Result
                </p>
                <Badge color={climate.result.level === 'high' ? 'red' : climate.result.level === 'moderate' ? 'amber' : 'green'}>
                  {climate.result.level.toUpperCase()} RISK
                </Badge>
                <p style={{ margin: '8px 0 0', fontSize: 12, color: 'var(--smoke)', lineHeight: 1.5 }}>
                  {climate.result.requiresFullCVA ? 'Full CVA required' : 'Screening sufficient'}
                </p>
              </Card>
            )}
          </div>

          {/* Right: generated text */}
          <div>
            <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
              <Button variant="primary" size="sm" icon={copied ? CheckCircle : Copy} onClick={copyToClipboard}>
                {copied ? 'Copied!' : 'Copy to Clipboard'}
              </Button>
              <Button variant="ghost" size="sm" icon={Download} onClick={downloadTxt}>
                Download .txt
              </Button>
            </div>

            <div style={{
              background: 'var(--midnight)',
              border: '1px solid var(--graphite)',
              borderRadius: 8,
              padding: '20px 24px',
              fontFamily: 'var(--font-mono)',
              fontSize: 12,
              color: 'var(--bone)',
              lineHeight: 1.8,
              whiteSpace: 'pre-wrap',
              minHeight: 500,
              overflowY: 'auto',
              maxHeight: '70vh',
            }}>
              {rawpText}
            </div>

            {/* BMP RAWP language sections */}
            {bmpObjects.length > 0 && (
              <Card style={{ marginTop: 16 }}>
                <h3 style={{ margin: '0 0 14px', fontSize: 13, color: 'var(--smoke)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>
                  Individual BMP Language Blocks
                </h3>
                {bmpObjects.map((bmp, i) => (
                  <div key={bmp.id} style={{ marginBottom: 16, paddingBottom: 16, borderBottom: i < bmpObjects.length - 1 ? '1px solid var(--elevated)' : 'none' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                      <span style={{ fontWeight: 600, color: 'var(--bone)', fontSize: 13 }}>{bmp.title}</span>
                      {bmp.derRef && <Badge color="gold">{bmp.derRef}</Badge>}
                    </div>
                    <div style={{
                      background: 'var(--midnight)',
                      borderRadius: 6,
                      padding: '10px 14px',
                      fontFamily: 'var(--font-mono)',
                      fontSize: 12,
                      color: 'var(--smoke)',
                      lineHeight: 1.7,
                      whiteSpace: 'pre-wrap',
                      border: '1px solid var(--graphite)',
                    }}>
                      {bmp.rawpLanguage}
                    </div>
                  </div>
                ))}
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
