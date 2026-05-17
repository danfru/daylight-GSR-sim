/**
 * Global GSR App State — Zustand store
 * Persists project data across all 7 modules
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const DEFAULT_PROJECT = {
  // Module 1 — Project Intake
  projectName: '',
  siteName: '',
  siteAddress: '',
  siteId: '',           // NYSDEC Site ID / BCP Index No.
  programType: '',      // 'bcp_volunteer', 'bcp_participant', 'state_superfund', 'vcp'
  phase: '',            // 'rawp', 'ri', 'fs', 'rd', 'rem_action', 'fer', 'other'
  cleanupTrack: '',     // 'track1', 'track2', 'track3', 'track4'
  region: '',           // NY region code
  county: '',
  consultantFirm: '',
  preparedBy: '',
  projectDate: '',
  contaminants: [],     // array of contaminant types
  remedyTechnologies: [], // array of tech IDs
  acceptanceDate: '',
  notes: '',
};

const DEFAULT_FOOTPRINT = {
  // Module 3 — Footprint Calculator inputs
  excavationCY: 0,
  transportMiles: 20,
  treatmentTech: 'none',
  treatmentDays: 0,
  treatmentFlowGPM: 0,
  monitoringRounds: 4,
  monitoringWellCount: 6,
  equipmentHoursOverride: null,
  // Calculated results (stored after calc)
  results: null,
};

const DEFAULT_CLIMATE = {
  // Module 4 — Climate Screener answers
  flooding: false,
  seaLevel: false,
  extremeHeat: false,
  erosion: false,
  wildfire: false,
  drought: false,
  // Result
  result: null,
};

const DEFAULT_FER = {
  // Module 6 — FER Tracker
  planned: {
    co2e: null,
    nox: null,
    sox: null,
    pm10: null,
    mmbtu: null,
  },
  actuals: [], // array of { date, phase, co2e, nox, sox, pm10, mmbtu, notes }
};

export const useGSR = create(
  persist(
    (set, get) => ({
      // ─── State ──────────────────────────────────────────────────────────────
      project: { ...DEFAULT_PROJECT },
      footprint: { ...DEFAULT_FOOTPRINT },
      climate: { ...DEFAULT_CLIMATE },
      selectedBMPs: [],         // array of BMP IDs
      fer: { ...DEFAULT_FER },
      activeModule: 'dashboard', // current nav module
      reportReady: false,

      // ─── Project Actions ────────────────────────────────────────────────────
      setProject: (fields) =>
        set((s) => ({ project: { ...s.project, ...fields } })),

      resetProject: () =>
        set({
          project: { ...DEFAULT_PROJECT },
          footprint: { ...DEFAULT_FOOTPRINT },
          climate: { ...DEFAULT_CLIMATE },
          selectedBMPs: [],
          fer: { ...DEFAULT_FER },
          reportReady: false,
        }),

      // ─── Footprint Actions ──────────────────────────────────────────────────
      setFootprintInput: (fields) =>
        set((s) => ({ footprint: { ...s.footprint, ...fields } })),

      setFootprintResults: (results) =>
        set((s) => ({ footprint: { ...s.footprint, results } })),

      // ─── BMP Actions ────────────────────────────────────────────────────────
      toggleBMP: (id) =>
        set((s) => ({
          selectedBMPs: s.selectedBMPs.includes(id)
            ? s.selectedBMPs.filter((b) => b !== id)
            : [...s.selectedBMPs, id],
        })),

      setBMPs: (ids) => set({ selectedBMPs: ids }),

      clearBMPs: () => set({ selectedBMPs: [] }),

      // ─── Climate Actions ────────────────────────────────────────────────────
      setClimateAnswer: (key, value) =>
        set((s) => ({ climate: { ...s.climate, [key]: value } })),

      setClimateResult: (result) =>
        set((s) => ({ climate: { ...s.climate, result } })),

      resetClimate: () => set({ climate: { ...DEFAULT_CLIMATE } }),

      // ─── FER Actions ────────────────────────────────────────────────────────
      setFERPlanned: (fields) =>
        set((s) => ({ fer: { ...s.fer, planned: { ...s.fer.planned, ...fields } } })),

      addFERActual: (entry) =>
        set((s) => ({
          fer: {
            ...s.fer,
            actuals: [...s.fer.actuals, { id: Date.now(), ...entry }],
          },
        })),

      updateFERActual: (id, fields) =>
        set((s) => ({
          fer: {
            ...s.fer,
            actuals: s.fer.actuals.map((a) => (a.id === id ? { ...a, ...fields } : a)),
          },
        })),

      deleteFERActual: (id) =>
        set((s) => ({
          fer: {
            ...s.fer,
            actuals: s.fer.actuals.filter((a) => a.id !== id),
          },
        })),

      // ─── Navigation ─────────────────────────────────────────────────────────
      setActiveModule: (mod) => set({ activeModule: mod }),

      // ─── Derived getters ────────────────────────────────────────────────────
      isProjectComplete: () => {
        const { project } = get();
        return !!(project.projectName && project.programType && project.phase && project.region);
      },

      hasFootprintData: () => {
        const { footprint } = get();
        return !!(footprint.results);
      },

      hasClimateData: () => {
        const { climate } = get();
        return !!(climate.result);
      },

      completionStatus: () => {
        const s = get();
        // Check SiteWise results via its own store (read from localStorage directly to avoid circular deps)
        let siteWiseDone = false;
        try {
          const sw = JSON.parse(localStorage.getItem('daylight-sitewise-store') || '{}');
          siteWiseDone = !!(sw?.state?.results);
        } catch {}
        return {
          intake:    !!(s.project.projectName && s.project.programType && s.project.phase),
          bmps:      s.selectedBMPs.length > 0,
          sitewise:  siteWiseDone,
          climate:   !!(s.climate.result),
          rawp:      !!(siteWiseDone && s.selectedBMPs.length > 0),
          fer:       !!(s.fer.planned.co2e),
          library:   true, // always accessible
        };
      },
    }),
    {
      name: 'daylight-gsr-store',
      version: 1,
    }
  )
);
