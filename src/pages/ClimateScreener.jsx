import { useState } from 'react';
import { CloudLightning, CheckCircle, AlertTriangle, XCircle, ArrowRight } from 'lucide-react';
import { useGSR } from '../store/useGSR.js';
import { CLIMATE_HAZARDS, NY_REGIONS } from '../utils/gsrData.js';
import { calcClimateScore } from '../utils/gsrCalculations.js';
import { SectionHeader, Card, InfoBox, Badge, Button, MetricCard, ProgressBar, ModuleGuide } from '../components/ui.jsx';

const HAZARD_ICONS = {
  flooding:       '🌊',
  sea_level_rise: '🌊',
  extreme_heat:   '🌡️',
  erosion:        '⛰️',
  wildfire:       '🔥',
  drought:        '☀️',
};

const HAZARD_LABELS = {
  flooding:       'Flooding / Stormwater',
  sea_level_rise: 'Sea Level Rise / Coastal',
  extreme_heat:   'Extreme Heat Events',
  erosion:        'Erosion / Slope Instability',
  wildfire:       'Wildfire Risk',
  drought:        'Drought / Water Scarcity',
};

const ANSWER_KEYS = {
  flooding:       'flooding',
  sea_level_rise: 'seaLevel',
  extreme_heat:   'extremeHeat',
  erosion:        'erosion',
  wildfire:       'wildfire',
  drought:        'drought',
};

