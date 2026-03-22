/**
 * GSR Data — NYSDEC Green & Sustainable Remediation
 * Sources: DER-31, 6 NYCRR Part 375, EPA SiteWise, SURF library, BCP RAWP templates
 */

// ── Program Types ─────────────────────────────────────────────────────────────
export const PROGRAM_TYPES = [
  { value: 'bcp',        label: 'BCP — Brownfield Cleanup Program' },
  { value: 'vcp',        label: 'VCP — Voluntary Cleanup Program' },
  { value: 'superfund',  label: 'State Superfund' },
  { value: 'spill',      label: 'Spill Program' },
  { value: 'rcra',       label: 'RCRA / Federal Program' },
];

// ── Project Phases ────────────────────────────────────────────────────────────
export const PROJECT_PHASES = [
  { value: 'ri',   label: 'RI — Remedial Investigation' },
  { value: 'fs',   label: 'FS — Feasibility Study / RAP' },
  { value: 'rawp', label: 'RAWP — Remedial Action Work Plan' },
  { value: 'ra',   label: 'RA — Active Remediation' },
  { value: 'fer',  label: 'FER — Final Engineering Report' },
  { value: 'smp',  label: 'SMP — Site Management Plan' },
];

// ── Remedy Technologies ───────────────────────────────────────────────────────
export const REMEDY_TECHNOLOGIES = [
  { value: 'excavation',        label: 'Soil Excavation & Off-Site Disposal',       category: 'soil' },
  { value: 'in_situ_iss',       label: 'In-Situ Solidification/Stabilization (ISS)', category: 'soil' },
  { value: 'soil_washing',      label: 'Soil Washing / Ex-Situ Treatment',           category: 'soil' },
  { value: 'svoc_bioremediation',label: 'Biopile / Land Treatment (Ex-Situ)',         category: 'soil' },
  { value: 'soil_vapor_svs',    label: 'Soil Vapor — SVE / SSDS',                   category: 'vapor' },
  { value: 'pump_treat',        label: 'Pump & Treat (Groundwater)',                 category: 'groundwater' },
  { value: 'isco',              label: 'ISCO / ISCR (In-Situ Chemical)',             category: 'groundwater' },
  { value: 'biostim',           label: 'Enhanced Bioremediation / Biostimulation',   category: 'groundwater' },
  { value: 'mna',               label: 'MNA — Monitored Natural Attenuation',        category: 'groundwater' },
  { value: 'perm_barrier',      label: 'Permeable Reactive Barrier (PRB)',           category: 'groundwater' },
  { value: 'site_cover',        label: 'Engineered Site Cover System (Track 4)',     category: 'ec' },
  { value: 'institutional',     label: 'Institutional Controls Only',                category: 'ic' },
  { value: 'multi',             label: 'Multi-Technology Remedy',                    category: 'multi' },
];

// ── Cleanup Tracks ────────────────────────────────────────────────────────────
export const CLEANUP_TRACKS = [
  { value: 'track1', label: 'Track 1 — Unrestricted Use' },
  { value: 'track2', label: 'Track 2 — Use-Specific SCOs' },
  { value: 'track3', label: 'Track 3 — Site-Specific SCOs (RA)' },
  { value: 'track4', label: 'Track 4 — Restricted / Site Cover' },
];

// ── NY Regions (climate vulnerability context) ────────────────────────────────
export const NY_REGIONS = [
  { value: 'nyc',         label: 'New York City (5 Boroughs)' },
  { value: 'long_island', label: 'Long Island' },
  { value: 'hudson_valley', label: 'Hudson Valley' },
  { value: 'capital',     label: 'Capital District' },
  { value: 'central',     label: 'Central NY' },
  { value: 'western',     label: 'Western NY' },
  { value: 'north',       label: 'Northern / Adirondack' },
];

