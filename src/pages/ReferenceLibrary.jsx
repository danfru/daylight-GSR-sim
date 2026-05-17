import { BookOpen, ExternalLink, Search, Download } from 'lucide-react';
import { useState, useMemo } from 'react';
import { REGULATORY_REFS } from '../utils/gsrData.js';
import { SectionHeader, Card, InfoBox, Badge, Input, ModuleGuide } from '../components/ui.jsx';

const SUPPLEMENTAL_REFS = [
  {
    id: 'epa_sitewise',
    title: 'EPA SiteWise™ Tool',
    type: 'tool',
    source: 'EPA / SURF',
    year: 2024,
    description: 'NYSDEC-accepted environmental footprint calculator for remediation projects. Required for BCP GSR footprint analysis.',
    tags: ['footprint', 'calculator', 'sitewise', 'required'],
    url: 'https://www.sustainableremediation.org/sitewise',
    note: 'Free download; NYSDEC DER-31 explicitly references SiteWise™ as an accepted tool',
  },
  {
    id: 'epa_sefa',
    title: 'EPA SEFA Tool',
    type: 'tool',
    source: 'EPA',
    year: 2023,
    description: 'Spreadsheet-based Environmental Footprint Analysis (SEFA) — alternative to SiteWise for simpler projects.',
    tags: ['footprint', 'calculator', 'alternative'],
    url: 'https://www.epa.gov/greenercleanups/superfund-task-force-recommendations-streamline-and-improve-site-cleanups',
  },
  {
    id: 'sustainrem_library',
    title: 'Sustainable Remediation Forum (SURF) Library',
    type: 'library',
    source: 'SURF / ITRC',
    year: 2024,
    description: 'Comprehensive library of sustainable remediation tools, case studies, and BMPs.',
    tags: ['bmp', 'library', 'surf', 'tools'],
    url: 'https://www.sustainableremediation.org',
  },
  {
    id: 'nysdec_gsr_web',
    title: 'NYSDEC GSR Program Page',
    type: 'regulatory',
    source: 'NYSDEC',
    year: 2025,
    description: 'Official NYSDEC page for Green and Sustainable Remediation program, policy documents, and BCP GSR requirements.',
    tags: ['nysdec', 'policy', 'bcp', 'required'],
    url: 'https://www.dec.ny.gov/chemical/remediation_hudson.html',
  },
  {
    id: 'itrc_gsr',
    title: 'ITRC Green and Sustainable Remediation Guidance',
    type: 'guidance',
    source: 'ITRC',
    year: 2020,
    description: 'Interstate Technology & Regulatory Council GSR state-of-the-practice guidance document.',
    tags: ['guidance', 'itrc', 'bmp'],
    url: 'https://gsr-1.itrcweb.org/',
  },
  {
    id: 'epa_greener_cleanups',
    title: 'EPA Greener Cleanups Initiative',
    type: 'policy',
    source: 'EPA',
    year: 2023,
    description: 'EPA\'s framework for incorporating sustainability into remedial actions — aligned with SiteWise methodology.',
    tags: ['epa', 'policy', 'ghg', 'energy'],
    url: 'https://www.epa.gov/greenercleanups',
  },
  {
    id: 'der31_2025',
    title: 'DER-31: Green and Sustainable Remediation Policy',
    type: 'regulatory',
    source: 'NYSDEC Division of Environmental Remediation',
    year: 2025,
    description: 'Core NYSDEC policy for GSR in BCP and State Superfund programs. Revised effective 2025. Requires four-pillar GSR plan in RAWP/FER.',
    tags: ['nysdec', 'der31', 'policy', 'required', 'rawp', 'fer'],
    url: 'https://www.dec.ny.gov/docs/remediation_hudson_pdf/der31.pdf',
    note: 'Revised 2025 — supersedes 2010 version. Critical read for all BCP consultants.',
  },
  {
    id: 'part375_2025',
    title: '6 NYCRR Part 375 — Environmental Remediation Programs',
    type: 'regulation',
    source: 'NYSDEC / NY State Register',
    year: 2025,
    description: 'Comprehensive revision effective December 31, 2025. Incorporates GSR requirements, updated SCOs, and new climate considerations.',
    tags: ['regulation', 'part375', 'sco', 'nysdec', 'required'],
    url: 'https://www.dec.ny.gov/regulations/2933.html',
  },
  {
    id: 'bcp_app_oct2025',
    title: 'BCP Application Form (October 2025 revision)',
    type: 'form',
    source: 'NYSDEC',
    year: 2025,
    description: 'Revised BCP application — Questions 5 and 6 now require GSR Plan commitment and Climate Vulnerability screening.',
    tags: ['bcp', 'application', 'q5', 'q6', 'climate', 'required'],
    url: 'https://www.dec.ny.gov/chemical/8450.html',
    note: 'Questions 5-6 are new and require explicit GSR and climate responses.',
  },
];

