"use client";
import { useState, useEffect, useRef, useCallback } from "react";

/* ─── Config ─────────────────────────────────────────────────────────────── */
const API      = "http://localhost:8000";
const MAX_STEP = 9;
const NOW_REF  = typeof window !== "undefined" ? Date.now() : 0;

/* ─── Colors ─────────────────────────────────────────────────────────────── */
const C = {
  red: "#f87171", orange: "#fb923c", purple: "#a78bfa", blue: "#38bdf8",
  green: "#34d399", amber: "#fbbf24", cyan: "#22d3ee", teal: "#5eead4",
} as const;
type CK = keyof typeof C;

/* ─── Hooks ──────────────────────────────────────────────────────────────── */
function useTick(ms = 1000) {
  const [, set] = useState(0);
  useEffect(() => { const id = setInterval(() => set(x => x + 1), ms); return () => clearInterval(id); }, [ms]);
}
function useAnim() {
  const [t, set] = useState(0);
  useEffect(() => {
    let raf: number;
    const start = performance.now();
    const loop = (now: number) => { set((now - start) / 1000); raf = requestAnimationFrame(loop); };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);
  return t;
}
function fmtMMSS(sec: number) {
  const s = Math.max(0, Math.floor(sec));
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}
function fmtETA(sec: number) {
  const s = Math.max(0, Math.floor(sec));
  const m = Math.floor(s / 60);
  return m === 0 ? `${s}s` : `${m}m ${String(s % 60).padStart(2, "0")}s`;
}

/* ─── Static design data ─────────────────────────────────────────────────── */
const DESIGN_INCIDENTS = [
  { id: "INC-4821", kind: "collision", color: "red"    as CK, label: "Multi-vehicle collision",  loc: "Marshall Ave @ 14th",       x: 640, y: 340, severity: 5, startedAgo: 247,  units: ["EMS-07","FD-12","PD-3"],  priority: "P1", victims: 3, trend: "+2" },
  { id: "INC-4822", kind: "fire",      color: "orange" as CK, label: "Structure fire · 4-alarm", loc: "Harper Ridge Apts, bldg C", x: 370, y: 230, severity: 4, startedAgo: 612,  units: ["FD-04","FD-08","EMS-11"], priority: "P1", victims: 0, trend: "=" },
  { id: "INC-4823", kind: "cardiac",   color: "purple" as CK, label: "Cardiac arrest · CPR",     loc: "88 Chambers St, Apt 4C",    x: 820, y: 500, severity: 4, startedAgo: 94,   units: ["EMS-02"],                 priority: "P1", victims: 1, trend: "−" },
  { id: "INC-4824", kind: "water",     color: "blue"   as CK, label: "Water main rupture",       loc: "Lexington & 22nd",          x: 230, y: 560, severity: 2, startedAgo: 1842, units: ["DPW-3"],                  priority: "P3", victims: 0, trend: "=" },
  { id: "INC-4825", kind: "collision", color: "red"    as CK, label: "Pedestrian struck",        loc: "River Rd near pier 9",      x: 1000, y: 590, severity: 3, startedAgo: 380, units: ["EMS-05","PD-7"],          priority: "P2", victims: 1, trend: "=" },
  { id: "INC-4826", kind: "cardiac",   color: "purple" as CK, label: "Respiratory distress",     loc: "PS 217 — nurse office",     x: 280, y: 370, severity: 3, startedAgo: 62,  units: ["EMS-14"],                 priority: "P2", victims: 1, trend: "=" },
];

const FACILITIES = [
  { t: "H", name: "St. Marian Hospital", x: 720, y: 260, kind: "hospital", cap: "ED 82%" },
  { t: "H", name: "Eastside Medical",    x: 980, y: 430, kind: "hospital", cap: "ED 47%" },
  { t: "H", name: "Northside Mem.",      x: 160, y: 190, kind: "hospital", cap: "ED 68%" },
  { t: "S", name: "P.S. 217",            x: 300, y: 360, kind: "school",   cap: undefined },
  { t: "S", name: "Lincoln Middle",      x: 830, y: 610, kind: "school",   cap: undefined },
  { t: "L", name: "Central Library",     x: 530, y: 440, kind: "library",  cap: undefined },
  { t: "C", name: "Civic Center",        x: 565, y: 180, kind: "civic",    cap: undefined },
  { t: "F", name: "Firehouse 4",         x: 420, y: 160, kind: "fire",     cap: undefined },
  { t: "F", name: "Firehouse 12",        x: 690, y: 560, kind: "fire",     cap: undefined },
  { t: "P", name: "12th Precinct",       x: 460, y: 540, kind: "police",   cap: undefined },
  { t: "E", name: "W Substation",        x: 110, y: 380, kind: "energy",   cap: undefined },
];

const ROUTES = [
  { id: "r1", color: "red"    as CK, progress: 0.62, points: [[160,580],[280,580],[280,450],[450,450],[450,340],[640,340]] as [number,number][] },
  { id: "r2", color: "orange" as CK, progress: 0.98, points: [[420,160],[420,230],[370,230]] as [number,number][] },
  { id: "r3", color: "purple" as CK, progress: 0.42, points: [[820,500],[900,500],[900,430],[980,430]] as [number,number][] },
  { id: "r4", color: "blue"   as CK, progress: 0.85, points: [[80,520],[160,520],[230,560]] as [number,number][] },
  { id: "r5", color: "red"    as CK, progress: 0.32, points: [[1000,590],[1020,590],[1020,470],[980,430]] as [number,number][] },
  { id: "r6", color: "orange" as CK, progress: 0.55, points: [[690,560],[580,560],[580,380],[460,380],[460,260],[370,230]] as [number,number][] },
  { id: "r7", color: "purple" as CK, progress: 0.76, points: [[100,420],[180,420],[180,370],[280,370]] as [number,number][] },
];

const FLEET_DATA = [
  { id: "EMS-07", kind: "ambulance", dest: "INC-4821",    eta: 142, status: "enroute",   crew: 2, fuel: 68 },
  { id: "EMS-02", kind: "ambulance", dest: "Eastside Med", eta: 220, status: "transport", crew: 2, fuel: 54 },
  { id: "EMS-05", kind: "ambulance", dest: "Eastside Med", eta: 180, status: "transport", crew: 2, fuel: 41 },
  { id: "EMS-11", kind: "ambulance", dest: "INC-4822",    eta: 95,  status: "enroute",   crew: 2, fuel: 73 },
  { id: "EMS-14", kind: "ambulance", dest: "INC-4826",    eta: 38,  status: "enroute",   crew: 2, fuel: 88 },
  { id: "FD-04",  kind: "engine",    dest: "INC-4822",    eta: 14,  status: "onscene",   crew: 5, fuel: 62 },
  { id: "FD-08",  kind: "engine",    dest: "INC-4822",    eta: 167, status: "enroute",   crew: 4, fuel: 59 },
  { id: "FD-12",  kind: "engine",    dest: "INC-4821",    eta: 210, status: "enroute",   crew: 5, fuel: 77 },
  { id: "PD-03",  kind: "police",    dest: "INC-4821",    eta: 44,  status: "onscene",   crew: 2, fuel: 51 },
  { id: "PD-07",  kind: "police",    dest: "INC-4825",    eta: 0,   status: "onscene",   crew: 2, fuel: 63 },
];

const RISK_DOMAINS = [
  { key: "Traffic",         value: 74, color: "red"    as CK, d15: "+8",  hist: [45,52,58,61,66,68,70,74] },
  { key: "Air Quality",     value: 61, color: "amber"  as CK, d15: "+4",  hist: [38,41,45,48,52,55,58,61] },
  { key: "Emergency Delay", value: 42, color: "purple" as CK, d15: "−3",  hist: [55,52,48,47,45,44,43,42] },
  { key: "Energy Strain",   value: 28, color: "green"  as CK, d15: "+1",  hist: [22,24,25,26,27,27,28,28] },
  { key: "Crime Pattern",   value: 36, color: "blue"   as CK, d15: "=",   hist: [34,35,35,36,36,36,36,36] },
];

const AI_ACTIONS = [
  { n: 1, title: "Preempt signals on Marshall corridor",       confidence: 97, impact: "high", autopilot: true,
    rationale: "EMS-07 enroute to multi-vehicle collision. 6 intersections between origin and scene. Opposing queues low. Clears lane without cascading delay.",
    chips: [{k:"ETA",v:"−2:14"},{k:"Queue",v:"−38%"},{k:"Safety",v:"+"}], source: "Traffic · EMS · Signal-net" },
  { n: 2, title: "Divert westbound 14th to 16th via Prospect", confidence: 91, impact: "med", autopilot: false,
    rationale: "Collision will block 2 of 3 westbound lanes for ~45 min. Prospect has 22% spare capacity. Expected cascade to Broadway avoided.",
    chips: [{k:"Delay",v:"−11 min"},{k:"Reroute",v:"1,420 veh"}], source: "Traffic sim · SUMO-17" },
  { n: 3, title: "Trigger AQI shelter advisory — Sector 4",    confidence: 88, impact: "high", autopilot: false,
    rationale: "Harper Ridge plume forecasted to drift SE. PM2.5 > 180 within 18 min. 2 schools and 1 senior facility downwind.",
    chips: [{k:"Exposure",v:"−63%"},{k:"Reach",v:"8.4k res."}], source: "Air · Wx · Pop-density" },
  { n: 4, title: "Pre-position FD-08 at Station 11",           confidence: 79, impact: "med", autopilot: false,
    rationale: "Wind + dry-fuel model elevates ignition risk in Ridgeview. Coverage gap opens once FD-04 committed. Station 11 restores 94% response envelope.",
    chips: [{k:"Coverage",v:"+12%"},{k:"Cost",v:"low"}], source: "Fire · Wx · Dispatch-opt" },
  { n: 5, title: "Shift 2.4 MW grid load — industrial W",      confidence: 72, impact: "low", autopilot: false,
    rationale: "HVAC surge projected 16:40–17:20. West substation at 88%. Shiftable industrial load identified, no production impact.",
    chips: [{k:"Load",v:"−2.4 MW"},{k:"Risk",v:"nominal"}], source: "Energy · Demand-forecast" },
];

const METRICS_DATA = [
  { label: "Ambulance ETA reduction", value: 24,  unit: "%",  accent: "green"  as CK, delta: "+3.1 pts",         sub: "weighted · P1 calls",      spark: [18,19,20,21,21,22,23,23,24,24], cmp: "vs 30d baseline", cmpVal: "20.9%" },
  { label: "Traffic queue reduction", value: 31,  unit: "%",  accent: "blue"   as CK, delta: "peak corridor avg", sub: "17 arterials monitored",    spark: [8,10,14,18,22,26,28,29,30,31],  cmp: "vs untreated sim", cmpVal: "0%" },
  { label: "AQI exposure reduction",  value: 48,  unit: "%",  accent: "amber"  as CK, delta: "sector 4 advisory", sub: "8,400 residents",           spark: [0,0,0,12,22,30,38,42,46,48],   cmp: "est. avoided",    cmpVal: "4,032 PEH" },
  { label: "Energy load shifted",     value: 2.4, unit: "MW", accent: "purple" as CK, delta: "shiftable · no impact", sub: "W substation · 16:40", spark: [0,0,.2,.4,.8,1.2,1.6,2,2.2,2.4], cmp: "headroom restored", cmpVal: "14%" },
];

const COMMS = [
  { t: "16:42:08", s: "DISPATCH", msg: "EMS-07 signaling corridor preempt — Marshall 10→16",            c: "cyan"   as CK },
  { t: "16:41:52", s: "FD-04",    msg: "On scene Harper Ridge. Bldg C flashover. Requesting 2nd alarm.", c: "orange" as CK },
  { t: "16:41:40", s: "Atlas-7",  msg: "Divert recommendation issued → 14th W to 16th via Prospect.",   c: "blue"   as CK },
  { t: "16:41:18", s: "EMS-02",   msg: "Patient stable, ROSC achieved. Transport Eastside.",             c: "green"  as CK },
  { t: "16:40:55", s: "PD-03",    msg: "Two lanes blocked, northbound open. Witness on site.",           c: "blue"   as CK },
  { t: "16:40:32", s: "Atlas-7",  msg: "AQI threshold breach projected 18 min → shelter advisory.",      c: "amber"  as CK },
  { t: "16:39:47", s: "DPW-3",    msg: "Valve isolation complete. Pressure normalizing sector 6.",       c: "blue"   as CK },
  { t: "16:38:14", s: "DISPATCH", msg: "PD-07 arrival INC-4825. Pedestrian conscious, breathing.",       c: "cyan"   as CK },
];

const ANOMALIES = [
  { id: "AN-12", label: "Spike · 311 noise reports",        loc: "Sector 2 · NE", sev: "low",  at: "−3m"  },
  { id: "AN-13", label: "Camera offline · 14th/Marshall",   loc: "DOT-A41",       sev: "med",  at: "−6m"  },
  { id: "AN-14", label: "AQI sensor drift · Harper N",      loc: "AQS-088",       sev: "med",  at: "−12m" },
  { id: "AN-15", label: "Load anomaly · W-Sub feeder 3",    loc: "ENR-WS3",       sev: "high", at: "−18m" },
];

/* ─── Interactive crisis dispatch data ───────────────────────────────────── */
const CRISIS_TYPES = {
  medical:        { label: "Medical Emergency", icon: "🫀", color: "#a78bfa", vehicle: "ambulance",   urgency: 1.00 },
  gas_leak:       { label: "Gas Leak",          icon: "⚠️", color: "#fbbf24", vehicle: "fire_engine", urgency: 0.92 },
  fire:           { label: "Building Fire",     icon: "🔥", color: "#fb923c", vehicle: "fire_engine", urgency: 0.85 },
  collision:      { label: "Multi-car Crash",   icon: "🚗", color: "#f87171", vehicle: "ambulance",   urgency: 0.70 },
  flooding:       { label: "Flash Flooding",    icon: "🌊", color: "#67e8f9", vehicle: "utility",     urgency: 0.65 },
  infrastructure: { label: "Power Outage",      icon: "⚡", color: "#fde68a", vehicle: "utility",     urgency: 0.50 },
} as const;
type CrisisType = keyof typeof CRISIS_TYPES;

const ZONE_DISPATCH = {
  "zone-central":     { name: "Central Corridor",  sensitivity: 0.92, path: "M 160 580 L 160 340 L 640 340", x: 640, y: 340 },
  "zone-school-east": { name: "School District",   sensitivity: 0.95, path: "M 160 580 L 160 370 L 280 370", x: 280, y: 370 },
  "zone-downtown":    { name: "Downtown Core",     sensitivity: 0.62, path: "M 160 580 L 160 460 L 530 460 L 530 440", x: 530, y: 440 },
  "zone-civic":       { name: "Civic Center",      sensitivity: 0.55, path: "M 160 580 L 160 180 L 565 180", x: 565, y: 180 },
} as const;
type ZoneKey = keyof typeof ZONE_DISPATCH;

const TRANSIT_SECS = 11;
const RESOLVE_SECS = 12;
const FADE_SECS    = 2;

interface UserCrisis {
  id: string; type: CrisisType; zone: ZoneKey; severity: number;
  addedAt: number; status: "transit" | "on_scene" | "resolved";
  progress: number; unitId: string; aiScore: number;
}

function aiScore(type: CrisisType, zone: ZoneKey, severity: number, waitSecs: number): number {
  const urgency     = CRISIS_TYPES[type].urgency;
  const sensitivity = ZONE_DISPATCH[zone].sensitivity;
  const timePres    = Math.min(waitSecs / 120, 1);
  return Math.round(((severity / 5) * 0.35 + urgency * 0.30 + sensitivity * 0.20 + timePres * 0.15) * 100);
}

/* ─── API interfaces ─────────────────────────────────────────────────────── */
interface SimIncident {
  id: string; title: string; type: string; severity: number;
  road_segment_id: string; description?: string; status: string;
}
interface SimVehicle {
  id: string; current_status: string; destination_facility_id?: string;
  eta_minutes?: number; eta_delta_minutes?: number;
}
interface SimState {
  city_name: string; timestamp: string; mode: string; headline: string;
  active_incidents: SimIncident[];
  vehicles: SimVehicle[];
  domain_scores: Record<string, number>;
  summary_metrics: { city_risk_score: number; avg_congestion_index: number; avg_aqi: number; ambulance_eta_delta_minutes: number; public_building_strain_avg: number };
  recommendations: { id: string; title: string; action: string; priority: number; confidence: number; rationale: string; expected_benefits: string[] }[];
  impact_summary: { ambulance_eta_reduction_pct: number; queue_length_reduction_pct: number; exposure_reduction_pct: number; energy_shift_kw: number };
}

/* ─── Inline-style helpers ───────────────────────────────────────────────── */
const S = {
  mono:  { fontFamily: "'JetBrains Mono', ui-monospace, monospace", fontFeatureSettings: "'tnum' 1" } as React.CSSProperties,
  upper: { textTransform: "uppercase" as const, letterSpacing: "0.14em" },
  dim:   { color: "var(--ink-dim)" },
  mute:  { color: "var(--ink-mute)" } as React.CSSProperties,
};

/* ─── SVG Icons ──────────────────────────────────────────────────────────── */
function IconAmbulance({ color = "#f87171", size = 14 }: { color?: string; size?: number }) {
  return (
    <svg width={size} height={size * 0.72} viewBox="0 0 14 10">
      <rect x="0.5" y="1.5" width="9" height="6" fill="none" stroke={color} strokeWidth="1"/>
      <rect x="9.5" y="3" width="3.5" height="4.5" fill="none" stroke={color} strokeWidth="1"/>
      <circle cx="3" cy="8.5" r="1" fill={color}/><circle cx="10.5" cy="8.5" r="1" fill={color}/>
      <path d="M4 4.5h2M5 3.5v2" stroke={color} strokeWidth="0.8"/>
    </svg>
  );
}
function IconEngine({ color = "#fb923c", size = 14 }: { color?: string; size?: number }) {
  return (
    <svg width={size} height={size * 0.72} viewBox="0 0 14 10">
      <rect x="0.5" y="2" width="8" height="5.5" fill="none" stroke={color} strokeWidth="1"/>
      <rect x="8.5" y="3.5" width="4.5" height="4" fill="none" stroke={color} strokeWidth="1"/>
      <rect x="1.5" y="0.5" width="3" height="1.5" fill={color}/>
      <circle cx="3" cy="8.5" r="1" fill={color}/><circle cx="10.5" cy="8.5" r="1" fill={color}/>
    </svg>
  );
}
function IconPolice({ color = "#38bdf8", size = 14 }: { color?: string; size?: number }) {
  return (
    <svg width={size} height={size * 0.72} viewBox="0 0 14 10">
      <rect x="0.5" y="2.5" width="10" height="5" fill="none" stroke={color} strokeWidth="1"/>
      <path d="M2 2.5L3 0.5h5l1 2" fill="none" stroke={color} strokeWidth="1"/>
      <rect x="10.5" y="4" width="2.5" height="3" fill="none" stroke={color} strokeWidth="1"/>
      <circle cx="3" cy="8.5" r="1" fill={color}/><circle cx="8" cy="8.5" r="1" fill={color}/>
    </svg>
  );
}

/* ═══════════════════════════════ HEADER ═══════════════════════════════════ */
interface HeaderProps { riskScore: number; incidentCount: number; aqi: number; etaDelta: number; step: number; }
function Header({ riskScore, incidentCount, aqi, etaDelta, step }: HeaderProps) {
  useTick(1000);
  const now   = new Date();
  const time  = now.toLocaleTimeString("en-GB", { hour12: false });
  const date  = now.toLocaleDateString("en-US",  { weekday: "short", month: "short", day: "2-digit" });
  const level = riskScore > 80 ? "CRITICAL" : riskScore > 60 ? "ELEVATED" : riskScore > 40 ? "GUARDED" : "NORMAL";
  const riskTone: CK = riskScore > 80 ? "red" : riskScore > 60 ? "amber" : riskScore > 40 ? "blue" : "green";

  return (
    <header style={{
      position: "sticky", top: 0, zIndex: 30,
      background: "linear-gradient(180deg, #0a1a28 0%, #05101a 100%)",
      borderBottom: "1px solid var(--line-2)",
      boxShadow: "0 1px 0 rgba(56,189,248,0.08), 0 8px 24px rgba(0,0,0,0.4)",
      flexShrink: 0,
    }}>
      {/* Top row */}
      <div style={{ display: "grid", gridTemplateColumns: "auto 1fr auto", alignItems: "center", height: 64, padding: "0 16px", gap: 16 }}>
        {/* Brand */}
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{
            width: 46, height: 30, background: "linear-gradient(135deg, #5eead4 0%, #22d3ee 40%, #38bdf8 70%, #0284c7 100%)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#021018", fontWeight: 800, letterSpacing: "0.05em",
            ...S.mono, fontSize: 14,
            boxShadow: "0 0 0 1px #0891b2 inset, 0 0 20px rgba(34,211,238,0.4)",
            clipPath: "polygon(12% 0, 100% 0, 88% 100%, 0 100%)",
          }}>CS</div>
          <div style={{ lineHeight: 1.15, whiteSpace: "nowrap" }}>
            <div style={{ fontSize: 13, fontWeight: 600, letterSpacing: "0.03em" }}>CityShield AI</div>
            <div style={{ ...S.mono, ...S.upper, fontSize: 9.5, ...S.dim, marginTop: 2, letterSpacing: "0.1em" }}>
              Sector 4 · C.Reyes · <span style={{ color: "var(--cyan)" }}>v4.2.1</span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: "flex", alignItems: "stretch", justifyContent: "center", minWidth: 0 }}>
          <StatBlock label="City Risk"   value={level}          valueSub={`${riskScore} / 100`}    tone={riskTone} bar={riskScore} trend="▲4" />
          <StatBlock label="Incidents"   value={String(incidentCount)} valueSub="active · multi-type"   tone="red"    trend="▲2" />
          <StatBlock label="AQI"         value={String(aqi)}    valueSub="PM2.5 · SE"               tone="orange" trend="▲18" />
          <StatBlock label="ETA Δ"       value={etaDelta > 0 ? `+${etaDelta.toFixed(1)}m` : `−${Math.abs(etaDelta).toFixed(1)}m`} valueSub="vs baseline" tone="green" trend="▼" />
          <StatBlock label="Sim Step"    value={`${step}/${MAX_STEP}`} valueSub="scenario timeline" tone="purple" />
        </div>

        {/* Right: alert + sim + clock */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <AlertBadge level={level} />
          <SimPill />
          <div style={{ ...S.mono, textAlign: "right", lineHeight: 1.15 }}>
            <div style={{ fontSize: 14, fontWeight: 600, letterSpacing: "0.02em" }}>{time}</div>
            <div style={{ ...S.upper, fontSize: 9, ...S.dim, letterSpacing: "0.12em" }}>{date} · UTC−05</div>
          </div>
        </div>
      </div>

      {/* Sub-row: tabs + threat ribbon + Atlas-7 */}
      <div style={{
        display: "grid", gridTemplateColumns: "auto 1fr auto", alignItems: "center", gap: 14,
        borderTop: "1px solid var(--line)", height: 32, padding: "0 16px",
        background: "rgba(4,16,28,0.6)",
      }}>
        <div style={{ display: "flex" }}>
          {["Live","Forecast","Plays","Audit"].map((t, i) => (
            <button key={t} style={{
              background: i === 0 ? "rgba(34,211,238,0.1)" : "transparent",
              color: i === 0 ? "var(--cyan)" : "var(--ink-dim)",
              border: "1px solid var(--line-2)", borderRight: "none",
              padding: "4px 11px", ...S.mono, fontSize: 10, ...S.upper,
              fontWeight: i === 0 ? 700 : 500,
              boxShadow: i === 0 ? "inset 0 -2px 0 var(--cyan)" : "none", cursor: "pointer",
            }}>{t}</button>
          ))}
        </div>
        <ThreatRibbon />
        <AIThinking />
      </div>
    </header>
  );
}

