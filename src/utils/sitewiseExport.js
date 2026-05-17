/**
 * SiteWise™ PDF Export
 * Generates a formatted GSR Footprint Summary report suitable for NYSDEC submittal.
 * Uses jsPDF for layout; no canvas dependency.
 */

import jsPDF from 'jspdf';
import { fmtMT, fmtMmbtu } from './sitewiseCalc.js';

const COMP_LABELS = [
  'Component 1 — Remedial Investigation',
  'Component 2 — Remedial Design',
  'Component 3 — Remedial Action',
  'Component 4 — O&M / Long-term Monitoring',
];

function today() {
  return new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

export async function exportSiteWisePDF({ project, components, reductions, results, projectState }) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'letter' });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const L = 54, R = W - 54, TW = R - L;
  let y = 54;

  // ─── Helpers ──────────────────────────────────────────────────────────────
  const nl = (n = 1) => { y += n; };
  function checkPage(needed = 20) {
    if (y + needed > H - 54) {
      doc.addPage();
      y = 54;
      addPageHeader();
    }
  }
  function addPageHeader() {
    doc.setFontSize(7).setTextColor(130, 130, 130);
    doc.text('DAYLIGHT GSR SIMULATOR  |  EPA SiteWise™ v3.2 Methodology  |  NYSDEC DER-31 §3', L, 24);
    doc.text(`Page ${doc.internal.getNumberOfPages()}`, R, 24, { align: 'right' });
    doc.setDrawColor(40, 40, 40).setLineWidth(0.5).line(L, 30, R, 30);
  }

  function h1(text) {
    checkPage(30);
    doc.setFontSize(18).setFont('helvetica', 'bold').setTextColor(242, 240, 235);
    doc.text(text, L, y);
    y += 22;
  }
  function h2(text) {
    checkPage(24);
    doc.setFontSize(12).setFont('helvetica', 'bold').setTextColor(245, 197, 24);
    doc.text(text, L, y);
    y += 16;
  }
  function h3(text) {
    checkPage(18);
    doc.setFontSize(10).setFont('helvetica', 'bold').setTextColor(200, 200, 200);
    doc.text(text, L, y);
    y += 14;
  }
  function body(text, indent = 0) {
    checkPage(14);
    doc.setFontSize(9).setFont('helvetica', 'normal').setTextColor(180, 180, 180);
    const lines = doc.splitTextToSize(text, TW - indent);
    doc.text(lines, L + indent, y);
    y += lines.length * 12;
  }
  function kv(label, value, bold = false) {
    checkPage(14);
    doc.setFontSize(9).setFont('helvetica', bold ? 'bold' : 'normal').setTextColor(160, 160, 160);
    doc.text(label + ':', L, y);
    doc.setFont('helvetica', 'normal').setTextColor(220, 220, 220);
    doc.text(String(value), L + 130, y);
    y += 14;
  }

  function tableHeader(cols) {
    checkPage(20);
    doc.setFillColor(30, 30, 30);
    doc.rect(L, y - 10, TW, 16, 'F');
    doc.setFontSize(8).setFont('helvetica', 'bold').setTextColor(150, 150, 150);
    let x = L + 4;
    cols.forEach(c => {
      doc.text(c.label, x, y);
      x += c.w;
    });
    y += 10;
    doc.setDrawColor(50, 50, 50).setLineWidth(0.5).line(L, y, R, y);
    y += 4;
  }

  function tableRow(cols, values, highlight = false) {
    checkPage(16);
    if (highlight) {
      doc.setFillColor(40, 35, 10);
      doc.rect(L, y - 10, TW, 14, 'F');
    }
    doc.setFontSize(8).setFont('helvetica', highlight ? 'bold' : 'normal')
       .setTextColor(highlight ? 245 : 200, highlight ? 197 : 200, highlight ? 24 : 200);
    let x = L + 4;
    cols.forEach((c, i) => {
      doc.text(String(values[i] ?? '—'), x, y, { maxWidth: c.w - 4 });
      x += c.w;
    });
    y += 14;
  }

  function divider(color = [40, 40, 40]) {
    checkPage(8);
    doc.setDrawColor(...color).setLineWidth(0.5).line(L, y, R, y);
    y += 8;
  }

  function badge(text, color = [245, 197, 24]) {
    checkPage(20);
    doc.setFillColor(...color, 0.15);
    const tw = doc.getTextWidth(text) + 12;
    doc.roundedRect(L, y - 11, tw, 15, 3, 3, 'F');
    doc.setFontSize(8).setFont('helvetica', 'bold').setTextColor(...color);
    doc.text(text, L + 6, y);
    y += 18;
  }

  // ─── Cover page ───────────────────────────────────────────────────────────
  // Background
  doc.setFillColor(13, 13, 13);
  doc.rect(0, 0, W, H, 'F');
  // Gold accent bar
  doc.setFillColor(245, 197, 24);
  doc.rect(0, 0, 4, H, 'F');

  // Logo / product label
  doc.setFontSize(8).setFont('helvetica', 'bold').setTextColor(245, 197, 24);
  doc.text('DAYLIGHT LABS', L, 70);
  doc.setFontSize(8).setFont('helvetica', 'normal').setTextColor(107, 107, 107);
  doc.text('GSR SIMULATOR', L, 82);

  doc.setFontSize(28).setFont('helvetica', 'bold').setTextColor(242, 240, 235);
  doc.text('Environmental Footprint', L, 140);
  doc.text('Analysis', L, 170);

  doc.setFontSize(11).setFont('helvetica', 'normal').setTextColor(107, 107, 107);
  doc.text('SiteWise™ v3.2 Methodology  ·  NYSDEC DER-31 §3', L, 195);

  doc.setDrawColor(40, 40, 40).setLineWidth(0.5).line(L, 215, R, 215);

  // Project details
  const meta = [
    ['Project Name',   project.projectName || '—'],
    ['Site Name',      project.siteName     || '—'],
    ['Site Address',   project.siteAddress  || '—'],
    ['NYSDEC Site ID', project.siteId       || '—'],
    ['Program Type',   project.programType  || '—'],
    ['Phase',          project.phase        || '—'],
    ['Prepared by',    project.preparedBy   || '—'],
    ['Firm',           project.consultantFirm || '—'],
    ['State (Grid)',   projectState],
    ['Report Date',    today()],
  ];
  let my = 240;
  meta.forEach(([k, v]) => {
    doc.setFontSize(9).setFont('helvetica', 'bold').setTextColor(107, 107, 107);
    doc.text(k, L, my);
    doc.setFont('helvetica', 'normal').setTextColor(200, 200, 200);
    doc.text(v, L + 140, my);
    my += 18;
  });

  // Significance banner
  const { significant, netTotal, flags } = results;
  const bannerY = 430;
  doc.setFillColor(significant ? 50 : 15, significant ? 10 : 40, significant ? 10 : 15);
  doc.roundedRect(L, bannerY, TW, 60, 4, 4, 'F');
  doc.setFontSize(11).setFont('helvetica', 'bold')
     .setTextColor(significant ? 229 : 76, significant ? 57 : 175, significant ? 53 : 80);
  doc.text(significant
    ? 'SIGNIFICANT FOOTPRINT — Full GSR Analysis Required'
    : 'BELOW SIGNIFICANCE THRESHOLDS — Simplified Analysis Acceptable', L + 12, bannerY + 22);
  doc.setFontSize(8).setFont('helvetica', 'normal').setTextColor(150, 150, 150);
  doc.text('DER-31 Table 3-1 thresholds: >100 MT CO₂e · >0.1 MT NOx/SOx/PM10 · >10,000 MMBTU', L + 12, bannerY + 38);
  doc.setFontSize(10).setFont('helvetica', 'bold').setTextColor(245, 197, 24);
  doc.text(`Net CO₂e: ${fmtMT(netTotal.co2e)} MT  |  Energy: ${fmtMmbtu(netTotal.energy_mmbtu)} MMBTU  |  NOx: ${fmtMT(netTotal.nox)} MT`, L + 12, bannerY + 54);

  // Footer
  doc.setFontSize(7).setTextColor(60, 60, 60);
  doc.text('Generated by Daylight GSR Simulator  |  For environmental professional use only  |  Verify all inputs against project records', L, H - 30);
  doc.text(today(), R, H - 30, { align: 'right' });

  // ─── Page 2 — Project Summary ─────────────────────────────────────────────
  doc.addPage();
  doc.setFillColor(13, 13, 13);
  doc.rect(0, 0, W, H, 'F');
  doc.setFillColor(245, 197, 24);
  doc.rect(0, 0, 4, H, 'F');
  y = 54;
  addPageHeader();

  h1('1. Project Overview');
  divider();

  h2('1.1 Project Information');
  meta.forEach(([k, v]) => kv(k, v));
  nl(8);

  h2('1.2 Regulatory Context');
  body('This analysis was prepared in accordance with NYSDEC DER-31 (October 2025 revision), ' +
       '"Ecological Guidance for Brownfield Cleanup Program Sites: Green and Sustainable Remediation (GSR)," ' +
       'and 6 NYCRR Part 375. The SiteWise™ Version 3.2 methodology (EPA/Battelle, 2018) was used to calculate ' +
       'the environmental footprint of this remediation project.');
  nl(6);
  body('Per DER-31 §3, the project footprint analysis addresses: (1) greenhouse gas emissions, ' +
       '(2) energy consumption, and (3) criteria air pollutant emissions (NOx, SOx, PM10). ' +
       'Results are compared against significance thresholds per DER-31 Table 3-1.');

  // ─── Page 3 — Results Summary ─────────────────────────────────────────────
  doc.addPage();
  doc.setFillColor(13, 13, 13);
  doc.rect(0, 0, W, H, 'F');
  doc.setFillColor(245, 197, 24);
  doc.rect(0, 0, 4, H, 'F');
  y = 54;
  addPageHeader();

  h1('2. Footprint Analysis Results');
  divider();

  h2('2.1 Net Project Totals');
  nl(4);

  const metricCols = [
    { label: 'Metric', w: 160 },
    { label: 'Value', w: 100 },
    { label: 'Unit', w: 100 },
    { label: 'Threshold', w: 100 },
    { label: 'Significant?', w: 80 },
  ];
  tableHeader(metricCols);
  [
    ['GHG (CO₂e)', fmtMT(netTotal.co2e), 'MT CO₂e', '100 MT', flags.co2e ? 'YES ⚠' : 'No'],
    ['Energy', fmtMmbtu(netTotal.energy_mmbtu), 'MMBTU', '10,000 MMBTU', flags.mmbtu ? 'YES ⚠' : 'No'],
    ['NOx', fmtMT(netTotal.nox), 'MT', '0.1 MT', flags.nox ? 'YES ⚠' : 'No'],
    ['SOx', fmtMT(netTotal.sox), 'MT', '0.1 MT', flags.sox ? 'YES ⚠' : 'No'],
    ['PM10', fmtMT(netTotal.pm10), 'MT', '0.1 MT', flags.pm10 ? 'YES ⚠' : 'No'],
  ].forEach(row => tableRow(metricCols, row, row[4].startsWith('YES')));
  nl(8);

  h2('2.2 Component Breakdown');
  nl(4);
  const compCols = [
    { label: 'Component', w: 180 },
    { label: 'CO₂e (MT)', w: 80 },
    { label: 'MMBTU', w: 80 },
    { label: 'NOx (MT)', w: 70 },
    { label: 'SOx (MT)', w: 70 },
    { label: 'PM10 (MT)', w: 60 },
  ];
  tableHeader(compCols);
  results.componentResults.forEach((cr, idx) => {
    tableRow(compCols, [
      `Component ${idx + 1}`,
      fmtMT(cr.total.co2e),
      fmtMmbtu(cr.total.energy_mmbtu),
      fmtMT(cr.total.nox),
      fmtMT(cr.total.sox),
      fmtMT(cr.total.pm10),
    ]);
  });
  // Gross
  tableRow(compCols, [
    'GROSS TOTAL',
    fmtMT(results.grossTotal.co2e),
    fmtMmbtu(results.grossTotal.energy_mmbtu),
    fmtMT(results.grossTotal.nox),
    fmtMT(results.grossTotal.sox),
    fmtMT(results.grossTotal.pm10),
  ]);
  // Reductions
  if (results.reductionRow.co2e < 0) {
    tableRow(compCols, [
      'Reductions',
      fmtMT(results.reductionRow.co2e),
      fmtMmbtu(results.reductionRow.energy_mmbtu),
      '—', '—', '—',
    ]);
  }
  // Net total — highlighted
  tableRow(compCols, [
    'NET PROJECT TOTAL',
    fmtMT(netTotal.co2e),
    fmtMmbtu(netTotal.energy_mmbtu),
    fmtMT(netTotal.nox),
    fmtMT(netTotal.sox),
    fmtMT(netTotal.pm10),
  ], true);
  nl(8);

  // ─── Component detail pages ────────────────────────────────────────────────
  results.componentResults.forEach((cr, idx) => {
    checkPage(40);
    h1(`3.${idx + 1} ${cr.label}`);
    divider();

    const subRows = [
      ['Material Production',   cr.subtotals.materialProduction],
      ['Transportation (total)',cr.subtotals.transportation],
      ['Equipment Use (total)', cr.subtotals.equipmentUse],
      ['Residual Handling',     cr.subtotals.residualHandling],
    ];

    const subCols = [
      { label: 'Section', w: 200 },
      { label: 'CO₂e (MT)', w: 90 },
      { label: 'MMBTU', w: 90 },
      { label: 'NOx (MT)', w: 80 },
      { label: 'SOx (MT)', w: 80 },
    ];
    tableHeader(subCols);
    subRows.forEach(([label, r]) => {
      if (!r) return;
      tableRow(subCols, [label, fmtMT(r.co2e), fmtMmbtu(r.energy_mmbtu), fmtMT(r.nox), fmtMT(r.sox)]);
    });
    tableRow(subCols, [
      'COMPONENT TOTAL',
      fmtMT(cr.total.co2e),
      fmtMmbtu(cr.total.energy_mmbtu),
      fmtMT(cr.total.nox),
      fmtMT(cr.total.sox),
    ], true);
    nl(8);

    // Show input data summary
    const comp = components[idx];
    if (comp) {
      h3('Input Data Summary');
      if (comp.materialItems?.length > 0) {
        body(`Materials (${comp.materialItems.length} items): ` +
          comp.materialItems.map(m => `${m.material} ${(m.qty_kg||0).toLocaleString()} kg`).join(', '));
      }
      if (comp.earthwork?.volumeCY > 0) {
        body(`Earthwork: ${comp.earthwork.volumeCY.toLocaleString()} CY, ${comp.earthwork.fuelType}`);
      }
      if (comp.wells?.length > 0) {
        body(`Drilling: ${comp.wells.map(w => `${w.method} ${w.hours}hrs`).join(', ')}`);
      }
      if (comp.residuals?.length > 0) {
        body(`Residuals: ${comp.residuals.map(r => `${r.type} ${r.tons}T @ ${r.miles}mi`).join(', ')}`);
      }
    }
    nl(10);
  });

  // ─── Footprint Reductions ──────────────────────────────────────────────────
  checkPage(60);
  h1('4. Footprint Reduction Measures');
  divider();

  const r = reductions;
  const hasReductions = r.solarKw > 0 || r.windKw > 0 || r.methaneCaptureScfD > 0
    || r.docReductionPct > 0 || r.vfdInstalled;

  if (hasReductions) {
    h2('4.1 Implemented Measures');
    if (r.solarKw > 0) kv('On-site Solar', `${r.solarKw} kW installed`);
    if (r.windKw > 0) kv('On-site Wind', `${r.windKw} kW installed`);
    if (r.methaneCaptureScfD > 0) kv('Methane Capture', `${r.methaneCaptureScfD} scf/day`);
    if (r.docReductionPct > 0) kv('Driving Reduction', `${r.docReductionPct}% reduction`);
    if (r.vfdInstalled) kv('Variable Frequency Drive', 'Installed — ~20% pump energy savings');
    nl(6);
    kv('Total Reduction (CO₂e)', `${fmtMT(Math.abs(results.reductionRow.co2e))} MT saved`, true);
  } else {
    body('No footprint reduction measures were identified for this project. Applicants are encouraged to ' +
         'evaluate feasible BMPs per DER-31 §3.4, including renewable energy, fuel-efficient equipment, ' +
         'and schedule optimization.');
  }

  // ─── Certification / signature block ──────────────────────────────────────
  checkPage(100);
  h1('5. Certification');
  divider();
  body('I certify that the information contained in this environmental footprint analysis is accurate and ' +
       'complete to the best of my knowledge. This analysis was prepared using the EPA SiteWise™ Version 3.2 ' +
       'methodology in accordance with NYSDEC DER-31 (2025) requirements for Green and Sustainable Remediation ' +
       'project footprint analysis.');
  nl(30);
  doc.setDrawColor(80, 80, 80).setLineWidth(0.5);
  doc.line(L, y, L + 200, y);
  y += 14;
  doc.setFontSize(8).setFont('helvetica', 'normal').setTextColor(130, 130, 130);
  doc.text('Signature of Qualified Environmental Professional', L, y);
  y += 24;
  doc.line(L, y, L + 200, y);
  y += 14;
  doc.text('Printed Name & Professional License', L, y);
  y += 24;
  doc.line(L, y, L + 120, y);
  y += 14;
  doc.text('Date', L, y);

  // ─── References ───────────────────────────────────────────────────────────
  checkPage(80);
  h1('References');
  divider();
  [
    'Battelle Memorial Institute. (2018). SiteWise™ Version 3.2 User Guide. Prepared for U.S. Navy NAVFAC, USACE, EPA.',
    'New York State Department of Environmental Conservation. (October 2025). DER-31: Brownfield Cleanup Program — Green and Sustainable Remediation Guidance.',
    '6 NYCRR Part 375: Environmental Remediation Programs (effective December 31, 2025).',
    'BCP Application Questions 5 & 6 — Green and Sustainable Remediation (October 2025 revision).',
    'U.S. EPA. (2018). Emissions & Generation Resource Integrated Database (eGRID). State electricity emission factors.',
    'IPCC. (1995). Second Assessment Report. Global Warming Potentials: N₂O = 310 CO₂e, CH₄ = 21 CO₂e.',
  ].forEach((ref, i) => {
    body(`${i + 1}. ${ref}`, 12);
    nl(2);
  });

  // ─── Save ──────────────────────────────────────────────────────────────────
  const filename = `GSR-Footprint-${(project.projectName || 'Project').replace(/\s+/g, '-')}-${new Date().toISOString().slice(0,10)}.pdf`;
  doc.save(filename);
}
