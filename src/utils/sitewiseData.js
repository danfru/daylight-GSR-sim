/**
 * SiteWise™ v3.2 Emission Factors & Lookup Tables
 * All values extracted directly from the SiteWise_Input Sheet.xlsm Look Up Table
 * Source: Battelle / US Navy / USACE, October 2018
 *
 * Units as stored:
 *  - CO2:  kg CO2 / gal (fuel) or kg CO2 e / kg (material) or lb CO2 / MWh (electricity)
 *  - N2O:  g N2O / gal, GWP 310
 *  - CH4:  g CH4 / gal, GWP 21
 *  - NOx:  g / gal (fuel) or g / kg (material) or lb / MWh (electricity)
 *  - SOx:  same units as NOx
 *  - PM10: same units as NOx
 *  - BTU:  BTU / gal
 */

// ─── Global Warming Potentials ────────────────────────────────────────────────
export const GWP = { N2O: 310, CH4: 21 };

// ─── Unit Conversions ─────────────────────────────────────────────────────────
export const CONV = {
  LBS_TO_KG:        0.453592,
  KG_TO_LBS:        2.20462,
  LBS_TO_MT:        0.000453592,
  KG_TO_MT:         0.001,
  G_TO_MT:          1e-6,
  BTU_TO_MMBTU:     1e-6,
  BTU_TO_MJ:        0.001055056,
  MJ_TO_BTU:        947.817,
  MWH_TO_KWH:       1000,
  KWH_TO_MWH:       0.001,
  FT2_TO_M2:        0.092903,
  CY_TO_M3:         0.764555,
  CY_TO_FT3:        27,
  TONS_TO_KG:       907.185,          // short tons
  LB_PER_FT_TO_KG_PER_M: 1.48816,
};

// Table 1c — Impact per kg of material [kg CO2e/kg, g NOx/kg, g SOx/kg, g PM10/kg, MJ/kg]
export const MATERIAL_FACTORS = {
  'Acetic Acid':                   { co2e: 1.36,    nox: 4.08,   sox: 6.80,   pm10: 1.36,  mj: 36.029 },
  'Asphalt':                       { co2e: 0.14,    nox: 0.28,   sox: 0.56,   pm10: 0.112, mj: 2.41 },
  'Bentonite':                     { co2e: 0.22,    nox: 0.44,   sox: 0.88,   pm10: 0.176, mj: 3.0 },
  'Fertilizer':                    { co2e: 2.75,    nox: 5.50,   sox: 5.50,   pm10: 0.275, mj: 36.9 },
  'Virgin GAC':                    { co2e: 4.50,    nox: 0.009,  sox: 0.009,  pm10: 0.00045,mj: 25.12 },
  'General Concrete':              { co2e: 0.13,    nox: 0.26,   sox: 0.52,   pm10: 0.104, mj: 0.95 },
  'Glass':                         { co2e: 0.85,    nox: 3.10,   sox: 1.70,   pm10: 0.70,  mj: 15.0 },
  'Gravel':                        { co2e: 0.017,   nox: 0.068,  sox: 0.085,  pm10: 0.034, mj: 0.3 },
  'HDPE':                          { co2e: 2.00,    nox: 4.00,   sox: 5.333,  pm10: 0.667, mj: 84.4 },
  'HDPE Liner':                    { co2e: 2.999,   nox: 6.20,   sox: 11.00,  pm10: 1.60,  mj: 103.88 },
  'Ion Exchange Resin':            { co2e: 3.73,    nox: 7.46,   sox: 9.947,  pm10: 1.243, mj: 87.16 },
  'Hydrochloric Acid':             { co2e: 1.48,    nox: 2.96,   sox: 5.92,   pm10: 1.184, mj: 23.6 },
  'Hydrogen Peroxide':             { co2e: 1.345,   nox: 8.70,   sox: 6.60,   pm10: 2.50,  mj: 23.0 },
  'LDPE':                          { co2e: 1.70,    nox: 5.10,   sox: 8.50,   pm10: 1.70,  mj: 78.1 },
  'Lime':                          { co2e: 0.848,   nox: 1.695,  sox: 3.391,  pm10: 0.678, mj: 6.29 },
  'Mulch':                         { co2e: 0.260,   nox: 1.41,   sox: 2.38,   pm10: 0.18,  mj: 5.84 },
  'Phosphate Fertilizer':          { co2e: 0.176,   nox: 1.75,   sox: 16.10,  pm10: 0.208, mj: 5.98 },
  'PVC':                           { co2e: 3.109,   nox: 6.00,   sox: 9.70,   pm10: 1.40,  mj: 67.5 },
  'Regenerated GAC':               { co2e: 2.00,    nox: 4.00,   sox: 5.333,  pm10: 0.667, mj: 22.3 },
  'Sand':                          { co2e: 0.005,   nox: 0.020,  sox: 0.025,  pm10: 0.010, mj: 0.1 },
  'Soda Ash':                      { co2e: 2.01,    nox: 4.02,   sox: 5.360,  pm10: 0.670, mj: 17.96 },
  'Sodium Hydroxide (dry, bulk)':  { co2e: 1.37,    nox: 4.11,   sox: 6.85,   pm10: 1.37,  mj: 15.35 },
  'Sodium Hypochlorite':           { co2e: 1.48,    nox: 2.96,   sox: 5.92,   pm10: 1.184, mj: 23.6 },
  'Soil':                          { co2e: 0.023,   nox: 0.092,  sox: 0.115,  pm10: 0.046, mj: 0.45 },
  'Steel':                         { co2e: 1.77,    nox: 5.31,   sox: 8.85,   pm10: 1.77,  mj: 24.4 },
  'Stainless Steel':               { co2e: 6.15,    nox: 12.30,  sox: 16.40,  pm10: 2.05,  mj: 56.7 },
  'Typical Cement':                { co2e: 0.83,    nox: 1.66,   sox: 3.32,   pm10: 0.664, mj: 4.6 },
  'Urea':                          { co2e: 2.75,    nox: 5.50,   sox: 7.333,  pm10: 0.917, mj: 36.9 },
  'Vegetable Oil':                 { co2e: 0.865,   nox: 1.730,  sox: 3.461,  pm10: 0.692, mj: 17.30 },
  'ZVI':                           { co2e: 1.25,    nox: 2.50,   sox: 5.00,   pm10: 1.00,  mj: 9.05 },
  'Very High Impact Material':     { co2e: 10.00,   nox: 20.00,  sox: 20.00,  pm10: 1.00,  mj: 100.0 },
  'High Impact Material':          { co2e: 3.00,    nox: 6.00,   sox: 8.00,   pm10: 1.00,  mj: 60.0 },
  'Medium Impact Material':        { co2e: 1.00,    nox: 3.00,   sox: 5.00,   pm10: 1.00,  mj: 30.0 },
  'Low Impact Material':           { co2e: 0.50,    nox: 1.00,   sox: 2.00,   pm10: 0.40,  mj: 10.0 },
  'Very Low Impact Material':      { co2e: 0.01,    nox: 0.04,   sox: 0.05,   pm10: 0.02,  mj: 0.2 },
};