const ALL_REFS = [
  ...REGULATORY_REFS.map((r) => ({
    ...r,
    source: r.agency || r.source || 'NYSDEC',
    tags: r.tags || [r.type || 'regulatory'],
    description: r.description || r.relevance || '',
  })),
  ...SUPPLEMENTAL_REFS,
];

const TYPE_COLORS = {
  regulatory: 'gold',
  regulation: 'gold',
  policy:     'amber',
  guidance:   'green',
  tool:       'green',
  library:    'default',
  form:       'amber',
};

export default function ReferenceLibrary() {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  const types = ['all', ...new Set(ALL_REFS.map((r) => r.type).filter(Boolean))];

  const filtered = useMemo(() => {
    return ALL_REFS.filter((ref) => {
      const matchType = typeFilter === 'all' || ref.type === typeFilter;
      const matchSearch = !search || [ref.title, ref.description, ref.source, ...(ref.tags || [])]
        .join(' ').toLowerCase().includes(search.toLowerCase());
      return matchType && matchSearch;
    });
  }, [search, typeFilter]);

  // Deduplicate by id
  const seen = new Set();
  const deduped = filtered.filter((r) => {
    if (seen.has(r.id)) return false;
    seen.add(r.id);
    return true;
  });

  return (
    <div>
      <SectionHeader
        title="Reference Library"
        subtitle="Regulatory documents, tools, and guidance for NYSDEC GSR compliance"
        icon={BookOpen}
      />

      <ModuleGuide
        purpose="The Reference Library is your quick-access desk reference for every regulatory document, tool, and guidance publication cited in the NYSDEC GSR framework. Three major regulatory changes took effect in late 2025 — DER-31, Part 375, and the BCP Application were all updated simultaneously. Keeping current with these documents is critical; NYSDEC reviewers will flag any RAWP that references superseded versions."
        regulation="DER-31 (Oct 2025) · 6 NYCRR Part 375 (Dec 31 2025) · BCP App Rev. Oct 2025"
        outcome="Citation-ready references for any NYSDEC GSR submittal"
        steps={[
          { title: 'Search by keyword', detail: 'The search bar filters across document titles, descriptions, and tags simultaneously. Try terms like "BMP," "footprint," "SiteWise," "climate," or "RAWP" to find relevant references quickly.' },
          { title: 'Filter by document type', detail: 'Use the type filter buttons (Regulatory, Guidance, Tool, Template) to narrow by category. "Regulatory" shows binding rules; "Guidance" shows interpretive documents; "Tool" shows calculators and software.' },
          { title: 'Read the citation block', detail: 'Each card shows the proper citation format for use in a RAWP or FER. Copy the citation text directly into your references section.' },
          { title: 'Note the Required badge', detail: 'Documents marked with a gold "Required" badge must be specifically addressed in every RAWP GSR section per DER-31. Everything else is referenced or optional supporting material.' },
          { title: 'Check the 2025 updates', detail: 'The Key 2025 Updates banner below highlights the three most significant recent changes. RAWPs submitted after December 31, 2025 must comply with all three updated documents.' },
        ]}
        tips={[
          'DER-31 is the primary GSR guidance document — it takes precedence over all other references. When in doubt, cite DER-31.',
          '6 NYCRR Part 375 became effective December 31, 2025 with significant changes to cleanup standards for all tracks. Projects with an accepted BCP application before that date use the prior version — confirm which version applies to your project.',
          'SiteWise™ v3.2 is the current accepted version. NYSDEC will flag calculations prepared with older versions.',
          'ITRC GSR Guidance (2020) is non-binding but frequently cited by NYSDEC reviewers as supporting context for BMP selection decisions.',
          'The BCP Application Questions 5 and 6 were added in the October 2025 revision — earlier application versions did not include these questions.',
        ]}
      />

      <InfoBox type="info" title="Key 2025 Regulatory Updates">
        Three major changes took effect in late 2025: (1) DER-31 revision requiring four-pillar GSR plans,
        (2) 6 NYCRR Part 375 comprehensive update (effective Dec 31, 2025), and (3) BCP Application
        revision adding Questions 5–6 for GSR and climate commitments.
      </InfoBox>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginTop: 20, marginBottom: 16 }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--smoke)' }} />
          <Input
            value={search}
            onChange={setSearch}
            placeholder="Search references…"
            style={{ paddingLeft: 36 }}
          />
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {types.map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              style={{
                padding: '8px 14px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 12,
                background: typeFilter === t ? 'var(--sunbeam)' : 'var(--graphite)',
                color: typeFilter === t ? '#ffffff' : 'var(--smoke)',
                fontWeight: typeFilter === t ? 700 : 400,
                textTransform: 'capitalize',
              }}
            >
              {t === 'all' ? `All (${ALL_REFS.length})` : t}
            </button>
          ))}
        </div>
      </div>

      {/* Reference cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {deduped.map((ref) => (
          <Card key={ref.id}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 6 }}>
                  <span style={{ fontWeight: 600, color: 'var(--bone)', fontSize: 14 }}>{ref.title}</span>
                  {ref.type && <Badge color={TYPE_COLORS[ref.type] || 'default'}>{ref.type}</Badge>}
                  {ref.year && <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--smoke)' }}>{ref.year}</span>}
                  {(ref.tags || []).includes('required') && <Badge color="red">Required</Badge>}
                </div>
                <p style={{ margin: '0 0 6px', fontSize: 13, color: 'var(--smoke)', lineHeight: 1.5 }}>
                  {ref.description}
                </p>
                {ref.source && (
                  <p style={{ margin: '0 0 6px', fontSize: 11, color: 'var(--smoke)', fontFamily: 'var(--font-mono)' }}>
                    Source: {ref.source}
                  </p>
                )}
                {ref.note && (
                  <div style={{ marginTop: 6, padding: '6px 10px', background: 'rgba(189,86,45,0.06)', borderRadius: 4, border: '1px solid rgba(189,86,45,0.12)' }}>
                    <p style={{ margin: 0, fontSize: 12, color: 'var(--sunbeam)' }}>💡 {ref.note}</p>
                  </div>
                )}
                {ref.tags && ref.tags.length > 0 && (
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 8 }}>
                    {ref.tags.filter((t) => t !== 'required').map((tag) => (
                      <span key={tag} style={{
                        fontSize: 10, fontFamily: 'var(--font-mono)', background: 'var(--elevated)',
                        color: 'var(--smoke)', borderRadius: 3, padding: '1px 6px',
                      }}>
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              {ref.url && (
                <a
                  href={ref.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '8px 14px', borderRadius: 6,
                    background: 'var(--elevated)', border: '1px solid var(--graphite)',
                    color: 'var(--bone)', fontSize: 12, textDecoration: 'none',
                    whiteSpace: 'nowrap', flexShrink: 0,
                    transition: 'border-color 0.15s',
                  }}
                >
                  <ExternalLink size={12} />
                  Open
                </a>
              )}
            </div>
          </Card>
        ))}

        {deduped.length === 0 && (
          <p style={{ textAlign: 'center', color: 'var(--smoke)', padding: 32, fontSize: 13 }}>
            No references match your search.
          </p>
        )}
      </div>

      {/* Quick citation guide */}
      <Card style={{ marginTop: 20 }}>
        <h3 style={{ margin: '0 0 14px', fontSize: 13, color: 'var(--smoke)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>
          Quick Citation Format for RAWP / FER
        </h3>
        <div style={{
          background: 'var(--midnight)', borderRadius: 6, padding: '14px 16px',
          fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--bone)', lineHeight: 1.8,
          border: '1px solid var(--graphite)',
        }}>
          {`New York State Department of Environmental Conservation (NYSDEC). 2025.
  DER-31: Green and Sustainable Remediation Policy. Division of Environmental
  Remediation. Albany, NY.

6 NYCRR Part 375, Environmental Remediation Programs (effective December 31, 2025).

U.S. Environmental Protection Agency (EPA). 2024. SiteWise™ Version 4.0 Tool.
  Superfund Remedy Report, 16th Edition. Office of Land and Emergency Management.

NYSDEC. 2025. Brownfield Cleanup Program Application (October 2025 revision).
  Questions 5 and 6 — Green and Sustainable Remediation and Climate Resiliency.`}
        </div>
      </Card>
    </div>
  );
}
