/**
 * SiteWise™ v3.2 Calculation Engine
 * Replicates the full Excel calculation chain:
 *   Component 1-4 → Summary → FinalSummary
 *
 * Each component computes:
 *   1. Material Production
 *   2. Transportation – Personnel
 *   3. Transportation – Equipment/Cargo
 *   4. Equipment Use (Earthwork, Drilling, Pumps, Generators, Electrical, Other)
 *   5. Residual Handling
 * Then sums into a component footprint; all 4 components sum to project totals.
 */

import {
  GWP, CONV,
  MATERIAL_FACTORS,
  PVC_PIPE_WEIGHT, STEEL_PIPE_WEIGHT,
  FUEL_FACTORS,
  VEHICLE_FACTORS, HD_TRUCK_FACTORS,
  AIR_FACTORS, RAIL_FACTORS,
  AIR_CARGO_FACTORS, RAIL_CARGO_FACTORS, WATER_CARGO_FACTORS,
  SHARED_ROAD_FACTORS,
  EARTHWORK_EQUIPMENT,
  DRILLING_FACTORS, DRILLING_EMISSION_FACTORS,
  STATE_ELECTRICITY,
  PUMP_FACTORS_DIESEL, GENERATOR_FACTORS_DIESEL,
  FOOTPRINT_REDUCTION,
  UNIT_TO_KG,
} from './sitewiseData.js';

// ─── Zero-baseline output row ─────────────────────────────────────────────────
const ZERO = { co2e: 0, energy_mmbtu: 0, nox: 0, sox: 0, pm10: 0 };
const zero = () => ({ ...ZERO });

// ─── Helpers ─────────────────────────────────────────────────────────────────
function addRows(...rows) {
  return rows.reduce((acc, r) => ({
    co2e:        (acc.co2e        || 0) + (r.co2e        || 0),
    energy_mmbtu:(acc.energy_mmbtu|| 0) + (r.energy_mmbtu|| 0),
    nox:         (acc.nox         || 0) + (r.nox         || 0),
    sox:         (acc.sox         || 0) + (r.sox         || 0),
    pm10:        (acc.pm10        || 0) + (r.pm10        || 0),
  }), zero());
}

function fuelToEmissions(fuelType, gallons) {
  const f = FUEL_FACTORS[fuelType] || FUEL_FACTORS.Diesel;
  const co2_kg  = f.co2_kg_gal  * gallons;
  const n2o_kg  = (f.n2o_g_gal  * gallons) * CONV.G_TO_MT * 1000; // kg
  const ch4_kg  = (f.ch4_g_gal  * gallons) * CONV.G_TO_MT * 1000;
  const co2e_kg = co2_kg + n2o_kg * GWP.N2O + ch4_kg * GWP.CH4;
  const btu     = f.btu_gal * gallons;
  return {
    co2e:         co2e_kg * CONV.KG_TO_MT,
    energy_mmbtu: btu * CONV.BTU_TO_MMBTU,
    nox:  0, sox: 0, pm10: 0,  // fuel combustion NOx/SOx/PM10 tracked separately
  };
}

// Auto-select earthwork equipment for a given volume (CY)
export function autoSelectEquipment(volumeCY) {
  const match = EARTHWORK_EQUIPMENT.find(
    e => volumeCY >= e.volLow && volumeCY < e.volHigh
  );
  return match || EARTHWORK_EQUIPMENT[0];
}

// ─── 1. Material Production ───────────────────────────────────────────────────
/**
 * items: [{ material: string, qty_kg: number }]
 * Returns MT CO2e, MMBTU, MT NOx/SOx/PM10
 */
export function calcMaterialProduction(items = []) {
  let co2e = 0, energy_mmbtu = 0, nox = 0, sox = 0, pm10 = 0;
  for (const item of items) {
    const f = MATERIAL_FACTORS[item.material];
    if (!f) continue;
    const kg = item.qty_kg || 0;
    co2e         += kg * f.co2e  * CONV.KG_TO_MT;       // kg→MT
    energy_mmbtu += kg * f.mj    * CONV.BTU_TO_MMBTU * CONV.MJ_TO_BTU; // MJ→MMBTU
    nox          += kg * f.nox   * CONV.G_TO_MT;         // g→MT
    sox          += kg * f.sox   * CONV.G_TO_MT;
    pm10         += kg * f.pm10  * CONV.G_TO_MT;
  }
  return { co2e, energy_mmbtu, nox, sox, pm10 };
}