// Table 1b — PVC pipe weight by nominal size and schedule [lb/ft]
export const PVC_PIPE_WEIGHT = {
  '0.125': { 'Sch 40 PVC': 0.051, 'Sch 80 PVC': 0.063 },
  '0.25':  { 'Sch 40 PVC': 0.086, 'Sch 80 PVC': 0.105 },
  '0.375': { 'Sch 40 PVC': 0.115, 'Sch 80 PVC': 0.146 },
  '0.5':   { 'Sch 40 PVC': 0.170, 'Sch 80 PVC': 0.213, 'Sch 120 PVC': 0.236 },
  '0.75':  { 'Sch 40 PVC': 0.226, 'Sch 80 PVC': 0.289, 'Sch 120 PVC': 0.311 },
  '1':     { 'Sch 40 PVC': 0.333, 'Sch 80 PVC': 0.424, 'Sch 120 PVC': 0.464 },
  '1.25':  { 'Sch 40 PVC': 0.450, 'Sch 80 PVC': 0.586, 'Sch 120 PVC': 0.649 },
  '1.5':   { 'Sch 40 PVC': 0.537, 'Sch 80 PVC': 0.711, 'Sch 120 PVC': 0.787 },
  '2':     { 'Sch 40 PVC': 0.720, 'Sch 80 PVC': 0.984, 'Sch 120 PVC': 1.111 },
  '3':     { 'Sch 40 PVC': 1.488, 'Sch 80 PVC': 2.010, 'Sch 120 PVC': 2.306 },
  '4':     { 'Sch 40 PVC': 2.118, 'Sch 80 PVC': 2.938, 'Sch 120 PVC': 3.713 },
  '6':     { 'Sch 40 PVC': 3.733, 'Sch 80 PVC': 5.610, 'Sch 120 PVC': 7.132 },
};
export const STEEL_PIPE_WEIGHT = {
  '0.5': { 'Sch 40 Steel': 0.85 }, '1': { 'Sch 40 Steel': 1.68 },
  '2':   { 'Sch 40 Steel': 3.65 }, '3': { 'Sch 40 Steel': 7.58 },
  '4':   { 'Sch 40 Steel': 10.79 },'6': { 'Sch 40 Steel': 18.97 },
};

// Table 2a — Fuel emission factors [kg CO2/gal, g N2O/gal, g CH4/gal, BTU/gal]
export const FUEL_FACTORS = {
  Diesel:      { co2_kg_gal: 10.955, n2o_g_gal: 0.1234,  ch4_g_gal: 12.35,   btu_gal: 135846.74 },
  Gasoline:    { co2_kg_gal: 10.633, n2o_g_gal: 0.2265,  ch4_g_gal: 12.716,  btu_gal: 139015.38 },
  'Biodiesel 20': { co2_kg_gal: 9.311, n2o_g_gal: 0.3279, ch4_g_gal: 10.775, btu_gal: 170744.92 },
  'E-Diesel':  { co2_kg_gal: 10.683, n2o_g_gal: 0.4247,  ch4_g_gal: 12.186, btu_gal: 144738.32 },
};

