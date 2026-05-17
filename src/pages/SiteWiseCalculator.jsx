/**
 * SiteWise™ v3.2 Calculator — full guided UI
 * Mirrors the 4-component structure of the EPA/Battelle SiteWise Excel workbooks.
 * DER-31 §3 requires project footprint analysis using SiteWise or equivalent method.
 */

import { useState, useMemo } from 'react';
import {
  Calculator, ChevronDown, ChevronRight, Plus, Trash2,
  Info, BarChart3, Download, RefreshCw, CheckCircle,
  AlertTriangle, Leaf, Zap, Truck, ArrowUpDown,
} from 'lucide-react';
import { useSiteWise } from '../store/useSiteWise.js';
import { useGSR } from '../store/useGSR.js';
import {
  calcProjectSiteWise, autoSelectEquipment, fmtMT, fmtMmbtu,
} from '../utils/sitewiseCalc.js';
import {
  MATERIAL_FACTORS, VEHICLE_FACTORS, DRILLING_FACTORS,
  STATES, FUEL_TYPES,
  PIPE_SCHEDULES, PIPE_DIAMETERS, PVC_PIPE_WEIGHT, STEEL_PIPE_WEIGHT, CONV,
  TREATMENT_CHEMICALS, TREATMENT_MEDIA, CONSTRUCTION_MATERIALS, BULK_MATERIALS,
  RAIL_TYPES, UNIT_TO_KG,
} from '../utils/sitewiseData.js';
import { exportSiteWisePDF } from '../utils/sitewiseExport.js';
import { ModuleGuide } from '../components/ui.jsx';

// ─── Color palette per component ─────────────────────────────────────────────
const COMP_COLORS = ['#5B7B9A', '#7A9B76', '#F5C518', '#D4654A'];
const COMP_LABELS_DEFAULT = [
  'Remedial Investigation',
  'Remedial Design',
  'Remedial Action',
  'O&M / Long-term Monitoring',
];

// ─── Small helpers ────────────────────────────────────────────────────────────
const Row = ({ label, children, hint }) => (
  <div style={{ marginBottom: 14 }}>
    <label style={{ display: 'block', fontSize: 11, fontFamily: 'var(--font-mono)',
      color: 'var(--smoke)', letterSpacing: '0.06em', marginBottom: 4 }}>
      {label}
      {hint && <span style={{ marginLeft: 6, color: 'rgba(107,107,107,0.6)', fontStyle: 'italic' }}>{hint}</span>}
    </label>
    {children}
  </div>
);

const NumInput = ({ value, onChange, placeholder = '0', min = 0, step = 'any', style = {} }) => (
  <input
    type="number" min={min} step={step}
    value={value === 0 ? '' : value}
    placeholder={placeholder}
    onChange={e => onChange(e.target.value === '' ? 0 : parseFloat(e.target.value) || 0)}
    style={{
      width: '100%', background: 'rgba(84,48,26,0.04)',
      border: '1px solid var(--ie-border)', borderRadius: 6,
      padding: '7px 10px', color: 'var(--bone)', fontSize: 13,
      fontFamily: 'var(--font-mono)', outline: 'none', ...style,
    }}
  />
);

const SelectInput = ({ value, onChange, options, style = {} }) => (
  <select
    value={value}
    onChange={e => onChange(e.target.value)}
    style={{
      width: '100%', background: '#1A1A1A',
      border: '1px solid var(--ie-border)', borderRadius: 6,
      padding: '7px 10px', color: 'var(--bone)', fontSize: 13,
      fontFamily: 'var(--font-mono)', outline: 'none', cursor: 'pointer', ...style,
    }}
  >
    {options.map(o => (
      <option key={typeof o === 'string' ? o : o.value} value={typeof o === 'string' ? o : o.value}>
        {typeof o === 'string' ? o : o.label}
      </option>
    ))}
  </select>
);

const SmallBtn = ({ onClick, children, danger, icon: Icon }) => (
  <button onClick={onClick} style={{
    display: 'inline-flex', alignItems: 'center', gap: 5,
    background: danger ? 'rgba(229,57,53,0.1)' : 'rgba(84,48,26,0.05)',
    border: `1px solid ${danger ? 'rgba(229,57,53,0.3)' : '#cbbba0'}`,
    borderRadius: 6, padding: '5px 10px',
    color: danger ? '#ef5350' : 'var(--smoke)',
    fontSize: 11, fontFamily: 'var(--font-mono)', cursor: 'pointer',
    transition: 'all 0.15s',
  }}>
    {Icon && <Icon size={11} />}{children}
  </button>
);

// ─── Section accordion ────────────────────────────────────────────────────────
function Section({ title, icon: Icon, color, children, badge, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{
      border: `1px solid ${open ? color + '30' : '#cbbba0'}`,
      borderRadius: 10, marginBottom: 8, overflow: 'hidden',
      transition: 'border 0.2s',
    }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: 10,
          padding: '12px 16px', background: open ? `${color}10` : 'transparent',
          border: 'none', cursor: 'pointer', textAlign: 'left',
          transition: 'background 0.2s',
        }}
      >
        {Icon && <Icon size={14} color={color} />}
        <span style={{ flex: 1, fontFamily: 'var(--font-display)', fontWeight: 600,
          fontSize: 13, color: 'var(--bone)' }}>{title}</span>
        {badge != null && badge > 0 && (
          <span style={{
            background: color + '20', border: `1px solid ${color}40`,
            borderRadius: 10, padding: '2px 8px',
            fontSize: 10, fontFamily: 'var(--font-mono)', color,
          }}>{badge}</span>
        )}
        {open ? <ChevronDown size={14} color="var(--smoke)" /> : <ChevronRight size={14} color="var(--smoke)" />}
      </button>
      {open && (
        <div style={{ padding: '16px', borderTop: `1px solid ${color}15` }}>
          {children}
        </div>
      )}
    </div>
  );
}

// ─── Info tooltip ─────────────────────────────────────────────────────────────
function InfoTip({ text }) {
  const [show, setShow] = useState(false);
  return (
    <span style={{ position: 'relative', display: 'inline-block' }}>
      <Info
        size={12} color="var(--smoke)" style={{ cursor: 'help', verticalAlign: 'middle' }}
        onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}
      />
      {show && (
        <div style={{
          position: 'absolute', bottom: '120%', left: '50%', transform: 'translateX(-50%)',
          background: 'var(--ie-card)', border: '1px solid var(--ie-border)',
          borderRadius: 6, padding: '8px 12px', fontSize: 11, color: 'var(--bone)',
          whiteSpace: 'nowrap', zIndex: 100, lineHeight: 1.5, maxWidth: 280, whiteSpace: 'normal',
          boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
        }}>{text}</div>
      )}
    </span>
  );
}

// ─── Metric display cell ──────────────────────────────────────────────────────
function MetricCell({ label, value, unit, color, flag }) {
  return (
    <div style={{
      background: flag ? 'rgba(229,57,53,0.08)' : 'rgba(84,48,26,0.03)',
      border: `1px solid ${flag ? 'rgba(229,57,53,0.25)' : '#cbbba0'}`,
      borderRadius: 8, padding: '10px 14px',
    }}>
      <div style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: 'var(--smoke)',
        letterSpacing: '0.08em', marginBottom: 4, textTransform: 'uppercase' }}>{label}</div>
      <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 18,
        color: flag ? '#ef5350' : (color || 'var(--bone)'), lineHeight: 1 }}>
        {value ?? '—'}
        <span style={{ fontSize: 10, color: 'var(--smoke)', marginLeft: 4, fontWeight: 400 }}>{unit}</span>
      </div>
      {flag && <div style={{ fontSize: 9, color: '#ef5350', marginTop: 4 }}>Above significance threshold</div>}
    </div>
  );
}

// ─── Material Production Section ──────────────────────────────────────────────
function MaterialSection({ compIdx }) {
  const items    = useSiteWise(s => s.components[compIdx].materialItems);
  const addM     = useSiteWise(s => s.addMaterial);
  const updateM  = useSiteWise(s => s.updateMaterial);
  const removeM  = useSiteWise(s => s.removeMaterial);
  const materials = Object.keys(MATERIAL_FACTORS);

  return (
    <div>
      <p style={{ margin: '0 0 12px', fontSize: 12, color: 'var(--smoke)', lineHeight: 1.6 }}>
        Enter materials used in this phase. The tool auto-applies lifecycle emission factors
        from SiteWise™ Table 1c (kg CO₂e/kg, g NOx/kg, etc.).
      </p>
      {items.map(item => (
        <div key={item.id} style={{
          display: 'grid', gridTemplateColumns: '1fr 130px auto',
          gap: 8, marginBottom: 8, alignItems: 'end',
        }}>
          <div>
            <div style={{ fontSize: 10, color: 'var(--smoke)', marginBottom: 3 }}>Material</div>
            <SelectInput
              value={item.material || materials[0]}
              onChange={v => updateM(compIdx, item.id, { material: v })}
              options={materials}
            />
          </div>
          <div>
            <div style={{ fontSize: 10, color: 'var(--smoke)', marginBottom: 3 }}>Quantity (kg)</div>
            <NumInput
              value={item.qty_kg || 0}
              onChange={v => updateM(compIdx, item.id, { qty_kg: v })}
            />
          </div>
          <SmallBtn danger icon={Trash2} onClick={() => removeM(compIdx, item.id)}>Remove</SmallBtn>
        </div>
      ))}
      <SmallBtn icon={Plus} onClick={() => addM(compIdx, { material: materials[0], qty_kg: 0 })}>
        Add Material
      </SmallBtn>
    </div>
  );
}