// ── BMP Library ───────────────────────────────────────────────────────────────
// Source: EPA Green Remediation BMP Fact Sheets; NYSDEC DER-31
export const BMP_LIBRARY = [
  // ── Energy ──
  {
    id: 'e1', category: 'energy', title: 'Renewable Energy Use at Treatment Systems',
    desc: 'Power pump-and-treat, SVE, or treatment systems with on-site solar PV or renewable energy contracts (RECs).',
    metrics: ['GHG reduction', 'Non-renewable energy reduction'],
    applicableTo: ['pump_treat', 'soil_vapor_svs', 'biostim'],
    effort: 'moderate', impact: 'high',
    rawpLanguage: 'Renewable energy sources (solar PV or RECs) will be used to power treatment system operations to the extent practicable, reducing non-renewable energy consumption and associated GHG emissions.',
    derRef: 'DER-31 §IV.B',
  },
  {
    id: 'e2', category: 'energy', title: 'Equipment Idle-Time Reduction',
    desc: 'Require engine idle-time limits (≤5 min) for construction equipment and haul trucks per NYC DEP rules and NYSDEC guidance.',
    metrics: ['GHG reduction', 'NOx/PM reduction', 'Fuel savings'],
    applicableTo: ['excavation', 'in_situ_iss', 'site_cover', 'multi'],
    effort: 'low', impact: 'moderate',
    rawpLanguage: 'All diesel-powered construction equipment and haul vehicles shall comply with idle-time limits (not to exceed 5 consecutive minutes) in accordance with applicable state and local anti-idling regulations, reducing fuel use, GHG emissions, and criteria air pollutants.',
    derRef: 'DER-31 §IV.A',
  },
  {
    id: 'e3', category: 'energy', title: 'Tier 4 / Low-Emission Equipment Specification',
    desc: 'Specify Tier 4 Final diesel engines or cleaner alternatives for construction equipment. Reduces NOx by up to 96% vs. unregulated equipment.',
    metrics: ['NOx reduction', 'PM reduction', 'GHG reduction'],
    applicableTo: ['excavation', 'in_situ_iss', 'site_cover', 'multi'],
    effort: 'low', impact: 'high',
    rawpLanguage: 'Construction contracts shall specify EPA Tier 4 Final (or Tier 4 Interim) compliant diesel engines for all heavy construction equipment to minimize NOx and particulate matter emissions during remedial construction activities.',
    derRef: 'DER-31 §IV.A',
  },
  {
    id: 'e4', category: 'energy', title: 'Passive Remediation Technology Preference',
    desc: 'Evaluate passive or low-energy alternatives (e.g., biostimulation, PRB, MNA) where technically feasible before selecting active treatment requiring continuous energy input.',
    metrics: ['Total energy reduction', 'GHG reduction'],
    applicableTo: ['pump_treat', 'isco', 'biostim', 'mna', 'perm_barrier'],
    effort: 'moderate', impact: 'high',
    rawpLanguage: 'Passive remediation alternatives including enhanced bioremediation, permeable reactive barriers, and monitored natural attenuation were evaluated and prioritized where technically feasible, minimizing long-term energy requirements.',
    derRef: 'DER-31 §III.B',
  },

  // ── GHG & Air ──
  {
    id: 'g1', category: 'ghg_air', title: 'Minimize Truck Miles — Local Disposal Facilities',
    desc: 'Source disposal facilities within the closest practical radius. Every 10 miles of round-trip haul per truck adds significant GHG and NOx.',
    metrics: ['GHG reduction', 'NOx/SOx reduction', 'Transportation fuel savings'],
    applicableTo: ['excavation', 'soil_washing', 'in_situ_iss'],
    effort: 'low', impact: 'high',
    rawpLanguage: 'Contaminated soil disposal will prioritize the nearest permitted facility that can accept the waste stream, minimizing truck miles and associated GHG and air emissions.',
    derRef: 'DER-31 §IV.A',
  },
  {
    id: 'g2', category: 'ghg_air', title: 'Dust Suppression & Air Monitoring',
    desc: 'Implement wet suppression, windscreens, and real-time particulate monitoring (PM10/PM2.5) during excavation and soil handling operations.',
    metrics: ['PM10 reduction', 'Community protection'],
    applicableTo: ['excavation', 'in_situ_iss', 'site_cover'],
    effort: 'low', impact: 'moderate',
    rawpLanguage: 'Dust suppression measures including water application and windscreens shall be implemented during all soil disturbance activities. Real-time air monitoring for particulate matter (PM10) will be conducted at site perimeter during active excavation.',
    derRef: 'DER-31 §IV.D',
  },
  {
    id: 'g3', category: 'ghg_air', title: 'Off-Gas Treatment / VOC Capture',
    desc: 'For SVE or SSDS systems emitting VOCs, use granular activated carbon (GAC) or thermal oxidation for off-gas treatment rather than direct air discharge.',
    metrics: ['VOC emissions reduction', 'Air quality protection'],
    applicableTo: ['soil_vapor_svs', 'pump_treat'],
    effort: 'moderate', impact: 'high',
    rawpLanguage: 'SVE/SSDS off-gas will be treated through granular activated carbon (GAC) prior to atmospheric discharge, capturing VOC emissions and protecting air quality for site workers and surrounding community.',
    derRef: 'DER-31 §IV.D',
  },

  // ── Water ──
  {
    id: 'w1', category: 'water', title: 'Water Reuse — Dewatering Recycling',
    desc: 'Treat and reuse dewatering effluent for dust suppression, equipment wash-down, or compaction control rather than discharging to sewer.',
    metrics: ['Water use reduction', 'Sewer discharge reduction'],
    applicableTo: ['excavation', 'in_situ_iss'],
    effort: 'moderate', impact: 'moderate',
    rawpLanguage: 'Dewatering effluent will be treated on-site through sedimentation and filtration and reused for dust suppression and equipment wash-down to the extent practicable, reducing potable water demand and sewer discharge volumes.',
    derRef: 'DER-31 §IV.C',
  },
  {
    id: 'w2', category: 'water', title: 'Stormwater Management — BMPs During Construction',
    desc: 'Install sediment barriers, inlet protection, and stabilized construction entrances to manage stormwater during remediation.',
    metrics: ['Water quality protection', 'Sediment control'],
    applicableTo: ['excavation', 'in_situ_iss', 'site_cover', 'multi'],
    effort: 'low', impact: 'moderate',
    rawpLanguage: 'Stormwater management BMPs including silt fencing, inlet protection, stabilized construction entrances, and erosion controls shall be implemented throughout remedial construction in accordance with the SWPPP.',
    derRef: 'DER-31 §IV.C',
  },
  {
    id: 'w3', category: 'water', title: 'Groundwater Monitoring Optimization',
    desc: 'Apply statistical analysis (Mann-Kendall trends) and adaptive monitoring to reduce monitoring frequency once declining trends are confirmed.',
    metrics: ['Water use reduction', 'Long-term monitoring cost reduction'],
    applicableTo: ['mna', 'pump_treat', 'biostim', 'perm_barrier'],
    effort: 'moderate', impact: 'moderate',
    rawpLanguage: 'Groundwater monitoring frequency will be optimized using statistical trend analysis (Mann-Kendall). Monitoring events will be consolidated or reduced in frequency once stable or declining concentration trends are confirmed at all compliance points.',
    derRef: 'DER-31 §IV.B',
  },

  // ── Materials / Waste ──
  {
    id: 'm1', category: 'materials', title: 'IDW Minimization',
    desc: 'Segregate investigation-derived waste (IDW) by constituent, minimizing hazardous waste volumes requiring off-site disposal.',
    metrics: ['Hazardous waste reduction', 'Disposal cost savings'],
    applicableTo: ['excavation', 'in_situ_iss', 'multi'],
    effort: 'low', impact: 'moderate',
    rawpLanguage: 'Investigation-derived waste (IDW) will be segregated by waste characterization results to minimize hazardous waste volumes requiring off-site disposal at TSDF facilities. Non-hazardous IDW will be disposed at permitted solid waste facilities.',
    derRef: 'DER-31 §IV.E',
  },
  {
    id: 'm2', category: 'materials', title: 'Recycled Materials for Site Cover / Backfill',
    desc: 'Specify recycled aggregate, reclaimed asphalt, or certified clean fill from demolition projects for site cover and backfill.',
    metrics: ['Virgin material reduction', 'Waste diversion'],
    applicableTo: ['excavation', 'site_cover', 'in_situ_iss'],
    effort: 'low', impact: 'moderate',
    rawpLanguage: 'Backfill and site cover materials will incorporate recycled aggregate and reclaimed materials (certified clean fill meeting 6 NYCRR Part 360 standards) to the extent practicable, reducing demand for virgin materials.',
    derRef: 'DER-31 §IV.E',
  },
  {
    id: 'm3', category: 'materials', title: 'Reagent Optimization — ISCO/ISCR',
    desc: 'Right-size ISCO/ISCR reagent quantities based on bench-scale testing to avoid over-application and minimize chemical waste.',
    metrics: ['Chemical use reduction', 'Waste reduction'],
    applicableTo: ['isco'],
    effort: 'moderate', impact: 'moderate',
    rawpLanguage: 'ISCO/ISCR reagent quantities will be optimized based on bench-scale treatability testing results to avoid over-application, reducing chemical use, transport impacts, and residual reagent waste.',
    derRef: 'DER-31 §IV.E',
  },
  {
    id: 'm4', category: 'materials', title: 'ISS — Binder Material Optimization',
    desc: 'Optimize cement/fly ash binder ratios for ISS through bench-scale testing. Fly ash substitution reduces embodied carbon vs. OPC.',
    metrics: ['GHG reduction (embodied carbon)', 'Material efficiency'],
    applicableTo: ['in_situ_iss'],
    effort: 'moderate', impact: 'high',
    rawpLanguage: 'ISS binder design will be optimized through bench-scale treatability testing, with partial substitution of fly ash or slag for Portland cement where technically acceptable, reducing embodied carbon and material costs.',
    derRef: 'DER-31 §IV.E',
  },

  // ── Land / Habitat ──
  {
    id: 'l1', category: 'land', title: 'Native Vegetation / Green Infrastructure',
    desc: 'Incorporate native species in site restoration and landscaping; include bioswales, rain gardens, or permeable paving where compatible with the remedy.',
    metrics: ['Habitat enhancement', 'Stormwater quality', 'Community benefit'],
    applicableTo: ['excavation', 'site_cover', 'mna', 'multi'],
    effort: 'low', impact: 'moderate',
    rawpLanguage: 'Site restoration will incorporate native plant species and green infrastructure (bioswales, rain gardens, permeable paving) where compatible with the approved remedy and site management plan, enhancing habitat value and managing stormwater.',
    derRef: 'DER-31 §IV.F',
  },
  {
    id: 'l2', category: 'land', title: 'Tree Preservation During Remediation',
    desc: 'Identify and protect mature trees and significant vegetation from construction impacts; minimize clearing footprint.',
    metrics: ['Habitat protection', 'Carbon sequestration'],
    applicableTo: ['excavation', 'in_situ_iss', 'multi'],
    effort: 'low', impact: 'low',
    rawpLanguage: 'Mature trees and significant vegetation will be identified, flagged, and protected from construction impacts. The limits of disturbance will be minimized to preserve existing vegetative cover and associated habitat value.',
    derRef: 'DER-31 §IV.F',
  },

  // ── Community / EJ ──
  {
    id: 'c1', category: 'community', title: 'Community Air Quality Monitoring',
    desc: 'Deploy real-time PM and VOC monitors at site perimeter with public-facing dashboard for community transparency.',
    metrics: ['Community protection', 'Transparency', 'EJ benefit'],
    applicableTo: ['excavation', 'in_situ_iss', 'soil_vapor_svs', 'multi'],
    effort: 'moderate', impact: 'high',
    rawpLanguage: 'Real-time air quality monitoring (PM10, PM2.5, VOCs) will be deployed at the site perimeter during active remediation. Monitoring data will be reported to the community through a public-facing web interface consistent with environmental justice commitments.',
    derRef: 'DER-31 §IV.D',
  },
  {
    id: 'c2', category: 'community', title: 'Local Procurement & Workforce',
    desc: 'Prioritize locally-sourced materials and local/minority subcontractors to support community economic benefit.',
    metrics: ['Community economic benefit', 'Transportation emissions reduction'],
    applicableTo: ['excavation', 'in_situ_iss', 'site_cover', 'multi'],
    effort: 'low', impact: 'moderate',
    rawpLanguage: 'Remedial contractors will prioritize locally-sourced materials and local/minority-owned subcontractors where feasible, consistent with applicable procurement requirements, to maximize community economic benefit and reduce transportation-related emissions.',
    derRef: 'DER-31 §IV.D',
  },
  {
    id: 'c3', category: 'community', title: 'Construction Hours / Noise Management',
    desc: 'Restrict heavy equipment operation to standard hours; deploy sound barriers for residential-adjacent sites.',
    metrics: ['Community quality of life', 'Noise reduction'],
    applicableTo: ['excavation', 'in_situ_iss', 'site_cover', 'multi'],
    effort: 'low', impact: 'moderate',
    rawpLanguage: 'Heavy equipment operations will be limited to permitted construction hours. Temporary noise barriers will be installed on residential-facing site boundaries to minimize noise impacts to adjacent sensitive receptors.',
    derRef: 'DER-31 §IV.D',
  },

  // ── Climate Resiliency ──
  {
    id: 'cr1', category: 'climate', title: 'Flood-Resilient Design of Treatment Systems',
    desc: 'Design P&T, SVE, and monitoring infrastructure above projected 100-year flood elevation accounting for sea level rise projections.',
    metrics: ['Remedy durability', 'Climate resilience'],
    applicableTo: ['pump_treat', 'soil_vapor_svs', 'biostim'],
    effort: 'moderate', impact: 'high',
    rawpLanguage: 'Treatment system infrastructure will be designed at elevations above projected 100-year flood elevations incorporating NY State sea level rise projections (NYSDEC ClimAID, NPCC scenarios) to ensure remedy integrity under climate change conditions.',
    derRef: 'DER-31 §V; 6 NYCRR Part 375-1.9',
  },
  {
    id: 'cr2', category: 'climate', title: 'Heat-Resilient O&M Protocols',
    desc: 'Develop protocols for treatment system operation during extreme heat events; plan for increased cooling demand and thermal impacts on remedy performance.',
    metrics: ['Remedy durability', 'Worker safety'],
    applicableTo: ['pump_treat', 'soil_vapor_svs', 'mna'],
    effort: 'low', impact: 'moderate',
    rawpLanguage: 'O&M protocols will include provisions for extreme heat conditions including treatment system performance adjustments, worker heat illness prevention measures, and monitoring for temperature-sensitive biological processes during heat events.',
    derRef: 'DER-31 §V',
  },
  {
    id: 'cr3', category: 'climate', title: 'Coastal Erosion Protection for Cover Systems',
    desc: 'For coastal/waterfront sites, design engineering controls and site covers to withstand projected increases in storm surge and wave action.',
    metrics: ['Remedy durability', 'Long-term containment'],
    applicableTo: ['site_cover', 'institutional'],
    effort: 'high', impact: 'high',
    rawpLanguage: 'Engineered cover systems at coastal/waterfront locations will be designed to withstand projected storm surge and wave action based on FEMA FIRMs and NYSDEC sea level rise scenarios, ensuring long-term containment effectiveness.',
    derRef: 'DER-31 §V; 6 NYCRR Part 375-1.9',
  },
];