// Table 2b — Passenger vehicle factors [g emissions/mile] (includes lifecycle)
export const VEHICLE_FACTORS = {
  Cars:          { mpg: 29,  co2_g_mi: 366.62, n2o_g_mi: 0.0165, ch4_g_mi: 0.4462, nox_g_mi: 0.141,  sox_g_mi: 0.044,  pm10_g_mi: 0.0046 },
  'Hybrid cars': { mpg: 37,  co2_g_mi: 287.36, n2o_g_mi: 0.0155, ch4_g_mi: 0.3451, nox_g_mi: 0.118,  sox_g_mi: 0.034,  pm10_g_mi: 0.0036 },
  SUVs:          { mpg: 24,  co2_g_mi: 443.01, n2o_g_mi: 0.0174, ch4_g_mi: 0.5361, nox_g_mi: 0.141,  sox_g_mi: 0.059,  pm10_g_mi: 0.0070 },
  'Hybrid SUVs': { mpg: 31,  co2_g_mi: 342.99, n2o_g_mi: 0.0162, ch4_g_mi: 0.4106, nox_g_mi: 0.118,  sox_g_mi: 0.046,  pm10_g_mi: 0.0055 },
  'Light truck': { mpg: 20,  co2_g_mi: 531.61, n2o_g_mi: 0.0185, ch4_g_mi: 0.6417, nox_g_mi: 0.229,  sox_g_mi: 0.059,  pm10_g_mi: 0.0072 },
  'Hybrid truck':{ mpg: 23,  co2_g_mi: 462.29, n2o_g_mi: 0.0177, ch4_g_mi: 0.5517, nox_g_mi: 0.192,  sox_g_mi: 0.050,  pm10_g_mi: 0.0063 },
  'Heavy Duty':  { mpg: 7.4, co2_g_mi: 1329.08,n2o_g_mi: 0.0283, ch4_g_mi: 1.5895, nox_g_mi: 0.442,  sox_g_mi: 0.180,  pm10_g_mi: 0.0180 },
};

// Table 2c — Air travel [per passenger-mile]
export const AIR_FACTORS = {
  co2_kg_pax_mi: 0.21, n2o_g_pax_mi: 0.0085, ch4_g_pax_mi: 0.0104,
  nox_g_pax_mi: 0.59,  sox_g_pax_mi: 0.058,   pm10_g_pax_mi: 0.0037,
  btu_pax_mi: 2843,
};

// Table 2e — Rail travel [per passenger-mile]
export const RAIL_FACTORS = {
  'Intercity rail': { co2_kg: 0.13, n2o_g: 0.001, ch4_g: 0.002, nox_g: 0.012, sox_g: 0.17,  pm10_g: 0.0018 },
  'Commuter rail':  { co2_kg: 0.16, n2o_g: 0.001, ch4_g: 0.002, nox_g: 1.400, sox_g: 0.011, pm10_g: 0.038 },
  'Transit rail':   { co2_kg: 0.20, n2o_g: 0.002, ch4_g: 0.004, nox_g: 0.035, sox_g: 0.48,  pm10_g: 0.0052 },
};

// Table 2d — Air cargo [per ton-mile]
export const AIR_CARGO_FACTORS = {
  co2_kg_tonmi: 1.358, n2o_g_tonmi: 0.0479, ch4_g_tonmi: 0.0417,
  nox_g_tonmi: 4.2642, sox_g_tonmi: 0.3094, pm10_g_tonmi: 0.0324,
  btu_tonmi: 9600,
};

// Table 2f — Rail cargo [per ton-mile]
export const RAIL_CARGO_FACTORS = {
  co2_kg_tonmi: 0.04, n2o_g_tonmi: 0.0006, ch4_g_tonmi: 0.002,
  nox_g_tonmi: 0.7252, sox_g_tonmi: 0.1068, pm10_g_tonmi: 0.0445,
  btu_tonmi: 305,
};

// Table 2g — Water cargo [per ton-mile]
export const WATER_CARGO_FACTORS = {
  co2_kg_tonmi: 0.048, n2o_g_tonmi: 0.002527, ch4_g_tonmi: 0.000489,
  nox_g_tonmi: 1.38589, sox_g_tonmi: 0.29511, pm10_g_tonmi: 0.036685,
  btu_tonmi: 278.168,
};

// Table 2i — Shared-load road equipment [per ton-mile]
export const SHARED_ROAD_FACTORS = {
  btu_tonmi: 3200,
  diesel_gal_tonmi: 0.023556,
};