// ─── Personnel Transport Section ──────────────────────────────────────────────
function PersonnelSection({ compIdx }) {
  const trips    = useSiteWise(s => s.components[compIdx].personnelTrips);
  const add      = useSiteWise(s => s.addPersonnelTrip);
  const update   = useSiteWise(s => s.updatePersonnelTrip);
  const remove   = useSiteWise(s => s.removePersonnelTrip);
  const vtypes   = Object.keys(VEHICLE_FACTORS);

  return (
    <div>
      <p style={{ margin: '0 0 12px', fontSize: 12, color: 'var(--smoke)', lineHeight: 1.6 }}>
        Worker commute and site visits. Enter one-way miles; if round-trip check the box.
        SiteWise™ Table 2b applies lifecycle vehicle emission factors.
      </p>
      {trips.map(t => (
        <div key={t.id} style={{
          display: 'grid', gridTemplateColumns: '140px 90px 90px 90px auto',
          gap: 8, marginBottom: 8, alignItems: 'end',
        }}>
          <div>
            <div style={{ fontSize: 10, color: 'var(--smoke)', marginBottom: 3 }}>Vehicle type</div>
            <SelectInput value={t.vehicleType || vtypes[0]} options={vtypes}
              onChange={v => update(compIdx, t.id, { vehicleType: v })} />
          </div>
          <div>
            <div style={{ fontSize: 10, color: 'var(--smoke)', marginBottom: 3 }}>Miles (one-way)</div>
            <NumInput value={t.miles || 0} onChange={v => update(compIdx, t.id, { miles: v })} />
          </div>
          <div>
            <div style={{ fontSize: 10, color: 'var(--smoke)', marginBottom: 3 }}># Passengers</div>
            <NumInput value={t.passengers || 1} min={1} onChange={v => update(compIdx, t.id, { passengers: v })} />
          </div>
          <div>
            <div style={{ fontSize: 10, color: 'var(--smoke)', marginBottom: 3 }}># Trips</div>
            <NumInput value={t.trips || 1} min={1} onChange={v => update(compIdx, t.id, { trips: v })} />
          </div>
          <SmallBtn danger icon={Trash2} onClick={() => remove(compIdx, t.id)}>Remove</SmallBtn>
        </div>
      ))}
      <SmallBtn icon={Plus} onClick={() => add(compIdx, { vehicleType: vtypes[0], miles: 0, passengers: 1, trips: 1 })}>
        Add Trip
      </SmallBtn>
    </div>
  );
}

// ─── Equipment Shipments Section ──────────────────────────────────────────────
function ShipmentSection({ compIdx }) {
  const items  = useSiteWise(s => s.components[compIdx].equipmentShipments);
  const add    = useSiteWise(s => s.addShipment);
  const update = useSiteWise(s => s.updateShipment);
  const remove = useSiteWise(s => s.removeShipment);
  const modes  = ['road', 'rail', 'air', 'water'];

  return (
    <div>
      <p style={{ margin: '0 0 12px', fontSize: 12, color: 'var(--smoke)', lineHeight: 1.6 }}>
        Equipment, materials, and supplies shipped to/from the site. Road uses HD truck factors (Table 2b);
        rail/air/water use cargo ton-mile factors (Tables 2d–2g).
      </p>
      {items.map(item => (
        <div key={item.id} style={{
          display: 'grid', gridTemplateColumns: '90px 120px 100px 80px auto',
          gap: 8, marginBottom: 8, alignItems: 'end',
        }}>
          <div>
            <div style={{ fontSize: 10, color: 'var(--smoke)', marginBottom: 3 }}>Mode</div>
            <SelectInput value={item.mode || 'road'} options={modes}
              onChange={v => update(compIdx, item.id, { mode: v })} />
          </div>
          <div>
            <div style={{ fontSize: 10, color: 'var(--smoke)', marginBottom: 3 }}>Fuel (road)</div>
            <SelectInput value={item.fuelType || 'Diesel'} options={FUEL_TYPES}
              onChange={v => update(compIdx, item.id, { fuelType: v })} />
          </div>
          <div>
            <div style={{ fontSize: 10, color: 'var(--smoke)', marginBottom: 3 }}>Miles</div>
            <NumInput value={item.miles || 0} onChange={v => update(compIdx, item.id, { miles: v })} />
          </div>
          <div>
            <div style={{ fontSize: 10, color: 'var(--smoke)', marginBottom: 3 }}>Tons</div>
            <NumInput value={item.tons || 0} onChange={v => update(compIdx, item.id, { tons: v })} />
          </div>
          <SmallBtn danger icon={Trash2} onClick={() => remove(compIdx, item.id)}>Remove</SmallBtn>
        </div>
      ))}
      <SmallBtn icon={Plus} onClick={() => add(compIdx, { mode: 'road', fuelType: 'Diesel', miles: 0, tons: 0 })}>
        Add Shipment
      </SmallBtn>
    </div>
  );
}

// ─── Earthwork Section ────────────────────────────────────────────────────────
function EarthworkSection({ compIdx }) {
  const earthwork = useSiteWise(s => s.components[compIdx].earthwork);
  const set       = useSiteWise(s => s.setEarthwork);
  const equip = earthwork.volumeCY > 0 ? autoSelectEquipment(earthwork.volumeCY) : null;

  return (
    <div>
      <p style={{ margin: '0 0 12px', fontSize: 12, color: 'var(--smoke)', lineHeight: 1.6 }}>
        Soil excavation and grading. SiteWise™ auto-selects equipment from Table 3b based on
        volume — no equipment experience required. Verify the auto-selected equipment matches
        your site plan.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
        <Row label="Excavation Volume (CY)">
          <NumInput value={earthwork.volumeCY} onChange={v => set(compIdx, { volumeCY: v })} />
        </Row>
        <Row label="Fuel Type">
          <SelectInput value={earthwork.fuelType} options={FUEL_TYPES}
            onChange={v => set(compIdx, { fuelType: v })} />
        </Row>
        <Row label="Hours Override" hint="(leave 0 = auto)">
          <NumInput value={earthwork.hoursOverride || 0}
            onChange={v => set(compIdx, { hoursOverride: v > 0 ? v : null })} />
        </Row>
      </div>
      {equip && (
        <div style={{
          background: 'rgba(189,86,45,0.06)', border: '1px solid rgba(189,86,45,0.20)',
          borderRadius: 8, padding: '10px 14px', marginTop: 4,
          display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center',
        }}>
          <span style={{ fontSize: 11, color: 'var(--sunbeam)', fontFamily: 'var(--font-mono)' }}>
            AUTO-SELECTED:
          </span>
          <span style={{ fontSize: 12, color: 'var(--bone)' }}>{equip.name}</span>
          <span style={{ fontSize: 11, color: 'var(--smoke)' }}>{equip.gph} gal/hr · {equip.cyph} CY/hr · {equip.hp} HP</span>
          <span style={{ fontSize: 11, color: 'var(--smoke)' }}>
            Est. hours: {earthwork.hoursOverride || (earthwork.volumeCY / equip.cyph).toFixed(1)}
          </span>
        </div>
      )}
    </div>
  );
}

// ─── Drilling Section ─────────────────────────────────────────────────────────
function DrillingSection({ compIdx }) {
  const wells  = useSiteWise(s => s.components[compIdx].wells);
  const add    = useSiteWise(s => s.addWell);
  const update = useSiteWise(s => s.updateWell);
  const remove = useSiteWise(s => s.removeWell);
  const methods = Object.keys(DRILLING_FACTORS);

  return (
    <div>
      <p style={{ margin: '0 0 12px', fontSize: 12, color: 'var(--smoke)', lineHeight: 1.6 }}>
        Well installation and soil borings. SiteWise™ Table 3c provides method-specific fuel consumption
        (gal/hr). Sonic drilling uses far more fuel than direct push — method selection significantly
        affects project footprint.
      </p>
      {wells.map(w => (
        <div key={w.id} style={{
          display: 'grid', gridTemplateColumns: '160px 120px 100px auto',
          gap: 8, marginBottom: 8, alignItems: 'end',
        }}>
          <div>
            <div style={{ fontSize: 10, color: 'var(--smoke)', marginBottom: 3 }}>Method</div>
            <SelectInput value={w.method || methods[0]} options={methods}
              onChange={v => update(compIdx, w.id, { method: v })} />
          </div>
          <div>
            <div style={{ fontSize: 10, color: 'var(--smoke)', marginBottom: 3 }}>Fuel</div>
            <SelectInput value={w.fuelType || 'Diesel'} options={['Diesel', 'Gasoline']}
              onChange={v => update(compIdx, w.id, { fuelType: v })} />
          </div>
          <div>
            <div style={{ fontSize: 10, color: 'var(--smoke)', marginBottom: 3 }}>Hours</div>
            <NumInput value={w.hours || 0} onChange={v => update(compIdx, w.id, { hours: v })} />
          </div>
          <SmallBtn danger icon={Trash2} onClick={() => remove(compIdx, w.id)}>Remove</SmallBtn>
        </div>
      ))}
      {wells.length > 0 && (
        <div style={{ fontSize: 11, color: 'var(--smoke)', marginBottom: 8 }}>
          Fuel rates: Direct Push 0.8 gph · Hollow Stem Auger 7.55 gph · Sonic 5.65 gph · Air Rotary 25 gph
        </div>
      )}
      <SmallBtn icon={Plus} onClick={() => add(compIdx, { method: methods[0], fuelType: 'Diesel', hours: 0 })}>
        Add Drilling Activity
      </SmallBtn>
    </div>
  );
}