// ─── 2. Transportation – Personnel ───────────────────────────────────────────
/**
 * trips: [{ vehicleType: string, miles: number, passengers: number }]
 */
export function calcPersonnelTransport(trips = []) {
  let co2e = 0, energy_mmbtu = 0, nox = 0, sox = 0, pm10 = 0;
  for (const t of trips) {
    const f = VEHICLE_FACTORS[t.vehicleType] || VEHICLE_FACTORS.Cars;
    const mi = (t.miles || 0) * (t.passengers || 1);
    co2e         += mi * f.co2_g_mi  * CONV.G_TO_MT;
    energy_mmbtu += mi * (f.co2_g_mi / f.mpg) * FUEL_FACTORS.Gasoline.btu_gal * CONV.BTU_TO_MMBTU / f.mpg;
    nox          += mi * f.nox_g_mi  * CONV.G_TO_MT;
    sox          += mi * f.sox_g_mi  * CONV.G_TO_MT;
    pm10         += mi * f.pm10_g_mi * CONV.G_TO_MT;
  }
  return { co2e, energy_mmbtu, nox, sox, pm10 };
}

// ─── 1b. Well Materials → Material Items ──────────────────────────────────────
/**
 * wellMaterials: [{ numWells, depthFt, diameterIn, casing, sandKg, gravelKg, bentoniteKg, cementKg }]
 * Converts well specs to equivalent { material, qty_kg } items for calcMaterialProduction.
 */
export function wellMaterialsToItems(wellMaterials = []) {
  const items = [];
  for (const w of wellMaterials) {
    const n = w.numWells || 0;
    const depth = w.depthFt || 0;
    const dia = w.diameterIn || '2';
    const casing = w.casing || 'Sch 40 PVC';

    // PVC or Steel casing weight
    let lbPerFt = 0;
    if (casing.includes('Steel')) {
      lbPerFt = (STEEL_PIPE_WEIGHT[dia] && STEEL_PIPE_WEIGHT[dia][casing]) || 0;
    } else {
      lbPerFt = (PVC_PIPE_WEIGHT[dia] && PVC_PIPE_WEIGHT[dia][casing]) || 0;
    }
    const casingKg = n * depth * lbPerFt * CONV.LBS_TO_KG;
    if (casingKg > 0) {
      const matName = casing.includes('Steel') ? 'Steel' : 'PVC';
      items.push({ material: matName, qty_kg: casingKg });
    }

    // Fill materials (already in kg)
    if (w.sandKg > 0)      items.push({ material: 'Sand',          qty_kg: w.sandKg || 0 });
    if (w.gravelKg > 0)    items.push({ material: 'Gravel',        qty_kg: w.gravelKg || 0 });
    if (w.bentoniteKg > 0) items.push({ material: 'Bentonite',     qty_kg: w.bentoniteKg || 0 });
    if (w.cementKg > 0)    items.push({ material: 'Typical Cement',qty_kg: w.cementKg || 0 });
  }
  return items;
}

// ─── 1c. Treatment Chemicals → Material Items ─────────────────────────────────
/**
 * treatmentChems: [{ material, injectionPts, lbsPerPt, injectionsPerPt }]
 */
export function treatmentChemsToItems(chems = []) {
  return chems.map(c => ({
    material: c.material || 'Hydrogen Peroxide',
    qty_kg: (c.injectionPts || 0) * (c.lbsPerPt || 0) * (c.injectionsPerPt || 1) * CONV.LBS_TO_KG,
  })).filter(i => i.qty_kg > 0);
}

// ─── 1d. Treatment Media → Material Items ─────────────────────────────────────
/**
 * treatmentMedia: [{ mediaType, lbs }]
 */
