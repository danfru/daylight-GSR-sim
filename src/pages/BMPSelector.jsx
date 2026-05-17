import { useState, useMemo } from 'react';
import { Leaf, Search, X, ChevronRight, CheckCircle } from 'lucide-react';
import { useGSR } from '../store/useGSR.js';
import { BMP_LIBRARY, BMP_CATEGORIES } from '../utils/gsrData.js';
import { SectionHeader, Card, InfoBox, Badge, Button, Input, MetricCard, ModuleGuide } from '../components/ui.jsx';

const EFFORT_COLORS = { low: 'green', medium: 'amber', high: 'red' };
const IMPACT_COLORS = { low: 'default', medium: 'amber', high: 'gold' };

export default function BMPSelector() {
  const selectedBMPs = useGSR((s) => s.selectedBMPs);
  const toggleBMP = useGSR((s) => s.toggleBMP);
  const clearBMPs = useGSR((s) => s.clearBMPs);
  const project = useGSR((s) => s.project);

  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [expandedBMP, setExpandedBMP] = useState(null);

  const filtered = useMemo(() => {
    return BMP_LIBRARY.filter((bmp) => {
      const matchCat = activeCategory === 'all' || bmp.category === activeCategory;
      const matchSearch = !search || [bmp.title, bmp.desc, bmp.category]
        .join(' ').toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [search, activeCategory]);

  const selectedCount = selectedBMPs.length;
  const categories = [{ id: 'all', label: 'All BMPs', icon: '◆', color: '#F5C518' }, ...BMP_CATEGORIES];

  return (
    <div>
      <SectionHeader
        title="BMP Selector"
        subtitle="Select Best Management Practices to reduce your remedial footprint"
        icon={Leaf}
        action={selectedCount > 0 && (
          <Button variant="ghost" size="sm" icon={X} onClick={clearBMPs}>
            Clear ({selectedCount})
          </Button>
        )}
      />

      {/* Selection summary */}
      {selectedCount > 0 && (
        <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
          <MetricCard label="BMPs Selected" value={selectedCount} sublabel="Ready for RAWP export" highlight />
          <MetricCard
            label="Categories Covered"
            value={new Set(selectedBMPs.map((id) => BMP_LIBRARY.find((b) => b.id === id)?.category).filter(Boolean)).size}
            sublabel={`of ${BMP_CATEGORIES.length} total`}
          />
          <MetricCard
            label="High-Impact BMPs"
            value={selectedBMPs.filter((id) => BMP_LIBRARY.find((b) => b.id === id)?.impact === 'high').length}
            sublabel="Recommended priority"
          />
        </div>
      )}

      <ModuleGuide
        purpose="Best Management Practices (BMPs) are the core of the GSR Plan. DER-31 §4 requires that applicants evaluate all applicable BMPs across the four GSR pillars and document selected practices in the RAWP. This module lets you browse all 17 NYSDEC-recognized BMPs, understand their environmental impact and implementation effort, and generate the exact regulatory language needed for your RAWP submission."
        regulation="DER-31 §4 · BCP App Q5 · ITRC GSR Guidance (2020)"
        outcome="RAWP-ready BMP language blocks for each selected practice"
        steps={[
          { title: 'Browse by category', detail: 'Use the left sidebar to filter by the four DER-31 pillars: Project Planning, Footprint Reduction, Treatment & Disposal, and Site Ecology. "All BMPs" shows the complete library.' },
          { title: 'Search for specific practices', detail: 'The search bar filters by BMP name, description, and category. Useful when you already know which BMPs you plan to implement (e.g., search "solar" or "native plantings").' },
          { title: 'Expand cards to read RAWP language', detail: 'Click the arrow on any BMP card to expand it and preview the pre-written regulatory language. This is the exact text that will appear in your RAWP GSR section.' },
          { title: 'Toggle to select', detail: 'Click anywhere on the card (or the Select button) to add it to your project. Selected BMPs are highlighted and tracked in the header count. You can change your selections at any time.' },
          { title: 'Review in RAWP Builder', detail: 'Once you\'ve selected all applicable BMPs, go to the RAWP Builder (step 5) to see them assembled into a complete, formatted GSR section document.' },
        ]}
        tips={[
          'DER-31 does not specify a minimum number of BMPs — NYSDEC expects applicants to select all that are technically feasible for the site conditions.',
          'High-impact BMPs (marked with a gold badge) have the greatest potential to reduce GHG emissions and should be prioritized for inclusion.',
          'Even if a BMP is not feasible, DER-31 requires that you document why it was evaluated and rejected. Use the RAWP Builder notes field for this.',
          'BMP language blocks are pre-written to meet DER-31 §4.3 format requirements — but always review and customize them for your specific site conditions.',
        ]}
      />

      <InfoBox type="info" title="DER-31 BMP Requirement">
        NYSDEC DER-31 §4 requires evaluation of applicable BMPs across all four GSR pillars.
        Selected BMPs are automatically compiled into RAWP-ready report language in the RAWP Builder.
        NYSDEC reviewers verify that the BMP evaluation is documented and justified.
      </InfoBox>

      <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', gap: 20, marginTop: 20 }}>
        {/* Category filter sidebar */}
        <div>
          <div style={{ position: 'sticky', top: 72 }}>
            {categories.map((cat) => {
              const count = cat.id === 'all'
                ? BMP_LIBRARY.length
                : BMP_LIBRARY.filter((b) => b.category === cat.id).length;
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: '100%',
                    padding: '9px 12px',
                    background: isActive ? 'rgba(189,86,45,0.08)' : 'none',
                    border: 'none',
                    borderLeft: isActive ? '3px solid var(--sunbeam)' : '3px solid transparent',
                    borderRadius: '0 6px 6px 0',
                    cursor: 'pointer',
                    marginBottom: 2,
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: isActive ? 'var(--bone)' : 'var(--smoke)', fontSize: 13 }}>
                    <span style={{ color: cat.color || 'var(--smoke)' }}>{cat.icon}</span>
                    {cat.label}
                  </span>
                  <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--smoke)' }}>{count}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* BMP list */}
        <div>
          {/* Search */}
          <div style={{ position: 'relative', marginBottom: 16 }}>
            <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--smoke)' }} />
            <Input
              value={search}
              onChange={setSearch}
              placeholder="Search BMPs…"
              className="search-input"
              style={{ paddingLeft: 36 }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {filtered.length === 0 && (
              <p style={{ color: 'var(--smoke)', fontSize: 13, textAlign: 'center', padding: 32 }}>No BMPs match your search.</p>
            )}
            {filtered.map((bmp) => {
              const isSelected = selectedBMPs.includes(bmp.id);
              const isExpanded = expandedBMP === bmp.id;
              const catInfo = BMP_CATEGORIES.find((c) => c.id === bmp.category);

              return (
                <Card
                  key={bmp.id}
                  style={{
                    border: isSelected ? '1px solid rgba(189,86,45,0.40)' : '1px solid var(--graphite)',
                    background: isSelected ? 'rgba(189,86,45,0.04)' : 'var(--graphite)',
                    cursor: 'pointer',
                  }}
                >
                  <div
                    style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}
                    onClick={() => toggleBMP(bmp.id)}
                  >
                    {/* Checkbox */}
                    <div style={{
                      width: 20, height: 20, borderRadius: 4, flexShrink: 0, marginTop: 2,
                      background: isSelected ? 'var(--sunbeam)' : 'var(--elevated)',
                      border: `1px solid ${isSelected ? 'var(--sunbeam)' : 'var(--smoke)'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {isSelected && <CheckCircle size={13} color="#ffffff" />}
                    </div>

                    {/* Content */}
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                        <span style={{ fontWeight: 600, color: 'var(--bone)', fontSize: 14 }}>{bmp.title}</span>
                        {catInfo && (
                          <span style={{ fontSize: 11, color: catInfo.color, fontFamily: 'var(--font-mono)' }}>
                            {catInfo.icon} {catInfo.label}
                          </span>
                        )}
                        <Badge color={EFFORT_COLORS[bmp.effort] || 'default'}>effort: {bmp.effort}</Badge>
                        <Badge color={IMPACT_COLORS[bmp.impact] || 'default'}>impact: {bmp.impact}</Badge>
                      </div>
                      <p style={{ margin: 0, fontSize: 13, color: 'var(--smoke)', lineHeight: 1.5 }}>{bmp.desc}</p>

                      {/* Metrics */}
                      {bmp.metrics && bmp.metrics.length > 0 && (
                        <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
                          {bmp.metrics.map((m) => (
                            <span key={m} style={{
                              fontSize: 10, fontFamily: 'var(--font-mono)',
                              background: 'var(--elevated)', color: 'var(--smoke)',
                              borderRadius: 3, padding: '2px 6px',
                            }}>
                              {m}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Expand toggle */}
                    <button
                      onClick={(e) => { e.stopPropagation(); setExpandedBMP(isExpanded ? null : bmp.id); }}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--smoke)', padding: 4, flexShrink: 0 }}
                    >
                      <ChevronRight size={14} style={{ transform: isExpanded ? 'rotate(90deg)' : 'none', transition: 'transform 0.15s' }} />
                    </button>
                  </div>

                  {/* Expanded RAWP language */}
                  {isExpanded && (
                    <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--elevated)' }} onClick={(e) => e.stopPropagation()}>
                      <p style={{ margin: '0 0 8px', fontSize: 11, color: 'var(--smoke)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                        RAWP Language Preview
                      </p>
                      <div style={{
                        background: 'var(--midnight)',
                        borderRadius: 6,
                        padding: '12px 14px',
                        fontFamily: 'var(--font-mono)',
                        fontSize: 12,
                        color: 'var(--bone)',
                        lineHeight: 1.7,
                        whiteSpace: 'pre-wrap',
                        border: '1px solid var(--graphite)',
                      }}>
                        {bmp.rawpLanguage}
                      </div>
                      {bmp.derRef && (
                        <p style={{ margin: '8px 0 0', fontSize: 11, color: 'var(--smoke)' }}>
                          Regulatory ref: <span style={{ color: 'var(--sunbeam)' }}>{bmp.derRef}</span>
                        </p>
                      )}
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