export const BMP_CATEGORIES = [
  { value: 'energy',    label: 'Energy', icon: 'Zap',        color: '#F5C518' },
  { value: 'ghg_air',  label: 'GHG & Air Quality', icon: 'Wind', color: '#7A9B76' },
  { value: 'water',    label: 'Water Resources', icon: 'Droplets', color: '#5B7B9A' },
  { value: 'materials', label: 'Materials & Waste', icon: 'Package', color: '#C47A12' },
  { value: 'land',     label: 'Land & Habitat', icon: 'Leaf',   color: '#4CAF50' },
  { value: 'community', label: 'Community & EJ', icon: 'Users', color: '#D4654A' },
  { value: 'climate',  label: 'Climate Resilience', icon: 'Shield', color: '#9C6BAD' },
];

// ── Climate Hazards ───────────────────────────────────────────────────────────
export const CLIMATE_HAZARDS = [
  {
    id: 'flooding',
    label: 'Flooding & Increased Precipitation',
    description: 'Increased frequency and intensity of precipitation events causing surface flooding, elevated groundwater, and washout of surface features.',
    highRiskRegions: ['nyc', 'long_island', 'hudson_valley'],
    remedyRisks: ['pump_treat', 'soil_vapor_svs', 'site_cover', 'institutional', 'mna'],
    screeningQuestions: [
      'Is the site within a FEMA 100-year or 500-year flood zone?',
      'Is the site within 500 ft of a water body (river, stream, bay, wetland)?',
      'Are any treatment system components installed at or near grade?',
      'Could flooding mobilize residual contamination off-site?',
    ],
    adaptationMeasures: [
      'Design treatment infrastructure above FEMA BFE + projected SLR',
      'Install flood barriers or berms around critical equipment',
      'Develop O&M contingency plan for flood events',
      'Elevate monitoring wells and sample ports above anticipated flood elevation',
    ],
    regulatoryRef: 'DER-31 §V.A; NYSDEC ClimAID; NYC Panel on Climate Change (NPCC)',
  },
  {
    id: 'sea_level_rise',
    label: 'Sea Level Rise',
    description: 'Gradual inundation of low-lying coastal areas; saline intrusion into freshwater aquifers; increased tidal flooding frequency.',
    highRiskRegions: ['nyc', 'long_island'],
    remedyRisks: ['mna', 'pump_treat', 'institutional', 'site_cover'],
    screeningQuestions: [
      'Is the site within 1 mile of tidal waters, bays, or the Atlantic coast?',
      'Is the site elevation within 10 ft of current mean high water?',
      'Would saline intrusion affect the remedial approach or contaminant fate/transport?',
      'Are long-term institutional controls dependent on current shoreline conditions?',
    ],
    adaptationMeasures: [
      'Evaluate site using NYSDEC sea level rise projections (1.2–2.5 ft by 2050; 2.7–6.3 ft by 2100, mid-high scenarios)',
      'Design remedy to function under increased groundwater elevations from SLR',
      'Consider long-term viability of ICs in flood-prone areas',
    ],
    regulatoryRef: 'DER-31 §V.A; NYS 2100 Commission; NPCC Phase II',
  },
  {
    id: 'extreme_heat',
    label: 'Extreme Heat',
    description: 'Increased frequency and duration of heat waves; elevated ambient and subsurface temperatures affecting biological treatment performance and worker safety.',
    highRiskRegions: ['nyc', 'long_island', 'capital', 'western'],
    remedyRisks: ['biostim', 'mna', 'pump_treat', 'soil_vapor_svs'],
    screeningQuestions: [
      'Does the remedy rely on biological processes (bioremediation, MNA) sensitive to temperature?',
      'Will field crews be working during summer months with extended heat exposure?',
      'Could elevated temperatures affect volatilization rates and vapor intrusion risk?',
      'Are any outdoor treatment components vulnerable to overheating?',
    ],
    adaptationMeasures: [
      'Develop heat illness prevention plans for field crews',
      'Evaluate temperature sensitivity of biological treatment (bioremediation rate changes)',
      'Monitor for increased volatilization under higher temperatures (VI pathway)',
      'Schedule intensive field activities during cooler months where possible',
    ],
    regulatoryRef: 'DER-31 §V.C; NYS ClimAID; OSHA Heat Illness Prevention Standards',
  },
  {
    id: 'erosion',
    label: 'Erosion & Geomorphic Change',
    description: 'Increased erosion from intensified storms, soil disturbance, and changing vegetation cover threatening remedy integrity and contamination containment.',
    highRiskRegions: ['nyc', 'long_island', 'hudson_valley', 'north'],
    remedyRisks: ['site_cover', 'institutional', 'excavation'],
    screeningQuestions: [
      'Does the remedy include a soil cover system that could be eroded?',
      'Is the site on sloped terrain (>5% grade) vulnerable to storm-driven erosion?',
      'Are there drainage channels or stormwater features at risk from increased runoff?',
      'Could erosion expose previously covered contamination?',
    ],
    adaptationMeasures: [
      'Design cover systems with erosion-resistant materials (armored rip-rap, reinforced turf)',
      'Incorporate drainage design for projected peak storm events (25-year, 50-year storms)',
      'Establish native deep-rooted vegetation for slope stabilization',
      'SMP to include post-storm cover system inspection protocol',
    ],
    regulatoryRef: 'DER-31 §V.B; NYSDEC Stormwater Management Design Manual',
  },
  {
    id: 'wildfire',
    label: 'Wildfire Risk',
    description: 'Increased wildfire risk in forested and semi-rural areas; smoke and ash deposition can introduce new contamination vectors.',
    highRiskRegions: ['north', 'central', 'western'],
    remedyRisks: ['mna', 'institutional', 'pump_treat'],
    screeningQuestions: [
      'Is the site in or adjacent to forested areas or grassland fire risk zones?',
      'Could wildfire damage monitoring wells, treatment systems, or institutional controls?',
      'Are there combustible materials stored on-site that increase ignition risk?',
    ],
    adaptationMeasures: [
      'Evaluate site location relative to NYS Forest Fire Danger Rating zones',
      'Establish defensible space around treatment system components',
      'Include wildfire event response in SMP contingency planning',
    ],
    regulatoryRef: 'DER-31 §V.D; NYS DEC Forest Fire Management',
  },
  {
    id: 'drought',
    label: 'Drought & Water Stress',
    description: 'Reduced recharge and falling water tables may concentrate contaminants, affect monitored natural attenuation, and create dust generation concerns.',
    highRiskRegions: ['long_island', 'central', 'western'],
    remedyRisks: ['mna', 'pump_treat', 'biostim', 'perm_barrier'],
    screeningQuestions: [
      'Does the remedy rely on adequate groundwater flow or recharge?',
      'Could drought-induced water table decline concentrate dissolved-phase contamination?',
      'Are there dust generation risks from drying contaminated soil?',
      'Does in-situ biological treatment require adequate moisture levels?',
    ],
    adaptationMeasures: [
      'Evaluate MNA effectiveness under reduced dilution and attenuation conditions',
      'Monitor for concentration rebound during drought periods',
      'Ensure dust suppression plans account for dry, windswept conditions',
    ],
    regulatoryRef: 'DER-31 §V.C; NYS Water Resources Plan',
  },
];