export function treatmentMediaToItems(media = []) {
  return media.map(m => ({
    material: m.mediaType || 'Virgin GAC',
    qty_kg: (m.lbs || 0) * CONV.LBS_TO_KG,
  })).filter(i => i.qty_kg > 0);
}

// ─── 1e. Construction Materials → Material Items ──────────────────────────────
/**
 * constructionMats: [{ material, lbs }]
 */
export function constructionMatsToItems(mats = []) {
  return mats.map(m => ({
    material: m.material || 'HDPE Liner',
    qty_kg: (m.lbs || 0) * CONV.LBS_TO_KG,
  })).filter(i => i.qty_kg > 0);
}

// ─── 1f. Bulk Materials → Material Items ─────────────────────────────────────
/**
 * bulkMaterials: [{ material, qty, unit }]
 * unit: 'lbs' | 'kg' | 'short tons' | 'metric tons'
 */
export function bulkMaterialsToItems(bulkMaterials = []) {
  return bulkMaterials.map(b => {
    const conv = UNIT_TO_KG[b.unit] ?? 1.0;
    return {
      material: b.material || 'Sand',
      qty_kg: (b.qty || 0) * conv,
    };
  }).filter(i => i.qty_kg > 0);
}

// ─── 4h. Electric Pumps → kWh Items ──────────────────────────────────────────
/**
 * electricPumps: [{ method:'flow'|'hp', gpm, headFt, numPumps, hours, sg, hpEach }]
 * Returns [{kwh, state}] for merging into electricItems.
 * Pump efficiency default 0.65, motor efficiency default 0.90.
 */
export function electricPumpsToKwhItems(electricPumps = [], state = 'NY') {
  const PUMP_EFF = 0.65;
  const MOTOR_EFF = 0.90;
  const KW_PER_HP = 0.7457;
  return electricPumps.map(p => {
    const n = p.numPumps || 1;
    const hrs = p.hours || 0;
    let kwh = 0;
    if (p.method === 'flow') {
      // Hydraulic HP = (gpm × head_ft × sg) / 3960
      // Shaft HP = Hydraulic HP / pump_eff
      // kW input = Shaft HP × KW_PER_HP / motor_eff
      const hydraulicHp = ((p.gpm || 0) * (p.headFt || 0) * (p.sg || 1.0)) / 3960;
      const inputKw = hydraulicHp / PUMP_EFF * KW_PER_HP / MOTOR_EFF;
      kwh = inputKw * n * hrs;
    } else {
      // HP known
      const inputKw = (p.hpEach || 0) * KW_PER_HP / MOTOR_EFF;
      kwh = inputKw * n * hrs;
    }
    return { kwh, state };
  }).filter(i => i.kwh > 0);
}

// ─── 2b. Transportation – Personnel Air ───────────────────────────────────────
/**
 * airTrips: [{ miles: number, travelers: number, flights: number }]
 */
export function calcAirPersonnel(airTrips = []) {
  let co2e = 0, energy_mmbtu = 0, nox = 0, sox = 0, pm10 = 0;
  for (const t of airTrips) {
    const paxMiles = (t.miles || 0) * (t.travelers || 1) * (t.flights || 1);
    co2e         += paxMiles * AIR_FACTORS.co2_kg_pax_mi * CONV.KG_TO_MT;
    energy_mmbtu += paxMiles * AIR_FACTORS.btu_pax_mi   * CONV.BTU_TO_MMBTU;
    nox          += paxMiles * AIR_FACTORS.nox_g_pax_mi * CONV.G_TO_MT;
    sox          += paxMiles * AIR_FACTORS.sox_g_pax_mi * CONV.G_TO_MT;
    pm10         += paxMiles * AIR_FACTORS.pm10_g_pax_mi* CONV.G_TO_MT;
  }
  return { co2e, energy_mmbtu, nox, sox, pm10 };
}

// ─── 2c. Transportation – Personnel Rail ──────────────────────────────────────
/**
 * railTrips: [{ railType: string, miles: number, trips: number, travelers: number }]
 */