// Table 2b — Heavy duty truck [g/mile]
export const HD_TRUCK_FACTORS = {
  Diesel:       { mpg: 8, co2_g_mi: 1369.33, n2o_g_mi: 0.01542, ch4_g_mi: 1.5438, nox_g_mi: 0.442, sox_g_mi: 0.125, pm10_g_mi: 0.00782 },
  Gasoline:     { mpg: 8, co2_g_mi: 1329.08, n2o_g_mi: 0.02831, ch4_g_mi: 1.5895, nox_g_mi: 0.442, sox_g_mi: 0.125, pm10_g_mi: 0.01800 },
  'Biodiesel 20': { mpg: 8, co2_g_mi: 1163.87, n2o_g_mi: 0.04099, ch4_g_mi: 1.3469, nox_g_mi: 0.442, sox_g_mi: 0.125, pm10_g_mi: 0.00635 },
};

// Table 3b — Earthwork equipment [gal/hr, CO2 g/hr, NOx g/hr, SOx g/hr, PM10 g/hr]
// Production rate CY/hr auto-selected by volume range; CO2 is lifecycle g/hr
export const EARTHWORK_EQUIPMENT = [
  { name: 'Dozer, 65 HP (D3) w/A Blade',         volLow: 0,      volHigh: 1001,   hp: 65.1,  gph: 5.1,  cyph: 100,  nox: 1370, sox: 195, pm10: 155 },
  { name: 'Dozer, 80 HP (D4) w/A Blade',         volLow: 1000,   volHigh: 2001,   hp: 80.1,  gph: 5.1,  cyph: 200,  nox: 1370, sox: 195, pm10: 155 },
  { name: 'Dozer, 105 HP (D5) w/A Blade',        volLow: 2000,   volHigh: 3501,   hp: 105,   gph: 7.9,  cyph: 300,  nox: 2109, sox: 300, pm10: 240 },
  { name: 'Dozer, 140 HP (D6) w/A Blade',        volLow: 3500,   volHigh: 5001,   hp: 140,   gph: 7.9,  cyph: 360,  nox: 2109, sox: 300, pm10: 240 },
  { name: 'Dozer, 200 HP (D7) w/U Blade',        volLow: 5000,   volHigh: 6501,   hp: 200.1, gph: 16.5, cyph: 700,  nox: 4371, sox: 624, pm10: 500 },
  { name: 'Dozer, 335 HP (D8) w/U Blade',        volLow: 6500,   volHigh: 8001,   hp: 335,   gph: 21.6, cyph: 960,  nox: 5720, sox: 817, pm10: 655 },
  { name: 'Dozer, 460 HP (D9) w/U Blade',        volLow: 8000,   volHigh: 10001,  hp: 460.1, gph: 21.6, cyph: 1200, nox: 5720, sox: 817, pm10: 655 },
  { name: 'Dozer, 700 HP (D10) w/U Blade',       volLow: 10000,  volHigh: 1e6,    hp: 700,   gph: 31.8, cyph: 1700, nox: 8427, sox: 1203,pm10: 963 },
  { name: 'Excavator, Hydraulic, 1.5 CY',        volLow: 0,      volHigh: 2001,   hp: 150,   gph: 7.9,  cyph: 249,  nox: 2109, sox: 300, pm10: 240 },
  { name: 'Excavator, Hydraulic, 1.25 CY',       volLow: 2000,   volHigh: 4001,   hp: 125,   gph: 7.9,  cyph: 169.8,nox: 2109, sox: 300, pm10: 240 },
  { name: 'Excavator, Hydraulic, 2 CY',          volLow: 4000,   volHigh: 6001,   hp: 270.3, gph: 10.8, cyph: 239,  nox: 2872, sox: 409, pm10: 328 },
  { name: 'Excavator, Hydraulic, 3.125 CY',      volLow: 6000,   volHigh: 8001,   hp: 380,   gph: 21.4, cyph: 301.2,nox: 5668, sox: 809, pm10: 648 },
  { name: 'Excavator, Hydraulic, 4 CY',          volLow: 8000,   volHigh: 10001,  hp: 400,   gph: 21.4, cyph: 298.8,nox: 5668, sox: 809, pm10: 648 },
  { name: 'Excavator, Hydraulic, 5.5 CY',        volLow: 10000,  volHigh: 1e6,    hp: 515,   gph: 21.4, cyph: 328.7,nox: 5668, sox: 809, pm10: 648 },
  { name: 'Loader, 65 HP, 1 CY',                 volLow: 0,      volHigh: 1501,   hp: 65.2,  gph: 1.3,  cyph: 110.7,nox: 1370, sox: 195, pm10: 155 },
  { name: 'Loader, 80 HP, 1.5 CY',               volLow: 1500,   volHigh: 3001,   hp: 80.2,  gph: 1.8,  cyph: 166,  nox: 1370, sox: 195, pm10: 155 },
  { name: 'Loader, 100 HP, 2 CY',                volLow: 3000,   volHigh: 4501,   hp: 100,   gph: 1.8,  cyph: 199.2,nox: 1370, sox: 195, pm10: 155 },
  { name: 'Loader, 155 HP, 3 CY',                volLow: 4500,   volHigh: 6001,   hp: 155,   gph: 2.1,  cyph: 298.8,nox: 2109, sox: 300, pm10: 240 },
  { name: 'Loader, 200 HP, 4 CY',                volLow: 6000,   volHigh: 7501,   hp: 200.2, gph: 2.9,  cyph: 398.4,nox: 4371, sox: 624, pm10: 500 },
  { name: 'Loader, 270 HP, 5.25 CY',             volLow: 7500,   volHigh: 9001,   hp: 270.2, gph: 2.9,  cyph: 475.4,nox: 4371, sox: 624, pm10: 500 },
  { name: 'Loader, 375 HP, 7 CY',                volLow: 9000,   volHigh: 10501,  hp: 375,   gph: 2.9,  cyph: 601,  nox: 4371, sox: 624, pm10: 500 },
  { name: 'Loader, 690 HP, 13.5 CY',             volLow: 10500,  volHigh: 1e6,    hp: 690,   gph: 2.9,  cyph: 960.4,nox: 4371, sox: 624, pm10: 500 },
  { name: 'Scraper, Standard, 15 CY',            volLow: 0,      volHigh: 5001,   hp: 330,   gph: 16,   cyph: 300,  nox: 4245, sox: 606, pm10: 485 },
  { name: 'Scraper, Standard, 22 CY',            volLow: 5000,   volHigh: 10001,  hp: 460.4, gph: 16,   cyph: 500,  nox: 4245, sox: 606, pm10: 485 },
  { name: 'Scraper, Standard, 34 CY',            volLow: 10000,  volHigh: 1e6,    hp: 500,   gph: 16,   cyph: 690,  nox: 4245, sox: 606, pm10: 485 },
  { name: 'Crawler Crane, 25 ton, 1 CY',         volLow: 0,      volHigh: 25001,  hp: 175,   gph: 3.260,cyph: 26.16,nox: 2109, sox: 300, pm10: 240 },
  { name: 'Crawler Crane, 50 ton, 2 CY',         volLow: 25000,  volHigh: 50001,  hp: 175,   gph: 3.260,cyph: 65.4, nox: 2109, sox: 300, pm10: 240 },
  { name: 'Crawler Crane, 100 ton, 4 CY',        volLow: 50000,  volHigh: 75001,  hp: 300,   gph: 5.338,cyph: 124.3,nox: 4371, sox: 624, pm10: 500 },
  { name: 'Crawler Crane, 150 ton, 6 CY',        volLow: 75000,  volHigh: 100001, hp: 300,   gph: 5.338,cyph: 189.7,nox: 4371, sox: 624, pm10: 500 },
  { name: 'Crawler Crane, 200 ton, 8 CY',        volLow: 100000, volHigh: 1e7,    hp: 600,   gph: 9.251,cyph: 248.5,nox: 8427, sox: 1203,pm10: 963 },
];

