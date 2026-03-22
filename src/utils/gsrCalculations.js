/**
 * GSR Footprint Calculator Engine
 * SiteWise-calibrated emission factors and calculation logic
 * Based on NYSDEC DER-31, EPA SiteWise methodology, and SURF library
 */

import { EMISSION_FACTORS as EF } from './gsrData.js';

// ─── Unit Conversions ────────────────────────────────────────────────────────
export const UNITS = {
  GAL_TO_MMBTU: 0.138,        // 1 gallon diesel = 0.138 MMBTU (HHV)
  MMBTU_TO_KWH: 293.07,       // 1 MMBTU = 293.07 kWh
  LBS_TO_MT: 0.000453592,      // 1 lb = 0.000453592 metric tons
  SHORT_TON_TO_MT: 0.907185,   // 1 short ton = 0.907185 MT
  CY_TO_TONS: 1.5,             // 1 CY soil ≈ 1.5 short tons (avg bulk density)
  MILES_PER_ROUND_TRIP: 2,     // factor for round-trip truck hauls
};

/**
 * Calculate gallons of diesel for excavation equipment
 * @param {number} cy - cubic yards of soil
 * @param {number} equipmentHours - total equipment hours (optional, computed if not provided)
 */
export function calcExcavationFuel(cy, equipmentHoursOverride = null) {
  const hours = equipmentHoursOverride ?? (cy / EF.excavation.cyPerEquipHour);
  const gallons = hours * EF.excavation.gallonsPerHour;
  return {
    hours: Math.round(hours),
    gallons: Math.round(gallons),
    mmbtu: +(gallons * UNITS.GAL_TO_MMBTU).toFixed(2),
  };
}

/**
 * Calculate truck transport emissions
 * @param {number} cy - cubic yards of soil
 * @param {number} distanceMiles - one-way miles to disposal facility
 * @param {number} trucksPerDay - truck capacity override (default 10 CY/truck)
 */
export function calcTransportFuel(cy, distanceMiles, trucksPerDay = null) {
  const tons = cy * UNITS.CY_TO_TONS;
  const loads = Math.ceil(cy / EF.truck.capacityCY);
  const totalMiles = loads * distanceMiles * UNITS.MILES_PER_ROUND_TRIP;
  const gallons = (totalMiles / EF.truck.mpg) + (loads * EF.truck.idleGallonsPerLoad);
  return {
    loads,
    totalMiles: Math.round(totalMiles),
    gallons: Math.round(gallons),
    mmbtu: +(gallons * UNITS.GAL_TO_MMBTU).toFixed(2),
    tons: +(tons).toFixed(1),
  };
}

/**
 * Calculate treatment system energy use
 * @param {string} techType - 'sveSvoc', 'aiStripping', 'pump_treat', 'thermal', 'in_situ', etc.
 * @param {number} durationDays - operating days
 * @param {number} flowRateGPM - flow rate (for pump & treat, air stripping)
 */
export function calcTreatmentEnergy(techType, durationDays, flowRateGPM = 0) {
  const hrs = durationDays * 24;
  let kwh = 0;
  let gallonsDiesel = 0;

  switch (techType) {
    case 'sveSvoc':
    case 'air_sparging':
      kwh = hrs * EF.treatment.sveSvoc_kwhPerHour;
      break;
    case 'pump_treat':
    case 'air_stripping':
      // GPM-based: ~0.02 kWh per gallon treated
      kwh = flowRateGPM > 0
        ? flowRateGPM * 60 * hrs * 0.02
        : hrs * EF.treatment.sveSvoc_kwhPerHour;
      break;
    case 'thermal_resistance':
    case 'ISCO':
    case 'EISB':
      kwh = hrs * EF.treatment.sveSvoc_kwhPerHour * 3; // high-energy
      break;
    case 'mna':
    case 'phytoremediation':
    case 'land_use_control':
      kwh = hrs * 0.5; // monitoring only
      break;
    case 'stabilization':
    case 'solidification':
      gallonsDiesel = durationDays * 8; // mixer/equipment per day
      kwh = hrs * 2;
      break;
    default:
      kwh = hrs * EF.treatment.sveSvoc_kwhPerHour;
  }

  const mmbtu_electric = kwh / UNITS.MMBTU_TO_KWH;
  const mmbtu_diesel = gallonsDiesel * UNITS.GAL_TO_MMBTU;

  return {
    kwh: Math.round(kwh),
    gallonsDiesel: Math.round(gallonsDiesel),
    mmbtu: +(mmbtu_electric + mmbtu_diesel).toFixed(2),
  };
}