export function calcRailPersonnel(railTrips = []) {
  let co2e = 0, energy_mmbtu = 0, nox = 0, sox = 0, pm10 = 0;
  for (const t of railTrips) {
    const f = RAIL_FACTORS[t.railType] || RAIL_FACTORS['Intercity rail'];
    const paxMiles = (t.miles || 0) * (t.trips || 1) * (t.travelers || 1);
    co2e         += paxMiles * f.co2_kg  * CONV.KG_TO_MT;
    energy_mmbtu += 0; // RAIL_FACTORS doesn't have BTU/pax-mile; negligible
    nox          += paxMiles * f.nox_g   * CONV.G_TO_MT;
    sox          += paxMiles * f.sox_g   * CONV.G_TO_MT;
    pm10         += paxMiles * f.pm10_g  * CONV.G_TO_MT;
  }
  return { co2e, energy_mmbtu, nox, sox, pm10 };
}

// ─── 3. Transportation – Equipment & Cargo ───────────────────────────────────
/**
 * shipments: [{
 *   mode: 'road'|'air'|'rail'|'water',
 *   fuelType: 'Diesel'|'Gasoline'|'Biodiesel 20',
 *   miles: number,
 *   tons: number,       // short tons (road) or ton-miles already provided
 *   truckType: 'HD'     // only for road
 * }]
 */
export function calcEquipmentTransport(shipments = []) {
  let co2e = 0, energy_mmbtu = 0, nox = 0, sox = 0, pm10 = 0;
  for (const s of shipments) {
    const miles = s.miles || 0;
    const tons  = s.tons  || 0;
    if (s.mode === 'road' || !s.mode) {
      const f = HD_TRUCK_FACTORS[s.fuelType] || HD_TRUCK_FACTORS.Diesel;
      // Estimate trips: 1 trip per load; shared road per ton-mile
      const tonMiles = miles * tons;
      const galSharedRoad = tonMiles * SHARED_ROAD_FACTORS.diesel_gal_tonmi;
      co2e         += miles * f.co2_g_mi * CONV.G_TO_MT;
      energy_mmbtu += galSharedRoad * FUEL_FACTORS.Diesel.btu_gal * CONV.BTU_TO_MMBTU;
      nox          += miles * f.nox_g_mi  * CONV.G_TO_MT;
      sox          += miles * f.sox_g_mi  * CONV.G_TO_MT;
      pm10         += miles * f.pm10_g_mi * CONV.G_TO_MT;
    } else if (s.mode === 'air') {
      const f = AIR_CARGO_FACTORS;
      const tonMiles = miles * tons;
      co2e         += tonMiles * f.co2_kg_tonmi * CONV.KG_TO_MT;
      energy_mmbtu += tonMiles * f.btu_tonmi    * CONV.BTU_TO_MMBTU;
      nox          += tonMiles * f.nox_g_tonmi  * CONV.G_TO_MT;
      sox          += tonMiles * f.sox_g_tonmi  * CONV.G_TO_MT;
      pm10         += tonMiles * f.pm10_g_tonmi * CONV.G_TO_MT;
    } else if (s.mode === 'rail') {
      const f = RAIL_CARGO_FACTORS;
      const tonMiles = miles * tons;
      co2e         += tonMiles * f.co2_kg_tonmi * CONV.KG_TO_MT;
      energy_mmbtu += tonMiles * f.btu_tonmi    * CONV.BTU_TO_MMBTU;
      nox          += tonMiles * f.nox_g_tonmi  * CONV.G_TO_MT;
      sox          += tonMiles * f.sox_g_tonmi  * CONV.G_TO_MT;
      pm10         += tonMiles * f.pm10_g_tonmi * CONV.G_TO_MT;
    } else if (s.mode === 'water') {
      const f = WATER_CARGO_FACTORS;
      const tonMiles = miles * tons;
      co2e         += tonMiles * f.co2_kg_tonmi * CONV.KG_TO_MT;
      energy_mmbtu += tonMiles * f.btu_tonmi    * CONV.BTU_TO_MMBTU;
      nox          += tonMiles * f.nox_g_tonmi  * CONV.G_TO_MT;
      sox          += tonMiles * f.sox_g_tonmi  * CONV.G_TO_MT;
      pm10         += tonMiles * f.pm10_g_tonmi * CONV.G_TO_MT;
    }
  }
  return { co2e, energy_mmbtu, nox, sox, pm10 };
}