// Table 3c — Well drilling fuel consumption [gal/hr]
export const DRILLING_FACTORS = {
  'Direct Push':        { gph: 0.8,  gph_min: 0.6,  gph_max: 1.0 },
  'Pump Rig':           { gph: 1.6,  gph_min: 1.3,  gph_max: 1.9 },
  'Sonic Drilling':     { gph: 5.65, gph_min: 5.0,  gph_max: 6.3 },
  'Hollow Stem Auger':  { gph: 7.55, gph_min: 6.3,  gph_max: 8.8 },
  'Mud Rotary':         { gph: 14.05,gph_min: 12.5, gph_max: 15.6 },
  'Air Rotary':         { gph: 25.0, gph_min: 21.9, gph_max: 28.1 },
};

// Table 3d — Well drilling emission factors [kg CO2/gal, g NOx/gal, g SOx/gal, g PM10/gal]
export const DRILLING_EMISSION_FACTORS = {
  Diesel:   { co2_kg_gal: 10.955, nox_g_gal: 113.7, sox_g_gal: 14.2, pm10_g_gal: 10.6 },
  Gasoline: { co2_kg_gal: 10.633, nox_g_gal: 46.6,  sox_g_gal: 2.1,  pm10_g_gal: 1.4 },
};

// Table 4a — State electricity emission factors [lb/MWh]
// CO2, N2O, CH4, NOx, SOx — from site info lookup table rows 317-369
export const STATE_ELECTRICITY = {
  AK: { co2: 1302.085,  n2o: 0.009102, ch4: 2.76182,  nox: 4.19103,  sox: 1.50377,  pm10: 0.65137 },
  AL: { co2: 1154.314,  n2o: 0.017677, ch4: 2.04995,  nox: 1.05436,  sox: 4.32306,  pm10: 0.41388 },
  AR: { co2: 1230.585,  n2o: 0.019337, ch4: 2.10012,  nox: 1.59398,  sox: 2.80510,  pm10: 0.44658 },
  AZ: { co2: 1236.528,  n2o: 0.016463, ch4: 2.33537,  nox: 1.57798,  sox: 0.85087,  pm10: 0.45892 },
  CA: { co2: 679.369,   n2o: 0.006135, ch4: 2.26561,  nox: 0.54397,  sox: 0.30203,  pm10: 0.18897 },
  CO: { co2: 1955.268,  n2o: 0.028353, ch4: 3.04973,  nox: 3.10605,  sox: 2.25908,  pm10: 0.68534 },
  CT: { co2: 659.838,   n2o: 0.011995, ch4: 1.53392,  nox: 0.61370,  sox: 0.49669,  pm10: 0.23256 },
  DC: { co2: 2880.293,  n2o: 0.026141, ch4: 2.56257,  nox: 5.97879,  sox: 20.47311, pm10: 0.88042 },
  DE: { co2: 1983.923,  n2o: 0.026053, ch4: 3.02767,  nox: 2.58685,  sox: 7.84077,  pm10: 0.74047 },
  FL: { co2: 1352.524,  n2o: 0.016300, ch4: 2.96336,  nox: 1.49655,  sox: 2.53618,  pm10: 0.46612 },
  GA: { co2: 1415.552,  n2o: 0.022682, ch4: 2.28442,  nox: 1.30089,  sox: 4.70983,  pm10: 0.46213 },
  HI: { co2: 1854.013,  n2o: 0.024312, ch4: 2.41772,  nox: 4.51539,  sox: 5.95669,  pm10: 0.76032 },
  IA: { co2: 1764.866,  n2o: 0.029064, ch4: 2.29938,  nox: 1.97892,  sox: 4.11855,  pm10: 0.62990 },
  ID: { co2: 151.180,   n2o: 0.002637, ch4: 0.52662,  nox: 0.22103,  sox: 0.21789,  pm10: 0.05956 },
  IL: { co2: 1162.232,  n2o: 0.018944, ch4: 1.52150,  nox: 0.99010,  sox: 2.72086,  pm10: 0.36698 },
  IN: { co2: 2209.885,  n2o: 0.036644, ch4: 2.97910,  nox: 2.40528,  sox: 7.80018,  pm10: 0.76817 },
  KS: { co2: 1819.000,  n2o: 0.029082, ch4: 2.34406,  nox: 2.50411,  sox: 2.48866,  pm10: 0.63897 },
  KY: { co2: 2224.705,  n2o: 0.037638, ch4: 2.93230,  nox: 2.19005,  sox: 6.10298,  pm10: 0.74907 },
  LA: { co2: 1274.320,  n2o: 0.014294, ch4: 2.68592,  nox: 1.65107,  sox: 2.18907,  pm10: 0.44979 },
  MA: { co2: 1265.138,  n2o: 0.019257, ch4: 2.89078,  nox: 1.24494,  sox: 2.37597,  pm10: 0.44985 },
  MD: { co2: 1344.973,  n2o: 0.023650, ch4: 1.88800,  nox: 1.18685,  sox: 10.01153, pm10: 0.44283 },
  ME: { co2: 624.295,   n2o: 0.024254, ch4: 1.98465,  nox: 1.06680,  sox: 0.80809,  pm10: 0.33131 },
  MI: { co2: 1665.650,  n2o: 0.028429, ch4: 2.37163,  nox: 2.10723,  sox: 6.10141,  pm10: 0.59741 },
  MN: { co2: 1523.636,  n2o: 0.028776, ch4: 1.98554,  nox: 2.04276,  sox: 2.36732,  pm10: 0.58127 },
  MO: { co2: 1964.207,  n2o: 0.032096, ch4: 2.63381,  nox: 1.65874,  sox: 6.23472,  pm10: 0.68695 },
  MS: { co2: 1243.082,  n2o: 0.015064, ch4: 2.65370,  nox: 1.55838,  sox: 2.02598,  pm10: 0.44429 },
  MT: { co2: 1561.560,  n2o: 0.026124, ch4: 1.84914,  nox: 1.95015,  sox: 2.87072,  pm10: 0.56393 },
  NC: { co2: 1263.985,  n2o: 0.021518, ch4: 1.84987,  nox: 1.00144,  sox: 2.20516,  pm10: 0.41965 },
  ND: { co2: 2228.042,  n2o: 0.035815, ch4: 2.66019,  nox: 4.20803,  sox: 8.31153,  pm10: 0.77491 },
  NE: { co2: 1732.199,  n2o: 0.028681, ch4: 2.10944,  nox: 3.11760,  sox: 4.79347,  pm10: 0.63135 },
  NH: { co2: 687.751,   n2o: 0.016234, ch4: 1.55600,  nox: 0.76184,  sox: 3.78345,  pm10: 0.26543 },
  NJ: { co2: 631.219,   n2o: 0.006943, ch4: 1.56528,  nox: 0.56827,  sox: 0.60515,  pm10: 0.19803 },
  NM: { co2: 2046.318,  n2o: 0.030755, ch4: 3.16279,  nox: 4.02842,  sox: 1.25191,  pm10: 0.72100 },
  NV: { co2: 1244.346,  n2o: 0.010900, ch4: 3.31328,  nox: 1.30108,  sox: 0.67121,  pm10: 0.39946 },
  NY: { co2: 667.431,   n2o: 0.007358, ch4: 1.56448,  nox: 0.67793,  sox: 0.90837,  pm10: 0.21404 },
  OH: { co2: 1939.257,  n2o: 0.032171, ch4: 2.71511,  nox: 1.88655,  sox: 9.84067,  pm10: 0.67428 },
  OK: { co2: 1661.541,  n2o: 0.020617, ch4: 3.15186,  nox: 2.58663,  sox: 3.01337,  pm10: 0.59208 },
  OR: { co2: 433.765,   n2o: 0.004696, ch4: 1.30262,  nox: 0.51384,  sox: 0.52818,  pm10: 0.13688 },
  PA: { co2: 1253.550,  n2o: 0.020521, ch4: 2.00868,  nox: 1.42273,  sox: 6.26660,  pm10: 0.44340 },
  RI: { co2: 1063.425,  n2o: 0.003784, ch4: 3.73858,  nox: 0.66694,  sox: 0.24218,  pm10: 0.33720 },
  SC: { co2: 909.842,   n2o: 0.014844, ch4: 1.45650,  nox: 0.73291,  sox: 2.33410,  pm10: 0.30929 },
  SD: { co2: 991.709,   n2o: 0.016302, ch4: 1.25355,  nox: 3.40951,  sox: 3.23650,  pm10: 0.35960 },
  TN: { co2: 1167.906,  n2o: 0.019994, ch4: 1.63363,  nox: 0.98247,  sox: 3.02335,  pm10: 0.38942 },
  TX: { co2: 1426.514,  n2o: 0.016506, ch4: 2.98592,  nox: 1.26139,  sox: 2.67700,  pm10: 0.47965 },
  UT: { co2: 2078.828,  n2o: 0.033245, ch4: 3.15066,  nox: 3.55558,  sox: 1.44022,  pm10: 0.73162 },
  VA: { co2: 1104.320,  n2o: 0.018960, ch4: 1.86043,  nox: 1.24623,  sox: 3.09791,  pm10: 0.38929 },
  VT: { co2: 15.236,    n2o: 0.007830, ch4: 0.08337,  nox: 0.18882,  sox: 0.01488,  pm10: 0.01788 },
  WA: { co2: 332.158,   n2o: 0.005004, ch4: 0.69132,  nox: 0.37398,  sox: 0.14411,  pm10: 0.09811 },
  WI: { co2: 1655.666,  n2o: 0.027253, ch4: 2.29963,  nox: 1.57305,  sox: 4.11582,  pm10: 0.59020 },
  WV: { co2: 2182.600,  n2o: 0.036625, ch4: 2.95554,  nox: 1.44211,  sox: 5.52465,  pm10: 0.74037 },
  WY: { co2: 2352.836,  n2o: 0.038956, ch4: 2.90868,  nox: 3.59700,  sox: 3.85171,  pm10: 0.82097 },
  'US Average': { co2: 1353.287, n2o: 0.020216, ch4: 2.31018, nox: 1.49073, sox: 3.42817, pm10: 0.48382 },
};