/**
 * Convert fuel + electricity totals to emissions
 * @param {number} totalGallonsDiesel
 * @param {number} totalKWh - grid electricity
 */
export function calcEmissions(totalGallonsDiesel, totalKWh = 0) {
  const co2e_diesel = totalGallonsDiesel * EF.diesel.co2e_per_gallon;
  const nox_diesel = totalGallonsDiesel * EF.diesel.nox_lbs_per_gallon * UNITS.LBS_TO_MT;
  const sox_diesel = totalGallonsDiesel * EF.diesel.sox_lbs_per_gallon * UNITS.LBS_TO_MT;
  const pm10_diesel = totalGallonsDiesel * EF.diesel.pm10_lbs_per_gallon * UNITS.LBS_TO_MT;

  const co2e_elec = (totalKWh / 1000) * EF.electricity_ny.co2e_per_mwh;
  const nox_elec = (totalKWh / 1000) * EF.electricity_ny.nox_lbs_per_mwh * UNITS.LBS_TO_MT;
  const sox_elec = (totalKWh / 1000) * EF.electricity_ny.sox_lbs_per_mwh * UNITS.LBS_TO_MT;
  const pm10_elec = (totalKWh / 1000) * EF.electricity_ny.pm10_lbs_per_mwh * UNITS.LBS_TO_MT;

  return {
    co2e: +(co2e_diesel + co2e_elec).toFixed(2),       // MT CO₂e
    nox:  +(nox_diesel  + nox_elec).toFixed(4),         // MT NOx
    sox:  +(sox_diesel  + sox_elec).toFixed(4),         // MT SOx
    pm10: +(pm10_diesel + pm10_elec).toFixed(4),        // MT PM10
    totalMmbtu: +((totalGallonsDiesel * UNITS.GAL_TO_MMBTU) + (totalKWh / UNITS.MMBTU_TO_KWH)).toFixed(2),
  };
}

/**
 * Full project footprint calculation
 * @param {Object} inputs
 * @param {number} inputs.excavationCY - cubic yards of soil to excavate/remove
 * @param {number} inputs.transportMiles - one-way haul distance to disposal
 * @param {string} inputs.treatmentTech - treatment technology type
 * @param {number} inputs.treatmentDays - treatment system operating days
 * @param {number} inputs.treatmentFlowGPM - treatment flow rate (GPM)
 * @param {number} inputs.monitoringRounds - number of monitoring rounds
 * @param {number} inputs.monitoringWellCount - number of monitoring wells
 * @param {boolean} inputs.hasOffgas - SVE/AS offgas management
 * @param {number} inputs.equipmentHoursOverride - override equipment hours
 */
