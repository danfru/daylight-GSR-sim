import { useState } from 'react';
import { ClipboardList, RefreshCw } from 'lucide-react';
import { useGSR } from '../store/useGSR.js';
import { PROGRAM_TYPES, PROJECT_PHASES, CLEANUP_TRACKS, NY_REGIONS, REMEDY_TECHNOLOGIES } from '../utils/gsrData.js';
import { Field, Input, Select, Textarea, SectionHeader, Card, InfoBox, Badge, Button, CheckItem } from '../components/ui.jsx';

const CONTAMINANT_OPTIONS = [
  { value: 'petroleum_hyd',    label: 'Petroleum Hydrocarbons (PHCs)' },
  { value: 'chlorinated_voc',  label: 'Chlorinated VOCs (e.g., TCE, PCE)' },
  { value: 'metals',           label: 'Metals (e.g., Lead, Arsenic)' },
  { value: 'svoc',             label: 'SVOCs (PAHs, PCBs)' },
  { value: 'pfas',             label: 'PFAS / PFOA / PFOS' },
  { value: 'pesticides',       label: 'Pesticides / Herbicides' },
  { value: 'radionuclides',    label: 'Radionuclides' },
  { value: 'other',            label: 'Other / Mixed' },
];

const GSR_CHECKLIST = [
  { id: 'planning',   label: 'Project Planning & Stakeholder Engagement initiated',         required: true },
  { id: 'footprint',  label: 'Environmental Footprint Analysis planned (SiteWise™ or SEFA)', required: true },
  { id: 'bmp',        label: 'BMP evaluation will be documented in RAWP',                   required: true },
  { id: 'climate',    label: 'Climate Resiliency Screening will be completed',               required: true },
  { id: 'q5',         label: 'BCP App Question 5 (GSR Plan commitment) addressed',          required: true },
  { id: 'q6',         label: 'BCP App Question 6 (Climate Vulnerability) addressed',        required: true },
  { id: 'fer_planned',label: 'FER will include GSR metrics tracking',                       required: false },
  { id: 'sitewise',   label: 'SiteWise™ tool access confirmed',                             required: false },
];

const initChecklist = () => {
  const init = {};
  GSR_CHECKLIST.forEach((i) => { init[i.id] = false; });
  return init;
};