// Table 4b — Diesel/Gasoline pump emission factors [gal/hr, g/hr emissions] by HP range
export const PUMP_FACTORS_DIESEL = [
  { hpRange: '1 to 3',      gph: 0.07458, co2_g_hr: 896.7,    nox_g_hr: 9,    sox_g_hr: 2 },
  { hpRange: '3 to 6',      gph: 0.12995, co2_g_hr: 1562.5,   nox_g_hr: 16,   sox_g_hr: 3 },
  { hpRange: '6 to 11',     gph: 0.21054, co2_g_hr: 2531.5,   nox_g_hr: 26,   sox_g_hr: 4 },
  { hpRange: '11 to 16',    gph: 0.34158, co2_g_hr: 4107.0,   nox_g_hr: 37,   sox_g_hr: 7 },
  { hpRange: '16 to 25',    gph: 0.54030, co2_g_hr: 6496.3,   nox_g_hr: 58,   sox_g_hr: 11 },
  { hpRange: '25 to 40',    gph: 0.85438, co2_g_hr: 10272.8,  nox_g_hr: 82,   sox_g_hr: 18 },
  { hpRange: '40 to 50',    gph: 1.11488, co2_g_hr: 13404.8,  nox_g_hr: 107,  sox_g_hr: 23 },
  { hpRange: '50 to 75',    gph: 1.55389, co2_g_hr: 18683.4,  nox_g_hr: 165,  sox_g_hr: 32 },
  { hpRange: '75 to 100',   gph: 2.14995, co2_g_hr: 25850.2,  nox_g_hr: 226,  sox_g_hr: 44 },
  { hpRange: '100 to 175',  gph: 2.96857, co2_g_hr: 35693.0,  nox_g_hr: 358,  sox_g_hr: 61 },
  { hpRange: '175 to 300',  gph: 5.45389, co2_g_hr: 65575.5,  nox_g_hr: 634,  sox_g_hr: 112 },
  { hpRange: '300 to 600',  gph: 8.91980, co2_g_hr: 107248.3, nox_g_hr: 1035, sox_g_hr: 183 },
];