export function calcProjectFootprint(inputs) {
  const {
    excavationCY = 0,
    transportMiles = 20,
    treatmentTech = 'none',
    treatmentDays = 0,
    treatmentFlowGPM = 0,
    monitoringRounds = 4,
    monitoringWellCount = 6,
    equipmentHoursOverride = null,
  } = inputs;

  // Excavation
  const excav = excavationCY > 0
    ? calcExcavationFuel(excavationCY, equipmentHoursOverride)
    : { gallons: 0, mmbtu: 0, hours: 0, loads: 0, totalMiles: 0 };

  // Transport
  const trans = excavationCY > 0
    ? calcTransportFuel(excavationCY, transportMiles)
    : { gallons: 0, mmbtu: 0, loads: 0, totalMiles: 0, tons: 0 };

  // Treatment
  const treat = treatmentTech !== 'none' && treatmentDays > 0
    ? calcTreatmentEnergy(treatmentTech, treatmentDays, treatmentFlowGPM)
    : { gallons: 0, kwh: 0, mmbtu: 0, gallonsDiesel: 0 };

  // Monitoring (field vehicle + sampling equipment)
  const monitoringGallons = monitoringRounds * monitoringWellCount * 0.8; // ~0.8 gal/well/round
  const monitoringKwh = monitoringRounds * monitoringWellCount * 2; // lab + equipment kWh

  // Totals
  const totalDiesel = excav.gallons + trans.gallons + (treat.gallonsDiesel || 0) + monitoringGallons;
  const totalKwh = (treat.kwh || 0) + monitoringKwh;
  const totalMmbtu = +(excav.mmbtu + trans.mmbtu + treat.mmbtu + (monitoringGallons * UNITS.GAL_TO_MMBTU)).toFixed(2);

  const emissions = calcEmissions(totalDiesel, totalKwh);

  return {
    summary: {
      co2e: emissions.co2e,
      nox: emissions.nox,
      sox: emissions.sox,
      pm10: emissions.pm10,
      totalMmbtu: emissions.totalMmbtu,
      totalKwh,
      totalDieselGallons: Math.round(totalDiesel),
    },
    breakdown: {
      excavation: {
        gallons: excav.gallons,
        mmbtu: excav.mmbtu,
        hours: excav.hours,
        cy: excavationCY,
      },
      transport: {
        gallons: trans.gallons,
        mmbtu: trans.mmbtu,
        loads: trans.loads,
        totalMiles: trans.totalMiles,
        tons: trans.tons,
      },
      treatment: {
        gallons: treat.gallonsDiesel || 0,
        kwh: treat.kwh || 0,
        mmbtu: treat.mmbtu,
        days: treatmentDays,
        tech: treatmentTech,
      },
      monitoring: {
        gallons: Math.round(monitoringGallons),
        kwh: monitoringKwh,
        rounds: monitoringRounds,
        wells: monitoringWellCount,
      },
    },
  };
}

/**
 * Calculate BMP reduction potential for a given project footprint
 * @param {Object} baseline - result from calcProjectFootprint
 * @param {string[]} selectedBmpIds - array of BMP IDs from BMP_LIBRARY
 */
export function calcBMPReductions(baseline, selectedBmpIds) {
  // Reduction factors per BMP (% reduction of relevant metric)
  const BMP_REDUCTIONS = {
    // Energy
    'renewable_energy_onsite':   { mmbtu: 0.25, co2e: 0.30 },
    'led_site_lighting':         { mmbtu: 0.05, co2e: 0.05 },
    'vfd_treatment':             { mmbtu: 0.15, co2e: 0.10 },
    // GHG/Air
    'tier4_equipment':           { co2e: 0.10, nox: 0.90, pm10: 0.75 },
    'equipment_idle_reduction':  { co2e: 0.05, nox: 0.10, pm10: 0.08 },
    'ev_field_vehicles':         { co2e: 0.08, nox: 0.05 },
    'carbon_offset':             { co2e: 0.20 },
    // Water
    'groundwater_reinjection':   { mmbtu: 0.05 },
    'stormwater_management':     {},
    'dewatering_treatment':      {},
    // Materials
    'recycled_fill':             { co2e: 0.05 },
    'soil_reuse_onsite':         { co2e: 0.15, mmbtu: 0.12 },
    'solvent_minimization':      { co2e: 0.03 },
    // Land
    'native_planting':           {},
    'green_infrastructure':      {},
    'habitat_enhancement':       {},
    // Community
    'community_air_monitoring':  {},
    'community_involvement':     {},
    // Climate
    'climate_adaptive_design':   {},
    'flood_resilient_systems':   {},
  };

  const reductions = { co2e: 0, nox: 0, sox: 0, pm10: 0, mmbtu: 0 };
  const applied = [];

  for (const id of selectedBmpIds) {
    const r = BMP_REDUCTIONS[id];
    if (!r) continue;
    const entry = { id, reductions: {} };
    if (r.co2e)  { entry.reductions.co2e  = +(baseline.summary.co2e  * r.co2e).toFixed(2);  reductions.co2e  += entry.reductions.co2e; }
    if (r.nox)   { entry.reductions.nox   = +(baseline.summary.nox   * r.nox).toFixed(4);   reductions.nox   += entry.reductions.nox; }
    if (r.sox)   { entry.reductions.sox   = +(baseline.summary.sox   * r.sox).toFixed(4);   reductions.sox   += entry.reductions.sox; }
    if (r.pm10)  { entry.reductions.pm10  = +(baseline.summary.pm10  * r.pm10).toFixed(4);  reductions.pm10  += entry.reductions.pm10; }
    if (r.mmbtu) { entry.reductions.mmbtu = +(baseline.summary.totalMmbtu * r.mmbtu).toFixed(2); reductions.mmbtu += entry.reductions.mmbtu; }
    applied.push(entry);
  }

  // Cap reductions at 100%
  const capPct = (val, base) => Math.min(val, base);

  return {
    reductions: {
      co2e:  +capPct(reductions.co2e,  baseline.summary.co2e).toFixed(2),
      nox:   +capPct(reductions.nox,   baseline.summary.nox).toFixed(4),
      sox:   +capPct(reductions.sox,   baseline.summary.sox).toFixed(4),
      pm10:  +capPct(reductions.pm10,  baseline.summary.pm10).toFixed(4),
      mmbtu: +capPct(reductions.mmbtu, baseline.summary.totalMmbtu).toFixed(2),
    },
    projected: {
      co2e:  +(baseline.summary.co2e  - reductions.co2e).toFixed(2),
      nox:   +(baseline.summary.nox   - reductions.nox).toFixed(4),
      sox:   +(baseline.summary.sox   - reductions.sox).toFixed(4),
      pm10:  +(baseline.summary.pm10  - reductions.pm10).toFixed(4),
      mmbtu: +(baseline.summary.totalMmbtu - reductions.mmbtu).toFixed(2),
    },
    appliedBMPs: applied,
    reductionPct: {
      co2e:  baseline.summary.co2e > 0  ? +((reductions.co2e  / baseline.summary.co2e)  * 100).toFixed(1) : 0,
      nox:   baseline.summary.nox > 0   ? +((reductions.nox   / baseline.summary.nox)   * 100).toFixed(1) : 0,
      mmbtu: baseline.summary.totalMmbtu > 0 ? +((reductions.mmbtu / baseline.summary.totalMmbtu) * 100).toFixed(1) : 0,
    },
  };
}

