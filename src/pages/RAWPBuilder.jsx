import { useState } from 'react';
import { FileText, Copy, Download, CheckCircle } from 'lucide-react';
import { useGSR } from '../store/useGSR.js';
import { useSiteWise } from '../store/useSiteWise.js';
import { BMP_LIBRARY } from '../utils/gsrData.js';
import { generateRAWPText } from '../utils/gsrCalculations.js';
import { SectionHeader, Card, InfoBox, Badge, Button, MetricCard, ModuleGuide } from '../components/ui.jsx';

export default function RAWPBuilder() {
  const project = useGSR((s) => s.project);
  const climate = useGSR((s) => s.climate);
  const selectedBMPs = useGSR((s) => s.selectedBMPs);
  const swResults = useSiteWise((s) => s.results);

  const [copied, setCopied] = useState(false);
  const [activeSection, setActiveSection] = useState('all');

  // Build a footprint-compatible object from SiteWise net totals so generateRAWPText still works
  const footprintCompat = swResults ? {
    results: {
      summary: {
        co2e:       swResults.netTotal.co2e,
        totalMmbtu: swResults.netTotal.energy_mmbtu,
        nox:        swResults.netTotal.nox,
        sox:        swResults.netTotal.sox,
        pm10:       swResults.netTotal.pm10,
      },
    },
  } : null;

  const isReady = !!(project.projectName && footprintCompat);
  const hasClimate = !!(climate.result);
  const bmpObjects = selectedBMPs.map((id) => BMP_LIBRARY.find((b) => b.id === id)).filter(Boolean);

  const rawpText = isReady
    ? generateRAWPText(project, footprintCompat, selectedBMPs, climate.result)
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
    { id: 'footprint', label: '3. Footprint Analysis (SiteWise™)' },
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

      <ModuleGuide
        purpose="The RAWP Builder assembles the complete GSR section of your Remedial Action Work Plan from data entered across all modules. It produces DER-31-compliant regulatory language covering all four GSR pillars — automatically pulling in your project data, SiteWise™ footprint metrics, selected BMPs with site-specific justifications, and your climate screening result. The output is formatted for direct insertion into a RAWP or as a standalone GSR Plan document."
        regulation="DER-31 §4.3 · 6 NYCRR Part 375-1.9(e) · BCP App Q5 & Q6"
        outcome="Copy-ready or downloadable GSR section text for RAWP submission"
        steps={[
          { title: 'Complete the 4 prerequisites', detail: 'The four readiness indicators below show which modules still need data. Project Setup and SiteWise™ are required to generate any text. BMPs and Climate Screening add additional sections. All four should be green before final RAWP preparation.' },
          { title: 'Select a section view', detail: 'Use the section tabs to review individual sections (Introduction, Footprint Analysis, BMPs, Climate) or view the full assembled document. This lets you spot-check individual sections without scrolling the entire document.' },
          { title: 'Review and copy the text', detail: 'The generated text uses your actual project data — site name, program type, footprint metrics, and BMP details. Read through carefully and verify all values match your project records. Use the Copy button to copy the full text to your clipboard.' },
          { title: 'Download the .txt file', detail: 'The Download button saves the full GSR section as a plain text file that can be pasted into Word, Bluebeam, or any document editor. Plain text formatting is intentional — Word will apply your firm\'s document template.' },
          { title: 'Copy individual BMP blocks', detail: 'Scroll below the main document to find individual BMP language blocks. Each can be copied independently — useful if BMPs need to go in different sections of a complex RAWP.' },
        ]}
        tips={[
          'NYSDEC DER-31 §4.3.2 specifies the required RAWP GSR section format. The generated text matches this format but should be reviewed by the project QEP before submission.',
          'The footprint significance determination (significant vs. below threshold) is automatically included based on your SiteWise™ results.',
          'BMP language blocks include the standard NYSDEC RAWP format: practice description, applicability rationale, and implementation commitment. Customize the site-specific details before submitting.',
          'If you update any module data, come back to the RAWP Builder — the text regenerates automatically from the latest store values.',
          'The RAWP Builder does not yet produce a formatted PDF. For the full formatted GSR Footprint Summary PDF with certification block, use the SiteWise™ Calculator export.',
        ]}
      />

      {/* Readiness check */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
        {[
          { label: 'Project Setup', done: !!(project.projectName && project.programType), mod: 'intake' },
          { label: 'BMPs Selected', done: selectedBMPs.length > 0, mod: 'bmps' },
          { label: 'SiteWise™ Calc', done: !!swResults, mod: 'sitewise' },
          { label: 'Climate Screen', done: hasClimate, mod: 'climate' },
        ].map((item) => (
          <div key={item.label} style={{
            background: item.done ? 'rgba(150,161,83,0.08)' : 'var(--graphite)',
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
                    background: activeSection === s.id ? 'rgba(189,86,45,0.08)' : 'none',
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