// ─── Pumps & Generators Section ───────────────────────────────────────────────
function PumpsSection({ compIdx }) {
  const pumps     = useSiteWise(s => s.components[compIdx].pumps);
  const addP      = useSiteWise(s => s.addPump);
  const updateP   = useSiteWise(s => s.updatePump);
  const removeP   = useSiteWise(s => s.removePump);
  const gens      = useSiteWise(s => s.components[compIdx].generators);
  const addG      = useSiteWise(s => s.addGenerator);
  const updateG   = useSiteWise(s => s.updateGenerator);
  const removeG   = useSiteWise(s => s.removeGenerator);

  const ItemRow = ({ item, update, remove, label }) => (
    <div style={{
      display: 'grid', gridTemplateColumns: '100px 120px auto',
      gap: 8, marginBottom: 8, alignItems: 'end',
    }}>
      <div>
        <div style={{ fontSize: 10, color: 'var(--smoke)', marginBottom: 3 }}>HP Rating</div>
        <NumInput value={item.hp || 0} min={1} onChange={v => update(compIdx, item.id, { hp: v })} />
      </div>
      <div>
        <div style={{ fontSize: 10, color: 'var(--smoke)', marginBottom: 3 }}>Operating Hours</div>
        <NumInput value={item.hours || 0} onChange={v => update(compIdx, item.id, { hours: v })} />
      </div>
      <SmallBtn danger icon={Trash2} onClick={() => remove(compIdx, item.id)}>Remove</SmallBtn>
    </div>
  );

  return (
    <div>
      <p style={{ margin: '0 0 12px', fontSize: 12, color: 'var(--smoke)', lineHeight: 1.6 }}>
        Diesel pumps (groundwater extraction, dewatering) and generators. Emission factors from
        SiteWise™ Tables 4b and 5a — auto-matched to HP range.
      </p>
      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 12,
        color: 'var(--bone)', marginBottom: 8 }}>Pumps (diesel)</div>
      {pumps.map(p => <ItemRow key={p.id} item={p} update={updateP} remove={removeP} />)}
      <SmallBtn icon={Plus} onClick={() => addP(compIdx, { hp: 16, hours: 0 })}>Add Pump</SmallBtn>

      <div style={{ margin: '16px 0 8px', fontFamily: 'var(--font-display)', fontWeight: 600,
        fontSize: 12, color: 'var(--bone)' }}>Generators (diesel)</div>
      {gens.map(g => <ItemRow key={g.id} item={g} update={updateG} remove={removeG} />)}
      <SmallBtn icon={Plus} onClick={() => addG(compIdx, { hp: 50, hours: 0 })}>Add Generator</SmallBtn>
    </div>
  );
}

// ─── Electricity Section ──────────────────────────────────────────────────────
function ElectricSection({ compIdx }) {
  const items  = useSiteWise(s => s.components[compIdx].electricItems);
  const state  = useSiteWise(s => s.projectState);
  const add    = useSiteWise(s => s.addElectric);
  const update = useSiteWise(s => s.updateElectric);
  const remove = useSiteWise(s => s.removeElectric);
  const stateOpts = STATES.map(s => ({ value: s, label: s }));

  return (
    <div>
      <p style={{ margin: '0 0 12px', fontSize: 12, color: 'var(--smoke)', lineHeight: 1.6 }}>
        Grid electricity consumption (treatment systems, lights, HVAC, instrumentation).
        SiteWise™ Table 4a applies state-specific emission factors — NY grid is significantly
        cleaner than the US average (667 vs. 1,353 lb CO₂/MWh).
      </p>
      {items.map(item => (
        <div key={item.id} style={{
          display: 'grid', gridTemplateColumns: '1fr 120px auto',
          gap: 8, marginBottom: 8, alignItems: 'end',
        }}>
          <div>
            <div style={{ fontSize: 10, color: 'var(--smoke)', marginBottom: 3 }}>kWh consumed</div>
            <NumInput value={item.kwh || 0} onChange={v => update(compIdx, item.id, { kwh: v })} />
          </div>
          <div>
            <div style={{ fontSize: 10, color: 'var(--smoke)', marginBottom: 3 }}>State</div>
            <SelectInput value={item.state || state} options={stateOpts}
              onChange={v => update(compIdx, item.id, { state: v })} />
          </div>
          <SmallBtn danger icon={Trash2} onClick={() => remove(compIdx, item.id)}>Remove</SmallBtn>
        </div>
      ))}
      <SmallBtn icon={Plus} onClick={() => add(compIdx, { kwh: 0, state })}>
        Add Electricity Item
      </SmallBtn>
    </div>
  );
}

// ─── Residuals Section ────────────────────────────────────────────────────────
function ResidualSection({ compIdx }) {
  const items  = useSiteWise(s => s.components[compIdx].residuals);
  const add    = useSiteWise(s => s.addResidual);
  const update = useSiteWise(s => s.updateResidual);
  const remove = useSiteWise(s => s.removeResidual);
  const types  = ['Contaminated Soil', 'C&D Debris', 'Wastewater', 'Hazardous Waste', 'Other'];

  return (
    <div>
      <p style={{ margin: '0 0 12px', fontSize: 12, color: 'var(--smoke)', lineHeight: 1.6 }}>
        Waste, soil, and materials transported off-site for disposal or treatment.
        Residual handling is often the largest single emission source for excavation projects.
      </p>
      {items.map(item => (
        <div key={item.id} style={{
          display: 'grid', gridTemplateColumns: '160px 120px 100px 120px auto',
          gap: 8, marginBottom: 8, alignItems: 'end',
        }}>
          <div>
            <div style={{ fontSize: 10, color: 'var(--smoke)', marginBottom: 3 }}>Type</div>
            <SelectInput value={item.type || types[0]} options={types}
              onChange={v => update(compIdx, item.id, { type: v })} />
          </div>
          <div>
            <div style={{ fontSize: 10, color: 'var(--smoke)', marginBottom: 3 }}>Tons (short)</div>
            <NumInput value={item.tons || 0} onChange={v => update(compIdx, item.id, { tons: v })} />
          </div>
          <div>
            <div style={{ fontSize: 10, color: 'var(--smoke)', marginBottom: 3 }}>Miles</div>
            <NumInput value={item.miles || 0} onChange={v => update(compIdx, item.id, { miles: v })} />
          </div>
          <div>
            <div style={{ fontSize: 10, color: 'var(--smoke)', marginBottom: 3 }}>Fuel Type</div>
            <SelectInput value={item.fuelType || 'Diesel'} options={FUEL_TYPES}
              onChange={v => update(compIdx, item.id, { fuelType: v })} />
          </div>
          <SmallBtn danger icon={Trash2} onClick={() => remove(compIdx, item.id)}>Remove</SmallBtn>
        </div>
      ))}
      <SmallBtn icon={Plus} onClick={() => add(compIdx, { type: types[0], tons: 0, miles: 0, fuelType: 'Diesel' })}>
        Add Residual Stream
      </SmallBtn>
    </div>
  );
}

// ─── Well Materials Section ───────────────────────────────────────────────────
function WellMaterialsSection({ compIdx }) {
  const items  = useSiteWise(s => s.components[compIdx].wellMaterials ?? []);
  const add    = useSiteWise(s => s.addWellMaterial);
  const update = useSiteWise(s => s.updateWellMaterial);
  const remove = useSiteWise(s => s.removeWellMaterial);

  // Filter diameters to those that have weight data
  const pvcDias   = Object.keys(PVC_PIPE_WEIGHT);
  const steelDias = Object.keys(STEEL_PIPE_WEIGHT);
  const casingOpts = ['Sch 40 PVC','Sch 80 PVC','Sch 120 PVC','Sch 40 Steel'];

  function getDias(casing) {
    return casing.includes('Steel') ? steelDias : pvcDias;
  }

  function autoCalcKg(item) {
    const n = item.numWells || 0;
    const depth = item.depthFt || 0;
    const dia = item.diameterIn || '2';
    const casing = item.casing || 'Sch 40 PVC';
    let lbPerFt = 0;
    if (casing.includes('Steel')) {
      lbPerFt = (STEEL_PIPE_WEIGHT[dia] && STEEL_PIPE_WEIGHT[dia][casing]) || 0;
    } else {
      lbPerFt = (PVC_PIPE_WEIGHT[dia] && PVC_PIPE_WEIGHT[dia][casing]) || 0;
    }
    return (n * depth * lbPerFt * CONV.LBS_TO_KG).toFixed(1);
  }

  return (
    <div>
      <p style={{ margin: '0 0 12px', fontSize: 12, color: 'var(--smoke)', lineHeight: 1.6 }}>
        Well installation materials. Casing weight is auto-calculated from # wells × depth × pipe weight
        (SiteWise™ Table 1b). Fill materials (sand, gravel, bentonite, cement) entered directly in kg.
      </p>
      {items.map(item => {
        const dias = getDias(item.casing || 'Sch 40 PVC');
        const autoKg = autoCalcKg(item);
        return (
          <div key={item.id} style={{
            border: '1px solid var(--ie-border)', borderRadius: 8,
            padding: '12px 14px', marginBottom: 10,
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: '80px 100px 130px 100px', gap: 8, marginBottom: 10 }}>
              <div>
                <div style={{ fontSize: 10, color: 'var(--smoke)', marginBottom: 3 }}># Wells</div>
                <NumInput value={item.numWells || 0} min={1}
                  onChange={v => update(compIdx, item.id, { numWells: v })} />
              </div>
              <div>
                <div style={{ fontSize: 10, color: 'var(--smoke)', marginBottom: 3 }}>Depth (ft)</div>
                <NumInput value={item.depthFt || 0}
                  onChange={v => update(compIdx, item.id, { depthFt: v })} />
              </div>
              <div>
                <div style={{ fontSize: 10, color: 'var(--smoke)', marginBottom: 3 }}>Casing</div>
                <SelectInput value={item.casing || 'Sch 40 PVC'} options={casingOpts}
                  onChange={v => update(compIdx, item.id, { casing: v, diameterIn: getDias(v)[0] })} />
              </div>
              <div>
                <div style={{ fontSize: 10, color: 'var(--smoke)', marginBottom: 3 }}>Dia. (in)</div>
                <SelectInput value={item.diameterIn || dias[0]} options={dias}
                  onChange={v => update(compIdx, item.id, { diameterIn: v })} />
              </div>
            </div>
            {autoKg > 0 && (
              <div style={{
                fontSize: 11, color: 'var(--sunbeam)', fontFamily: 'var(--font-mono)',
                marginBottom: 10, padding: '4px 8px',
                background: 'rgba(189,86,45,0.06)', borderRadius: 4, display: 'inline-block',
              }}>
                AUTO: {autoKg} kg {item.casing?.includes('Steel') ? 'Steel' : 'PVC'} casing
              </div>
            )}
            <div style={{ fontSize: 11, color: 'var(--smoke)', marginBottom: 6 }}>Fill materials (kg each):</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr) auto', gap: 8, alignItems: 'end' }}>
              <div>
                <div style={{ fontSize: 10, color: 'var(--smoke)', marginBottom: 3 }}>Sand (kg)</div>
                <NumInput value={item.sandKg || 0} onChange={v => update(compIdx, item.id, { sandKg: v })} />
              </div>
              <div>
                <div style={{ fontSize: 10, color: 'var(--smoke)', marginBottom: 3 }}>Gravel (kg)</div>
                <NumInput value={item.gravelKg || 0} onChange={v => update(compIdx, item.id, { gravelKg: v })} />
              </div>
              <div>
                <div style={{ fontSize: 10, color: 'var(--smoke)', marginBottom: 3 }}>Bentonite (kg)</div>
                <NumInput value={item.bentoniteKg || 0} onChange={v => update(compIdx, item.id, { bentoniteKg: v })} />
              </div>
              <div>
                <div style={{ fontSize: 10, color: 'var(--smoke)', marginBottom: 3 }}>Cement (kg)</div>
                <NumInput value={item.cementKg || 0} onChange={v => update(compIdx, item.id, { cementKg: v })} />
              </div>
              <SmallBtn danger icon={Trash2} onClick={() => remove(compIdx, item.id)}>Remove</SmallBtn>
            </div>
          </div>
        );
      })}
      <SmallBtn icon={Plus} onClick={() => add(compIdx, {
        numWells: 1, depthFt: 0, diameterIn: '2', casing: 'Sch 40 PVC',
        sandKg: 0, gravelKg: 0, bentoniteKg: 0, cementKg: 0,
      })}>
        Add Well Type
      </SmallBtn>
    </div>
  );
}