/**
 * Climate vulnerability score
 * @param {Object} answers - { flooding: bool, seaLevel: bool, extremeHeat: bool, erosion: bool, wildfire: bool, drought: bool }
 * @param {string} region - NY region code
 */
export function calcClimateScore(answers, region = 'nyc') {
  const weights = {
    flooding:      { nyc: 3, li: 3, hrv: 2, cap: 1, wny: 1, cny: 1, nny: 1, mhv: 2 },
    sea_level_rise:{ nyc: 3, li: 3, hrv: 1, cap: 0, wny: 0, cny: 0, nny: 0, mhv: 1 },
    extreme_heat:  { nyc: 2, li: 2, hrv: 2, cap: 1, wny: 1, cny: 1, nny: 1, mhv: 2 },
    erosion:       { nyc: 2, li: 2, hrv: 2, cap: 1, wny: 1, cny: 1, nny: 1, mhv: 2 },
    wildfire:      { nyc: 0, li: 0, hrv: 1, cap: 1, wny: 0, cny: 0, nny: 2, mhv: 1 },
    drought:       { nyc: 1, li: 1, hrv: 1, cap: 2, wny: 1, cny: 1, nny: 1, mhv: 1 },
  };

  let score = 0;
  let maxScore = 0;
  const flagged = [];

  for (const [hazard, regionWeights] of Object.entries(weights)) {
    const w = regionWeights[region] ?? 1;
    maxScore += w * 3;
    const answerKey = hazard === 'sea_level_rise' ? 'seaLevel' : hazard;
    if (answers[answerKey] || answers[hazard]) {
      score += w * 3;
      flagged.push(hazard);
    }
  }

  const pct = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
  const level = pct >= 60 ? 'high' : pct >= 30 ? 'moderate' : 'low';
  const requiresFullCVA = level === 'high' || flagged.includes('flooding') || flagged.includes('sea_level_rise');

  return {
    score,
    maxScore,
    pct,
    level,
    flagged,
    requiresFullCVA,
    recommendation: requiresFullCVA
      ? 'Full Climate Vulnerability Assessment (CVA) required per DER-31 §4.4'
      : level === 'moderate'
      ? 'Climate screening documentation required; CVA recommended'
      : 'Climate screening documentation required; low risk identified',
  };
}