// ─── 4a. Equipment Use – Earthwork ───────────────────────────────────────────
/**
 * Input: { volumeCY: number, fuelType: string, hoursOverride?: number }
 * Auto-selects equipment from EARTHWORK_EQUIPMENT table.
 */
export function calcEarthwork(input = {}) {
  const { volumeCY = 0, fuelType = 'Diesel', hoursOverride } = input;
  if (volumeCY <= 0) return zero();
  const equip = autoSelectEquipment(volumeCY);
  const hours = hoursOverride != null ? hoursOverride : (volumeCY / equip.cyph);
  const gallons = hours * equip.gph;
  const base = fuelToEmissions(fuelType, gallons);
  // NOx/SOx/PM10 from equipment-specific rates (g/hr)
  return {
    ...base,
    nox:  hours * equip.nox  * CONV.G_TO_MT,
    sox:  hours * equip.sox  * CONV.G_TO_MT,
    pm10: hours * equip.pm10 * CONV.G_TO_MT,
  };
}

// ─── 4b. Equipment Use – Drilling ────────────────────────────────────────────
/**
 * wells: [{ method: string, hours: number, fuelType: 'Diesel'|'Gasoline' }]
 */
export function calcDrilling(wells = []) {
  let co2e = 0, energy_mmbtu = 0, nox = 0, sox = 0, pm10 = 0;
  for (const w of wells) {
    const df = DRILLING_FACTORS[w.method];
    const ef = DRILLING_EMISSION_FACTORS[w.fuelType] || DRILLING_EMISSION_FACTORS.Diesel;
    if (!df) continue;
    const hrs = w.hours || 0;
    const gal = hrs * df.gph;
    const base = fuelToEmissions(w.fuelType || 'Diesel', gal);
    co2e         += base.co2e;
    energy_mmbtu += base.energy_mmbtu;
    nox          += gal * ef.nox_g_gal  * CONV.G_TO_MT;
    sox          += gal * ef.sox_g_gal  * CONV.G_TO_MT;
    pm10         += gal * ef.pm10_g_gal * CONV.G_TO_MT;
  }
  return { co2e, energy_mmbtu, nox, sox, pm10 };
}

// ─── 4c. Equipment Use – Pumps ───────────────────────────────────────────────
/**
 * pumps: [{ hp: number, hours: number }]
 * Auto-matches to nearest HP range in PUMP_FACTORS_DIESEL.
 */
export function calcPumps(pumps = []) {
  let co2e = 0, energy_mmbtu = 0, nox = 0, sox = 0, pm10 = 0;
  for (const p of pumps) {
    const match = PUMP_FACTORS_DIESEL.find(r => {
      const [lo, hi] = r.hpRange.split(' to ').map(Number);
      return p.hp >= lo && p.hp < hi;
    }) || PUMP_FACTORS_DIESEL[PUMP_FACTORS_DIESEL.length - 1];
    const hrs = p.hours || 0;
    const gal = hrs * match.gph;
    const base = fuelToEmissions('Diesel', gal);
    co2e         += base.co2e;
    energy_mmbtu += base.energy_mmbtu;
    nox          += hrs * match.nox_g_hr * CONV.G_TO_MT;
    sox          += hrs * match.sox_g_hr * CONV.G_TO_MT;
    pm10         += 0; // not tracked in SiteWise pump table
  }
  return { co2e, energy_mmbtu, nox, sox, pm10 };
}