export default function ProjectIntake() {
  const project = useGSR((s) => s.project);
  const setProject = useGSR((s) => s.setProject);
  const resetProject = useGSR((s) => s.resetProject);
  const [checklist, setChecklist] = useState(initChecklist);

  function toggleContaminant(val) {
    const curr = project.contaminants || [];
    setProject({ contaminants: curr.includes(val) ? curr.filter((c) => c !== val) : [...curr, val] });
  }

  function toggleTech(val) {
    const curr = project.remedyTechnologies || [];
    setProject({ remedyTechnologies: curr.includes(val) ? curr.filter((t) => t !== val) : [...curr, val] });
  }

  const requiredDone = GSR_CHECKLIST.filter((i) => i.required).every((i) => checklist[i.id]);
  const allDone = GSR_CHECKLIST.every((i) => checklist[i.id]);

  return (
    <div>
      <SectionHeader
        title="Project Intake"
        subtitle="Set up your project — this data flows into all GSR modules"
        icon={ClipboardList}
        action={
          <Button variant="ghost" size="sm" icon={RefreshCw} onClick={resetProject}>
            Reset
          </Button>
        }
      />

      <InfoBox type="info" title="DER-31 Requirement">
        All NYSDEC BCP projects with a RAWP or FER submitted after December 31, 2025 must include a
        GSR Plan addressing the four core pillars. BCP Application Questions 5 and 6 now require
        explicit GSR and Climate commitments.
      </InfoBox>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginTop: 20 }}>
        {/* Left column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Card>
            <h3 style={{ margin: '0 0 16px', fontSize: 13, color: 'var(--smoke)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Project Identity
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <Field label="Project Name" required>
                <Input value={project.projectName} onChange={(v) => setProject({ projectName: v })} placeholder="e.g., 210 Douglass St BCP Remediation" />
              </Field>
              <Field label="Site Name">
                <Input value={project.siteName} onChange={(v) => setProject({ siteName: v })} placeholder="e.g., Former Dry Cleaner" />
              </Field>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <Field label="NYSDEC Site ID">
                  <Input value={project.siteId} onChange={(v) => setProject({ siteId: v })} placeholder="e.g., C241079" />
                </Field>
                <Field label="County">
                  <Input value={project.county} onChange={(v) => setProject({ county: v })} placeholder="e.g., Kings" />
                </Field>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <Field label="Consultant Firm">
                  <Input value={project.consultantFirm} onChange={(v) => setProject({ consultantFirm: v })} placeholder="Firm name" />
                </Field>
                <Field label="Prepared By">
                  <Input value={project.preparedBy} onChange={(v) => setProject({ preparedBy: v })} placeholder="Name / PE / RG" />
                </Field>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <Field label="BCP Acceptance Date">
                  <Input type="date" value={project.acceptanceDate} onChange={(v) => setProject({ acceptanceDate: v })} />
                </Field>
                <Field label="Date Prepared">
                  <Input type="date" value={project.projectDate} onChange={(v) => setProject({ projectDate: v })} />
                </Field>
              </div>
            </div>
          </Card>

          <Card>
            <h3 style={{ margin: '0 0 16px', fontSize: 13, color: 'var(--smoke)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Program &amp; Phase
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <Field label="Program Type" required>
                <Select
                  value={project.programType}
                  onChange={(v) => setProject({ programType: v })}
                  options={PROGRAM_TYPES.map((p) => ({ value: p.id, label: p.name }))}
                  placeholder="Select program…"
                />
              </Field>
              <Field label="Current Project Phase" required>
                <Select
                  value={project.phase}
                  onChange={(v) => setProject({ phase: v })}
                  options={PROJECT_PHASES.map((p) => ({ value: p.id, label: p.name }))}
                  placeholder="Select phase…"
                />
              </Field>
              <Field label="Cleanup Track">
                <Select
                  value={project.cleanupTrack}
                  onChange={(v) => setProject({ cleanupTrack: v })}
                  options={CLEANUP_TRACKS.map((t) => ({ value: t.id, label: t.name }))}
                  placeholder="Select track…"
                />
              </Field>
              <Field label="NY Region" required hint="Affects climate hazard weighting">
                <Select
                  value={project.region}
                  onChange={(v) => setProject({ region: v })}
                  options={NY_REGIONS.map((r) => ({ value: r.id, label: r.name }))}
                  placeholder="Select region…"
                />
              </Field>
            </div>
          </Card>

          <Card>
            <h3 style={{ margin: '0 0 12px', fontSize: 13, color: 'var(--smoke)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Notes
            </h3>
            <Textarea
              value={project.notes}
              onChange={(v) => setProject({ notes: v })}
              placeholder="Project description, site history, relevant regulatory context…"
              rows={4}
            />
          </Card>
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Card>
            <h3 style={{ margin: '0 0 16px', fontSize: 13, color: 'var(--smoke)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Contaminants of Concern
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {CONTAMINANT_OPTIONS.map((opt) => (
                <CheckItem
                  key={opt.value}
                  checked={(project.contaminants || []).includes(opt.value)}
                  onChange={() => toggleContaminant(opt.value)}
                >
                  {opt.label}
                </CheckItem>
              ))}
            </div>
          </Card>

          <Card>
            <h3 style={{ margin: '0 0 4px', fontSize: 13, color: 'var(--smoke)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Remedy Technologies
            </h3>
            <p style={{ margin: '0 0 12px', fontSize: 12, color: 'var(--smoke)' }}>Select all planned technologies</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {REMEDY_TECHNOLOGIES.map((tech) => (
                <CheckItem
                  key={tech.id}
                  checked={(project.remedyTechnologies || []).includes(tech.id)}
                  onChange={() => toggleTech(tech.id)}
                >
                  <span style={{ fontWeight: 500 }}>{tech.name}</span>
                  <span style={{ color: 'var(--smoke)', fontSize: 12, marginLeft: 6 }}>— {tech.category}</span>
                </CheckItem>
              ))}
            </div>
          </Card>

          {/* GSR Readiness Checklist */}
          <Card>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <h3 style={{ margin: 0, fontSize: 13, color: 'var(--smoke)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                GSR Readiness
              </h3>
              <div style={{ display: 'flex', gap: 6 }}>
                <Badge color={requiredDone ? 'green' : 'amber'}>
                  {GSR_CHECKLIST.filter((i) => i.required && checklist[i.id]).length}/{GSR_CHECKLIST.filter((i) => i.required).length} req'd
                </Badge>
                {allDone && <Badge color="gold">✓ Complete</Badge>}
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {GSR_CHECKLIST.map((item) => (
                <CheckItem
                  key={item.id}
                  checked={checklist[item.id]}
                  onChange={(v) => setChecklist((prev) => ({ ...prev, [item.id]: v }))}
                >
                  <span>
                    {item.label}
                    {item.required && (
                      <span style={{ marginLeft: 6, fontSize: 10, color: 'var(--alert-amber)', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                        REQ
                      </span>
                    )}
                  </span>
                </CheckItem>
              ))}
            </div>
            {!requiredDone && (
              <InfoBox type="warning" style={{ marginTop: 14 }}>
                All required items must be addressed before submitting to NYSDEC.
              </InfoBox>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