/**
 * Generate RAWP GSR section text
 * @param {Object} project - project intake data
 * @param {Object} footprint - calcProjectFootprint result
 * @param {string[]} selectedBmpIds
 * @param {Object} climateResult - calcClimateScore result
 */
export function generateRAWPText(project, footprint, selectedBmpIds, climateResult) {
  const { projectName, site, phase, programType, region } = project;
  const { summary } = footprint;

  const bmpLines = selectedBmpIds.map((id, i) => `   ${i + 1}. [BMP: ${id}]`).join('\n');

  return `GREEN AND SUSTAINABLE REMEDIATION (GSR) PLAN
${projectName || '[Project Name]'} — ${site || '[Site Address]'}
NYSDEC BCP — ${programType || 'BCP'} Program

1. INTRODUCTION
This Green and Sustainable Remediation (GSR) Plan has been prepared in accordance with NYSDEC
DER-31 (Revised 2025), 6 NYCRR Part 375, and the requirements of the Brownfield Cleanup Program
(BCP) Application, Questions 5 and 6. The GSR Plan addresses the four core pillars: (1) Project
Planning and Stakeholder Engagement, (2) Environmental Footprint Analysis, (3) Best Management
Practice (BMP) Analysis, and (4) Climate Resiliency.

2. PROJECT OVERVIEW
Phase: ${phase || '[Remedial Phase]'}
Region: ${region || '[NY Region]'}

3. ENVIRONMENTAL FOOTPRINT ANALYSIS (SiteWise™ Methodology)
Baseline remedial footprint estimates have been calculated using SiteWise™-calibrated emission
factors consistent with EPA SURF library guidance.

   Metric                    Value           Unit
   ─────────────────────────────────────────────────
   GHG Emissions             ${summary.co2e?.toLocaleString() || '—'}        MT CO₂e
   Total Energy              ${summary.totalMmbtu?.toLocaleString() || '—'}        MMBTU
   NOx Emissions             ${summary.nox?.toLocaleString() || '—'}        MT NOx
   SOx Emissions             ${summary.sox?.toLocaleString() || '—'}        MT SOx
   PM10 Emissions            ${summary.pm10?.toLocaleString() || '—'}        MT PM10
   Total Diesel              ${summary.totalDieselGallons?.toLocaleString() || '—'}        gallons
   Electricity Use           ${summary.totalKwh?.toLocaleString() || '—'}        kWh

4. BEST MANAGEMENT PRACTICES (BMPs)
The following BMPs have been selected to reduce the remedial environmental footprint:

${bmpLines || '   [No BMPs selected]'}

5. CLIMATE RESILIENCY SCREENING
Climate vulnerability level: ${climateResult?.level?.toUpperCase() || 'NOT ASSESSED'}
Hazards identified: ${climateResult?.flagged?.join(', ') || 'none'}
${climateResult?.requiresFullCVA ? 'A Full Climate Vulnerability Assessment (CVA) is required.' : 'Climate screening documentation is sufficient at this time.'}

6. REGULATORY REFERENCES
- NYSDEC DER-31: Green and Sustainable Remediation Policy (Revised 2025)
- 6 NYCRR Part 375 (effective December 31, 2025)
- EPA SiteWise™ Tool (SURF Library)
- BCP Application Form, Questions 5-6 (October 2025 revision)

[PREPARER CERTIFICATION BLOCK — Insert firm name, PE/RG license, date]
`;
}

/**
 * Format a number with units for display
 */
export function fmtMetric(value, unit, decimals = 1) {
  if (value === null || value === undefined || isNaN(value)) return '—';
  return `${Number(value).toLocaleString(undefined, { maximumFractionDigits: decimals })} ${unit}`;
}

/**
 * Determine SiteWise significance threshold
 * Per NYSDEC DER-31: projects with >500 MT CO₂e require detailed footprint analysis
 */
export function checkSignificanceThreshold(co2e) {
  if (co2e >= 1000) return { level: 'major', label: 'Major Footprint', color: 'alert-red', requiresDetail: true };
  if (co2e >= 500)  return { level: 'significant', label: 'Significant Footprint', color: 'alert-amber', requiresDetail: true };
  if (co2e >= 100)  return { level: 'moderate', label: 'Moderate Footprint', color: 'signal-green', requiresDetail: false };
  return { level: 'minor', label: 'Minor Footprint', color: 'signal-green', requiresDetail: false };
}