// ─── 4d. Equipment Use – Generators ─────────────────────────────────────────
export function calcGenerators(generators = []) {
  let co2e = 0, energy_mmbtu = 0, nox = 0, sox = 0, pm10 = 0;
  for (const g of generators) {
    const match = GENERATOR_FACTORS_DIESEL.find(r => {
      const [lo, hi] = r.hpRange.split(' to ').map(Number);
      return g.hp >= lo && g.hp < hi;
    }) || GENERATOR_FACTORS_DIESEL[GENERATOR_FACTORS_DIESEL.length - 1];
    const hrs = g.hours || 0;
    const gal = hrs * match.gph;
    const base = fuelToEmissions('Diesel', gal);
    co2e         += base.co2e;
    energy_mmbtu += base.energy_mmbtu;
    nox          += hrs * (match.nox_g_hr || 0) * CONV.G_TO_MT;
    sox          += hrs * (match.sox_g_hr || 0) * CONV.G_TO_MT;
    pm10         += 0;
  }
  return { co2e, energy_mmbtu, nox, sox, pm10 };
}

// ─── 4e. Equipment Use – Electricity ─────────────────────────────────────────
/**
 * electricItems: [{ kwh: number, state: string }]
 * Uses STATE_ELECTRICITY table; defaults to NY.
 */
export function calcElectricity(electricItems = []) {
  let co2e = 0, energy_mmbtu = 0, nox = 0, sox = 0, pm10 = 0;
  for (const e of electricItems) {
    const kwh   = e.kwh || 0;
    const mwh   = kwh * CONV.KWH_TO_MWH;
    const sf    = STATE_ELECTRICITY[e.state] || STATE_ELECTRICITY.NY;
    // lb/MWh → MT
    const co2_mt  = mwh * sf.co2  * CONV.LBS_TO_MT;
    const n2o_mt  = mwh * sf.n2o  * CONV.LBS_TO_MT;
    const ch4_mt  = mwh * sf.ch4  * CONV.LBS_TO_MT;
    co2e         += co2_mt + n2o_mt * GWP.N2O + ch4_mt * GWP.CH4;
    energy_mmbtu += kwh * 0.003412;   // 1 kWh = 0.003412 MMBTU
    nox          += mwh * sf.nox  * CONV.LBS_TO_MT;
    sox          += mwh * sf.sox  * CONV.LBS_TO_MT;
    pm10         += mwh * sf.pm10 * CONV.LBS_TO_MT;
  }
  return { co2e, energy_mmbtu, nox, sox, pm10 };
}

// ─── 4f. Other Equipment (generic diesel) ────────────────────────────────────
/**
 * items: [{ name: string, hp: number, hours: number, fuelType: string }]
 */
export function calcOtherEquipment(items = []) {
  let co2e = 0, energy_mmbtu = 0, nox = 0, sox = 0, pm10 = 0;
  for (const item of items) {
    // Load factor ~0.56 is SiteWise default for off-road equipment
    const LOAD_FACTOR = 0.56;
    const gphEst = (item.hp || 50) * LOAD_FACTOR * 0.06; // rough: 0.06 gal/hp·hr at 56% load
    const gal = (item.hours || 0) * gphEst;
    const base = fuelToEmissions(item.fuelType || 'Diesel', gal);
    co2e         += base.co2e;
    energy_mmbtu += base.energy_mmbtu;
    // Use Dozer 105HP NOx rate as proxy
    nox += (item.hours || 0) * 2109 * CONV.G_TO_MT;
    sox += (item.hours || 0) * 300  * CONV.G_TO_MT;
    pm10 += (item.hours || 0) * 240 * CONV.G_TO_MT;
  }
  return { co2e, energy_mmbtu, nox, sox, pm10 };
}

// ─── 5. Residual Handling ─────────────────────────────────────────────────────
/**
 * residuals: [{
 *   type: 'soil'|'debris'|'wastewater'|'other',
 *   tons: number,
 *   miles: number,
 *   fuelType: string
 * }]
 */