function StatBlock({ label, value, valueSub, tone, bar, trend }: { label: string; value: string; valueSub: string; tone: CK; bar?: number; trend?: string }) {
  const col = C[tone];
  return (
    <div style={{ padding: "5px 12px", borderLeft: "1px solid var(--line)", minWidth: 0, width: 118, position: "relative" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <span style={{ ...S.mono, ...S.upper, fontSize: 9, ...S.dim, letterSpacing: "0.18em" }}>{label}</span>
        {trend && <span style={{ ...S.mono, fontSize: 9, color: trend.startsWith("▼") ? C.green : col, opacity: 0.85 }}>{trend}</span>}
      </div>
      <div style={{ ...S.mono, fontSize: 17, fontWeight: 700, color: col, lineHeight: 1.15, marginTop: 1, letterSpacing: "-0.01em" }}>{value}</div>
      <div style={{ ...S.mono, fontSize: 10, ...S.dim, marginTop: 1 }}>{valueSub}</div>
      {typeof bar === "number" && (
        <div style={{ marginTop: 5, height: 2, background: "#10283d", position: "relative" }}>
          <div style={{ position: "absolute", inset: 0, width: `${bar}%`, background: col, boxShadow: `0 0 6px ${col}` }} />
        </div>
      )}
    </div>
  );
}

function AlertBadge({ level }: { level: string }) {
  const map: Record<string, { c: CK; bg: string }> = {
    NORMAL:   { c: "green",  bg: "rgba(52,211,153,0.08)" },
    GUARDED:  { c: "blue",   bg: "rgba(56,189,248,0.08)" },
    ELEVATED: { c: "amber",  bg: "rgba(251,191,36,0.1)"  },
    CRITICAL: { c: "red",    bg: "rgba(248,113,113,0.12)"},
  };
  const m = map[level] ?? map.ELEVATED;
  const col = C[m.c];
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 8,
      background: m.bg, border: `1px solid ${col}`,
      boxShadow: `0 0 14px ${col}33, inset 0 0 0 1px ${col}22`,
      clipPath: "polygon(6px 0, 100% 0, calc(100% - 6px) 100%, 0 100%)",
      padding: "6px 16px 6px 14px",
    }}>
      <div style={{ position: "relative", width: 10, height: 10 }}>
        <span style={{ position: "absolute", inset: 0, borderRadius: "50%", background: col, animation: "pulse-ring 1.6s ease-out infinite" }} />
        <span style={{ position: "absolute", inset: 2, borderRadius: "50%", background: col, boxShadow: `0 0 8px ${col}` }} />
      </div>
      <span style={{ ...S.mono, ...S.upper, fontSize: 11, fontWeight: 700, color: col, letterSpacing: "0.2em" }}>{level}</span>
    </div>
  );
}

