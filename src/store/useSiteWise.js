/**
 * SiteWise™ v3.2 — Zustand store
 * Mirrors the 4-component structure of the SiteWise Excel workbooks.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const makeBlankComponent = (label = 'Component 1') => ({
  label,
  enabled: true,

  // 1. Material Production — [{ id, material, qty_kg }]
  materialItems: [],

  // 1b. Well Materials — [{ id, numWells, depthFt, diameterIn, casing, sandKg, gravelKg, bentoniteKg, cementKg }]
  wellMaterials: [],

  // 1c. Treatment Chemicals — [{ id, material, injectionPts, lbsPerPt, injectionsPerPt }]
  treatmentChems: [],

  // 1d. Treatment Media — [{ id, mediaType, lbs }]
  treatmentMedia: [],

  // 1e. Construction Materials — [{ id, material, lbs }]
  constructionMats: [],

  // 1f. Bulk Material Quantities — [{ id, material, qty, unit }]
  bulkMaterials: [],

  // 2a. Personnel Transport Road — [{ id, vehicleType, miles, passengers, trips }]
  personnelTrips: [],

  // 2b. Personnel Transport Air — [{ id, miles, travelers, flights }]
  airTrips: [],

  // 2c. Personnel Transport Rail — [{ id, railType, miles, trips, travelers }]
  railTrips: [],

  // 3. Equipment / Cargo Shipments — [{ id, mode, fuelType, miles, tons }]
  equipmentShipments: [],

  // 4a. Earthwork
  earthwork: {
    volumeCY: 0,
    fuelType: 'Diesel',
    hoursOverride: null,
  },

  // 4b. Drilling — [{ id, method, hours, fuelType }]
  wells: [],

  // 4c. Pumps (diesel) — [{ id, hp, hours }]
  pumps: [],

  // 4d. Generators (diesel) — [{ id, hp, hours }]
  generators: [],

  // 4e. Electric Pumps / Treatment Systems — [{ id, method:'flow'|'hp', gpm, headFt, numPumps, hours, sg, hpEach }]
  electricPumps: [],

  // 4f. Electricity — [{ id, kwh, state }]
  electricItems: [],

  // 4g. Other Equipment — [{ id, name, hp, hours, fuelType }]
  otherEquipment: [],

  // 5. Residual Handling — [{ id, type, tons, miles, fuelType }]
  residuals: [],
});

export const useSiteWise = create(
  persist(
    (set, get) => ({
      // ─── State ──────────────────────────────────────────────────────────────
      projectState: 'NY',
      components: [
        makeBlankComponent('Component 1 — Remedial Investigation'),
        makeBlankComponent('Component 2 — Remedial Design'),
        makeBlankComponent('Component 3 — Remedial Action'),
        makeBlankComponent('Component 4 — Operation & Maintenance'),
      ],
      reductions: {
        solarKw: 0,
        windKw: 0,
        methaneCaptureScfD: 0,
        docReductionPct: 0,
        vfdInstalled: false,
      },
      results: null,
      lastCalcAt: null,

      // ─── Project-level ───────────────────────────────────────────────────────
      setProjectState: (state) => set({ projectState: state }),
      setResults: (results) => set({ results, lastCalcAt: Date.now() }),
      clearResults: () => set({ results: null, lastCalcAt: null }),

      // ─── Component labels ────────────────────────────────────────────────────
      setComponentLabel: (idx, label) =>
        set((s) => {
          const components = [...s.components];
          components[idx] = { ...components[idx], label };
          return { components };
        }),

      toggleComponent: (idx) =>
        set((s) => {
          const components = [...s.components];
          components[idx] = { ...components[idx], enabled: !components[idx].enabled };
          return { components };
        }),

      // ─── Generic list mutators ───────────────────────────────────────────────
      _updateComponent: (idx, fields) =>
        set((s) => {
          const components = [...s.components];
          components[idx] = { ...components[idx], ...fields };
          return { components };
        }),

      _addListItem: (idx, listKey, item) =>
        set((s) => {
          const components = [...s.components];
          const comp = components[idx];
          components[idx] = {
            ...comp,
            [listKey]: [...(comp[listKey] || []), { id: Date.now() + Math.random(), ...item }],
          };
          return { components };
        }),

      _updateListItem: (idx, listKey, itemId, fields) =>
        set((s) => {
          const components = [...s.components];
          const comp = components[idx];
          components[idx] = {
            ...comp,
            [listKey]: comp[listKey].map((i) => i.id === itemId ? { ...i, ...fields } : i),
          };
          return { components };
        }),

      _removeListItem: (idx, listKey, itemId) =>
        set((s) => {
          const components = [...s.components];
          const comp = components[idx];
          components[idx] = {
            ...comp,
            [listKey]: comp[listKey].filter((i) => i.id !== itemId),
          };
          return { components };
        }),

      // ─── Material Items ──────────────────────────────────────────────────────
      addMaterial: (idx, item)       => get()._addListItem(idx, 'materialItems', item),
      updateMaterial: (idx, id, f)   => get()._updateListItem(idx, 'materialItems', id, f),
      removeMaterial: (idx, id)      => get()._removeListItem(idx, 'materialItems', id),

      // ─── Well Materials ──────────────────────────────────────────────────────
      addWellMaterial: (idx, item)       => get()._addListItem(idx, 'wellMaterials', item),
      updateWellMaterial: (idx, id, f)   => get()._updateListItem(idx, 'wellMaterials', id, f),
      removeWellMaterial: (idx, id)      => get()._removeListItem(idx, 'wellMaterials', id),

      // ─── Treatment Chemicals ─────────────────────────────────────────────────
      addTreatmentChem: (idx, item)      => get()._addListItem(idx, 'treatmentChems', item),
      updateTreatmentChem: (idx, id, f)  => get()._updateListItem(idx, 'treatmentChems', id, f),
      removeTreatmentChem: (idx, id)     => get()._removeListItem(idx, 'treatmentChems', id),

      // ─── Treatment Media ─────────────────────────────────────────────────────
      addTreatmentMedia: (idx, item)     => get()._addListItem(idx, 'treatmentMedia', item),
      updateTreatmentMedia: (idx, id, f) => get()._updateListItem(idx, 'treatmentMedia', id, f),
      removeTreatmentMedia: (idx, id)    => get()._removeListItem(idx, 'treatmentMedia', id),

      // ─── Construction Materials ──────────────────────────────────────────────
      addConstructionMat: (idx, item)    => get()._addListItem(idx, 'constructionMats', item),
      updateConstructionMat: (idx, id, f)=> get()._updateListItem(idx, 'constructionMats', id, f),
      removeConstructionMat: (idx, id)   => get()._removeListItem(idx, 'constructionMats', id),

      // ─── Bulk Materials ──────────────────────────────────────────────────────
      addBulkMaterial: (idx, item)       => get()._addListItem(idx, 'bulkMaterials', item),
      updateBulkMaterial: (idx, id, f)   => get()._updateListItem(idx, 'bulkMaterials', id, f),
      removeBulkMaterial: (idx, id)      => get()._removeListItem(idx, 'bulkMaterials', id),

      // ─── Personnel Trips ─────────────────────────────────────────────────────
      addPersonnelTrip: (idx, item)         => get()._addListItem(idx, 'personnelTrips', item),
      updatePersonnelTrip: (idx, id, f)     => get()._updateListItem(idx, 'personnelTrips', id, f),
      removePersonnelTrip: (idx, id)        => get()._removeListItem(idx, 'personnelTrips', id),

      // ─── Air Trips ───────────────────────────────────────────────────────────
      addAirTrip: (idx, item)               => get()._addListItem(idx, 'airTrips', item),
      updateAirTrip: (idx, id, f)           => get()._updateListItem(idx, 'airTrips', id, f),
      removeAirTrip: (idx, id)              => get()._removeListItem(idx, 'airTrips', id),

      // ─── Rail Trips ──────────────────────────────────────────────────────────
      addRailTrip: (idx, item)              => get()._addListItem(idx, 'railTrips', item),
      updateRailTrip: (idx, id, f)          => get()._updateListItem(idx, 'railTrips', id, f),
      removeRailTrip: (idx, id)             => get()._removeListItem(idx, 'railTrips', id),

      // ─── Equipment Shipments ─────────────────────────────────────────────────
      addShipment: (idx, item)       => get()._addListItem(idx, 'equipmentShipments', item),
      updateShipment: (idx, id, f)   => get()._updateListItem(idx, 'equipmentShipments', id, f),
      removeShipment: (idx, id)      => get()._removeListItem(idx, 'equipmentShipments', id),

      // ─── Earthwork ───────────────────────────────────────────────────────────
      setEarthwork: (idx, fields) =>
        set((s) => {
          const components = [...s.components];
          components[idx] = {
            ...components[idx],
            earthwork: { ...components[idx].earthwork, ...fields },
          };
          return { components };
        }),

      // ─── Drilling Wells ──────────────────────────────────────────────────────
      addWell: (idx, item)           => get()._addListItem(idx, 'wells', item),
      updateWell: (idx, id, f)       => get()._updateListItem(idx, 'wells', id, f),
      removeWell: (idx, id)          => get()._removeListItem(idx, 'wells', id),

      // ─── Pumps ───────────────────────────────────────────────────────────────
      addPump: (idx, item)           => get()._addListItem(idx, 'pumps', item),
      updatePump: (idx, id, f)       => get()._updateListItem(idx, 'pumps', id, f),
      removePump: (idx, id)          => get()._removeListItem(idx, 'pumps', id),

      // ─── Generators ──────────────────────────────────────────────────────────
      addGenerator: (idx, item)      => get()._addListItem(idx, 'generators', item),
      updateGenerator: (idx, id, f)  => get()._updateListItem(idx, 'generators', id, f),
      removeGenerator: (idx, id)     => get()._removeListItem(idx, 'generators', id),

      // ─── Electric Pumps ──────────────────────────────────────────────────────
      addElectricPump: (idx, item)       => get()._addListItem(idx, 'electricPumps', item),
      updateElectricPump: (idx, id, f)   => get()._updateListItem(idx, 'electricPumps', id, f),
      removeElectricPump: (idx, id)      => get()._removeListItem(idx, 'electricPumps', id),

      // ─── Electricity ─────────────────────────────────────────────────────────
      addElectric: (idx, item)       => get()._addListItem(idx, 'electricItems', item),
      updateElectric: (idx, id, f)   => get()._updateListItem(idx, 'electricItems', id, f),
      removeElectric: (idx, id)      => get()._removeListItem(idx, 'electricItems', id),

      // ─── Other Equipment ─────────────────────────────────────────────────────
      addOtherEquip: (idx, item)     => get()._addListItem(idx, 'otherEquipment', item),
      updateOtherEquip: (idx, id, f) => get()._updateListItem(idx, 'otherEquipment', id, f),
      removeOtherEquip: (idx, id)    => get()._removeListItem(idx, 'otherEquipment', id),

      // ─── Residuals ───────────────────────────────────────────────────────────
      addResidual: (idx, item)       => get()._addListItem(idx, 'residuals', item),
      updateResidual: (idx, id, f)   => get()._updateListItem(idx, 'residuals', id, f),
      removeResidual: (idx, id)      => get()._removeListItem(idx, 'residuals', id),

      // ─── Footprint Reductions ────────────────────────────────────────────────
      setReduction: (fields) =>
        set((s) => ({ reductions: { ...s.reductions, ...fields } })),

      // ─── Reset ───────────────────────────────────────────────────────────────
      resetSiteWise: () =>
        set({
          projectState: 'NY',
          components: [
            makeBlankComponent('Component 1 — Remedial Investigation'),
            makeBlankComponent('Component 2 — Remedial Design'),
            makeBlankComponent('Component 3 — Remedial Action'),
            makeBlankComponent('Component 4 — Operation & Maintenance'),
          ],
          reductions: {
            solarKw: 0, windKw: 0, methaneCaptureScfD: 0,
            docReductionPct: 0, vfdInstalled: false,
          },
          results: null,
          lastCalcAt: null,
        }),
    }),
    {
      name: 'daylight-sitewise-store',
      version: 2,
      migrate: (persistedState, version) => {
        // v1→v2: add new empty arrays to each component
        if (version < 2) {
          return {
            ...persistedState,
            components: (persistedState.components || []).map(c => ({
              wellMaterials: [], treatmentChems: [], treatmentMedia: [],
              constructionMats: [], bulkMaterials: [],
              airTrips: [], railTrips: [], electricPumps: [],
              ...c,
            })),
          };
        }
        return persistedState;
      },
    }
  )
);