export default function ClimateScreener() {
  const climate = useGSR((s) => s.climate);
  const setClimateAnswer = useGSR((s) => s.setClimateAnswer);
  const setClimateResult = useGSR((s) => s.setClimateResult);
  const resetClimate = useGSR((s) => s.resetClimate);
  const project = useGSR((s) => s.project);

  const [step, setStep] = useState(0); // 0=intro, 1-6=hazard questions, 7=result
  const hazardKeys = Object.keys(HAZARD_LABELS);
  const currentHazardKey = hazardKeys[step - 1];
  const currentHazard = CLIMATE_HAZARDS[currentHazardKey];
  const ansKey = ANSWER_KEYS[currentHazardKey];

  function runScreening() {
    const result = calcClimateScore(
      {
        flooding:     climate.flooding,
        seaLevel:     climate.seaLevel,
        extremeHeat:  climate.extremeHeat,
        erosion:      climate.erosion,
        wildfire:     climate.wildfire,
        drought:      climate.drought,
      },
      project.region || 'nyc'
    );
    setClimateResult(result);
    setStep(7);
  }

  const regionLabel = NY_REGIONS.find((r) => r.id === project.region)?.name || project.region || 'Not set';
  const result = climate.result;

  const levelColors = { high: 'red', moderate: 'amber', low: 'green' };
  const levelIcons  = { high: XCircle, moderate: AlertTriangle, low: CheckCircle };

  return (
    <div>
      <SectionHeader
        title="Climate Screener"
        subtitle="Step-by-step climate vulnerability screening per DER-31 §4.4"
        icon={CloudLightning}
        action={result && (
          <Button variant="ghost" size="sm" onClick={() => { resetClimate(); setStep(0); }}>
            Re-screen
          </Button>
        )}
      />

      {/* Intro / step 0 */}
      {step === 0 && (
        <div>
          <ModuleGuide
            purpose="The Climate Screener evaluates whether your site is vulnerable to six climate hazards identified in NYSDEC DER-31 §4.4 and BCP Application Question 6. The result determines if your RAWP needs a simple narrative screening statement or a full Climate Vulnerability Assessment (CVA) — a significantly more detailed analysis. Your NY region automatically weights the scoring to reflect local climate conditions."
            regulation="DER-31 §4.4 · BCP App Q6 (Oct 2025) · NY Climate Act (2019)"
            outcome="Screening result: Low / Moderate / High vulnerability + CVA determination"
            steps={[
              { title: 'Know your site region', detail: 'Set your NY region in Project Intake first — it affects the hazard weighting. NYC and Long Island have much higher coastal flooding and heat scores than the Adirondacks.' },
              { title: 'Step through 6 hazard questions', detail: 'For each hazard (flooding, sea level rise, extreme heat, erosion, wildfire, drought) answer Yes or No based on known site conditions. Read the context information provided for each hazard — it explains what to look for.' },
              { title: 'Understand the scoring', detail: 'Each Yes answer adds to a weighted vulnerability score. Scores are region-adjusted: a "flooding" Yes in NYC carries more weight than the same answer in western NY. The algorithm mirrors NYSDEC\'s DER-31 Table 4-1 approach.' },
              { title: 'Read your result', detail: 'Low = screening statement sufficient. Moderate = recommend a CVA. High = full CVA required in the RAWP. The result is automatically referenced in your RAWP Builder narrative.' },
              { title: 'Re-screen if conditions change', detail: 'Use the Re-screen button to start over. This is useful if site conditions change between project phases or if new climate data becomes available.' },
            ]}
            tips={[
              'Not sure about a hazard? FEMA\'s Flood Map Service Center (msc.fema.gov) shows flood zone designations — a site in Zone AE is a "Yes" for flooding.',
              'Sea Level Rise only applies to coastal sites within the 100-year tidal flood zone — most inland sites answer "No."',
              'Wildfire risk in NY is generally low except for parts of Long Island Pine Barrens and some Catskill areas.',
              'A High screening result doesn\'t mean the project can\'t proceed — it means the RAWP must include a CVA that identifies adaptation measures for the remedy design.',
              'NYSDEC has published a Climate Vulnerability Assessment guidance document. DER-31 Appendix D contains the required CVA format.',
            ]}
          />

          <InfoBox type="info" title="DER-31 Climate Resiliency Requirement">
            BCP Application Question 6 and DER-31 §4.4 require a Climate Resiliency component in all GSR Plans.
            This screener walks you through six hazard categories. High-risk projects require a full
            Climate Vulnerability Assessment (CVA) prepared by a qualified professional.
          </InfoBox>

          <Card style={{ marginTop: 20, textAlign: 'center', padding: '40px 24px' }}>
            <CloudLightning size={48} color="var(--sunbeam)" style={{ marginBottom: 16 }} />
            <h2 style={{ margin: '0 0 8px', fontFamily: 'var(--font-display)', fontSize: 22, color: 'var(--bone)' }}>
              Climate Vulnerability Screening
            </h2>
            <p style={{ margin: '0 0 8px', color: 'var(--smoke)', fontSize: 14, maxWidth: 500, marginLeft: 'auto', marginRight: 'auto' }}>
              You'll answer screening questions for 6 climate hazard categories. Your NY region ({regionLabel}) will
              weight the results automatically.
            </p>
            {!project.region && (
              <InfoBox type="warning" style={{ margin: '16px auto', maxWidth: 460 }}>
                Set your NY Region in Project Intake for accurate weighting.
              </InfoBox>
            )}
            <Button variant="primary" size="lg" icon={ArrowRight} onClick={() => setStep(1)} style={{ marginTop: 16 }}>
              Start Screening
            </Button>
          </Card>
        </div>
      )}

      {/* Hazard question steps 1–6 */}
      {step >= 1 && step <= 6 && currentHazard && (
        <div>
          {/* Progress */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 12, color: 'var(--smoke)', fontFamily: 'var(--font-mono)' }}>
                Hazard {step} of 6
              </span>
              <span style={{ fontSize: 12, color: 'var(--smoke)', fontFamily: 'var(--font-mono)' }}>
                {Math.round((step / 6) * 100)}%
              </span>
            </div>
            <ProgressBar value={step} max={6} color="sunbeam" showPct={false} />
          </div>

          <Card>
            <div style={{ marginBottom: 16 }}>
              <span style={{ fontSize: 28 }}>{HAZARD_ICONS[currentHazardKey]}</span>
              <h2 style={{ margin: '8px 0 4px', fontFamily: 'var(--font-display)', fontSize: 20, color: 'var(--bone)' }}>
                {HAZARD_LABELS[currentHazardKey]}
              </h2>
              {project.region && currentHazard.highRiskRegions?.includes(project.region) && (
                <Badge color="red">High Risk: {regionLabel}</Badge>
              )}
            </div>

            {/* Screening questions */}
            <div style={{ marginBottom: 20 }}>
              <p style={{ margin: '0 0 12px', color: 'var(--smoke)', fontSize: 13, fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Screening Questions
              </p>
              {(currentHazard.screeningQuestions || []).map((q, i) => (
                <p key={i} style={{ margin: '0 0 8px', color: 'var(--bone)', fontSize: 14, paddingLeft: 12, borderLeft: '2px solid var(--graphite)' }}>
                  {i + 1}. {q}
                </p>
              ))}
            </div>

            {/* Remedy risks */}
            {currentHazard.remedyRisks && currentHazard.remedyRisks.length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <p style={{ margin: '0 0 8px', color: 'var(--smoke)', fontSize: 12, fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>
                  Potential Remedy Risks
                </p>
                <ul style={{ margin: 0, paddingLeft: 20, color: 'var(--smoke)', fontSize: 13, lineHeight: 1.7 }}>
                  {currentHazard.remedyRisks.map((r, i) => <li key={i}>{r}</li>)}
                </ul>
              </div>
            )}

            {/* Yes/No answer */}
            <div style={{ borderTop: '1px solid var(--graphite)', paddingTop: 18, marginTop: 8 }}>
              <p style={{ margin: '0 0 12px', color: 'var(--bone)', fontSize: 14, fontWeight: 600 }}>
                Is this hazard applicable or potentially relevant to your site?
              </p>
              <div style={{ display: 'flex', gap: 12 }}>
                <button
                  onClick={() => { setClimateAnswer(ansKey, true); }}
                  style={{
                    flex: 1, padding: '14px', borderRadius: 8, cursor: 'pointer',
                    border: `2px solid ${climate[ansKey] === true ? 'var(--alert-amber)' : 'var(--graphite)'}`,
                    background: climate[ansKey] === true ? 'rgba(255,159,10,0.1)' : 'var(--elevated)',
                    color: climate[ansKey] === true ? 'var(--alert-amber)' : 'var(--smoke)',
                    fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 14,
                  }}
                >
                  ⚠️ Yes — applicable
                </button>
                <button
                  onClick={() => { setClimateAnswer(ansKey, false); }}
                  style={{
                    flex: 1, padding: '14px', borderRadius: 8, cursor: 'pointer',
                    border: `2px solid ${climate[ansKey] === false ? 'var(--signal-green)' : 'var(--graphite)'}`,
                    background: climate[ansKey] === false ? 'rgba(150,161,83,0.10)' : 'var(--elevated)',
                    color: climate[ansKey] === false ? 'var(--signal-green)' : 'var(--smoke)',
                    fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 14,
                  }}
                >
                  ✓ No — not applicable
                </button>
              </div>
            </div>

            {/* Adaptation measures (shown if yes) */}
            {climate[ansKey] === true && currentHazard.adaptationMeasures && (
              <div style={{ marginTop: 16, padding: '12px 14px', background: 'rgba(255,159,10,0.06)', borderRadius: 6, border: '1px solid rgba(255,159,10,0.2)' }}>
                <p style={{ margin: '0 0 8px', fontSize: 12, color: 'var(--alert-amber)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>
                  Recommended Adaptation Measures
                </p>
                <ul style={{ margin: 0, paddingLeft: 18, color: 'var(--bone)', fontSize: 13, lineHeight: 1.7 }}>
                  {currentHazard.adaptationMeasures.map((m, i) => <li key={i}>{m}</li>)}
                </ul>
              </div>
            )}

            {/* Navigation */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 20 }}>
              <Button variant="ghost" onClick={() => setStep(step - 1)}>
                ← Back
              </Button>
              {step < 6 ? (
                <Button
                  variant="primary"
                  onClick={() => setStep(step + 1)}
                  disabled={climate[ansKey] === undefined || climate[ansKey] === null}
                  icon={ArrowRight}
                >
                  Next Hazard
                </Button>
              ) : (
                <Button
                  variant="primary"
                  onClick={runScreening}
                  disabled={climate[ansKey] === undefined || climate[ansKey] === null}
                  icon={CheckCircle}
                >
                  Generate Results
                </Button>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* Results — step 7 */}
      {step === 7 && result && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 20 }}>
            <MetricCard
              label="Vulnerability Level"
              value={result.level.toUpperCase()}
              sublabel={`Score: ${result.score} / ${result.maxScore}`}
              highlight={result.level === 'high'}
            />
            <MetricCard
              label="Hazards Flagged"
              value={result.flagged.length}
              sublabel={`of 6 assessed`}
            />
            <MetricCard
              label="Full CVA Required"
              value={result.requiresFullCVA ? 'YES' : 'NO'}
              sublabel="Per DER-31 §4.4"
            />
          </div>

          <Card style={{ borderColor: result.level === 'high' ? 'rgba(229,57,53,0.4)' : result.level === 'moderate' ? 'rgba(255,159,10,0.3)' : 'rgba(76,175,80,0.3)' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
              {(() => {
                const LevelIcon = levelIcons[result.level];
                return <LevelIcon size={24} color={`var(--${levelColors[result.level] === 'red' ? 'alert-red' : levelColors[result.level] === 'amber' ? 'alert-amber' : 'signal-green'})`} style={{ flexShrink: 0, marginTop: 2 }} />;
              })()}
              <div>
                <h3 style={{ margin: '0 0 6px', fontFamily: 'var(--font-display)', fontSize: 16, color: 'var(--bone)' }}>
                  {result.level === 'high' ? 'High Climate Vulnerability' : result.level === 'moderate' ? 'Moderate Climate Vulnerability' : 'Low Climate Vulnerability'}
                </h3>
                <p style={{ margin: 0, color: 'var(--smoke)', fontSize: 13, lineHeight: 1.6 }}>
                  {result.recommendation}
                </p>
              </div>
            </div>
          </Card>

          {/* Hazard detail cards */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginTop: 16 }}>
            {hazardKeys.map((key) => {
              const ansKey2 = ANSWER_KEYS[key];
              const flagged = result.flagged.includes(key);
              const hazardData = CLIMATE_HAZARDS[key];
              return (
                <Card key={key} style={{ border: `1px solid ${flagged ? 'rgba(255,159,10,0.3)' : 'var(--graphite)'}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <span style={{ fontSize: 20 }}>{HAZARD_ICONS[key]}</span>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--bone)' }}>{HAZARD_LABELS[key]}</div>
                      <Badge color={flagged ? 'amber' : 'green'}>{flagged ? 'Flagged' : 'Not applicable'}</Badge>
                    </div>
                  </div>
                  {flagged && hazardData?.regulatoryRef && (
                    <p style={{ margin: 0, fontSize: 11, color: 'var(--smoke)', fontFamily: 'var(--font-mono)' }}>
                      {hazardData.regulatoryRef}
                    </p>
                  )}
                </Card>
              );
            })}
          </div>

          {result.requiresFullCVA && (
            <InfoBox type="warning" title="Full CVA Required" style={{ marginTop: 16 }}>
              Based on your screening results, a Full Climate Vulnerability Assessment (CVA) is required.
              The CVA must evaluate current and future (2050, 2080) climate projections, site-specific
              vulnerability, and proposed adaptation measures for inclusion in the RAWP and FER.
              Reference: DER-31 §4.4, NYSDEC Climate Smart Communities guidance.
            </InfoBox>
          )}
        </div>
      )}
    </div>
  );
}