function SimPill() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 9px", border: "1px solid var(--line-2)", background: "rgba(251,191,36,0.05)" }}>
      <span style={{ width: 6, height: 6, background: "var(--amber)", display: "block", animation: "blink-hard 1.2s infinite" }} />
      <span style={{ ...S.mono, ...S.upper, fontSize: 10, color: "var(--amber)", letterSpacing: "0.16em", fontWeight: 700 }}>SIM</span>
      <span style={{ ...S.mono, ...S.upper, fontSize: 9.5, color: "var(--ink-2)", letterSpacing: "0.1em" }}>S-B14</span>
    </div>
  );
}

function ThreatRibbon() {
  const events = [
    { at: 0,  label: "NOW",     c: "cyan"   as CK | "mute" },
    { at: 4,  label: "FD alarm",c: "orange" as CK | "mute" },
    { at: 8,  label: "AQI",     c: "amber"  as CK | "mute" },
    { at: 14, label: "Shift",   c: "blue"   as CK | "mute" },
    { at: 22, label: "HVAC",    c: "purple" as CK | "mute" },
    { at: 30, label: "+30m",    c: "mute"   as CK | "mute" },
  ];
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
      <span style={{ ...S.mono, ...S.upper, fontSize: 9, ...S.dim, whiteSpace: "nowrap" }}>T+30m</span>
      <div style={{ flex: 1, position: "relative", height: 14, minWidth: 0 }}>
        <div style={{ position: "absolute", top: 6, left: 0, right: 0, height: 1, background: "var(--line-2)" }} />
        {events.map((e, i) => {
          const col = e.c === "mute" ? "var(--ink-mute)" : C[e.c as CK];
          const left = (e.at / 30) * 100;
          return (
            <div key={i} style={{ position: "absolute", left: `${left}%`, transform: "translateX(-50%)", top: -1 }}>
              <div style={{ width: e.at === 0 ? 9 : 6, height: e.at === 0 ? 9 : 6, background: col, margin: "0 auto", animation: e.at === 0 ? "soft-pulse 1.4s infinite" : "none" }} />
              <div style={{ ...S.mono, fontSize: 8.5, color: col, marginTop: 1, whiteSpace: "nowrap", transform: "translateX(-50%)", position: "absolute", left: "50%" }}>{e.label}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AIThinking() {
  const [dots, setDots] = useState(0);
  useEffect(() => { const id = setInterval(() => setDots(d => (d + 1) % 4), 450); return () => clearInterval(id); }, []);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, whiteSpace: "nowrap" }}>
      <span style={{ width: 5, height: 5, background: C.cyan, display: "block", boxShadow: `0 0 6px ${C.cyan}`, animation: "soft-pulse 1.2s infinite" }} />
      <span style={{ ...S.mono, ...S.upper, fontSize: 9.5, color: "var(--cyan)", letterSpacing: "0.14em", fontWeight: 700 }}>ATLAS-7</span>
      <span style={{ ...S.mono, fontSize: 9.5, ...S.dim }}>14 models{".".repeat(dots)}</span>
    </div>
  );
}

/* ═══════════════════════════════ LEFT RAIL ════════════════════════════════ */
interface LeftRailProps { step: number; maxStep: number; playing: boolean; onPlay: () => void; onPause: () => void; onSeek: (s: number) => void; }
function LeftRail({ step, maxStep, playing, onPlay, onPause, onSeek }: LeftRailProps) {
  return (
    <aside style={{ width: 260, background: "var(--surface)", borderRight: "1px solid var(--line)", display: "flex", flexDirection: "column", overflow: "hidden", minHeight: 0 }}>
      <RailPanel title="Scenario Clock">
        <ScenarioClock step={step} maxStep={maxStep} playing={playing} onPlay={onPlay} onPause={onPause} onSeek={onSeek} />
      </RailPanel>
      <RailPanel title="Weather + Wind">
        <WeatherPanel />
      </RailPanel>
      <RailPanel title="Comms Log" flex right={<span style={{ ...S.mono, fontSize: 9, ...S.dim }}>last 8m</span>}>
        <CommsLog />
      </RailPanel>
      <RailPanel title="Anomaly Feed" right={<span style={{ ...S.mono, fontSize: 9, color: C.amber }}>4 open</span>}>
        <AnomalyFeed />
      </RailPanel>
    </aside>
  );
}

function RailPanel({ title, right, children, flex }: { title: string; right?: React.ReactNode; children: React.ReactNode; flex?: boolean }) {
  return (
    <section style={{ display: "flex", flexDirection: "column", borderBottom: "1px solid var(--line)", minHeight: 0, flex: flex ? 1 : "none", overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", borderBottom: "1px solid var(--line)", background: "linear-gradient(90deg, rgba(34,211,238,0.04), transparent 50%)", flexShrink: 0 }}>
        <span style={{ width: 5, height: 5, background: "var(--cyan)", display: "block", boxShadow: "0 0 6px var(--cyan)" }} />
        <span style={{ ...S.mono, ...S.upper, fontSize: 10, fontWeight: 700, letterSpacing: "0.18em" }}>{title}</span>
        <span style={{ flex: 1 }} />
        {right}
      </div>
      <div style={{ overflow: "auto", minHeight: 0 }}>{children}</div>
    </section>
  );
}

function ScenarioClock({ step, maxStep, playing, onPlay, onPause, onSeek }: LeftRailProps) {
  useTick(1000);
  const pct = step / maxStep;
  const simTime = new Date(2026, 3, 22, 14, 5 + step * 3);
  const timeStr = simTime.toLocaleTimeString("en-GB", { hour12: false, hour: "2-digit", minute: "2-digit" });
  return (
    <div style={{ padding: "12px 14px" }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
        <div>
          <div style={{ ...S.mono, ...S.upper, fontSize: 9, ...S.dim, letterSpacing: "0.14em" }}>Sim Time</div>
          <div style={{ ...S.mono, fontSize: 22, fontWeight: 700, color: "var(--ink)", lineHeight: 1 }}>{timeStr}</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ ...S.mono, ...S.upper, fontSize: 9, ...S.dim }}>Step</div>
          <div style={{ ...S.mono, fontSize: 14, fontWeight: 600, color: "var(--ink-2)" }}>{step}/{maxStep}</div>
        </div>
      </div>
      <div style={{ position: "relative", height: 6, background: "#0f2336", marginTop: 12 }}>
        <div style={{ position: "absolute", inset: 0, width: `${pct * 100}%`, background: `linear-gradient(90deg, ${C.cyan}88, ${C.cyan})`, boxShadow: `0 0 8px ${C.cyan}66` }} />
        {[0.25, 0.5, 0.75].map((f, i) => (
          <div key={i} style={{ position: "absolute", left: `${f * 100}%`, top: -2, bottom: -2, width: 1, background: "var(--line-3)" }} />
        ))}
      </div>
      <div style={{ ...S.mono, display: "flex", justifyContent: "space-between", marginTop: 4, fontSize: 9, ...S.dim }}>
        <span>14:05</span><span>+15m</span><span>14:35</span>
      </div>
      <div style={{ display: "flex", gap: 4, marginTop: 10 }}>
        <button className="ghost" style={{ flex: 1 }} onClick={() => onSeek(0)}>◀◀</button>
        <button className="ghost" style={{ flex: 1 }} onClick={playing ? onPause : onPlay}>{playing ? "⏸" : "▶"}</button>
        <button className="ghost" style={{ flex: 1 }} onClick={() => onSeek(Math.min(step + 1, maxStep))}>▶▶</button>
      </div>
      {/* Step scrubber dots */}
      <div style={{ display: "flex", gap: 3, marginTop: 10, justifyContent: "center" }}>
        {Array.from({ length: maxStep + 1 }, (_, i) => (
          <div key={i} onClick={() => onSeek(i)} style={{
            width: 6, height: 6, borderRadius: "50%", cursor: "pointer",
            background: i <= step ? C.cyan : "var(--line-2)",
            boxShadow: i === step ? `0 0 6px ${C.cyan}` : "none",
          }} />
        ))}
      </div>
    </div>
  );
}

function WeatherPanel() {
  return (
    <div style={{ padding: "10px 14px" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr auto", alignItems: "center", gap: 10 }}>
        <div>
          <div style={{ ...S.mono, fontSize: 20, fontWeight: 700, color: "var(--ink)", lineHeight: 1 }}>14°<span style={{ fontSize: 12, ...S.dim }}>C</span></div>
          <div style={{ ...S.mono, ...S.upper, fontSize: 9, ...S.dim, letterSpacing: "0.14em", marginTop: 3 }}>overcast · dry</div>
        </div>
        <svg width="60" height="60" viewBox="0 0 60 60">
          <circle cx="30" cy="30" r="22" fill="none" stroke="var(--line-2)" />
          <text x="30" y="10" textAnchor="middle" fill="var(--ink-dim)" fontFamily="JetBrains Mono" fontSize="8">N</text>
          <text x="30" y="56" textAnchor="middle" fill="var(--ink-mute)" fontFamily="JetBrains Mono" fontSize="8">S</text>
          <text x="6"  y="32" textAnchor="middle" fill="var(--ink-mute)" fontFamily="JetBrains Mono" fontSize="8">W</text>
          <text x="54" y="32" textAnchor="middle" fill="var(--ink-mute)" fontFamily="JetBrains Mono" fontSize="8">E</text>
          <g transform="rotate(135 30 30)">
            <line x1="30" y1="48" x2="30" y2="14" stroke={C.amber} strokeWidth="1.5"/>
            <polygon points="30,10 26,18 34,18" fill={C.amber}/>
          </g>
        </svg>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 10 }}>
        <MiniStat k="wind"     v="12 km/h" sub="NW→SE"    c="amber"  />
        <MiniStat k="humidity" v="64%"     sub="stable"   c="blue"   />
        <MiniStat k="pressure" v="1009"    sub="falling"  c="purple" />
        <MiniStat k="pm2.5"    v="184"     sub="unhealthy" c="orange" />
      </div>
    </div>
  );
}

function MiniStat({ k, v, sub, c }: { k: string; v: string; sub: string; c: CK }) {
  const col = C[c];
  return (
    <div style={{ borderLeft: `2px solid ${col}`, paddingLeft: 6 }}>
      <div style={{ ...S.mono, ...S.upper, fontSize: 9, ...S.dim, letterSpacing: "0.12em" }}>{k}</div>
      <div style={{ ...S.mono, fontSize: 12, fontWeight: 600, color: "var(--ink)" }}>{v}</div>
      <div style={{ ...S.mono, fontSize: 9, color: col, opacity: 0.85 }}>{sub}</div>
    </div>
  );
}

function CommsLog() {
  return (
    <div style={{ maxHeight: 220, overflowY: "auto" }}>
      {COMMS.map((m, i) => {
        const col = C[m.c];
        return (
          <div key={i} style={{
            display: "grid", gridTemplateColumns: "52px 54px 1fr", gap: 6,
            padding: "6px 10px 6px 12px", borderBottom: "1px solid var(--line)",
            fontSize: 10.5, lineHeight: 1.35,
            animation: i === 0 ? "slide-in 0.3s ease-out" : "none",
          }}>
            <span style={{ ...S.mono, ...S.mute }}>{m.t}</span>
            <span style={{ ...S.mono, ...S.upper, color: col, fontWeight: 700, letterSpacing: "0.08em", fontSize: 9.5 }}>{m.s}</span>
            <span style={{ ...S.mono, color: "var(--ink-2)", fontSize: 10 }}>{m.msg}</span>
          </div>
        );
      })}
    </div>
  );
}

function AnomalyFeed() {
  return (
    <div>
      {ANOMALIES.map(a => {
        const col = a.sev === "high" ? C.red : a.sev === "med" ? C.amber : C.blue;
        return (
          <div key={a.id} style={{ display: "grid", gridTemplateColumns: "3px 1fr auto", borderBottom: "1px solid var(--line)", alignItems: "stretch" }}>
            <div style={{ background: col, boxShadow: `inset 0 0 6px ${col}` }} />
            <div style={{ padding: "7px 10px" }}>
              <div style={{ ...S.mono, fontSize: 10, color: "var(--ink)", fontWeight: 600 }}>{a.label}</div>
              <div style={{ ...S.mono, fontSize: 9, ...S.dim, marginTop: 2 }}>
                <span style={{ color: col }}>{a.id}</span> · {a.loc}
              </div>
            </div>
            <div style={{ padding: "7px 10px", textAlign: "right" }}>
              <div style={{ ...S.mono, ...S.upper, fontSize: 9, color: col, letterSpacing: "0.14em", fontWeight: 700 }}>{a.sev}</div>
              <div style={{ ...S.mono, fontSize: 9, ...S.mute }}>{a.at}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ═══════════════════════════════ CITY MAP ════════════════════════════════ */
interface CityMapProps { userCrises: UserCrisis[]; }
function CityMap({ userCrises }: CityMapProps) {
  const t = useAnim();
  const W = 1200, H = 720;
  const hLines = [90, 150, 220, 290, 360, 430, 510, 580, 640];
  const vLines = [80, 150, 220, 300, 380, 460, 540, 620, 700, 780, 860, 940, 1020, 1100];

  const facColorMap: Record<string, string> = {
    hospital: "#34d399", school: "#60a5fa", library: "#a78bfa",
    civic: "#22d3ee", fire: "#fb923c", police: "#38bdf8", energy: "#fbbf24",
  };

  return (
    <div style={{
      position: "relative", width: "100%", height: "100%", overflow: "hidden",
      background:
        "radial-gradient(ellipse 50% 35% at 35% 40%, rgba(56,189,248,0.06), transparent 65%)," +
        "radial-gradient(ellipse 35% 28% at 75% 60%, rgba(167,139,250,0.05), transparent 65%)," +
        "linear-gradient(180deg, #061320 0%, #040b11 100%)",
    }}>
      {/* Top strip */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, zIndex: 4, height: 36, padding: "0 14px",
        display: "flex", alignItems: "center", gap: 14, borderBottom: "1px solid var(--line)",
        background: "linear-gradient(180deg, rgba(8,24,38,0.9) 0%, rgba(4,11,17,0) 100%)",
      }}>
        <span style={{ ...S.mono, ...S.upper, fontSize: 10, color: "var(--ink-2)", letterSpacing: "0.2em", fontWeight: 700 }}>Sector 4 · Operational View</span>
        <span style={{ ...S.mono, fontSize: 9, ...S.mute }}>40.7412°N · 73.9956°W · zoom 1.00×</span>
        <span style={{ flex: 1 }} />
        {[["red","collision"],["orange","fire"],["purple","medical"],["blue","water/util"]].map(([c,l]) => (
          <span key={l} style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: C[c as CK], boxShadow: `0 0 6px ${C[c as CK]}`, display: "block" }} />
            <span style={{ ...S.mono, ...S.upper, fontSize: 9, ...S.dim }}>{l}</span>
          </span>
        ))}
        <span style={{ width: 1, height: 16, background: "var(--line-2)", display: "block" }} />
        {[["Heatmap",true],["Isochrones",true],["AQI",true],["Cameras",false],["Traffic",false]].map(([label, active]) => (
          <span key={String(label)} style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "2px 7px", cursor: "pointer", border: `1px solid ${active ? "var(--line-3)" : "var(--line-2)"}`, background: active ? "rgba(56,189,248,0.08)" : "transparent" }}>
            <span style={{ width: 5, height: 5, display: "block", background: active ? C.cyan : "var(--ink-mute)", boxShadow: active ? `0 0 4px ${C.cyan}` : "none" }} />
            <span style={{ ...S.mono, ...S.upper, fontSize: 9, color: active ? "var(--ink-2)" : "var(--ink-dim)" }}>{String(label)}</span>
          </span>
        ))}
      </div>

      {/* Scan line */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden", zIndex: 1 }}>
        <div style={{ position: "absolute", left: 0, right: 0, height: 120, background: "linear-gradient(180deg, transparent 0%, rgba(56,189,248,0.045) 50%, transparent 100%)", animation: "scan-line 12s linear infinite" }} />
      </div>

      {/* Bottom HUD */}
      <div style={{ position: "absolute", bottom: 12, left: 14, zIndex: 4, display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ display: "flex" }}>
          <div style={{ width: 40, height: 4, background: "var(--ink-dim)" }} />
          <div style={{ width: 40, height: 4, border: "1px solid var(--ink-dim)", borderLeft: 0 }} />
        </div>
        <span style={{ ...S.mono, ...S.upper, fontSize: 9, ...S.dim }}>0.5 km</span>
        <span style={{ width: 1, height: 14, background: "var(--line-2)", display: "block" }} />
        <span style={{ ...S.mono, fontSize: 9, ...S.mute }}>OSM · roads · traffic-v4 · AQI-s088 · wx-noaa</span>
      </div>
      <div style={{ position: "absolute", bottom: 12, right: 14, zIndex: 4, display: "flex", gap: 6 }}>
        <button className="ghost">＋</button>
        <button className="ghost">−</button>
        <button className="ghost">⟲</button>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice"
           style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
        <defs>
          <radialGradient id="aqi-haze" cx="30%" cy="32%" r="28%">
            <stop offset="0%"   stopColor="#fbbf24" stopOpacity="0.38"/>
            <stop offset="45%"  stopColor="#fb923c" stopOpacity="0.18"/>
            <stop offset="100%" stopColor="#fb923c" stopOpacity="0"/>
          </radialGradient>
          <radialGradient id="aqi-haze2" cx="30%" cy="32%" r="20%">
            <stop offset="0%"   stopColor="#f87171" stopOpacity="0.25"/>
            <stop offset="100%" stopColor="#f87171" stopOpacity="0"/>
          </radialGradient>
          <filter id="glow-soft" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="b"/>
            <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          <pattern id="park" width="8" height="8" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="0.7" fill="#1a3a24"/>
          </pattern>
          <pattern id="heatG" width="40" height="40" patternUnits="userSpaceOnUse">
            <rect width="40" height="40" fill="rgba(52,211,153,0.04)"/>
          </pattern>
          <pattern id="heatA" width="40" height="40" patternUnits="userSpaceOnUse">
            <rect width="40" height="40" fill="rgba(251,191,36,0.09)"/>
          </pattern>
          <pattern id="heatR" width="40" height="40" patternUnits="userSpaceOnUse">
            <rect width="40" height="40" fill="rgba(248,113,113,0.14)"/>
          </pattern>
        </defs>

        <rect x="0" y="0" width={W} height={H} fill="#040b11"/>

        {/* Heatmap */}
        {(() => {
          const cells: React.ReactElement[] = [];
          for (let r = 0; r < 18; r++) for (let c = 0; c < 30; c++) {
            const cx = 40 * c, cy = 40 * r;
            let score = 0;
            DESIGN_INCIDENTS.forEach(inc => {
              const d = Math.hypot((cx + 20) - inc.x, (cy + 20) - inc.y);
              score += Math.max(0, 1 - d / 200) * inc.severity;
            });
            if (score < 0.8) continue;
            const fill = score > 3 ? "url(#heatR)" : score > 1.8 ? "url(#heatA)" : "url(#heatG)";
            cells.push(<rect key={`${r}-${c}`} x={cx} y={cy} width="40" height="40" fill={fill}/>);
          }
          return cells;
        })()}

        {/* Park */}
        <rect x="490" y="380" width="140" height="110" fill="url(#park)" opacity="0.9"/>
        <rect x="490" y="380" width="140" height="110" fill="#0d2016" opacity="0.4"/>
        <text x="560" y="440" textAnchor="middle" fill="#2a5a3c" fontFamily="JetBrains Mono" fontSize="9" letterSpacing="0.2em">CENTRAL GREEN</text>

        {/* River */}
        <polygon points="0,510 1200,280 1200,340 0,570" fill="#081c2e"/>
        <polygon points="0,525 1200,295 1200,325 0,555" fill="#0a2438" opacity="0.8"/>
        <text x="960" y="316" fill="#1d4a6a" fontFamily="JetBrains Mono" fontSize="9" letterSpacing="0.22em" transform="rotate(-11 960 316)">HUDSON CHANNEL · FLOW 2.1 m/s</text>

        {/* District labels */}
        {[["180","100","MIDTOWN"],["740","110","NORTH RIDGE"],["240","670","HARBOR"],["880","690","EASTSIDE"],["410","260","HARPER RIDGE"]].map(([x,y,l]) => (
          <text key={l} x={x} y={y} fill="#1d2f42" fontFamily="JetBrains Mono" fontSize="11" letterSpacing="0.28em">{l}</text>
        ))}

        {/* Streets */}
        {hLines.map((y, i) => <line key={"h"+i} x1="0" y1={y} x2={W} y2={y} stroke={i===4?"#1b3a55":"#102437"} strokeWidth={i===4?1.6:0.8}/>)}
        {vLines.map((x, i) => <line key={"v"+i} x1={x} y1="0" x2={x} y2={H} stroke={i===6?"#1b3a55":"#102437"} strokeWidth={i===6?1.6:0.8}/>)}
        <line x1="0" y1="570" x2={W} y2="240" stroke="#153049" strokeWidth="1.1"/>
        <line x1="0" y1="690" x2="800" y2="40" stroke="#153049" strokeWidth="1.1"/>

        {/* Glowing arterial */}
        <line x1="0" y1="360" x2={W} y2="360" stroke="#38bdf8" strokeWidth="1.4" strokeOpacity="0.55" filter="url(#glow-soft)"/>
        <text x="14" y="354" fill="#38bdf8" fontFamily="JetBrains Mono" fontSize="9" opacity="0.7" letterSpacing="0.2em">MARSHALL AVE · PRIORITY</text>

        {/* Isochrones */}
        <g opacity="0.55">
          <ellipse cx="420" cy="160" rx="120" ry="90"  fill="none" stroke={C.orange} strokeWidth="0.8" strokeDasharray="2 4"/>
          <ellipse cx="420" cy="160" rx="200" ry="140" fill="none" stroke={C.orange} strokeWidth="0.8" strokeDasharray="2 4" opacity="0.6"/>
          <text x="540" y="80" fill={C.orange} fontFamily="JetBrains Mono" fontSize="8" opacity="0.8">FD·4min</text>
          <text x="620" y="40" fill={C.orange} fontFamily="JetBrains Mono" fontSize="8" opacity="0.6">FD·8min</text>
        </g>
        <g opacity="0.45">
          <ellipse cx="720" cy="260" rx="150" ry="105" fill="none" stroke={C.green} strokeWidth="0.8" strokeDasharray="2 4"/>
          <text x="860" y="180" fill={C.green} fontFamily="JetBrains Mono" fontSize="8" opacity="0.8">EMS·5min</text>
        </g>

        {/* AQI haze */}
        <ellipse cx="370" cy="250" rx="340" ry="230" fill="url(#aqi-haze)"/>
        <ellipse cx="370" cy="230" rx="80" ry="60" fill="url(#aqi-haze2)"/>
        {[[300,180],[400,220],[500,280],[600,330]].map((p, i) => (
          <g key={i} transform={`translate(${p[0]} ${p[1]}) rotate(135)`} opacity="0.65">
            <line x1="-10" y1="0" x2="10" y2="0" stroke={C.amber} strokeWidth="1"/>
            <polygon points="10,0 6,-3 6,3" fill={C.amber}/>
          </g>
        ))}

        {/* Routes */}
        {ROUTES.map(r => (
          <polyline key={r.id} points={r.points.map(p => p.join(",")).join(" ")}
            fill="none" stroke={C[r.color]} strokeWidth="2"
            strokeDasharray="6 6" strokeLinecap="round" strokeLinejoin="round" opacity="0.85"
            style={{ animation: "marquee-dash 1.2s linear infinite", filter: `drop-shadow(0 0 3px ${C[r.color]})` }}
          />
        ))}

        {/* Animated vehicle dots */}
        {ROUTES.map((r) => {
          const len = r.points.length;
          const prog = (r.progress + (t * 0.04)) % 1;
          const seg  = prog * (len - 1);
          const i    = Math.floor(seg);
          const f    = seg - i;
          const [x1, y1] = r.points[i];
          const [x2, y2] = r.points[Math.min(i + 1, len - 1)];
          const vx = x1 + (x2 - x1) * f, vy = y1 + (y2 - y1) * f;
          const col = C[r.color];
          return (
            <g key={"v"+r.id}>
              <circle cx={vx} cy={vy} r="10" fill={col} opacity="0.2"/>
              <rect x={vx-5} y={vy-4} width="10" height="8" fill={col} stroke="#000" strokeOpacity="0.6" strokeWidth="0.5"/>
              <rect x={vx-5} y={vy-4} width="10" height="2" fill="#fff" opacity="0.3"/>
            </g>
          );
        })}

        {/* Facilities */}
        {FACILITIES.map((f, i) => {
          const col = facColorMap[f.kind];
          return (
            <g key={i}>
              <rect x={f.x-9} y={f.y-9} width="18" height="18" fill="#050d14" stroke={col} strokeWidth="1.2"/>
              <rect x={f.x-9} y={f.y-9} width="18" height="3" fill={col} fillOpacity="0.4"/>
              <text x={f.x} y={f.y+4} textAnchor="middle" fill={col} fontFamily="JetBrains Mono" fontSize="10" fontWeight="700">{f.t}</text>
              <text x={f.x+13} y={f.y-3} fill="#6a8aa3" fontFamily="JetBrains Mono" fontSize="8.5" letterSpacing="0.06em">{f.name}</text>
              {f.cap && <text x={f.x+13} y={f.y+8} fill="#3e5871" fontFamily="JetBrains Mono" fontSize="8">{f.cap}</text>}
            </g>
          );
        })}

        {/* Design incidents */}
        {DESIGN_INCIDENTS.map(inc => <IncidentMark key={inc.id} inc={inc}/>)}

        {/* User crisis markers */}
        {userCrises.filter(c => c.status !== "resolved").map(crisis => {
          const zone = ZONE_DISPATCH[crisis.zone];
          const cfg  = CRISIS_TYPES[crisis.type];
          const col  = cfg.color;
          const isOnScene = crisis.status === "on_scene";
          const CIRC = 2 * Math.PI * 12;
          const dash = CIRC - (crisis.progress / 100) * CIRC;
          return (
            <g key={crisis.id}>
              {/* Vehicle dot animating along path */}
              {crisis.status === "transit" && (
                <>
                  <circle r="5" fill={col} opacity="0.9">
                    <animateMotion dur={`${TRANSIT_SECS}s`} fill="freeze" repeatCount="1" path={zone.path}/>
                  </circle>
                  <polyline points={zone.path.replace(/[ML]\s*/g,"").replace(/\s+/g," ").split(" ").join(",")}
                    fill="none" stroke={col} strokeWidth="1.5" strokeDasharray="5 5" opacity="0.5"
                    style={{ animation: "marquee-dash-slow 2s linear infinite" }}/>
                </>
              )}
              {/* Destination marker */}
              <polygon
                points={`${zone.x},${zone.y-10} ${zone.x+8},${zone.y+2} ${zone.x},${zone.y+8} ${zone.x-8},${zone.y+2}`}
                fill={col} opacity={isOnScene ? 1 : 0.6} filter="url(#glow-soft)"
              />
              {/* Resolution ring */}
              {isOnScene && (
                <circle cx={zone.x} cy={zone.y} r="12" fill="none" stroke={col} strokeWidth="2"
                  strokeDasharray={`${CIRC}`}
                  strokeDashoffset={`${dash}`}
                  transform={`rotate(-90 ${zone.x} ${zone.y})`}
                  style={{ transition: "stroke-dashoffset 0.4s linear" }}
                />
              )}
              {/* Label */}
              <text x={zone.x + 12} y={zone.y - 4} fill={col} fontFamily="JetBrains Mono" fontSize="8.5" fontWeight="700">{cfg.icon} {crisis.type}</text>
            </g>
          );
        })}

        {/* AQI callout */}
        <g>
          <line x1="370" y1="155" x2="140" y2="85" stroke={C.amber} strokeWidth="1" strokeDasharray="2 3" opacity="0.7"/>
          <circle cx="370" cy="155" r="2.5" fill={C.amber}/>
          <g transform="translate(28 60)">
            <rect x="0" y="0" width="210" height="52" fill="#050d14" fillOpacity="0.85" stroke={C.amber} strokeOpacity="0.5"/>
            <rect x="0" y="0" width="3" height="52" fill={C.amber}/>
            <text x="10" y="14" fill={C.amber} fontFamily="JetBrains Mono" fontSize="10" fontWeight="700">AQI HAZE · PM2.5 184</text>
            <text x="10" y="28" fill="#c69220" fontFamily="JetBrains Mono" fontSize="9">Harper Ridge plume · class 4</text>
            <text x="10" y="40" fill="#8a6a18" fontFamily="JetBrains Mono" fontSize="9">drift SE · 12 km/h · 8.4k exposed</text>
            <text x="195" y="48" textAnchor="end" fill="#c69220" fontFamily="JetBrains Mono" fontSize="9" opacity="0.9">T+18 min</text>
          </g>
        </g>

        {/* Compass */}
        <g transform={`translate(${W-60} 60)`}>
          <circle cx="0" cy="0" r="26" fill="#050d1488" stroke="#1d3a54" strokeWidth="1"/>
          <circle cx="0" cy="0" r="18" fill="none" stroke="#14293d"/>
          <line x1="0" y1="-26" x2="0" y2="26" stroke="#14293d" strokeWidth="0.5"/>
          <line x1="-26" y1="0" x2="26" y2="0" stroke="#14293d" strokeWidth="0.5"/>
          <g style={{ transformOrigin: "0 0", animation: "sweep 4s linear infinite" }}>
            <path d="M0 0 L0 -26 A26 26 0 0 1 22.5 13 Z" fill={C.cyan} opacity="0.15"/>
            <line x1="0" y1="0" x2="0" y2="-26" stroke={C.cyan} strokeWidth="1"/>
          </g>
          <polygon points="0,-22 -4,-6 0,-10 4,-6" fill="#38bdf8"/>
          <text x="0" y="-30" textAnchor="middle" fill="#38bdf8" fontFamily="JetBrains Mono" fontSize="9" fontWeight="700">N</text>
        </g>
      </svg>
    </div>
  );
}

function IncidentMark({ inc }: { inc: typeof DESIGN_INCIDENTS[0] }) {
  useTick(1000);
  const col = C[inc.color];
  const elapsed = (Date.now() - NOW_REF) / 1000 + inc.startedAgo;
  return (
    <g>
      <circle cx={inc.x} cy={inc.y} r="18" fill={col} opacity="0.12">
        <animate attributeName="r" values="14;28;14" dur="1.8s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="0.28;0;0.28" dur="1.8s" repeatCount="indefinite"/>
      </circle>
      <circle cx={inc.x} cy={inc.y} r="10" fill={col} opacity="0.28"/>
      <circle cx={inc.x} cy={inc.y} r="5" fill={col} style={{ filter: `drop-shadow(0 0 5px ${col})` }}/>
      <line x1={inc.x} y1={inc.y} x2={inc.x+14} y2={inc.y-22} stroke={col} strokeOpacity="0.5" strokeWidth="0.8"/>
      <g transform={`translate(${inc.x+14} ${inc.y-32})`}>
        <rect x="0" y="0" width="100" height="26" fill="#050d14" fillOpacity="0.9" stroke={col} strokeOpacity="0.55" strokeWidth="0.6"/>
        <rect x="0" y="0" width="3" height="26" fill={col}/>
        <text x="8"  y="11" fill={col} fontFamily="JetBrains Mono" fontSize="9" fontWeight="700">{inc.id}</text>
        <text x="50" y="11" fill="#6a8aa3" fontFamily="JetBrains Mono" fontSize="9">{inc.priority}</text>
        <text x="8"  y="22" fill="#bacbdb" fontFamily="JetBrains Mono" fontSize="8.5">{fmtMMSS(elapsed)} · sev {inc.severity}</text>
      </g>
    </g>
  );
}

/* ═══════════════════════════════ SIDEBAR ══════════════════════════════════ */
interface SidebarProps {
  userCrises: UserCrisis[];
  onDispatch: (c: UserCrisis & { aiScore: number }) => void;
}
function Sidebar({ userCrises, onDispatch }: SidebarProps) {
  return (
    <aside style={{ display: "flex", flexDirection: "column", height: "100%", background: "var(--surface)", borderLeft: "1px solid var(--line)", overflow: "hidden", minHeight: 0 }}>
      <IncidentsPanel userCrises={userCrises}/>
      <FleetPanel/>
      <RiskPanel/>
      <AIQueuePanel/>
      <AddCrisisPanel onDispatch={onDispatch}/>
    </aside>
  );
}

function PanelHeader({ title, count, right, sub }: { title: string; count?: React.ReactNode; right?: React.ReactNode; sub?: string }) {
  return (
    <div style={{
      display: "grid", gridTemplateColumns: "auto 1fr auto", alignItems: "center", gap: 10,
      padding: "9px 14px", borderTop: "1px solid var(--line-2)", borderBottom: "1px solid var(--line)",
      background: "linear-gradient(90deg, rgba(34,211,238,0.04), transparent 50%)", flexShrink: 0,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ width: 6, height: 6, background: "var(--cyan)", display: "block", boxShadow: "0 0 6px var(--cyan)" }}/>
        <span style={{ ...S.mono, ...S.upper, fontSize: 10, fontWeight: 700, letterSpacing: "0.18em" }}>{title}</span>
        {count !== undefined && (
          <span style={{ ...S.mono, fontSize: 9, ...S.dim, padding: "1px 6px", border: "1px solid var(--line-2)" }}>{count}</span>
        )}
      </div>
      <span style={{ ...S.mono, fontSize: 9, ...S.mute, justifySelf: "start" }}>{sub}</span>
      <span>{right}</span>
    </div>
  );
}

function IncidentsPanel({ userCrises }: { userCrises: UserCrisis[] }) {
  const [tab, setTab] = useState("active");
  const allInc = [...DESIGN_INCIDENTS];
  const activeUser = userCrises.filter(c => c.status !== "resolved");
  return (
    <section style={{ flexShrink: 0 }}>
      <PanelHeader title="Incidents" count={allInc.length + activeUser.length} right={
        <div style={{ display: "flex" }}>
          {["active","queue","closed"].map(k => (
            <button key={k} onClick={() => setTab(k)} style={{
              ...S.mono, ...S.upper, background: tab===k ? "rgba(34,211,238,0.1)" : "transparent",
              color: tab===k ? "var(--cyan)" : "var(--ink-dim)", border: "1px solid var(--line-2)",
              borderRight: "none", padding: "3px 8px", fontSize: 9, cursor: "pointer", fontWeight: tab===k ? 700 : 500,
            }}>{k}</button>
          ))}
        </div>
      }/>
      <div style={{ maxHeight: 260, overflowY: "auto" }}>
        {activeUser.map(c => <UserCrisisCard key={c.id} crisis={c}/>)}
        {allInc.map(inc => <IncidentCard key={inc.id} inc={inc}/>)}
      </div>
    </section>
  );
}

function UserCrisisCard({ crisis }: { crisis: UserCrisis }) {
  const cfg = CRISIS_TYPES[crisis.type];
  const col = cfg.color;
  const waitSecs = (Date.now() - NOW_REF - crisis.addedAt) / 1000;
  const score = crisis.aiScore;
  return (
    <div style={{ display: "grid", gridTemplateColumns: "3px 1fr auto", borderBottom: "1px solid var(--line)", background: "rgba(167,139,250,0.03)" }}>
      <div style={{ background: col, boxShadow: `inset 0 0 8px ${col}` }}/>
      <div style={{ padding: "8px 12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3, flexWrap: "wrap" }}>
          <span style={{ fontSize: 12 }}>{cfg.icon}</span>
          <span style={{ ...S.mono, fontSize: 10, color: col, fontWeight: 700 }}>USER</span>
          <span style={{ ...S.mono, ...S.upper, fontSize: 9, padding: "1px 5px", background: `${col}22`, color: col, border: `1px solid ${col}55`, fontWeight: 700 }}>AI·{score}</span>
          <span style={{ ...S.mono, ...S.upper, fontSize: 9, ...S.mute }}>{crisis.status.replace("_"," ")}</span>
        </div>
        <div style={{ fontSize: 12, fontWeight: 600, color: "var(--ink)", lineHeight: 1.25 }}>{cfg.label}</div>
        <div style={{ ...S.mono, fontSize: 10, ...S.dim, marginTop: 2 }}>{ZONE_DISPATCH[crisis.zone].name} · sev {crisis.severity}/5</div>
      </div>
      <div style={{ padding: "8px 14px 8px 8px", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
        <div style={{ ...S.mono, fontSize: 12, fontWeight: 700, color: col }}>{fmtMMSS(Math.max(0, waitSecs))}</div>
        {crisis.status === "on_scene" && (
          <div style={{ ...S.mono, fontSize: 9, color: C.green }}>{Math.round(crisis.progress)}%</div>
        )}
      </div>
    </div>
  );
}

function IncidentCard({ inc }: { inc: typeof DESIGN_INCIDENTS[0] }) {
  useTick(1000);
  const col = C[inc.color];
  const elapsed = (Date.now() - NOW_REF) / 1000 + inc.startedAgo;
  return (
    <div style={{ display: "grid", gridTemplateColumns: "3px 1fr auto", borderBottom: "1px solid var(--line)", background: inc.priority==="P1" ? "rgba(248,113,113,0.025)" : "transparent" }}>
      <div style={{ background: col, boxShadow: `inset 0 0 8px ${col}` }}/>
      <div style={{ padding: "10px 12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
          <span style={{ ...S.mono, fontSize: 10, color: col, fontWeight: 700 }}>{inc.id}</span>
          <span style={{ ...S.mono, ...S.upper, fontSize: 9, padding: "1px 5px", background: `${col}22`, color: col, border: `1px solid ${col}55`, fontWeight: 700 }}>{inc.priority}</span>
          <span style={{ ...S.mono, ...S.upper, fontSize: 9, ...S.mute }}>{inc.kind}</span>
          {inc.victims > 0 && <span style={{ ...S.mono, fontSize: 9, ...S.dim }}>· <span style={{ color: C.red }}>{inc.victims}</span> pts</span>}
        </div>
        <div style={{ fontSize: 12.5, fontWeight: 600, color: "var(--ink)", lineHeight: 1.25 }}>{inc.label}</div>
        <div style={{ ...S.mono, fontSize: 10, ...S.dim, marginTop: 3 }}>{inc.loc}</div>
        <div style={{ marginTop: 6, display: "flex", flexWrap: "wrap", gap: 3 }}>
          {inc.units.map(u => (
            <span key={u} style={{ ...S.mono, fontSize: 9, padding: "1px 5px", background: "rgba(56,189,248,0.05)", border: "1px solid var(--line-2)", color: "var(--ink-2)" }}>{u}</span>
          ))}
        </div>
      </div>
      <div style={{ padding: "10px 14px 10px 8px", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 5 }}>
        <div style={{ ...S.mono, fontSize: 14, fontWeight: 700, color: col }}>{fmtMMSS(elapsed)}</div>
        <div style={{ display: "flex", gap: 2 }}>
          {[1,2,3,4,5].map(i => (
            <span key={i} style={{ width: 5, height: 10, background: i<=inc.severity ? col : "#1a2e42", boxShadow: i<=inc.severity ? `0 0 4px ${col}` : "none", display: "block" }}/>
          ))}
        </div>
        <span style={{ ...S.mono, ...S.upper, fontSize: 8, ...S.mute }}>sev · {inc.trend}</span>
      </div>
    </div>
  );
}

function FleetPanel() {
  const [tab, setTab] = useState("all");
  const filtered = FLEET_DATA.filter(u => tab === "all" || u.kind === tab);
  return (
    <section style={{ flexShrink: 0 }}>
      <PanelHeader title="Fleet Tracker" count={`${FLEET_DATA.length} units`} sub="live · GPS · 1 Hz" right={
        <div style={{ display: "flex" }}>
          {[["all","ALL"],["ambulance","EMS"],["engine","FD"],["police","PD"]].map(([k,l]) => (
            <button key={k} onClick={() => setTab(k)} style={{
              ...S.mono, ...S.upper, background: tab===k ? "rgba(34,211,238,0.1)" : "transparent",
              color: tab===k ? "var(--cyan)" : "var(--ink-dim)", border: "1px solid var(--line-2)",
              borderRight: "none", padding: "3px 7px", fontSize: 9, cursor: "pointer", fontWeight: tab===k ? 700 : 500,
            }}>{l}</button>
          ))}
        </div>
      }/>
      <div style={{ maxHeight: 180, overflowY: "auto" }}>
        {filtered.map(u => <FleetRow key={u.id} u={u}/>)}
      </div>
    </section>
  );
}

function FleetRow({ u }: { u: typeof FLEET_DATA[0] }) {
  const color = u.kind==="ambulance" ? C.red : u.kind==="engine" ? C.orange : C.blue;
  const statusColor = ({ enroute: C.amber, onscene: C.green, transport: C.blue } as Record<string,string>)[u.status] ?? C.blue;
  const fuelColor = u.fuel < 45 ? C.amber : u.fuel < 20 ? C.red : C.green;
  return (
    <div style={{ display: "grid", gridTemplateColumns: "26px 68px 1fr 74px 56px", alignItems: "center", gap: 8, padding: "7px 14px", borderBottom: "1px solid var(--line)" }}>
      <div style={{ width: 22, height: 16, background: `${color}15`, border: `1px solid ${color}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
        {u.kind==="ambulance" ? <IconAmbulance color={color} size={12}/> : u.kind==="engine" ? <IconEngine color={color} size={12}/> : <IconPolice color={color} size={12}/>}
      </div>
      <span style={{ ...S.mono, fontSize: 11, fontWeight: 700, color: "var(--ink)" }}>{u.id}</span>
      <div>
        <div style={{ ...S.mono, fontSize: 10, ...S.dim, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>→ {u.dest}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
          <span style={{ width: 5, height: 5, background: statusColor, boxShadow: `0 0 4px ${statusColor}`, display: "block" }}/>
          <span style={{ ...S.mono, ...S.upper, fontSize: 9, color: statusColor }}>{u.status}</span>
          <span style={{ ...S.mono, fontSize: 9, ...S.mute }}>· crew {u.crew}</span>
        </div>
      </div>
      <div>
        <div style={{ ...S.mono, fontSize: 9, color: fuelColor }}>fuel {u.fuel}%</div>
        <div style={{ height: 3, background: "#0f2336", marginTop: 3 }}>
          <div style={{ width: `${u.fuel}%`, height: "100%", background: fuelColor }}/>
        </div>
      </div>
      <div style={{ textAlign: "right" }}>
        <div style={{ ...S.mono, fontSize: 12, fontWeight: 700, color: "var(--ink)" }}>{fmtETA(u.eta)}</div>
        <div style={{ ...S.mono, ...S.upper, fontSize: 8, ...S.mute }}>eta</div>
      </div>
    </div>
  );
}

function RiskPanel() {
  return (
    <section style={{ flexShrink: 0 }}>
      <PanelHeader title="Domain Risk" sub="now · 15m horizon · 5 domains" right={
        <span style={{ ...S.mono, ...S.upper, fontSize: 9, ...S.dim }}>Δ15m</span>
      }/>
      <div style={{ padding: "10px 14px 12px" }}>
        {RISK_DOMAINS.map(d => {
          const col = C[d.color];
          return (
            <div key={d.key} style={{ marginBottom: 9, display: "grid", gridTemplateColumns: "110px 1fr 44px 34px", gap: 8, alignItems: "center" }}>
              <span style={{ ...S.mono, ...S.upper, fontSize: 10, color: "var(--ink-2)", letterSpacing: "0.12em" }}>{d.key}</span>
              <div style={{ position: "relative", height: 7, background: "#0f2336" }}>
                {[25,50,75].map(tick => <div key={tick} style={{ position: "absolute", left: `${tick}%`, top: 0, bottom: 0, width: 1, background: "#14283d" }}/>)}
                <div style={{ position: "absolute", inset: 0, width: `${d.value}%`, background: `linear-gradient(90deg, ${col}66, ${col})`, boxShadow: `0 0 6px ${col}66`, transformOrigin: "left", animation: "bar-grow 0.6s ease-out" }}/>
                <div style={{ position: "absolute", left: `${d.value}%`, top: -2, bottom: -2, width: 2, background: col, boxShadow: `0 0 6px ${col}` }}/>
              </div>
              <svg width="44" height="14" viewBox="0 0 44 14" preserveAspectRatio="none" style={{ opacity: 0.9 }}>
                <polyline points={d.hist.map((v,i) => `${(i/(d.hist.length-1))*44},${14-(v/100)*12}`).join(" ")} fill="none" stroke={col} strokeWidth="1"/>
              </svg>
              <span style={{ ...S.mono, fontSize: 10, fontWeight: 700, color: col, textAlign: "right" }}>
                {d.value}<span style={{ color: "var(--ink-mute)", fontWeight: 400 }}> {d.d15}</span>
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function AIQueuePanel() {
  const [expanded, setExpanded] = useState(1);
  return (
    <section style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
      <PanelHeader title="AI Priority Queue" sub="Atlas-7 · 14 models ensemble" right={
        <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ width: 5, height: 5, background: C.cyan, display: "block", boxShadow: `0 0 4px ${C.cyan}`, animation: "soft-pulse 1.4s infinite" }}/>
          <span style={{ ...S.mono, ...S.upper, fontSize: 9, color: C.cyan }}>thinking</span>
        </span>
      }/>
      <div style={{ overflowY: "auto", flex: 1 }}>
        {AI_ACTIONS.map(a => (
          <AIAction key={a.n} a={a} expanded={expanded===a.n} onToggle={() => setExpanded(expanded===a.n ? -1 : a.n)}/>
        ))}
      </div>
    </section>
  );
}

function AIAction({ a, expanded, onToggle }: { a: typeof AI_ACTIONS[0]; expanded: boolean; onToggle: () => void }) {
  const confColor = a.confidence>=90 ? C.green : a.confidence>=80 ? C.cyan : C.amber;
  const impColor  = a.impact==="high" ? C.red : a.impact==="med" ? C.amber : C.green;
  return (
    <div style={{ padding: "11px 14px", borderBottom: "1px solid var(--line)", display: "grid", gridTemplateColumns: "28px 1fr", gap: 10, background: a.autopilot ? "rgba(52,211,153,0.025)" : "transparent", cursor: "pointer" }} onClick={onToggle}>
      <div style={{ ...S.mono, fontSize: 14, fontWeight: 700, color: "var(--cyan)", background: "rgba(34,211,238,0.06)", border: "1px solid rgba(34,211,238,0.35)", width: 26, height: 26, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 10px rgba(34,211,238,0.15)" }}>{a.n}</div>
      <div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 8, justifyContent: "space-between" }}>
          <div style={{ fontSize: 12.5, fontWeight: 600, color: "var(--ink)", lineHeight: 1.3 }}>{a.title}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, whiteSpace: "nowrap" }}>
            {a.autopilot && <span style={{ ...S.mono, ...S.upper, fontSize: 8, color: C.green, padding: "1px 5px", border: `1px solid ${C.green}66`, background: `${C.green}15` }}>AUTO</span>}
            <span style={{ ...S.mono, ...S.upper, fontSize: 8, color: impColor }}>{a.impact}</span>
            <span style={{ ...S.mono, fontSize: 10, color: confColor, fontWeight: 700 }}>{a.confidence}<span style={{ ...S.mute }}>%</span></span>
          </div>
        </div>
        <div style={{ height: 2, background: "#0f2336", marginTop: 5 }}>
          <div style={{ width: `${a.confidence}%`, height: "100%", background: confColor, boxShadow: `0 0 4px ${confColor}` }}/>
        </div>
        <div style={{ fontSize: 11, color: "var(--ink-dim)", lineHeight: 1.5, marginTop: 6 }}>{a.rationale}</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 8, alignItems: "center" }}>
          {a.chips.map((ch, i) => (
            <span key={i} style={{ ...S.mono, fontSize: 9.5, padding: "2px 6px", background: "rgba(56,189,248,0.06)", border: "1px solid rgba(56,189,248,0.25)", ...S.dim }}>
              <span style={{ ...S.mute, ...S.upper }}>{ch.k} </span>
              <span style={{ color: "var(--ink)" }}>{ch.v}</span>
            </span>
          ))}
          <span style={{ flex: 1 }}/>
          <button className="prime">Execute</button>
          <button className="ghost">Defer</button>
        </div>
        {expanded && (
          <div style={{ marginTop: 8, padding: "8px 10px", borderLeft: `2px solid ${C.cyan}`, background: "rgba(34,211,238,0.04)" }}>
            <div style={{ ...S.mono, ...S.upper, fontSize: 9, ...S.dim }}>Source models</div>
            <div style={{ ...S.mono, fontSize: 10, color: "var(--ink-2)", marginTop: 3 }}>{a.source}</div>
            <div style={{ ...S.mono, ...S.upper, fontSize: 9, ...S.dim, marginTop: 6 }}>Counterfactual (no action)</div>
            <div style={{ ...S.mono, fontSize: 10, color: C.red, marginTop: 3 }}>+{Math.round(a.confidence/8)} min delay · {a.impact==="high" ? "cascade risk high" : "cascade contained"}</div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Add Crisis Panel ───────────────────────────────────────────────────── */
function AddCrisisPanel({ onDispatch }: { onDispatch: (c: UserCrisis & { aiScore: number }) => void }) {
  const [type, setType]     = useState<CrisisType>("medical");
  const [zone, setZone]     = useState<ZoneKey>("zone-central");
  const [severity, setSev]  = useState(3);
  const [open, setOpen]     = useState(false);

  function handleDispatch() {
    const now   = Date.now() - NOW_REF;
    const score = aiScore(type, zone, severity, 0);
    const crisis: UserCrisis & { aiScore: number } = {
      id: `UC-${Date.now()}`, type, zone, severity,
      addedAt: now, status: "transit", progress: 0,
      unitId: `UNIT-${Math.floor(Math.random() * 900 + 100)}`,
      aiScore: score,
    };
    onDispatch(crisis);
    setOpen(false);
  }

  if (!open) {
    return (
      <div style={{ padding: "10px 14px", borderTop: "1px solid var(--line-2)", flexShrink: 0 }}>
        <button className="prime" style={{ width: "100%", fontSize: 10, padding: "8px" }} onClick={() => setOpen(true)}>
          + Dispatch New Crisis
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: "12px 14px", borderTop: "1px solid var(--line-2)", background: "rgba(34,211,238,0.03)", flexShrink: 0 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <span style={{ width: 6, height: 6, background: C.cyan, display: "block", boxShadow: "0 0 6px var(--cyan)" }}/>
        <span style={{ ...S.mono, ...S.upper, fontSize: 10, fontWeight: 700, letterSpacing: "0.18em" }}>Dispatch Crisis</span>
        <span style={{ flex: 1 }}/>
        <button className="ghost" style={{ padding: "2px 8px" }} onClick={() => setOpen(false)}>✕</button>
      </div>

      <label style={{ ...S.mono, ...S.upper, fontSize: 9, ...S.dim, display: "block", marginBottom: 4 }}>Crisis type</label>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4, marginBottom: 10 }}>
        {(Object.keys(CRISIS_TYPES) as CrisisType[]).map(k => {
          const cfg = CRISIS_TYPES[k];
          const active = type === k;
          return (
            <button key={k} onClick={() => setType(k)} style={{
              background: active ? `${cfg.color}22` : "transparent",
              border: `1px solid ${active ? cfg.color : "var(--line-2)"}`,
              color: active ? cfg.color : "var(--ink-dim)",
              padding: "5px 8px", cursor: "pointer", textAlign: "left",
              ...S.mono, fontSize: 9.5, ...S.upper,
            }}>{cfg.icon} {cfg.label}</button>
          );
        })}
      </div>

      <label style={{ ...S.mono, ...S.upper, fontSize: 9, ...S.dim, display: "block", marginBottom: 4 }}>Zone</label>
      <select value={zone} onChange={e => setZone(e.target.value as ZoneKey)} style={{
        width: "100%", background: "var(--surface-2)", border: "1px solid var(--line-2)",
        color: "var(--ink)", padding: "6px 8px", marginBottom: 10, ...S.mono, fontSize: 10,
      }}>
        {(Object.keys(ZONE_DISPATCH) as ZoneKey[]).map(k => (
          <option key={k} value={k}>{ZONE_DISPATCH[k].name}</option>
        ))}
      </select>

      <label style={{ ...S.mono, ...S.upper, fontSize: 9, ...S.dim, display: "block", marginBottom: 4 }}>Severity {severity}/5</label>
      <div style={{ display: "flex", gap: 4, marginBottom: 12 }}>
        {[1,2,3,4,5].map(i => (
          <button key={i} onClick={() => setSev(i)} style={{
            flex: 1, height: 20, border: "1px solid var(--line-2)", cursor: "pointer",
            background: i <= severity ? (severity >= 4 ? C.red : severity === 3 ? C.amber : C.green) : "transparent",
            boxShadow: i <= severity ? `0 0 4px ${severity>=4 ? C.red : C.amber}` : "none",
          }}/>
        ))}
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <span style={{ ...S.mono, fontSize: 9, ...S.dim }}>
          AI score: <span style={{ color: C.cyan, fontWeight: 700 }}>{aiScore(type, zone, severity, 0)}</span>
        </span>
        <span style={{ ...S.mono, fontSize: 9, ...S.dim }}>sensitivity {(ZONE_DISPATCH[zone].sensitivity * 100).toFixed(0)}%</span>
      </div>
      <button className="prime" style={{ width: "100%", padding: "8px" }} onClick={handleDispatch}>
        Dispatch → {ZONE_DISPATCH[zone].name}
      </button>
    </div>
  );
}

/* ═══════════════════════════ METRICS STRIP ════════════════════════════════ */
function MetricsStrip() {
  return (
    <footer style={{
      flexShrink: 0, background: "linear-gradient(0deg, #0a1a28 0%, #05101a 100%)",
      borderTop: "1px solid var(--line-2)",
      boxShadow: "0 -1px 0 rgba(56,189,248,0.08), 0 -8px 24px rgba(0,0,0,0.4)",
      display: "grid", gridTemplateColumns: "auto repeat(4, 1fr) auto", height: 96,
    }}>
      <ScenarioBadge/>
      {METRICS_DATA.map((m, i) => <MetricTile key={i} m={m}/>)}
      <FooterMeta/>
    </footer>
  );
}

function ScenarioBadge() {
  return (
    <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", padding: "10px 18px", borderRight: "1px solid var(--line)", background: "rgba(34,211,238,0.03)", minWidth: 180 }}>
      <div style={{ ...S.mono, ...S.upper, fontSize: 9, ...S.dim, letterSpacing: "0.18em" }}>Impact · 30m window</div>
      <div style={{ ...S.mono, fontSize: 16, fontWeight: 700, color: "var(--ink)", marginTop: 2 }}>Net Outcome</div>
      <div style={{ ...S.mono, fontSize: 11, color: C.green, marginTop: 2 }}>
        ▲ <span style={{ fontWeight: 700 }}>94.2%</span> policy score · est. <span style={{ fontWeight: 700 }}>1 life</span> saved
      </div>
    </div>
  );
}

function MetricTile({ m }: { m: typeof METRICS_DATA[0] }) {
  const col = C[m.accent];
  const max = Math.max(...m.spark);
  const pts = m.spark.map((v, i) => [i * (86 / (m.spark.length - 1)), 26 - (v / max) * 22] as [number,number]);
  const line = pts.map(p => p.join(",")).join(" ");
  const fill = `0,28 ${line} 86,28`;
  return (
    <div style={{ padding: "12px 18px", borderLeft: "1px solid var(--line)", display: "flex", flexDirection: "column", justifyContent: "center", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: 0, left: 0, bottom: 0, width: 3, background: col, boxShadow: `0 0 10px ${col}` }}/>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <span style={{ ...S.mono, ...S.upper, fontSize: 9, ...S.dim, letterSpacing: "0.18em" }}>{m.label}</span>
        <span style={{ ...S.mono, ...S.upper, fontSize: 8, color: C.green }}>▲ OPT</span>
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginTop: 4 }}>
        <span style={{ ...S.mono, fontSize: 28, fontWeight: 700, color: col, lineHeight: 1, letterSpacing: "-0.02em" }}>
          {m.value >= 1 && m.value % 1 !== 0 ? m.value.toFixed(1) : m.value}
        </span>
        <span style={{ ...S.mono, fontSize: 13, color: col, fontWeight: 500 }}>{m.unit}</span>
        <span style={{ flex: 1 }}/>
        <svg width="86" height="28" viewBox="0 0 86 28" preserveAspectRatio="none">
          <defs>
            <linearGradient id={`gr-${m.accent}`} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor={col} stopOpacity="0.35"/>
              <stop offset="100%" stopColor={col} stopOpacity="0"/>
            </linearGradient>
          </defs>
          <polygon points={fill} fill={`url(#gr-${m.accent})`}/>
          <polyline points={line} fill="none" stroke={col} strokeWidth="1.2"/>
          <circle cx={pts[pts.length-1][0]} cy={pts[pts.length-1][1]} r="2" fill={col}/>
        </svg>
      </div>
      <div style={{ ...S.mono, fontSize: 10, ...S.dim, marginTop: 4, display: "flex", justifyContent: "space-between" }}>
        <span>{m.delta} · {m.sub}</span>
        <span style={{ ...S.mute }}>{m.cmp}: <span style={{ color: "var(--ink-2)" }}>{m.cmpVal}</span></span>
      </div>
    </div>
  );
}

function FooterMeta() {
  return (
    <div style={{ padding: "10px 18px", borderLeft: "1px solid var(--line)", display: "flex", flexDirection: "column", justifyContent: "center", gap: 3, minWidth: 200, background: "rgba(167,139,250,0.03)" }}>
      <div style={{ ...S.mono, ...S.upper, fontSize: 9, ...S.dim, letterSpacing: "0.18em" }}>Data integrity</div>
      <div style={{ ...S.mono, fontSize: 11, color: "var(--ink)" }}><span style={{ color: C.green }}>●</span> 31 feeds nominal</div>
      <div style={{ ...S.mono, fontSize: 10, color: C.amber }}>⚠ 2 degraded · DOT-A41, AQS-088</div>
      <div style={{ ...S.mono, fontSize: 9, ...S.mute, marginTop: 2 }}>ledger 0xA41C…7F29 · chain synced</div>
    </div>
  );
}

/* ═══════════════════════════ DASHBOARD SHELL ══════════════════════════════ */
export function DashboardShell() {
  const [step, setStep]         = useState(0);
  const [playing, setPlaying]   = useState(false);
  const [simState, setSimState] = useState<SimState | null>(null);
  const [userCrises, setUserCrises] = useState<(UserCrisis & { aiScore: number })[]>([]);

  const timerRef     = useRef<ReturnType<typeof setInterval> | null>(null);
  const lifecycleRef = useRef<ReturnType<typeof setInterval> | null>(null);

  /* ── Fetch sim state ── */
  const fetchStep = useCallback(async (s: number) => {
    try {
      const res  = await fetch(`${API}/api/v1/simulations/step?step=${s}`, { method: "POST" });
      const data = await res.json();
      setSimState(data.state as SimState);
    } catch { /* keep static data */ }
  }, []);

  useEffect(() => { fetchStep(step); }, [step, fetchStep]);

  /* ── Playback ── */
  useEffect(() => {
    if (playing) {
      timerRef.current = setInterval(() => {
        setStep(s => {
          if (s >= MAX_STEP) { setPlaying(false); return s; }
          return s + 1;
        });
      }, 2000);
    } else if (timerRef.current) clearInterval(timerRef.current);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [playing]);

  /* ── Crisis lifecycle engine ── */
  useEffect(() => {
    lifecycleRef.current = setInterval(() => {
      const now = Date.now() - NOW_REF;
      setUserCrises(prev => prev
        .map(c => {
          const elapsed = (now - c.addedAt) / 1000;
          if (c.status === "transit" && elapsed >= TRANSIT_SECS)
            return { ...c, status: "on_scene" as const, progress: 0 };
          if (c.status === "on_scene") {
            const p = Math.min(100, ((elapsed - TRANSIT_SECS) / RESOLVE_SECS) * 100);
            if (p >= 100) return { ...c, status: "resolved" as const, progress: 100 };
            return { ...c, progress: p };
          }
          return c;
        })
        .filter(c => {
          if (c.status !== "resolved") return true;
          const elapsed = (now - c.addedAt) / 1000;
          return elapsed < TRANSIT_SECS + RESOLVE_SECS + FADE_SECS;
        })
      );
    }, 400);
    return () => { if (lifecycleRef.current) clearInterval(lifecycleRef.current); };
  }, []);

  function handleDispatch(c: UserCrisis & { aiScore: number }) {
    setUserCrises(prev => [...prev, c]);
  }

  const riskScore    = simState?.summary_metrics.city_risk_score ?? 68;
  const incidentCount = simState?.active_incidents.length ?? DESIGN_INCIDENTS.length;
  const aqi          = simState?.summary_metrics.avg_aqi ?? 162;
  const etaDelta     = simState?.summary_metrics.ambulance_eta_delta_minutes ?? -2.2;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden", background: "var(--bg)" }}>
      <Header
        riskScore={riskScore}
        incidentCount={incidentCount}
        aqi={aqi}
        etaDelta={etaDelta}
        step={step}
      />
      <main style={{ display: "grid", gridTemplateColumns: "260px 1fr 440px", flex: 1, minHeight: 0 }}>
        <LeftRail
          step={step} maxStep={MAX_STEP}
          playing={playing}
          onPlay={() => { if (step >= MAX_STEP) setStep(0); setPlaying(true); }}
          onPause={() => setPlaying(false)}
          onSeek={s => { setPlaying(false); setStep(s); }}
        />
        <div style={{ position: "relative", minHeight: 0, overflow: "hidden" }}>
          <CityMap userCrises={userCrises}/>
        </div>
        <Sidebar userCrises={userCrises} onDispatch={handleDispatch}/>
      </main>
      <MetricsStrip/>
    </div>
  );
}