// ─── Treatment Chemicals Section ──────────────────────────────────────────────
function TreatmentChemsSection({ compIdx }) {
  const items  = useSiteWise(s => s.components[compIdx].treatmentChems ?? []);
  const add    = useSiteWise(s => s.addTreatmentChem);
  const update = useSiteWise(s => s.updateTreatmentChem);
  const remove = useSiteWise(s => s.removeTreatmentChem);

  return (
    <div>
      <p style={{ margin: '0 0 12px', fontSize: 12, color: 'var(--smoke)', lineHeight: 1.6 }}>
        In-situ injection chemicals. Enter material per injection point (dry mass, lbs).
        Total mass = injection points × lbs/point × # events. Converted to kg using SiteWise™ Table 1c factors.
      </p>
      {items.map(item => {
        const totalLbs = (item.injectionPts || 0) * (item.lbsPerPt || 0) * (item.injectionsPerPt || 1);
        return (
          <div key={item.id} style={{
            display: 'grid', gridTemplateColumns: '180px 90px 100px 80px auto',
            gap: 8, marginBottom: 8, alignItems: 'end',
          }}>
            <div>
              <div style={{ fontSize: 10, color: 'var(--smoke)', marginBottom: 3 }}>Material</div>
              <SelectInput value={item.material || TREATMENT_CHEMICALS[0]} options={TREATMENT_CHEMICALS}
                onChange={v => update(compIdx, item.id, { material: v })} />
            </div>
            <div>
              <div style={{ fontSize: 10, color: 'var(--smoke)', marginBottom: 3 }}># Points</div>
              <NumInput value={item.injectionPts || 0} min={1}
                onChange={v => update(compIdx, item.id, { injectionPts: v })} />
            </div>
            <div>
              <div style={{ fontSize: 10, color: 'var(--smoke)', marginBottom: 3 }}>Lbs/point</div>
              <NumInput value={item.lbsPerPt || 0}
                onChange={v => update(compIdx, item.id, { lbsPerPt: v })} />
            </div>
            <div>
              <div style={{ fontSize: 10, color: 'var(--smoke)', marginBottom: 3 }}># Events</div>
              <NumInput value={item.injectionsPerPt || 1} min={1}
                onChange={v => update(compIdx, item.id, { injectionsPerPt: v })} />
            </div>
            <SmallBtn danger icon={Trash2} onClick={() => remove(compIdx, item.id)}>Remove</SmallBtn>
          </div>
        );
      })}
      {items.some(i => (i.injectionPts||0)*(i.lbsPerPt||0)*(i.injectionsPerPt||1) > 0) && (
        <div style={{ fontSize: 11, color: 'var(--smoke)', marginBottom: 8 }}>
          Total: {items.reduce((s,i) => s + (i.injectionPts||0)*(i.lbsPerPt||0)*(i.injectionsPerPt||1), 0).toFixed(0)} lbs
          = {(items.reduce((s,i) => s + (i.injectionPts||0)*(i.lbsPerPt||0)*(i.injectionsPerPt||1), 0) * 0.453592).toFixed(0)} kg
        </div>
      )}
      <SmallBtn icon={Plus} onClick={() => add(compIdx, {
        material: TREATMENT_CHEMICALS[0], injectionPts: 0, lbsPerPt: 0, injectionsPerPt: 1,
      })}>
        Add Chemical
      </SmallBtn>
    </div>
  );
}

// ─── Treatment Media Section ──────────────────────────────────────────────────
function TreatmentMediaSection({ compIdx }) {
  const items  = useSiteWise(s => s.components[compIdx].treatmentMedia ?? []);
  const add    = useSiteWise(s => s.addTreatmentMedia);
  const update = useSiteWise(s => s.updateTreatmentMedia);
  const remove = useSiteWise(s => s.removeTreatmentMedia);

  return (
    <div>
      <p style={{ margin: '0 0 12px', fontSize: 12, color: 'var(--smoke)', lineHeight: 1.6 }}>
        Treatment media: GAC, ion exchange resin, and similar filter media. Enter weight in pounds.
        Virgin GAC has high embodied energy (25 MJ/kg); regenerated GAC is ~50% lower.
      </p>
      {items.map(item => (
        <div key={item.id} style={{
          display: 'grid', gridTemplateColumns: '200px 140px auto',
          gap: 8, marginBottom: 8, alignItems: 'end',
        }}>
          <div>
            <div style={{ fontSize: 10, color: 'var(--smoke)', marginBottom: 3 }}>Media Type</div>
            <SelectInput value={item.mediaType || TREATMENT_MEDIA[0]} options={TREATMENT_MEDIA}
              onChange={v => update(compIdx, item.id, { mediaType: v })} />
          </div>
          <div>
            <div style={{ fontSize: 10, color: 'var(--smoke)', marginBottom: 3 }}>Weight (lbs)</div>
            <NumInput value={item.lbs || 0}
              onChange={v => update(compIdx, item.id, { lbs: v })} />
          </div>
          <SmallBtn danger icon={Trash2} onClick={() => remove(compIdx, item.id)}>Remove</SmallBtn>
        </div>
      ))}
      <SmallBtn icon={Plus} onClick={() => add(compIdx, { mediaType: TREATMENT_MEDIA[0], lbs: 0 })}>
        Add Treatment Media
      </SmallBtn>
    </div>
  );
}

// ─── Construction Materials Section ──────────────────────────────────────────
function ConstructionMatsSection({ compIdx }) {
  const items  = useSiteWise(s => s.components[compIdx].constructionMats ?? []);
  const add    = useSiteWise(s => s.addConstructionMat);
  const update = useSiteWise(s => s.updateConstructionMat);
  const remove = useSiteWise(s => s.removeConstructionMat);

  return (
    <div>
      <p style={{ margin: '0 0 12px', fontSize: 12, color: 'var(--smoke)', lineHeight: 1.6 }}>
        Cap, liner, and structural materials. Enter total weight in pounds.
        Note: 40-mil HDPE liner ≈ 2.1 lbs/ft² · 6" concrete slab ≈ 75 lbs/ft²
      </p>
      {items.map(item => (
        <div key={item.id} style={{
          display: 'grid', gridTemplateColumns: '200px 140px auto',
          gap: 8, marginBottom: 8, alignItems: 'end',
        }}>
          <div>
            <div style={{ fontSize: 10, color: 'var(--smoke)', marginBottom: 3 }}>Material</div>
            <SelectInput value={item.material || CONSTRUCTION_MATERIALS[0]} options={CONSTRUCTION_MATERIALS}
              onChange={v => update(compIdx, item.id, { material: v })} />
          </div>
          <div>
            <div style={{ fontSize: 10, color: 'var(--smoke)', marginBottom: 3 }}>Weight (lbs)</div>
            <NumInput value={item.lbs || 0}
              onChange={v => update(compIdx, item.id, { lbs: v })} />
          </div>
          <SmallBtn danger icon={Trash2} onClick={() => remove(compIdx, item.id)}>Remove</SmallBtn>
        </div>
      ))}
      <SmallBtn icon={Plus} onClick={() => add(compIdx, { material: CONSTRUCTION_MATERIALS[0], lbs: 0 })}>
        Add Material
      </SmallBtn>
    </div>
  );
}