// ── Regulatory References ─────────────────────────────────────────────────────
export const REGULATORY_REFS = [
  {
    category: 'core_regulation',
    title: '6 NYCRR Part 375 — Environmental Remediation Programs',
    desc: 'Primary regulation governing all NYSDEC remediation programs including BCP, VCP, and State Superfund. Effective December 31, 2025 (revised). GSR requirements embedded in remedy selection and design criteria.',
    status: 'current',
    url: 'https://extapps.dec.ny.gov/docs/remediation_hudson_pdf/part375rlso.pdf',
  },
  {
    category: 'der_policy',
    title: 'DER-31: Green and Sustainable Remediation Policy',
    desc: 'Core NYSDEC policy document defining GSR requirements. Applies to ALL NYSDEC remediation programs. Proposed revisions were open for public comment through December 2, 2025 — verify current version.',
    status: 'current',
    url: 'https://extapps.dec.ny.gov/docs/remediation_hudson_pdf/der31.pdf',
  },
  {
    category: 'rawp_template',
    title: 'NYSDEC Generic RAWP Template (March 2024)',
    desc: 'Official NYSDEC template for Remedial Action Work Plans. Includes required GSR section language and SiteWise requirement. Required GSR components: BMP analysis, footprint metrics, climate vulnerability assessment.',
    status: 'current',
    url: 'https://dec.ny.gov/sites/default/files/2024-03/rawptemplate.pdf',
  },
  {
    category: 'fer_template',
    title: 'NYSDEC FER Checklist / Template',
    desc: 'FER documentation requirements including planned vs. actual GSR metrics comparison, implemented BMP documentation, deviation explanation, and DER-31 certification.',
    status: 'current',
    url: 'https://dec.ny.gov/sites/default/files/2023-12/fertemplate.pdf',
  },
  {
    category: 'gsr_guidance',
    title: 'GSR Fact Sheet (January 2024)',
    desc: 'NYSDEC summary of current GSR requirements, BMP process, and SiteWise acceptance as the footprint analysis tool.',
    status: 'current',
    url: 'https://dec.ny.gov/sites/default/files/2024-01/gsrfactsheet.pdf',
  },
  {
    category: 'gsr_guidance',
    title: 'GSR & Climate Resilience FAQ',
    desc: 'NYSDEC Q&A addressing common consultant questions on scope, documentation requirements, and quantitative vs. qualitative assessment thresholds.',
    status: 'current',
    url: 'https://dec.ny.gov/sites/default/files/2024-04/gsrresiliencyfaq.pdf',
  },
  {
    category: 'bcp_application',
    title: 'BCP Application Form (Revised October 2025)',
    desc: 'Updated BCP Application Form includes new Questions 5-6 requiring: (Q5) report on GSR and climate resilience evaluation across all phases; (Q6) climate change screening or vulnerability assessment for remediation-stage projects.',
    status: 'new',
    url: 'https://dec.ny.gov/sites/default/files/2025-01/bcpapplication.pdf',
  },
  {
    category: 'sitewise',
    title: 'SiteWise™ Environmental Footprint Analysis Tool (SURF)',
    desc: 'NYSDEC-accepted quantitative footprint analysis calculator. Calculates GHG (CO₂e), total energy (MMBTU), NOx, SOx, and PM10 for remedial alternatives. Available from SURF (Sustainable Remediation Forum) library. Current version: 3.2.',
    status: 'current',
    url: 'https://www.sustainableremediation.org/library/',
  },
  {
    category: 'epa_tool',
    title: 'EPA SEFA — Spreadsheets for Environmental Footprint Analysis',
    desc: 'Alternative EPA footprint analysis tool. 21 automated metrics including lifecycle material, water, energy, and air emission calculations. Free download from EPA CLU-IN.',
    status: 'current',
    url: 'https://clu-in.org/greenremediation/SEFA/',
  },
  {
    category: 'epa_bmp',
    title: 'EPA Green Remediation BMP Fact Sheets',
    desc: 'EPA fact sheets covering GSR BMPs for specific technologies including ISS, excavation, P&T, bioremediation, and more. Primary reference for BMP selection and documentation.',
    status: 'current',
    url: 'https://www.epa.gov/remedytech/green-remediation-best-management-practices',
  },
  {
    category: 'climate',
    title: 'NYSDEC ClimAID — Climate Change Adaptation Guidance',
    desc: 'NY State climate projections by region used for climate vulnerability assessments. Includes sea level rise, precipitation, temperature, and extreme event projections by time horizon (2050, 2080, 2100).',
    status: 'current',
    url: 'https://www.nyserda.ny.gov/All-Programs/ClimAID',
  },
  {
    category: 'climate',
    title: 'NYC Panel on Climate Change (NPCC) Guidance',
    desc: 'For NYC projects: NYC-specific climate projections required for coastal flood and SLR vulnerability assessments. NPCC scenarios are NYSDEC-accepted for NYC BCP projects.',
    status: 'current',
    url: 'https://climate.cityofnewyork.us/',
  },
];

// ── SiteWise Emission Factors ─────────────────────────────────────────────────
// Calibrated to real RAWP SiteWise outputs (Langan, 210 Douglass St BCP, 2024)
// All factors per CY of active remediation volume unless noted
export const EMISSION_FACTORS = {
  // Diesel fuel base factors (per gallon)
  diesel_co2e_kg_per_gal:  10.21,   // EPA AP-42
  diesel_mmbtu_per_gal:    0.1381,
  diesel_nox_kg_per_gal:   0.0487,
  diesel_sox_kg_per_gal:   0.0027,
  diesel_pm10_kg_per_gal:  0.00138,

  // NY grid electricity (per kWh)
  elec_co2e_kg_per_kwh:    0.233,   // EPA eGRID NY 2023
  elec_mmbtu_per_kwh:      0.003412,

  // Excavation equipment fuel (gal diesel/CY)
  excavation_fuel_per_cy:  0.95,

  // Transport truck (20 ton, 5 MPG)
  truck_ton_capacity:      20,
  truck_mpg:               5.0,
  soil_density_tons_per_cy: 1.35,

  // Import fill (same truck, assume 60% of haul distance for return)
  import_fill_fuel_factor: 0.60,
};