export function calcResidualHandling(residuals = []) {
  let co2e = 0, energy_mmbtu = 0, nox = 0, sox = 0, pm10 = 0;
  for (const r of residuals) {
    const f = HD_TRUCK_FACTORS[r.fuelType] || HD_TRUCK_FACTORS.Diesel;
    const miles = r.miles || 0;
    const tons  = r.tons  || 0;
    const tonMiles = miles * tons;
    const gal = tonMiles * SHARED_ROAD_FACTORS.diesel_gal_tonmi;
    co2e         += miles * f.co2_g_mi  * CONV.G_TO_MT;
    energy_mmbtu += gal * FUEL_FACTORS.Diesel.btu_gal * CONV.BTU_TO_MMBTU;
    nox          += miles * f.nox_g_mi  * CONV.G_TO_MT;
    sox          += miles * f.sox_g_mi  * CONV.G_TO_MT;
    pm10         += miles * f.pm10_g_mi * CONV.G_TO_MT;
  }
  return { co2e, energy_mmbtu, nox, sox, pm10 };
}

// ─── Component Calculator ─────────────────────────────────────────────────────
/**
 * Computes the full footprint for one SiteWise component.
 * componentData shape:
 * {
 *   label: string,
 *   materialItems: [...],
 *   personnelTrips: [...],
 *   equipmentShipments: [...],
 *   earthwork: { volumeCY, fuelType, hoursOverride },
 *   wells: [...],
 *   pumps: [...],
 *   generators: [...],
 *   electricItems: [...],
 *   otherEquipment: [...],
 *   residuals: [...],
 * }
 */
export function calcComponent(componentData = {}) {
  // Aggregate all material inputs into one material production total
  const allMaterialItems = [
    ...(componentData.materialItems || []),
    ...wellMaterialsToItems(componentData.wellMaterials),
    ...treatmentChemsToItems(componentData.treatmentChems),
    ...treatmentMediaToItems(componentData.treatmentMedia),
    ...constructionMatsToItems(componentData.constructionMats),
    ...bulkMaterialsToItems(componentData.bulkMaterials),
  ];
  const materialProduction   = calcMaterialProduction(allMaterialItems);

  // All personnel transport modes
  const roadPersonnel        = calcPersonnelTransport(componentData.personnelTrips);
  const airPersonnel         = calcAirPersonnel(componentData.airTrips);
  const railPersonnel        = calcRailPersonnel(componentData.railTrips);
  const personnelTransport   = addRows(roadPersonnel, airPersonnel, railPersonnel);

  const equipmentTransport   = calcEquipmentTransport(componentData.equipmentShipments);
  const earthworkUse         = calcEarthwork(componentData.earthwork || {});
  const drillingUse          = calcDrilling(componentData.wells);
  const pumpUse              = calcPumps(componentData.pumps);
  const generatorUse         = calcGenerators(componentData.generators);
  // electricItems already includes converted electricPumps (injected by calcProjectSiteWise)
  const electricityUse       = calcElectricity(componentData.electricItems);
  const otherEquipmentUse    = calcOtherEquipment(componentData.otherEquipment);
  const residualHandling     = calcResidualHandling(componentData.residuals);

  const equipmentUse = addRows(
    earthworkUse, drillingUse, pumpUse, generatorUse,
    electricityUse, otherEquipmentUse
  );

  const transportation = addRows(personnelTransport, equipmentTransport);

  const total = addRows(
    materialProduction, transportation, equipmentUse, residualHandling
  );

  return {
    label: componentData.label || 'Component',
    breakdown: {
      materialProduction,
      personnelTransport,
      equipmentTransport,
      earthworkUse,
      drillingUse,
      pumpUse,
      generatorUse,
      electricityUse,
      otherEquipmentUse,
      residualHandling,
    },
    subtotals: {
      materialProduction,
      transportation,
      equipmentUse,
      residualHandling,
    },
    total,
  };
}

// ─── Footprint Reduction ──────────────────────────────────────────────────────
/**
 * reductions: {
 *   solarKw: number,         // solar panels installed
 *   windKw: number,
 *   methaneCaptureScfd: number,
 *   docReductionPct: number, // % reduction in driving
 *   vfdInstalled: boolean,
 * }
 */