// ─── Bulk Materials Section ───────────────────────────────────────────────────
function BulkMaterialsSection({ compIdx }) {
  const items  = useSiteWise(s => s.components[compIdx].bulkMaterials ?? []);
  const add    = useSiteWise(s => s.addBulkMaterial);
  const update = useSiteWise(s => s.updateBulkMaterial);
  const remove = useSiteWise(s => s.removeBulkMaterial);
  const matOpts = BULK_MATERIALS;
  const unitOpts = Object.keys(UNIT_TO_KG);

  return (
    <div>
      <p style={{ margin: '0 0 12px', fontSize: 12, color: 'var(--smoke)', lineHeight: 1.6 }}>
        Flexible catch-all for any material not covered by the sections above.
        Full SiteWise™ material library available. Quantity can be entered in lbs, kg, or tons.
      </p>
      {items.map(item => (
        <div key={item.id} style={{
          display: 'grid', gridTemplateColumns: '200px 80px 130px auto',
          gap: 8, marginBottom: 8, alignItems: 'end',
        }}>
          <div>
            <div style={{ fontSize: 10, color: 'var(--smoke)', marginBottom: 3 }}>Material</div>
            <SelectInput value={item.material || matOpts[0]} options={matOpts}
              onChange={v => update(compIdx, item.id, { material: v })} />
          </div>
          <div>
            <div style={{ fontSize: 10, color: 'var(--smoke)', marginBottom: 3 }}>Qty</div>
            <NumInput value={item.qty || 0}
              onChange={v => update(compIdx, item.id, { qty: v })} />
          </div>
          <div>
            <div style={{ fontSize: 10, color: 'var(--smoke)', marginBottom: 3 }}>Unit</div>
            <SelectInput value={item.unit || 'lbs'} options={unitOpts}
              onChange={v => update(compIdx, item.id, { unit: v })} />
          </div>
          <SmallBtn danger icon={Trash2} onClick={() => remove(compIdx, item.id)}>Remove</SmallBtn>
        </div>
      ))}
      <SmallBtn icon={Plus} onClick={() => add(compIdx, { material: matOpts[0], qty: 0, unit: 'lbs' })}>
        Add Bulk Material
      </SmallBtn>
    </div>
  );
}

// ─── Air & Rail Personnel Section ────────────────────────────────────────────
function AirRailPersonnelSection({ compIdx }) {
  const airTrips   = useSiteWise(s => s.components[compIdx].airTrips ?? []);
  const addAir     = useSiteWise(s => s.addAirTrip);
  const updateAir  = useSiteWise(s => s.updateAirTrip);
  const removeAir  = useSiteWise(s => s.removeAirTrip);
  const railTrips  = useSiteWise(s => s.components[compIdx].railTrips ?? []);
  const addRail    = useSiteWise(s => s.addRailTrip);
  const updateRail = useSiteWise(s => s.updateRailTrip);
  const removeRail = useSiteWise(s => s.removeRailTrip);
  const railOpts   = RAIL_TYPES;

  return (
    <div>
      <p style={{ margin: '0 0 12px', fontSize: 12, color: 'var(--smoke)', lineHeight: 1.6 }}>
        Air travel uses EPA lifecycle factors (0.21 kg CO₂/pax-mile). Rail uses mode-specific
        factors — transit rail (subway) is lowest; intercity rail is mid-range.
      </p>

      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 12,
        color: 'var(--bone)', marginBottom: 8 }}>Air Travel</div>
      {airTrips.map(t => (
        <div key={t.id} style={{
          display: 'grid', gridTemplateColumns: '130px 100px 100px auto',
          gap: 8, marginBottom: 8, alignItems: 'end',
        }}>
          <div>
            <div style={{ fontSize: 10, color: 'var(--smoke)', marginBottom: 3 }}>Distance (miles)</div>
            <NumInput value={t.miles || 0} onChange={v => updateAir(compIdx, t.id, { miles: v })} />
          </div>
          <div>
            <div style={{ fontSize: 10, color: 'var(--smoke)', marginBottom: 3 }}># Travelers</div>
            <NumInput value={t.travelers || 1} min={1} onChange={v => updateAir(compIdx, t.id, { travelers: v })} />
          </div>
          <div>
            <div style={{ fontSize: 10, color: 'var(--smoke)', marginBottom: 3 }}># Flights</div>
            <NumInput value={t.flights || 1} min={1} onChange={v => updateAir(compIdx, t.id, { flights: v })} />
          </div>
          <SmallBtn danger icon={Trash2} onClick={() => removeAir(compIdx, t.id)}>Remove</SmallBtn>
        </div>
      ))}
      <SmallBtn icon={Plus} onClick={() => addAir(compIdx, { miles: 0, travelers: 1, flights: 1 })}>
        Add Air Trip
      </SmallBtn>

      <div style={{ margin: '16px 0 8px', fontFamily: 'var(--font-display)', fontWeight: 600,
        fontSize: 12, color: 'var(--bone)' }}>Rail Travel</div>
      {railTrips.map(t => (
        <div key={t.id} style={{
          display: 'grid', gridTemplateColumns: '160px 130px 80px 80px auto',
          gap: 8, marginBottom: 8, alignItems: 'end',
        }}>
          <div>
            <div style={{ fontSize: 10, color: 'var(--smoke)', marginBottom: 3 }}>Rail Type</div>
            <SelectInput value={t.railType || railOpts[0]} options={railOpts}
              onChange={v => updateRail(compIdx, t.id, { railType: v })} />
          </div>
          <div>
            <div style={{ fontSize: 10, color: 'var(--smoke)', marginBottom: 3 }}>Distance (miles)</div>
            <NumInput value={t.miles || 0} onChange={v => updateRail(compIdx, t.id, { miles: v })} />
          </div>
          <div>
            <div style={{ fontSize: 10, color: 'var(--smoke)', marginBottom: 3 }}># Trips</div>
            <NumInput value={t.trips || 1} min={1} onChange={v => updateRail(compIdx, t.id, { trips: v })} />
          </div>
          <div>
            <div style={{ fontSize: 10, color: 'var(--smoke)', marginBottom: 3 }}># Travelers</div>
            <NumInput value={t.travelers || 1} min={1} onChange={v => updateRail(compIdx, t.id, { travelers: v })} />
          </div>
          <SmallBtn danger icon={Trash2} onClick={() => removeRail(compIdx, t.id)}>Remove</SmallBtn>
        </div>
      ))}
      <SmallBtn icon={Plus} onClick={() => addRail(compIdx, { railType: railOpts[0], miles: 0, trips: 1, travelers: 1 })}>
        Add Rail Trip
      </SmallBtn>
    </div>
  );
}

// ─── Electric Pumps / Treatment Systems ──────────────────────────────────────
function ElectricPumpsSection({ compIdx }) {
  const state  = useSiteWise(s => s.projectState);
  const items  = useSiteWise(s => s.components[compIdx].electricPumps ?? []);
  const add    = useSiteWise(s => s.addElectricPump);
  const update = useSiteWise(s => s.updateElectricPump);
  const remove = useSiteWise(s => s.removeElectricPump);

  function previewKwh(p) {
    const n = p.numPumps || 1, hrs = p.hours || 0;
    const PUMP_EFF = 0.65, MOTOR_EFF = 0.90, KW_PER_HP = 0.7457;
    if (p.method === 'flow') {
      const hydraulicHp = ((p.gpm || 0) * (p.headFt || 0) * (p.sg || 1.0)) / 3960;
      const inputKw = hydraulicHp / PUMP_EFF * KW_PER_HP / MOTOR_EFF;
      return (inputKw * n * hrs).toFixed(0);
    }
    const inputKw = (p.hpEach || 0) * KW_PER_HP / MOTOR_EFF;
    return (inputKw * n * hrs).toFixed(0);
  }

  return (
    <div>
      <p style={{ margin: '0 0 12px', fontSize: 12, color: 'var(--smoke)', lineHeight: 1.6 }}>
        Electric treatment systems (P&T, air strippers, SVE blowers). Use <strong>Flow/Head</strong> method
        if pump design specs are known; use <strong>HP/Hours</strong> if motor size is known.
        Both convert to kWh and use the {state} grid emission factor.
      </p>
      {items.map(item => {
        const kwhPrev = previewKwh(item);
        return (
          <div key={item.id} style={{
            border: '1px solid rgba(150,161,83,0.12)', borderRadius: 8,
            padding: '12px 14px', marginBottom: 10,
          }}>
            <div style={{ display: 'flex', gap: 8, marginBottom: 10, alignItems: 'center' }}>
              <div style={{ fontSize: 11, color: 'var(--smoke)' }}>Method:</div>
              {['flow','hp'].map(m => (
                <button key={m} onClick={() => update(compIdx, item.id, { method: m })}
                  style={{
                    padding: '4px 12px', borderRadius: 6, cursor: 'pointer', fontSize: 11,
                    fontFamily: 'var(--font-mono)',
                    background: item.method === m ? 'rgba(150,161,83,0.12)' : 'rgba(84,48,26,0.04)',
                    border: `1px solid ${item.method === m ? 'rgba(150,161,83,0.40)' : '#cbbba0'}`,
                    color: item.method === m ? '#4CAF50' : 'var(--smoke)',
                  }}>
                  {m === 'flow' ? 'Flow/Head' : 'HP/Hours'}
                </button>
              ))}
              <SmallBtn danger icon={Trash2} onClick={() => remove(compIdx, item.id)}>Remove</SmallBtn>
            </div>

            {item.method === 'flow' ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 8 }}>
                <div>
                  <div style={{ fontSize: 10, color: 'var(--smoke)', marginBottom: 3 }}>Flow (gpm)</div>
                  <NumInput value={item.gpm || 0} onChange={v => update(compIdx, item.id, { gpm: v })} />
                </div>
                <div>
                  <div style={{ fontSize: 10, color: 'var(--smoke)', marginBottom: 3 }}>Total Head (ft)</div>
                  <NumInput value={item.headFt || 0} onChange={v => update(compIdx, item.id, { headFt: v })} />
                </div>
                <div>
                  <div style={{ fontSize: 10, color: 'var(--smoke)', marginBottom: 3 }}>Sp. Gravity</div>
                  <NumInput value={item.sg || 1.0} step={0.01} onChange={v => update(compIdx, item.id, { sg: v })} />
                </div>
                <div>
                  <div style={{ fontSize: 10, color: 'var(--smoke)', marginBottom: 3 }}># Pumps</div>
                  <NumInput value={item.numPumps || 1} min={1} onChange={v => update(compIdx, item.id, { numPumps: v })} />
                </div>
                <div>
                  <div style={{ fontSize: 10, color: 'var(--smoke)', marginBottom: 3 }}>Op. Hours</div>
                  <NumInput value={item.hours || 0} onChange={v => update(compIdx, item.id, { hours: v })} />
                </div>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
                <div>
                  <div style={{ fontSize: 10, color: 'var(--smoke)', marginBottom: 3 }}>HP per pump</div>
                  <NumInput value={item.hpEach || 0} onChange={v => update(compIdx, item.id, { hpEach: v })} />
                </div>
                <div>
                  <div style={{ fontSize: 10, color: 'var(--smoke)', marginBottom: 3 }}># Pumps</div>
                  <NumInput value={item.numPumps || 1} min={1} onChange={v => update(compIdx, item.id, { numPumps: v })} />
                </div>
                <div>
                  <div style={{ fontSize: 10, color: 'var(--smoke)', marginBottom: 3 }}>Op. Hours</div>
                  <NumInput value={item.hours || 0} onChange={v => update(compIdx, item.id, { hours: v })} />
                </div>
              </div>
            )}

            {kwhPrev > 0 && (
              <div style={{ marginTop: 8, fontSize: 11, color: '#4CAF50', fontFamily: 'var(--font-mono)' }}>
                ≈ {Number(kwhPrev).toLocaleString()} kWh → uses {state} grid factor
              </div>
            )}
          </div>
        );
      })}
      <SmallBtn icon={Plus} onClick={() => add(compIdx, {
        method: 'flow', gpm: 0, headFt: 0, sg: 1.0, numPumps: 1, hours: 0, hpEach: 0,
      })}>
        Add Electric System
      </SmallBtn>
    </div>
  );
}