// Table 5a — Diesel generator emission factors [gal/hr, g/hr] by HP range
export const GENERATOR_FACTORS_DIESEL = [
  { hpRange: '3 to 6',     gph: 0.13302, co2_g_hr: 1644.9,   nox_g_hr: 17.8,  sox_g_hr: 2.3 },
  { hpRange: '6 to 11',    gph: 0.20930, co2_g_hr: 2588.3,   nox_g_hr: 28.0,  sox_g_hr: 3.6 },
  { hpRange: '11 to 16',   gph: 0.33717, co2_g_hr: 4169.5,   nox_g_hr: 39.9,  sox_g_hr: 5.9 },
  { hpRange: '16 to 25',   gph: 0.52938, co2_g_hr: 6546.4,   nox_g_hr: 62.6,  sox_g_hr: 9.2 },
  { hpRange: '25 to 40',   gph: 0.83201, co2_g_hr: 10288.8,  nox_g_hr: 87.5,  sox_g_hr: 14.5 },
  { hpRange: '40 to 50',   gph: 1.12436, co2_g_hr: 13904.1,  nox_g_hr: 118.3, sox_g_hr: 19.6 },
  { hpRange: '50 to 75',   gph: 1.49359, co2_g_hr: 18470.1,  nox_g_hr: 167.9, sox_g_hr: 26.0 },
  { hpRange: '75 to 100',  gph: 2.15270, co2_g_hr: 26620.8,  nox_g_hr: 242.0, sox_g_hr: 37.5 },
  { hpRange: '100 to 175', gph: 3.04256, co2_g_hr: 37625.0,  nox_g_hr: 384.6, sox_g_hr: 53.0 },
  { hpRange: '175 to 300', gph: 5.33737, co2_g_hr: 66003.1,  nox_g_hr: 652.6, sox_g_hr: 93.0 },
  { hpRange: '300 to 600', gph: 9.40674, co2_g_hr: 116325.8, nox_g_hr: 1148.2,sox_g_hr: 163.9 },
];