export function calcReductions(reductions = {}, baseTotal = zero()) {
  let savedCo2e = 0, savedMmbtu = 0;
  const fr = FOOTPRINT_REDUCTION || {};

  // Solar: kW × hr/yr ÷ 1000 → MWh → use NY average CO2 factor
  if (reductions.solarKw > 0) {
    const mwhPerYear = (reductions.solarKw * 4.5 * 365) / 1000; // 4.5 peak hrs/day avg
    savedMmbtu   += mwhPerYear * 1000 * 0.003412;
    savedCo2e    += mwhPerYear * STATE_ELECTRICITY.NY.co2 * CONV.LBS_TO_MT;
  }
  if (reductions.windKw > 0) {
    const mwhPerYear = (reductions.windKw * 8 * 365) / 1000; // ~35% capacity factor
    savedMmbtu   += mwhPerYear * 1000 * 0.003412;
    savedCo2e    += mwhPerYear * STATE_ELECTRICITY.NY.co2 * CONV.LBS_TO_MT;
  }
  // Methane capture: scfd × BTU/scf ÷ 1e6 = MMBTU/day
  if (reductions.methaneCaptureScfD > 0) {
    const scfd = reductions.methaneCaptureScfD;
    const mmbtu_day = scfd * 1020 * CONV.BTU_TO_MMBTU; // 1020 BTU/scf methane
    savedMmbtu += mmbtu_day * 365;
    savedCo2e  += (scfd * 365 / 35.315) * 0.000717 * GWP.CH4 * CONV.KG_TO_MT; // approx kg CH4/m3
  }
  // DOC (driving) reduction
  if (reductions.docReductionPct > 0) {
    // Not directly in baseline; estimate 10% of co2e
    savedCo2e += baseTotal.co2e * (reductions.docReductionPct / 100) * 0.1;
  }
  // VFD — typically saves ~25% of pump electricity
  if (reductions.vfdInstalled) {
    savedCo2e  += baseTotal.co2e  * 0.02; // ~2% of total
    savedMmbtu += baseTotal.energy_mmbtu * 0.02;
  }

  return {
    co2e:         -Math.abs(savedCo2e),
    energy_mmbtu: -Math.abs(savedMmbtu),
    nox: 0, sox: 0, pm10: 0,
  };
}

// ─── Project Summary ──────────────────────────────────────────────────────────
/**
 * Main entry point — takes the full useSiteWise store state and returns results.
 *
 * @param {Array}  components  — array of up to 4 componentData objects
 * @param {Object} reductions  — footprint reduction inputs
 * @param {string} projectState — 2-letter state code for electricity
 * @returns {Object} full project footprint results
 */
export function calcProjectSiteWise(components = [], reductions = {}, projectState = 'NY') {
  // Inject state into all electric items if not set
  const comps = components.map(c => ({
    ...c,
    electricItems: [
      ...(c.electricItems || []).map(e => ({ state: projectState, ...e })),
      ...electricPumpsToKwhItems(c.electricPumps || [], projectState),
    ],
  }));

  const componentResults = comps.map(calcComponent);
  const grossTotal = addRows(...componentResults.map(r => r.total));
  const reductionRow = calcReductions(reductions, grossTotal);
  const netTotal = addRows(grossTotal, reductionRow);

  // Significance thresholds (DER-31 Table 3-1)
  const thresholds = {
    co2e:  100,    // MT CO2e
    nox:   0.1,    // MT
    sox:   0.1,    // MT
    pm10:  0.1,    // MT
    mmbtu: 10000,  // MMBTU
  };
  const flags = {
    co2e:  netTotal.co2e         > thresholds.co2e,
    nox:   netTotal.nox          > thresholds.nox,
    sox:   netTotal.sox          > thresholds.sox,
    pm10:  netTotal.pm10         > thresholds.pm10,
    mmbtu: netTotal.energy_mmbtu > thresholds.mmbtu,
  };

  return {
    componentResults,
    grossTotal,
    reductionRow,
    netTotal,
    thresholds,
    flags,
    significant: Object.values(flags).some(Boolean),
  };
}

// ─── Formatting helpers ───────────────────────────────────────────────────────
export function fmtMT(val, decimals = 3) {
  if (val == null || isNaN(val)) return '—';
  return val.toFixed(decimals);
}
export function fmtMmbtu(val) {
  if (val == null || isNaN(val)) return '—';
  return val.toLocaleString(undefined, { maximumFractionDigits: 1 });
}