// ─── Component Panel ──────────────────────────────────────────────────────────
function ComponentPanel({ compIdx }) {
  const [open, setOpen] = useState(compIdx === 0);
  const comp    = useSiteWise(s => s.components[compIdx]);
  const toggle  = useSiteWise(s => s.toggleComponent);
  const setLabel = useSiteWise(s => s.setComponentLabel);
  const color   = COMP_COLORS[compIdx];
  const results = useSiteWise(s => s.results);
  const compResult = results?.componentResults?.[compIdx];

  const hasData = comp.materialItems.length + comp.personnelTrips.length +
    comp.equipmentShipments.length + comp.wells.length + comp.pumps.length +
    comp.generators.length + comp.electricItems.length + comp.residuals.length +
    comp.earthwork.volumeCY +
    (comp.wellMaterials?.length ?? 0) + (comp.treatmentChems?.length ?? 0) +
    (comp.treatmentMedia?.length ?? 0) + (comp.constructionMats?.length ?? 0) +
    (comp.bulkMaterials?.length ?? 0) + (comp.airTrips?.length ?? 0) +
    (comp.railTrips?.length ?? 0) + (comp.electricPumps?.length ?? 0) > 0;

  return (
    <div style={{
      border: `1px solid ${open ? color + '40' : '#cbbba0'}`,
      borderRadius: 12, marginBottom: 12,
      background: open ? `${color}05` : 'transparent',
      transition: 'all 0.2s',
    }}>
      {/* Component header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '14px 18px', cursor: 'pointer',
      }} onClick={() => setOpen(o => !o)}>
        <div style={{
          width: 10, height: 10, borderRadius: '50%',
          background: comp.enabled ? color : '#cbbba0',
          flexShrink: 0,
        }} />
        <span style={{
          fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--smoke)',
          letterSpacing: '0.1em', textTransform: 'uppercase', flexShrink: 0,
        }}>Component {compIdx + 1}</span>
        <span style={{
          fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14,
          color: 'var(--bone)', flex: 1,
        }}>{COMP_LABELS_DEFAULT[compIdx]}</span>
        {hasData && <CheckCircle size={13} color={color} />}
        {compResult && (
          <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color }}>
            {fmtMT(compResult.total.co2e)} MT CO₂e
          </span>
        )}
        {open ? <ChevronDown size={14} color="var(--smoke)" /> : <ChevronRight size={14} color="var(--smoke)" />}
      </div>

      {open && (
        <div style={{ padding: '0 18px 18px' }}>
          {/* Enable/disable */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <button
              onClick={() => toggle(compIdx)}
              style={{
                background: comp.enabled ? `${color}20` : 'rgba(84,48,26,0.04)',
                border: `1px solid ${comp.enabled ? color + '50' : '#cbbba0'}`,
                borderRadius: 6, padding: '4px 12px', cursor: 'pointer',
                fontSize: 11, fontFamily: 'var(--font-mono)',
                color: comp.enabled ? color : 'var(--smoke)',
              }}
            >
              {comp.enabled ? 'ENABLED' : 'DISABLED'}
            </button>
            <span style={{ fontSize: 11, color: 'var(--smoke)' }}>
              {comp.enabled ? 'Included in project total' : 'Excluded from calculations'}
            </span>
          </div>

          {comp.enabled && (
            <>
              <Section title="Material Production (Generic)" icon={Leaf} color="#7A9B76"
                badge={comp.materialItems.length}>
                <MaterialSection compIdx={compIdx} />
              </Section>
              <Section title="Well Casing & Fill Materials" icon={Calculator} color="#7A9B76"
                badge={(comp.wellMaterials?.length ?? 0)}>
                <WellMaterialsSection compIdx={compIdx} />
              </Section>
              <Section title="Treatment Chemicals (Injection)" icon={Leaf} color="#7A9B76"
                badge={(comp.treatmentChems?.length ?? 0)}>
                <TreatmentChemsSection compIdx={compIdx} />
              </Section>
              <Section title="Treatment Media (GAC, IER)" icon={Leaf} color="#7A9B76"
                badge={(comp.treatmentMedia?.length ?? 0)}>
                <TreatmentMediaSection compIdx={compIdx} />
              </Section>
              <Section title="Construction Materials (Cap, Liner)" icon={Leaf} color="#7A9B76"
                badge={(comp.constructionMats?.length ?? 0)}>
                <ConstructionMatsSection compIdx={compIdx} />
              </Section>
              <Section title="Bulk Materials (Any Unit)" icon={Leaf} color="#7A9B76"
                badge={(comp.bulkMaterials?.length ?? 0)}>
                <BulkMaterialsSection compIdx={compIdx} />
              </Section>
              <Section title="Personnel Transportation — Road" icon={Truck} color="#5B7B9A"
                badge={comp.personnelTrips.length}>
                <PersonnelSection compIdx={compIdx} />
              </Section>
              <Section title="Personnel Transportation — Air & Rail" icon={Truck} color="#5B7B9A"
                badge={(comp.airTrips?.length ?? 0) + (comp.railTrips?.length ?? 0)}>
                <AirRailPersonnelSection compIdx={compIdx} />
              </Section>
              <Section title="Equipment & Cargo Shipments" icon={ArrowUpDown} color="#9B7AB4"
                badge={comp.equipmentShipments.length}>
                <ShipmentSection compIdx={compIdx} />
              </Section>
              <Section title="Earthwork Equipment" icon={Calculator} color="#F5C518"
                badge={comp.earthwork.volumeCY > 0 ? 1 : 0}>
                <EarthworkSection compIdx={compIdx} />
              </Section>
              <Section title="Well Drilling" icon={Calculator} color="#D4654A"
                badge={comp.wells.length}>
                <DrillingSection compIdx={compIdx} />
              </Section>
              <Section title="Pumps & Generators" icon={Zap} color="#E8A317"
                badge={comp.pumps.length + comp.generators.length}>
                <PumpsSection compIdx={compIdx} />
              </Section>
              <Section title="Electric Pumps & Treatment Systems" icon={Zap} color="#4CAF50"
                badge={(comp.electricPumps?.length ?? 0)}>
                <ElectricPumpsSection compIdx={compIdx} />
              </Section>
              <Section title="Electricity Consumption" icon={Zap} color="#4CAF50"
                badge={comp.electricItems.length}>
                <ElectricSection compIdx={compIdx} />
              </Section>
              <Section title="Residual Handling" icon={Trash2} color="#607D8B"
                badge={comp.residuals.length}>
                <ResidualSection compIdx={compIdx} />
              </Section>

              {/* Component result mini-summary */}
              {compResult && (
                <div style={{
                  marginTop: 12, padding: '12px 16px',
                  background: `${color}08`, border: `1px solid ${color}20`, borderRadius: 8,
                }}>
                  <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color,
                    letterSpacing: '0.06em', marginBottom: 10 }}>COMPONENT {compIdx + 1} TOTALS</div>
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    {[
                      { l: 'MT CO₂e', v: fmtMT(compResult.total.co2e) },
                      { l: 'MMBTU', v: fmtMmbtu(compResult.total.energy_mmbtu) },
                      { l: 'MT NOx', v: fmtMT(compResult.total.nox) },
                      { l: 'MT SOx', v: fmtMT(compResult.total.sox) },
                      { l: 'MT PM10', v: fmtMT(compResult.total.pm10) },
                    ].map(({ l, v }) => (
                      <div key={l} style={{ textAlign: 'center' }}>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 16, fontWeight: 700, color }}>{v}</div>
                        <div style={{ fontSize: 9, color: 'var(--smoke)' }}>{l}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Reductions Panel ─────────────────────────────────────────────────────────
function ReductionsPanel() {
  const reductions = useSiteWise(s => s.reductions);
  const setR       = useSiteWise(s => s.setReduction);

  return (
    <div style={{
      border: '1px solid rgba(76,175,80,0.3)', borderRadius: 12,
      background: 'rgba(76,175,80,0.04)', padding: '18px',
      marginBottom: 12,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
        <Leaf size={16} color="#4CAF50" />
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15,
          color: 'var(--bone)' }}>Footprint Reduction Measures</span>
        <InfoTip text="DER-31 §3.4: Applicants should identify feasible reduction measures. These are subtracted from the gross project footprint." />
      </div>
      <p style={{ margin: '0 0 16px', fontSize: 12, color: 'var(--smoke)', lineHeight: 1.6 }}>
        Optional measures that reduce the project's net environmental footprint. Applicable measures
        are documented in the RAWP GSR section and can demonstrate BMP implementation.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Row label="On-site Solar (kW installed)" hint="~4.5 peak hrs/day">
          <NumInput value={reductions.solarKw} onChange={v => setR({ solarKw: v })} />
        </Row>
        <Row label="On-site Wind (kW installed)" hint="~25% capacity factor">
          <NumInput value={reductions.windKw} onChange={v => setR({ windKw: v })} />
        </Row>
        <Row label="Methane Capture (scf/day)" hint="landfill gas or wellhead">
          <NumInput value={reductions.methaneCaptureScfD} onChange={v => setR({ methaneCaptureScfD: v })} />
        </Row>
        <Row label="DOC Driving Reduction (%)" hint="carpooling, remote work">
          <NumInput value={reductions.docReductionPct} min={0} onChange={v => setR({ docReductionPct: Math.min(v, 100) })} />
        </Row>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 8 }}>
        <button
          onClick={() => setR({ vfdInstalled: !reductions.vfdInstalled })}
          style={{
            background: reductions.vfdInstalled ? 'rgba(150,161,83,0.12)' : 'rgba(84,48,26,0.04)',
            border: `1px solid ${reductions.vfdInstalled ? 'rgba(150,161,83,0.40)' : '#cbbba0'}`,
            borderRadius: 6, padding: '6px 14px', cursor: 'pointer',
            fontSize: 12, fontFamily: 'var(--font-mono)',
            color: reductions.vfdInstalled ? '#4CAF50' : 'var(--smoke)',
          }}
        >
          {reductions.vfdInstalled ? '✓' : '○'} Variable Frequency Drive (VFD) — saves ~20% pump energy
        </button>
      </div>
    </div>
  );
}

// ─── Results Panel ────────────────────────────────────────────────────────────
function ResultsPanel({ results }) {
  if (!results) return null;
  const { netTotal, grossTotal, reductionRow, componentResults, flags, significant, thresholds } = results;

  const BREAKDOWN_ROWS = [
    { key: 'materialProduction', label: 'Material Production' },
    { key: 'transportation',     label: 'Transportation' },
    { key: 'equipmentUse',       label: 'Equipment Use' },
    { key: 'residualHandling',   label: 'Residual Handling' },
  ];

  return (
    <div>
      {/* DER-31 significance banner */}
      <div style={{
        padding: '12px 18px', borderRadius: 10, marginBottom: 16,
        background: significant ? 'rgba(229,57,53,0.08)' : 'rgba(150,161,83,0.08)',
        border: `1px solid ${significant ? 'rgba(229,57,53,0.3)' : 'rgba(76,175,80,0.3)'}`,
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        {significant
          ? <AlertTriangle size={16} color="#ef5350" />
          : <CheckCircle size={16} color="#4CAF50" />}
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13,
            color: significant ? '#ef5350' : '#4CAF50' }}>
            {significant ? 'Significant Footprint — Full GSR Analysis Required' : 'Below Significance Thresholds — Simplified Analysis Acceptable'}
          </div>
          <div style={{ fontSize: 11, color: 'var(--smoke)', marginTop: 2 }}>
            DER-31 Table 3-1: &gt;100 MT CO₂e · &gt;0.1 MT NOx/SOx/PM10 · &gt;10,000 MMBTU
          </div>
        </div>
      </div>

      {/* Net total metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8, marginBottom: 16 }}>
        <MetricCell label="Net CO₂e" value={fmtMT(netTotal.co2e)} unit="MT" color="#F5C518" flag={flags.co2e} />
        <MetricCell label="Energy" value={fmtMmbtu(netTotal.energy_mmbtu)} unit="MMBTU" color="#E8A317" flag={flags.mmbtu} />
        <MetricCell label="NOx" value={fmtMT(netTotal.nox)} unit="MT" color="#4CAF50" flag={flags.nox} />
        <MetricCell label="SOx" value={fmtMT(netTotal.sox)} unit="MT" color="#9B7AB4" flag={flags.sox} />
        <MetricCell label="PM10" value={fmtMT(netTotal.pm10)} unit="MT" color="#5B7B9A" flag={flags.pm10} />
      </div>

      {/* Gross vs Net */}
      {(reductionRow.co2e < 0) && (
        <div style={{
          display: 'flex', gap: 12, marginBottom: 16,
          padding: '10px 14px', background: 'rgba(76,175,80,0.05)',
          border: '1px solid rgba(150,161,83,0.12)', borderRadius: 8,
        }}>
          <div>
            <div style={{ fontSize: 10, color: 'var(--smoke)' }}>Gross CO₂e</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 14, color: 'var(--bone)' }}>
              {fmtMT(grossTotal.co2e)} MT
            </div>
          </div>
          <div style={{ color: 'var(--smoke)', alignSelf: 'center' }}>−</div>
          <div>
            <div style={{ fontSize: 10, color: 'var(--smoke)' }}>Reductions</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 14, color: '#4CAF50' }}>
              {fmtMT(Math.abs(reductionRow.co2e))} MT
            </div>
          </div>
          <div style={{ color: 'var(--smoke)', alignSelf: 'center' }}>=</div>
          <div>
            <div style={{ fontSize: 10, color: 'var(--smoke)' }}>Net CO₂e</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 14, color: '#F5C518' }}>
              {fmtMT(netTotal.co2e)} MT
            </div>
          </div>
        </div>
      )}

      {/* Component breakdown table */}
      <div style={{
        border: '1px solid var(--ie-border)', borderRadius: 10,
        overflow: 'hidden', marginBottom: 16,
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '180px repeat(5, 1fr)',
          background: 'rgba(84,48,26,0.04)',
          padding: '8px 12px',
          borderBottom: '1px solid var(--ie-border)',
        }}>
          {['Component', 'CO₂e (MT)', 'MMBTU', 'NOx (MT)', 'SOx (MT)', 'PM10 (MT)'].map(h => (
            <div key={h} style={{ fontSize: 10, fontFamily: 'var(--font-mono)',
              color: 'var(--smoke)', letterSpacing: '0.05em' }}>{h}</div>
          ))}
        </div>
        {componentResults.map((cr, idx) => (
          <div key={idx} style={{
            display: 'grid',
            gridTemplateColumns: '180px repeat(5, 1fr)',
            padding: '8px 12px',
            borderBottom: '1px solid rgba(84,48,26,0.04)',
            background: idx % 2 === 0 ? 'transparent' : 'rgba(84,48,26,0.01)',
          }}>
            <div style={{ fontSize: 12, color: COMP_COLORS[idx], fontFamily: 'var(--font-display)', fontWeight: 600 }}>
              {cr.label.split(' — ')[0]}
            </div>
            {[fmtMT(cr.total.co2e), fmtMmbtu(cr.total.energy_mmbtu),
              fmtMT(cr.total.nox), fmtMT(cr.total.sox), fmtMT(cr.total.pm10)].map((v, i) => (
              <div key={i} style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--bone)' }}>{v}</div>
            ))}
          </div>
        ))}
        {/* Totals row */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '180px repeat(5, 1fr)',
          padding: '10px 12px',
          background: 'rgba(189,86,45,0.05)',
          borderTop: '1px solid rgba(189,86,45,0.20)',
        }}>
          <div style={{ fontSize: 12, fontFamily: 'var(--font-display)', fontWeight: 700, color: '#F5C518' }}>
            NET TOTAL
          </div>
          {[fmtMT(netTotal.co2e), fmtMmbtu(netTotal.energy_mmbtu),
            fmtMT(netTotal.nox), fmtMT(netTotal.sox), fmtMT(netTotal.pm10)].map((v, i) => (
            <div key={i} style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 700, color: '#F5C518' }}>{v}</div>
          ))}
        </div>
      </div>

      {/* Section breakdown for first component */}
      {componentResults[0] && (
        <div style={{ marginBottom: 8 }}>
          <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--smoke)',
            letterSpacing: '0.06em', marginBottom: 8 }}>COMPONENT 1 — SECTION BREAKDOWN</div>
          <div style={{
            border: '1px solid var(--ie-border)', borderRadius: 8, overflow: 'hidden',
          }}>
            {BREAKDOWN_ROWS.map(({ key, label }) => {
              const r = componentResults[0].subtotals[key];
              if (!r) return null;
              const pct = componentResults[0].total.co2e > 0
                ? (r.co2e / componentResults[0].total.co2e * 100) : 0;
              return (
                <div key={key} style={{
                  display: 'grid', gridTemplateColumns: '160px 1fr 80px',
                  padding: '7px 12px', borderBottom: '1px solid rgba(84,48,26,0.04)',
                  alignItems: 'center', gap: 12,
                }}>
                  <div style={{ fontSize: 11, color: 'var(--bone)' }}>{label}</div>
                  <div style={{ height: 6, background: 'rgba(84,48,26,0.05)', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ width: `${Math.max(0, Math.min(100, pct))}%`, height: '100%',
                      background: '#5B7B9A', borderRadius: 3, transition: 'width 0.5s' }} />
                  </div>
                  <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--smoke)', textAlign: 'right' }}>
                    {fmtMT(r.co2e)} MT
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function SiteWiseCalculator() {
  const project       = useGSR(s => s.project);
  const projectState  = useSiteWise(s => s.projectState);
  const setPS         = useSiteWise(s => s.setProjectState);
  const components    = useSiteWise(s => s.components);
  const reductions    = useSiteWise(s => s.reductions);
  const results       = useSiteWise(s => s.results);
  const setResults    = useSiteWise(s => s.setResults);
  const resetSW       = useSiteWise(s => s.resetSiteWise);
  const [activeTab, setActiveTab] = useState('inputs');  // 'inputs' | 'results'
  const [calcError, setCalcError] = useState(null);

  function runCalc() {
    try {
      const r = calcProjectSiteWise(
        components.filter(c => c.enabled),
        reductions,
        projectState,
      );
      setResults(r);
      setActiveTab('results');
      setCalcError(null);
    } catch (err) {
      setCalcError(err.message);
    }
  }

  async function handleExport() {
    if (!results) { alert('Please calculate first.'); return; }
    await exportSiteWisePDF({ project, components, reductions, results, projectState });
  }

  const stateOpts = Object.keys({ NY: 1, NJ: 1, CT: 1, PA: 1, MA: 1, VT: 1, NH: 1, ME: 1, RI: 1,
    AK:1,AL:1,AR:1,AZ:1,CA:1,CO:1,DC:1,DE:1,FL:1,GA:1,HI:1,IA:1,ID:1,IL:1,IN:1,KS:1,KY:1,LA:1,
    MD:1,MI:1,MN:1,MO:1,MS:1,MT:1,NC:1,ND:1,NE:1,NM:1,NV:1,OH:1,OK:1,OR:1,SC:1,SD:1,TN:1,TX:1,
    UT:1,VA:1,WA:1,WI:1,WV:1,WY:1,'US Average':1 });

  return (
    <div>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'flex-start', gap: 16,
        marginBottom: 24, flexWrap: 'wrap',
      }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <Calculator size={16} color="var(--sunbeam)" />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--smoke)',
              letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              EPA SiteWise™ v3.2 · DER-31 §3 Footprint Analysis
            </span>
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800,
            color: 'var(--bone)', margin: '0 0 6px', letterSpacing: '-0.02em' }}>
            Environmental Footprint Calculator
          </h1>
          <p style={{ margin: 0, fontSize: 13, color: 'var(--smoke)', lineHeight: 1.6, maxWidth: 640 }}>
            Calculate GHG emissions, energy use, and criteria pollutants for up to 4 remedial phases.
            Replicates the EPA/Battelle SiteWise™ v3.2 methodology required by NYSDEC DER-31 for
            BCP sites with significant environmental footprints.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 11, color: 'var(--smoke)', fontFamily: 'var(--font-mono)' }}>State:</span>
            <SelectInput
              value={projectState}
              onChange={setPS}
              options={Object.keys(stateOpts).map(k => ({ value: k, label: k }))}
              style={{ width: 120 }}
            />
          </div>
          <button
            onClick={runCalc}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'var(--sunbeam)', color: '#ffffff',
              border: 'none', borderRadius: 8, padding: '10px 20px',
              cursor: 'pointer', fontFamily: 'var(--font-display)',
              fontWeight: 700, fontSize: 14,
            }}
          >
            <BarChart3 size={15} /> Calculate Footprint
          </button>
          {results && (
            <button onClick={handleExport} style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'rgba(84,48,26,0.05)', border: '1px solid var(--ie-border)',
              borderRadius: 8, padding: '10px 18px', cursor: 'pointer',
              color: 'var(--bone)', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 13,
            }}>
              <Download size={14} /> Export PDF
            </button>
          )}
          <button onClick={resetSW} style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: 'transparent', border: '1px solid var(--ie-border)',
            borderRadius: 8, padding: '10px 14px', cursor: 'pointer',
            color: 'var(--smoke)', fontSize: 12,
          }}>
            <RefreshCw size={13} /> Reset
          </button>
        </div>
      </div>

      {calcError && (
        <div style={{
          padding: '10px 16px', marginBottom: 16,
          background: 'rgba(229,57,53,0.1)', border: '1px solid rgba(229,57,53,0.3)',
          borderRadius: 8, color: '#ef5350', fontSize: 12,
        }}>
          Calculation error: {calcError}
        </div>
      )}

      <ModuleGuide
        purpose="The SiteWise™ Calculator is the EPA/Battelle-developed environmental footprint tool required by NYSDEC DER-31 §3 for all BCP projects. It quantifies greenhouse gas emissions (CO₂e), total energy (MMBTU), and criteria air pollutants (NOx, SOx, PM10) across up to four remedial phases using lifecycle emission factors for materials, vehicles, equipment, electricity, and waste. Results determine whether your project exceeds DER-31 significance thresholds — which triggers a full GSR analysis requirement — and feed directly into the RAWP Builder and FER Tracker."
        regulation="EPA SiteWise™ v3.2 (Battelle 2018) · DER-31 §3 · 6 NYCRR Part 375-1.9(e)"
        outcome="Net project footprint (MT CO₂e, MMBTU, NOx, SOx, PM10) + significance determination + PDF report"
        steps={[
          { title: 'Set your state (electricity grid)', detail: 'The state selector at top right sets the electricity emission factor for all components. For NY projects, keep this as NY — the NY grid (667 lb CO₂/MWh) is significantly cleaner than the US average (1,353 lb CO₂/MWh), so this matters.' },
          { title: 'Enable only the phases that apply', detail: 'Each of the four components maps to a remedial phase: Remedial Investigation, Remedial Design, Remedial Action, and O&M/Monitoring. Disable any phases that are not part of your project scope by clicking the ENABLED/DISABLED toggle inside each component.' },
          { title: 'Fill in each input category', detail: 'Expand the accordion sections within each component and enter data for what applies: Materials (kg of each material used), Personnel trips, Equipment shipments, Earthwork volume (CY), Well drilling, Pumps and generators (HP + hours), Grid electricity (kWh), and Residuals (tons transported to disposal). Skip sections that don\'t apply — leaving them at zero is correct.' },
          { title: 'Let earthwork auto-select equipment', detail: 'Just enter the total excavation volume in cubic yards. The calculator selects the appropriate equipment from SiteWise™ Table 3b based on volume — a 500 CY excavation gets a different machine than a 50,000 CY excavation. The auto-selected equipment name and rates are shown for your verification.' },
          { title: 'Add footprint reduction measures', detail: 'The Footprint Reduction Measures panel (below the four components) lets you subtract on-site solar, wind, methane capture, driving reductions, and VFDs from the gross total. These are the measures that also belong in your BMP selection.' },
          { title: 'Calculate and review results', detail: 'Click the Calculate Footprint button to run all calculations. Switch to the Results & Summary tab to see net totals, the component breakdown table, and the significance determination. Red values exceed DER-31 thresholds.' },
          { title: 'Export the PDF report', detail: 'Click Export PDF to generate a formatted GSR Footprint Summary document with cover page, project info, component tables, reduction measures, certification block, and references. This PDF can be submitted as an appendix to the RAWP or used for the FER.' },
        ]}
        tips={[
          'Not sure what units to use for materials? SiteWise™ uses kilograms (kg) throughout. 1 ton (short) = 907 kg. 1 55-gallon drum of liquid ≈ 208 kg.',
          'Significance thresholds (DER-31 Table 3-1): >100 MT CO₂e OR >0.1 MT NOx/SOx/PM10 OR >10,000 MMBTU triggers full GSR analysis. If below all thresholds, a simplified screening statement in the RAWP is sufficient.',
          'For the Remedial Investigation component, the biggest contributors are typically personnel transportation and drilling. For Remedial Action, earthwork and residual handling dominate.',
          'Direct Push drilling (0.8 gal/hr) uses ~31x less fuel than Air Rotary (25 gal/hr). Where technically feasible, direct push is a high-impact BMP for RI projects.',
          'The NY electricity grid factor (667 lb CO₂/MWh) reflects the significant contribution of nuclear and hydro in NY — electric-powered treatment systems have a much lower footprint in NY than in coal-heavy states like WV (2,182 lb CO₂/MWh).',
        ]}
      />

      {/* Tab nav */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 16 }}>
        {[
          { id: 'inputs',  label: 'Data Entry', icon: Calculator },
          { id: 'results', label: 'Results & Summary', icon: BarChart3 },
        ].map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setActiveTab(id)} style={{
            display: 'inline-flex', alignItems: 'center', gap: 7,
            background: activeTab === id ? 'rgba(189,86,45,0.10)' : 'transparent',
            border: `1px solid ${activeTab === id ? 'rgba(189,86,45,0.40)' : '#cbbba0'}`,
            borderRadius: 8, padding: '8px 16px', cursor: 'pointer',
            color: activeTab === id ? 'var(--sunbeam)' : 'var(--smoke)',
            fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 13,
          }}>
            <Icon size={13} /> {label}
            {id === 'results' && results && (
              <span style={{
                marginLeft: 4, background: 'rgba(189,86,45,0.20)',
                borderRadius: 10, padding: '1px 7px',
                fontSize: 10, fontFamily: 'var(--font-mono)',
              }}>
                {results.significant ? '⚠ Significant' : '✓ OK'}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'inputs' && (
        <div>
          {[0, 1, 2, 3].map(idx => (
            <ComponentPanel key={idx} compIdx={idx} />
          ))}
          <ReductionsPanel />
        </div>
      )}

      {activeTab === 'results' && (
        <div>
          {results
            ? <ResultsPanel results={results} />
            : (
              <div style={{
                padding: '48px', textAlign: 'center',
                border: '1px dashed #cbbba0', borderRadius: 12,
              }}>
                <BarChart3 size={32} color="var(--smoke)" style={{ marginBottom: 12 }} />
                <p style={{ color: 'var(--smoke)', fontSize: 13, margin: 0 }}>
                  Enter data in the Data Entry tab, then click <strong>Calculate Footprint</strong> to see results.
                </p>
              </div>
            )}
        </div>
      )}

      {/* Regulatory footer */}
      <div style={{
        marginTop: 24, padding: '12px 18px',
        background: 'rgba(84,48,26,0.02)', border: '1px solid rgba(84,48,26,0.04)',
        borderRadius: 8, fontSize: 10, color: 'rgba(107,107,107,0.7)',
        fontFamily: 'var(--font-mono)', letterSpacing: '0.05em',
        display: 'flex', gap: 16, flexWrap: 'wrap',
      }}>
        <span>EPA SITEWISE™ V3.2 · BATTELLE 2018</span>
        <span>NYSDEC DER-31 (2025) §3</span>
        <span>6 NYCRR PART 375-1.9(e)</span>
        <span>GWP: N₂O=310 · CH₄=21 (IPCC AR2)</span>
        <span>State electricity: EPA eGRID 2018</span>
      </div>
    </div>
  );
}