// Footprint Reduction Technologies
export const FOOTPRINT_REDUCTION = {
  SOLAR_INSTALL_COST_PER_W: 5.87,  // $/W
  WIND_INSTALL_COST_PER_KW: 1912,  // $/kW
  WIND_CAPACITY_FACTOR_BY_REGION: {
    Northeast: 0.25, Southeast: 0.27, Midwest: 0.35, Southwest: 0.30, Northwest: 0.35,
  },
  SOLAR_HOURS_PER_YEAR: 1642.5,    // peak sun hours/yr US average
  METHANE_BTU_PER_SCF: 975.88,
  DOC_REDUCTION_FACTOR: 0.85,       // 85% PM10 reduction with diesel oxidation catalyst
  VFD_ENERGY_SAVINGS: 0.20,         // 20% energy savings with VFD
};

// Well Pipe Schedule Options
export const PIPE_SCHEDULES = ['Sch 40 PVC', 'Sch 80 PVC', 'Sch 120 PVC', 'Sch 40 Steel', 'Sch 80 Steel'];
export const PIPE_DIAMETERS = ['0.125','0.25','0.375','0.5','0.75','1','1.25','1.5','2','2.5','3','4','6','8','10','12'];
export const TREATMENT_CHEMICALS = ['Hydrogen Peroxide','Soda Ash','Sodium Hydroxide (dry, bulk)','Sodium Hypochlorite',
  'Hydrochloric Acid','Acetic Acid','Lime','Urea','Fertilizer','Phosphate Fertilizer','ZVI','Vegetable Oil','Other'];
export const TREATMENT_MEDIA = ['Virgin GAC','Regenerated GAC','Ion Exchange Resin','Sand','Gravel','HDPE','PVC'];
export const CONSTRUCTION_MATERIALS = ['HDPE Liner','General Concrete','Asphalt','Gravel','Sand','Typical Cement',
  'Bentonite','Steel','Glass','Mulch'];
export const BULK_MATERIALS = Object.keys(MATERIAL_FACTORS);
export const FUEL_TYPES = ['Diesel','Gasoline','Biodiesel 20','E-Diesel'];
export const RAIL_TYPES = Object.keys(RAIL_FACTORS);
export const EARTHWORK_TYPES = ['Dozer','Excavator','Loader','Scraper','Crawler Crane'];
// Unit conversions for bulk material inputs
export const UNIT_TO_KG = {
  'lbs':         0.453592,
  'kg':          1.0,
  'short tons':  907.185,
  'metric tons': 1000.0,
};

export const STATES = Object.keys(STATE_ELECTRICITY);
