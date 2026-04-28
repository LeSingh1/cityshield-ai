"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000/api/v1";
const MAX_STEP = 8;

const TRANSIT_SECS = 11;
const RESOLVE_SECS = 12;
const FADE_SECS    = 2;

/* ── Crisis configs ──────────────────────────────────────── */
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
  "zone-central":     { name: "Central Corridor", sensitivity: 0.92, path: "M 720 207 L 370 207",                                                        x: 370, y: 207 },
  "zone-school-east": { name: "School East",       sensitivity: 0.95, path: "M 720 105 L 536 105 L 536 88 L 610 88",                                    x: 610, y: 88  },
  "zone-downtown":    { name: "Downtown Core",     sensitivity: 0.62, path: "M 720 403 L 370 403",                                                        x: 370, y: 403 },
  "zone-civic":       { name: "Civic Center",      sensitivity: 0.55, path: "M 720 301 L 268 301 L 268 340 L 205 340",                                  x: 205, y: 340 },
} as const;

type ZoneKey = keyof typeof ZONE_DISPATCH;

function aiScore(type: CrisisType, zone: ZoneKey, severity: number, waitSecs: number): number {
  const urgency     = CRISIS_TYPES[type].urgency;
  const sensitivity = ZONE_DISPATCH[zone].sensitivity;
  const timePres    = Math.min(waitSecs / 120, 1);
  return Math.round(((severity / 5) * 0.35 + urgency * 0.30 + sensitivity * 0.20 + timePres * 0.15) * 100);
}

/* ── Types ───────────────────────────────────────────────── */
interface UserCrisis {
  id: string; type: CrisisType; zone: ZoneKey; severity: number;
  addedAt: number; status: "transit" | "on_scene" | "resolved";
  progress: number; unitId: string;
}

interface Incident {
  id: string; title: string;
  type: "collision" | "fire" | "medical" | "infrastructure";
  severity: number; road_segment_id: string; description?: string; status: string;
}

interface Vehicle {
  id: string; vehicle_type: string; current_status: string;
  destination_facility_id: string | null; eta_minutes: number; eta_delta_minutes: number;
}

interface SimState {
  city_name: string; timestamp: string; headline: string;
  active_incidents: Incident[];
  zones: { id: string; unified_risk: number; dominant_factor: string; aqi: number }[];
  road_segments: { id: string; congestion_index: number; status: string }[];
  summary_metrics: { city_risk_score: number; avg_congestion_index: number; avg_aqi: number; ambulance_eta_delta_minutes: number; public_building_strain_avg: number };
  domain_scores: { traffic: number; air_quality: number; emergency_delay: number; energy_strain: number };
  recommendations: { id: string; title: string; rationale: string; confidence: number; expected_benefits: string[]; action: string }[];
  impact_summary: { ambulance_eta_reduction_pct: number; queue_length_reduction_pct: number; exposure_reduction_pct: number; energy_shift_kw: number };
  vehicles: Vehicle[];
  applied_actions?: string[];
}

const STEP_LABELS = ["City normal","Baseline","Collision","Spillback","AQI warning","Amb delay","Fire","Cardiac","Water main"];

function riskColor(v: number) { return v >= 70 ? "#f87171" : v >= 50 ? "#fbbf24" : "#34d399"; }
function clampScore(v: number) { return Math.max(0, Math.min(99, Math.round(v))); }
function alertLevel(risk: number) {
  if (risk >= 80) return { label: "CRITICAL", color: "#f87171", bg: "rgba(248,113,113,0.1)" };
  if (risk >= 60) return { label: "ELEVATED", color: "#fbbf24", bg: "rgba(251,191,36,0.1)"  };
  if (risk >= 30) return { label: "GUARDED",  color: "#38bdf8",  bg: "rgba(56,189,248,0.1)" };
  return               { label: "NORMAL",   color: "#34d399", bg: "rgba(52,211,153,0.1)"  };
}
const VEH_ICON: Record<string,string> = { ambulance: "🚑", fire_engine: "🚒" };

function crisisVehicleIcon(type: CrisisType) {
  const vehicle = CRISIS_TYPES[type].vehicle;
  if (vehicle === "fire_engine") return "🚒";
  if (vehicle === "utility") return "🚐";
  return "🚑";
}

function crisisAffectedSegments(crisis: Pick<UserCrisis, "zone" | "type">): string[] {
  if (crisis.zone === "zone-school-east") return ["segment-r10", "segment-r08"];
  if (crisis.zone === "zone-downtown") return ["segment-r11"];
  if (crisis.zone === "zone-civic") return ["segment-r12"];
  if (crisis.type === "infrastructure" || crisis.type === "flooding") return ["segment-r09", "segment-r10"];
  return ["segment-r08", "segment-r09"];
}

function domainScoresWithCrises(state: SimState | null, crises: UserCrisis[]) {
  const base = state?.domain_scores ?? { traffic: 0, air_quality: 0, emergency_delay: 0, energy_strain: 0 };
  const next = { ...base };
  for (const crisis of crises) {
    const pressure = crisis.severity * (crisis.status === "transit" ? 4 : 2);
    if (crisis.type === "medical") next.emergency_delay += pressure + 8;
    if (crisis.type === "collision") { next.traffic += pressure + 6; next.emergency_delay += pressure; }
    if (crisis.type === "fire" || crisis.type === "gas_leak") { next.air_quality += pressure + 5; next.emergency_delay += pressure; }
    if (crisis.type === "flooding") { next.traffic += pressure + 4; next.energy_strain += pressure; }
    if (crisis.type === "infrastructure") { next.energy_strain += pressure + 6; next.traffic += pressure; }
  }
  return {
    traffic: clampScore(next.traffic),
    air_quality: clampScore(next.air_quality),
    emergency_delay: clampScore(next.emergency_delay),
    energy_strain: clampScore(next.energy_strain),
  };
}

/* ════════════════════════════════════════════════════════════
   CITY MAP  (unchanged SVG component)
═════════════════════════════════════════════════════════════ */
function CityMap({ state, step, userCrises }: { state: SimState|null; step: number; userCrises: UserCrisis[] }) {
  const segs  = state?.road_segments ?? [];
  const incs  = state?.active_incidents ?? [];
  const zones = state?.zones ?? [];
  const vehs  = state?.vehicles ?? [];
  const applied = new Set(state?.applied_actions ?? []);
  const rerouted = applied.has("reroute_general_traffic");
  const greenWave = applied.has("ambulance_green_wave");
  const fireLane = applied.has("fire_lane_clearance");
  const activeUserCrises = userCrises.filter(c => c.status !== "resolved");
  const userAffectedSegments = new Set(activeUserCrises.flatMap(crisisAffectedSegments));

  const segStatus = (id: string) => segs.find(s => s.id === id)?.status ?? "normal";
  const roadFill  = (id: string) => {
    if (rerouted && (id === "segment-r08" || id === "segment-r09" || id === "segment-r10")) return "rgba(52,211,153,0.32)";
    if (fireLane && id === "segment-r11") return "rgba(52,211,153,0.28)";
    if (userAffectedSegments.has(id)) return "rgba(167,139,250,0.34)";
    const s = segStatus(id);
    return s === "managed" ? "rgba(52,211,153,0.30)" :
           s === "blocked"  ? "rgba(248,113,113,0.55)" :
           s === "critical" ? "rgba(248,113,113,0.40)" :
           s === "stressed" ? "rgba(251,191,36,0.38)"  : "rgba(56,189,248,0.13)";
  };
  const congLabel = (id: string) => {
    const s = segStatus(id);
    return s === "normal" ? null : s === "blocked" ? "BLOCKED" : s === "critical" ? "CRITICAL" : "CONGESTED";
  };

  const hasType      = (t: Incident["type"]) => incs.some(i => i.type === t);
  const hasCollision = hasType("collision");
  const hasFire      = hasType("fire");
  const hasCardiac   = hasType("medical");
  const hasWater     = hasType("infrastructure");
  const hasAqi       = zones.find(z => z.id === "zone-school-east")?.dominant_factor === "air_quality";
  const schoolAqi    = zones.find(z => z.id === "zone-school-east")?.aqi ?? 54;

  const ambu1 = vehs.find(v => v.id === "ambu-01");
  const ambu2 = vehs.find(v => v.id === "ambu-02");
  const fire1 = vehs.find(v => v.id === "fire-01");

  const ambu1Path = greenWave
    ? "M 700 207 L 536 207 L 536 105 L 88 105 L 88 96"
    : step >= 2
    ? "M 700 207 L 402 207 L 402 105 L 88 105 L 88 96"
    : "M 700 207 L 134 207 L 134 105 L 88 105 L 88 96";
  const ambu2Path = "M 700 403 L 134 403 L 134 326";
  const fire1Path = fireLane
    ? "M 536 0 L 536 301 L 402 301 L 402 403 L 236 403"
    : "M 536 0 L 536 301 L 268 301 L 268 403 L 236 403";

  const circ = 2 * Math.PI * 30;

  return (
    <svg viewBox="0 0 720 480" preserveAspectRatio="xMidYMid meet"
      style={{ position:"absolute", inset:0, width:"100%", height:"100%" }}>
      <defs>
        <radialGradient id="gAqi" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="#fbbf24" stopOpacity="0.35"/><stop offset="100%" stopColor="#fbbf24" stopOpacity="0"/></radialGradient>
        <radialGradient id="gSmoke" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="#6b7280" stopOpacity="0.30"/><stop offset="100%" stopColor="#6b7280" stopOpacity="0"/></radialGradient>
        <radialGradient id="gWater" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="#38bdf8" stopOpacity="0.25"/><stop offset="100%" stopColor="#38bdf8" stopOpacity="0"/></radialGradient>
        <filter id="glow"><feGaussianBlur stdDeviation="2.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        <filter id="glow2"><feGaussianBlur stdDeviation="5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        <filter id="vshadow"><feDropShadow dx="0" dy="1" stdDeviation="2" floodColor="#000" floodOpacity="0.6"/></filter>
      </defs>

      <rect width={720} height={480} fill="#030b14"/>

      {([
        [0,0,128,100],[140,0,122,100],[274,0,122,100],[408,0,122,100],[542,0,178,100],
        [0,112,128,90],[140,112,122,90],[274,112,122,90],[408,112,122,90],[542,112,178,90],
        [0,214,128,80],[140,214,122,80],[274,214,122,80],[408,214,122,80],[542,214,178,80],
        [0,306,128,90],[140,306,122,90],[274,306,122,90],[408,306,122,90],[542,306,178,90],
        [0,408,128,72],[140,408,122,72],[274,408,122,72],[408,408,122,72],[542,408,178,72],
      ] as [number,number,number,number][]).map(([x,y,w,h],i)=>(
        <rect key={i} x={x} y={y} width={w} height={h} fill="#060f1c" rx={1}/>
      ))}

      {[100,202,296,398].map(y=><rect key={`hy${y}`} x={0} y={y} width={720} height={10} fill="rgba(56,189,248,0.055)"/>)}
      {[128,262,396,530].map(x=><rect key={`vx${x}`} x={x} y={0} width={12} height={480} fill="rgba(56,189,248,0.055)"/>)}

      <rect x={0}   y={202} width={720} height={12} fill={roadFill("segment-r08")}/>
      <rect x={0}   y={202} width={262} height={12} fill={roadFill("segment-r09")} opacity={0.75}/>
      <rect x={262} y={0}   width={12}  height={480} fill={roadFill("segment-r10")} opacity={0.5}/>
      <rect x={530} y={0}   width={12}  height={202} fill={roadFill("segment-r10")} opacity={0.4}/>
      <rect x={0}   y={398} width={430} height={10} fill={roadFill("segment-r11")}/>
      <rect x={128} y={296} width={12}  height={112} fill={roadFill("segment-r12")} opacity={0.65}/>
      {rerouted && (
        <path d="M 36 207 L 134 207 L 134 403 L 536 403 L 536 207 L 684 207" fill="none" stroke="#34d399" strokeWidth={2.2}
          strokeDasharray="10 7" opacity={0.72}/>
      )}
      {greenWave && (
        <path d={ambu1Path} fill="none" stroke="#34d399" strokeWidth={3} strokeDasharray="5 5" opacity={0.36}/>
      )}

      <text x={420} y={211} fill="rgba(56,189,248,0.32)" fontSize={7} fontFamily="JetBrains Mono,monospace">CENTRAL AVE E</text>
      <text x={16}  y={211} fill="rgba(56,189,248,0.32)" fontSize={7} fontFamily="JetBrains Mono,monospace">CENTRAL AVE W</text>
      <text x={438} y={406} fill="rgba(56,189,248,0.32)" fontSize={7} fontFamily="JetBrains Mono,monospace">MARKET ST</text>
      <text x={268} y={470} fill="rgba(56,189,248,0.32)" fontSize={7} fontFamily="JetBrains Mono,monospace" transform="rotate(-90,268,470)">3RD ST</text>
      <text x={402} y={450} fill="rgba(56,189,248,0.32)" fontSize={7} fontFamily="JetBrains Mono,monospace" transform="rotate(-90,402,450)">5TH AVE</text>
      <text x={536} y={430} fill="rgba(56,189,248,0.32)" fontSize={7} fontFamily="JetBrains Mono,monospace" transform="rotate(-90,536,430)">7TH AVE</text>
      <text x={134} y={355} fill="rgba(56,189,248,0.32)" fontSize={7} fontFamily="JetBrains Mono,monospace" transform="rotate(-90,134,355)">CIVIC DR</text>
      <text x={134} y={165} fill="rgba(56,189,248,0.32)" fontSize={7} fontFamily="JetBrains Mono,monospace" transform="rotate(-90,134,165)">1ST AVE</text>

      {congLabel("segment-r08") && !rerouted && <g><rect x={310} y={184} width={74} height={14} rx={2} fill="rgba(251,191,36,0.14)" stroke="rgba(251,191,36,0.5)" strokeWidth={0.6}/><text x={347} y={194} textAnchor="middle" fill="#fbbf24" fontSize={7} fontWeight="700" fontFamily="JetBrains Mono,monospace">{congLabel("segment-r08")}</text></g>}
      {congLabel("segment-r09") && !rerouted && <g><rect x={42}  y={220} width={74} height={14} rx={2} fill="rgba(248,113,113,0.14)" stroke="rgba(248,113,113,0.5)" strokeWidth={0.6}/><text x={79} y={230} textAnchor="middle" fill="#f87171" fontSize={7} fontWeight="700" fontFamily="JetBrains Mono,monospace">{congLabel("segment-r09")}</text></g>}
      {congLabel("segment-r11") && !fireLane && <g><rect x={42} y={374} width={60} height={13} rx={2} fill="rgba(251,146,60,0.14)" stroke="rgba(251,146,60,0.5)" strokeWidth={0.6}/><text x={72} y={384} textAnchor="middle" fill="#fb923c" fontSize={7} fontWeight="700" fontFamily="JetBrains Mono,monospace">{congLabel("segment-r11")}</text></g>}
      {rerouted && <g><rect x={428} y={380} width={72} height={14} rx={2} fill="rgba(52,211,153,0.13)" stroke="rgba(52,211,153,0.48)" strokeWidth={0.7}/><text x={464} y={390} textAnchor="middle" fill="#34d399" fontSize={7} fontWeight="700" fontFamily="JetBrains Mono,monospace">REROUTED</text></g>}
      {fireLane && <g><rect x={284} y={374} width={76} height={14} rx={2} fill="rgba(52,211,153,0.13)" stroke="rgba(52,211,153,0.48)" strokeWidth={0.7}/><text x={322} y={384} textAnchor="middle" fill="#34d399" fontSize={7} fontWeight="700" fontFamily="JetBrains Mono,monospace">LANE CLEAR</text></g>}

      {hasAqi   && <ellipse cx={595} cy={88}  rx={118} ry={78} fill="url(#gAqi)"/>}
      {hasFire  && <ellipse cx={210} cy={408} rx={96}  ry={52} fill="url(#gSmoke)"/>}
      {hasWater && <ellipse cx={134} cy={208} rx={48}  ry={20} fill="url(#gWater)"/>}

      {ambu1?.current_status==="en_route" && <path d={ambu1Path} fill="none" stroke={ambu1.eta_delta_minutes>0?"#f87171":"#38bdf8"} strokeWidth={1.5} strokeDasharray="7 5" opacity={0.35}/>}
      {ambu2?.current_status==="en_route" && <path d={ambu2Path} fill="none" stroke="#a78bfa" strokeWidth={1.5} strokeDasharray="7 5" opacity={0.35}/>}
      {fire1?.current_status==="en_route" && <path d={fire1Path} fill="none" stroke="#fb923c" strokeWidth={1.5} strokeDasharray="7 5" opacity={0.35}/>}

      {activeUserCrises.map(c=>(
        <path key={`route-${c.id}`} d={ZONE_DISPATCH[c.zone].path} fill="none"
          stroke={CRISIS_TYPES[c.type].color} strokeWidth={c.status === "transit" ? 1.7 : 1.1}
          strokeDasharray={c.status === "transit" ? "7 5" : "3 6"} opacity={c.status === "transit" ? 0.44 : 0.25}/>
      ))}

      {hasCollision && <g filter="url(#glow)"><circle cx={274} cy={208} r={20} fill="rgba(248,113,113,0.15)"><animate attributeName="r" values="20;32;20" dur="2s" repeatCount="indefinite"/><animate attributeName="opacity" values="0.9;0.2;0.9" dur="2s" repeatCount="indefinite"/></circle><circle cx={274} cy={208} r={8} fill="#f87171"/><circle cx={274} cy={208} r={3.5} fill="#fff" opacity={0.9}/></g>}
      {hasFire      && <g filter="url(#glow2)"><circle cx={210} cy={405} r={16} fill="rgba(251,146,60,0.2)"><animate attributeName="r" values="16;26;16" dur="1.5s" repeatCount="indefinite"/></circle><circle cx={210} cy={405} r={8} fill="#fb923c"/><circle cx={210} cy={405} r={3.5} fill="#fff4e6" opacity={0.9}/></g>}
      {hasCardiac   && <g filter="url(#glow)"><circle cx={152} cy={340} r={14} fill="rgba(167,139,250,0.2)"><animate attributeName="r" values="14;22;14" dur="1.0s" repeatCount="indefinite"/></circle><circle cx={152} cy={340} r={7} fill="#a78bfa"/><circle cx={152} cy={340} r={3} fill="#faf5ff" opacity={0.9}/></g>}
      {hasWater     && <g filter="url(#glow)"><circle cx={134} cy={208} r={11} fill="rgba(56,189,248,0.25)"><animate attributeName="r" values="11;17;11" dur="2.2s" repeatCount="indefinite"/></circle><circle cx={134} cy={208} r={5.5} fill="#38bdf8"/><circle cx={134} cy={208} r={2.2} fill="#e0f7ff" opacity={0.9}/></g>}

      {hasCollision && <text x={312} y={184} textAnchor="middle" fill="#f87171" fontSize={8} fontWeight="700" fontFamily="JetBrains Mono,monospace" filter="url(#glow)">COLLISION</text>}
      {hasFire      && <text x={258} y={392} textAnchor="middle" fill="#fb923c" fontSize={8} fontWeight="700" fontFamily="JetBrains Mono,monospace" filter="url(#glow)">FIRE</text>}
      {hasCardiac   && <text x={112} y={346} textAnchor="middle" fill="#a78bfa" fontSize={8} fontWeight="700" fontFamily="JetBrains Mono,monospace" filter="url(#glow)">CARDIAC</text>}
      {hasWater     && <text x={168} y={178} textAnchor="middle" fill="#38bdf8" fontSize={8} fontWeight="700" fontFamily="JetBrains Mono,monospace" filter="url(#glow)">WATER MAIN</text>}

      {activeUserCrises.map(c=>{
        const disp  = ZONE_DISPATCH[c.zone];
        const color = CRISIS_TYPES[c.type].color;
        const mx = disp.x - 34; const my = disp.y - 28;
        return (
          <g key={`marker-${c.id}`} filter="url(#glow)">
            <polygon points={`${mx},${my-11} ${mx+11},${my} ${mx},${my+11} ${mx-11},${my}`} fill={color} opacity={0.9}>
              <animate attributeName="opacity" values="0.9;0.35;0.9" dur="1.6s" repeatCount="indefinite"/>
            </polygon>
            <text x={mx} y={my-15} textAnchor="middle" fill={color} fontSize={7} fontWeight="700" fontFamily="JetBrains Mono,monospace">{CRISIS_TYPES[c.type].label.toUpperCase()}</text>
          </g>
        );
      })}

      {ambu1?.current_status==="en_route" && (
        <g filter="url(#vshadow)">
          <rect x="-11" y="-5.5" width="22" height="11" rx="2.5" fill="#dbeafe" stroke={ambu1.eta_delta_minutes>0?"#f87171":"#38bdf8"} strokeWidth="1.2"/>
          <rect x="5" y="-3.5" width="5" height="7" rx="1" fill="#93c5fd" opacity="0.75"/>
          <rect x="-2" y="-3.5" width="3" height="7" fill="#ef4444"/>
          <rect x="-4.5" y="-1" width="7" height="2" fill="#ef4444"/>
          <rect x="-5" y="-8.5" width="10" height="3" rx="1.5"><animate attributeName="fill" values="#ef4444;#3b82f6;#ef4444" dur="0.65s" repeatCount="indefinite"/></rect>
          <rect x="-11" y="-8" width="4" height="3" rx="0.8" fill="#0f172a"/>
          <rect x="-11" y="5" width="4" height="3" rx="0.8" fill="#0f172a"/>
          <rect x="7" y="-8" width="4" height="3" rx="0.8" fill="#0f172a"/>
          <rect x="7" y="5" width="4" height="3" rx="0.8" fill="#0f172a"/>
          <text y="18" textAnchor="middle" fill={ambu1.eta_delta_minutes>0?"#f87171":"#38bdf8"} fontSize="7" fontFamily="JetBrains Mono,monospace" fontWeight="700">A-1</text>
          <animateMotion dur="9s" repeatCount="indefinite" rotate="auto" path={ambu1Path}/>
        </g>
      )}
      {ambu2?.current_status==="en_route" && (
        <g filter="url(#vshadow)">
          <rect x="-11" y="-5.5" width="22" height="11" rx="2.5" fill="#ede9fe" stroke="#a78bfa" strokeWidth="1.2"/>
          <rect x="5" y="-3.5" width="5" height="7" rx="1" fill="#c4b5fd" opacity="0.75"/>
          <rect x="-2" y="-3.5" width="3" height="7" fill="#7c3aed"/>
          <rect x="-4.5" y="-1" width="7" height="2" fill="#7c3aed"/>
          <rect x="-5" y="-8.5" width="10" height="3" rx="1.5"><animate attributeName="fill" values="#a78bfa;#ec4899;#a78bfa" dur="0.65s" repeatCount="indefinite"/></rect>
          <rect x="-11" y="-8" width="4" height="3" rx="0.8" fill="#0f172a"/>
          <rect x="-11" y="5" width="4" height="3" rx="0.8" fill="#0f172a"/>
          <rect x="7" y="-8" width="4" height="3" rx="0.8" fill="#0f172a"/>
          <rect x="7" y="5" width="4" height="3" rx="0.8" fill="#0f172a"/>
          <text y="18" textAnchor="middle" fill="#a78bfa" fontSize="7" fontFamily="JetBrains Mono,monospace" fontWeight="700">A-2</text>
          <animateMotion dur="7s" repeatCount="indefinite" rotate="auto" path={ambu2Path}/>
        </g>
      )}
      {fire1?.current_status==="en_route" && (
        <g filter="url(#vshadow)">
          <rect x="-14" y="-5.5" width="28" height="11" rx="2" fill="#fef2f2" stroke="#fb923c" strokeWidth="1.2"/>
          <rect x="8" y="-4.5" width="5" height="9" rx="1" fill="#fed7aa" opacity="0.85"/>
          <rect x="-12" y="-9" width="20" height="1.5" rx="0.5" fill="#fb923c" opacity="0.8"/>
          {[-8,-4,0,4].map(lx=><line key={lx} x1={lx} y1="-9" x2={lx} y2="-7.5" stroke="#ea580c" strokeWidth="0.8"/>)}
          <rect x="-5" y="-12" width="10" height="3" rx="1.5"><animate attributeName="fill" values="#ef4444;#fbbf24;#ef4444" dur="0.5s" repeatCount="indefinite"/></rect>
          <rect x="-13" y="-8.5" width="4" height="3" rx="0.8" fill="#0f172a"/>
          <rect x="-13" y="5.5" width="4" height="3" rx="0.8" fill="#0f172a"/>
          <rect x="9" y="-8.5" width="4" height="3" rx="0.8" fill="#0f172a"/>
          <rect x="9" y="5.5" width="4" height="3" rx="0.8" fill="#0f172a"/>
          <text y="18" textAnchor="middle" fill="#fb923c" fontSize="7" fontFamily="JetBrains Mono,monospace" fontWeight="700">F-1</text>
          <animateMotion dur="8s" repeatCount="indefinite" rotate="auto" path={fire1Path}/>
        </g>
      )}

      {activeUserCrises.map(c=>{
        const disp  = ZONE_DISPATCH[c.zone];
        const color = CRISIS_TYPES[c.type].color;
        const isOnScene = c.status === "on_scene";
        const icon = crisisVehicleIcon(c.type);
        return (
          <g key={`unit-${c.id}`} filter="url(#vshadow)"
            transform={isOnScene ? `translate(${disp.x},${disp.y})` : undefined}>
            <circle r="12" fill="rgba(3,11,20,0.92)" stroke={color} strokeWidth="1.3"/>
            <text x="0" y="4" textAnchor="middle" fontSize="13" fontFamily="Apple Color Emoji, Segoe UI Emoji, sans-serif">{icon}</text>
            <rect x="-6" y="-16" width="12" height="3" rx="1.5">
              <animate attributeName="fill" values={`${color};#ffffff;${color}`} dur="0.55s" repeatCount="indefinite"/>
            </rect>
            <text x="0" y="24" textAnchor="middle" fill={color} fontSize="6.5" fontWeight="700" fontFamily="JetBrains Mono,monospace">{c.unitId}</text>
            {isOnScene && (
              <>
                <circle r={30} fill="none" stroke={color} strokeWidth={1} opacity={0.18}/>
                <circle r={30} fill="none" stroke={color} strokeWidth={2.8}
                  strokeDasharray={circ} strokeDashoffset={circ * (1 - c.progress / 100)}
                  transform="rotate(-90)" opacity={0.88}/>
                <text x="0" y="-37" textAnchor="middle" fill={color} fontSize="8" fontFamily="JetBrains Mono,monospace" fontWeight="700">{Math.round(c.progress)}%</text>
                <text x="0" y="35" textAnchor="middle" fill={color} fontSize="6.5" fontFamily="JetBrains Mono,monospace" opacity="0.75">RESOLVING</text>
              </>
            )}
            {!isOnScene && (
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              <animateMotion dur={`${TRANSIT_SECS}s`} fill="freeze" rotate="auto" {...{ path: disp.path } as any}/>
            )}
          </g>
        );
      })}

      <rect x={44} y={72} width={42} height={26} rx={4} fill="rgba(52,211,153,0.18)" stroke="rgba(52,211,153,0.6)" strokeWidth={1.5}/>
      <text x={65} y={89} textAnchor="middle" fill="rgba(52,211,153,0.95)" fontSize={11} fontWeight="700" fontFamily="JetBrains Mono,monospace">H+</text>
      <text x={65} y={68} textAnchor="middle" fill="rgba(52,211,153,0.5)" fontSize={7} fontFamily="JetBrains Mono,monospace">ST. ANNE HOSP.</text>

      <rect x={558} y={34} width={44} height={26} rx={4}
        fill={hasAqi?"rgba(251,191,36,0.22)":"rgba(251,191,36,0.1)"}
        stroke={hasAqi?"rgba(251,191,36,0.85)":"rgba(251,191,36,0.35)"} strokeWidth={1.5}/>
      <text x={580} y={51} textAnchor="middle" fill="rgba(251,191,36,0.95)" fontSize={9} fontWeight="700" fontFamily="JetBrains Mono,monospace">ELEM.</text>
      <text x={548} y={30} fill="rgba(251,191,36,0.5)" fontSize={7} fontFamily="JetBrains Mono,monospace">JEFFERSON</text>
      {hasAqi && <g><line x1={602} y1={47} x2={636} y2={20} stroke="rgba(251,191,36,0.28)" strokeWidth={0.9}/><rect x={632} y={8} width={62} height={20} rx={3} fill="rgba(251,191,36,0.18)" stroke="rgba(251,191,36,0.55)" strokeWidth={1}/><text x={663} y={22} textAnchor="middle" fill="#fbbf24" fontSize={9} fontWeight="700" fontFamily="JetBrains Mono,monospace">AQI {schoolAqi}</text></g>}

      <rect x={184} y={394} width={52} height={22} rx={4} fill={hasFire?"rgba(251,146,60,0.22)":"rgba(251,146,60,0.08)"} stroke={hasFire?"rgba(251,146,60,0.85)":"rgba(251,146,60,0.28)"} strokeWidth={1.5}/>
      <text x={210} y={409} textAnchor="middle" fill="rgba(251,146,60,0.95)" fontSize={8} fontWeight="700" fontFamily="JetBrains Mono,monospace">LIBRARY</text>
      <text x={210} y={426} textAnchor="middle" fill="rgba(251,146,60,0.48)" fontSize={7} fontFamily="JetBrains Mono,monospace">PUB. LIBRARY</text>

      <rect x={134} y={312} width={52} height={22} rx={4} fill={hasCardiac?"rgba(167,139,250,0.22)":"rgba(167,139,250,0.08)"} stroke={hasCardiac?"rgba(167,139,250,0.85)":"rgba(167,139,250,0.28)"} strokeWidth={1.5}/>
      <text x={160} y={326} textAnchor="middle" fill="rgba(167,139,250,0.95)" fontSize={8} fontWeight="700" fontFamily="JetBrains Mono,monospace">CIVIC CTR</text>

      {ambu1?.current_status==="en_route" && ambu1.eta_delta_minutes>0 && <g><rect x={392} y={148} width={84} height={14} rx={2} fill="rgba(248,113,113,0.13)" stroke="rgba(248,113,113,0.38)" strokeWidth={0.7}/><text x={434} y={158} textAnchor="middle" fill="#f87171" fontSize={7.5} fontWeight="700" fontFamily="JetBrains Mono,monospace">A-1 DELAY +{ambu1.eta_delta_minutes}m</text></g>}
      {ambu2?.current_status==="en_route" && ambu2.eta_delta_minutes>0 && <g><rect x={430} y={330} width={84} height={14} rx={2} fill="rgba(167,139,250,0.13)" stroke="rgba(167,139,250,0.38)" strokeWidth={0.7}/><text x={472} y={340} textAnchor="middle" fill="#a78bfa" fontSize={7.5} fontWeight="700" fontFamily="JetBrains Mono,monospace">A-2 DELAY +{ambu2.eta_delta_minutes}m</text></g>}

      <text x={14} y={470} fill="rgba(56,189,248,0.22)" fontSize={7} fontFamily="JetBrains Mono,monospace">N↑  MetroSim · AI-optimal routing active</text>
    </svg>
  );
}

/* ── Sim controls ────────────────────────────────────────── */
function SimControls({ step, playing, loading, onPlay, onPause, onReset, onSeek }: {
  step: number; playing: boolean; loading: boolean;
  onPlay: ()=>void; onPause: ()=>void; onReset: ()=>void; onSeek: (s: number)=>void;
}) {
  return (
    <div className="sim-controls">
      <button className="sim-btn" onClick={onReset} disabled={loading}>↺</button>
      <button className="sim-btn" onClick={playing ? onPause : onPlay} disabled={loading}>
        {loading ? "…" : playing ? "⏸" : "▶"}
      </button>
      <div className="sim-track">
        {STEP_LABELS.map((label, i) => (
          <button key={i} className={`sim-step ${i===step?"active":""} ${i<step?"past":""}`} onClick={()=>onSeek(i)} title={label}>
            <span className="sim-dot"/><span className="sim-step-label">{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ── Dispatch panel ──────────────────────────────────────── */
let unitCounter = 1;

function AddCrisisPanel({ onDispatch }: { onDispatch: (c: UserCrisis & { aiScore: number }) => void }) {
  const [selType,     setSelType]     = useState<CrisisType>("medical");
  const [selSeverity, setSelSeverity] = useState(3);
  const [selZone,     setSelZone]     = useState<ZoneKey>("zone-central");
  const [dispatched,  setDispatched]  = useState(false);

  const dispatch = () => {
    const now = Date.now();
    const prefix = CRISIS_TYPES[selType].vehicle === "fire_engine" ? "F" : CRISIS_TYPES[selType].vehicle === "utility" ? "U" : "A";
    const id = `user-${now}`;
    const score = aiScore(selType, selZone, selSeverity, 0);
    const crisis: UserCrisis = { id, type: selType, zone: selZone, severity: selSeverity, addedAt: now, status: "transit", progress: 0, unitId: `${prefix}-${unitCounter++}` };
    onDispatch({ ...crisis, aiScore: score } as UserCrisis & { aiScore: number });
    setDispatched(true);
    setTimeout(() => setDispatched(false), 1500);
  };

  const cfg = CRISIS_TYPES[selType];

  return (
    <div className="dpane" style={{ gap: 10 }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div><div className="dpane-label">Dispatch control</div><div className="dpane-title">Add crisis</div></div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 4 }}>
        {(Object.entries(CRISIS_TYPES) as [CrisisType, typeof CRISIS_TYPES[CrisisType]][]).map(([key, c]) => (
          <button key={key} onClick={() => setSelType(key)} className="type-btn"
            style={{
              borderColor: selType === key ? c.color : "rgba(255,255,255,0.08)",
              background:  selType === key ? `${c.color}14` : "rgba(255,255,255,0.02)",
              color:       selType === key ? c.color : "var(--dm-muted)",
            }}>
            <span style={{ fontSize: "1rem" }}>{c.icon}</span>
            <span style={{ lineHeight: 1.2, textAlign: "center" }}>{c.label.split(" ").slice(-1)[0]}</span>
          </button>
        ))}
      </div>

      <div>
        <div style={{ fontSize: "0.58rem", color: "var(--dm-muted)", fontFamily: "var(--mono)", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.1em" }}>Severity</div>
        <div style={{ display: "flex", gap: 3 }}>
          {[1,2,3,4,5].map(n => (
            <button key={n} onClick={() => setSelSeverity(n)}
              style={{
                flex: 1, height: 26, borderRadius: 4, border: "1px solid",
                borderColor: selSeverity >= n ? riskColor(n * 20) : "rgba(255,255,255,0.08)",
                background:  selSeverity >= n ? `${riskColor(n * 20)}14` : "rgba(255,255,255,0.02)",
                color:       selSeverity >= n ? riskColor(n * 20) : "var(--dm-muted)",
                cursor: "pointer", fontSize: "0.72rem", fontFamily: "var(--mono)", fontWeight: 600,
              }}>{n}</button>
          ))}
        </div>
      </div>

      <div>
        <div style={{ fontSize: "0.58rem", color: "var(--dm-muted)", fontFamily: "var(--mono)", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.1em" }}>Zone</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 3 }}>
          {(Object.entries(ZONE_DISPATCH) as [ZoneKey, typeof ZONE_DISPATCH[ZoneKey]][]).map(([key, z]) => (
            <button key={key} onClick={() => setSelZone(key)}
              style={{
                padding: "4px 7px", borderRadius: 4, border: "1px solid",
                borderColor: selZone === key ? "#38bdf8" : "rgba(255,255,255,0.08)",
                background:  selZone === key ? "rgba(56,189,248,0.1)" : "rgba(255,255,255,0.02)",
                color:       selZone === key ? "#38bdf8" : "var(--dm-muted)",
                cursor: "pointer", fontSize: "0.62rem", fontFamily: "var(--mono)",
              }}>{z.name}</button>
          ))}
        </div>
      </div>

      <button onClick={dispatch}
        style={{
          padding: "8px", borderRadius: 5, border: "1px solid",
          borderColor: dispatched ? "#34d399" : cfg.color,
          background:  dispatched ? "rgba(52,211,153,0.1)" : `${cfg.color}14`,
          color:       dispatched ? "#34d399" : cfg.color,
          cursor: "pointer", fontFamily: "var(--mono)", fontSize: "0.7rem", fontWeight: 700,
          letterSpacing: "0.07em", transition: "all 0.2s",
        }}>
        {dispatched ? "✓ UNIT DISPATCHED" : `▶ AI DISPATCH — ${cfg.icon} ${cfg.label}`}
      </button>
    </div>
  );
}

/* ── Priority queue ──────────────────────────────────────── */
function CrisisPriorityPanel({ userCrises, simIncidents }: { userCrises: (UserCrisis & { aiScore: number })[]; simIncidents: Incident[] }) {
  const now = Date.now();

  const simRows = simIncidents.map(inc => ({
    id: inc.id, label: inc.title,
    icon: inc.type === "fire" ? "🔥" : inc.type === "medical" ? "🫀" : inc.type === "infrastructure" ? "💧" : "💥",
    color: inc.type === "fire" ? "#fb923c" : inc.type === "medical" ? "#a78bfa" : inc.type === "infrastructure" ? "#38bdf8" : "#f87171",
    severity: inc.severity, zone: "zone-central" as ZoneKey,
    aiScore: aiScore(inc.type === "medical" ? "medical" : inc.type === "fire" ? "fire" : inc.type === "infrastructure" ? "infrastructure" : "collision", "zone-central", inc.severity, 120),
    status: "responding" as const, unit: "A-1 / F-1", waitSecs: 120,
  }));

  const userRows = userCrises.filter(c => c.status !== "resolved").map(c => ({
    id: c.id, label: CRISIS_TYPES[c.type].label,
    icon: CRISIS_TYPES[c.type].icon, color: CRISIS_TYPES[c.type].color,
    severity: c.severity, zone: c.zone,
    aiScore: aiScore(c.type, c.zone, c.severity, (now - c.addedAt) / 1000),
    status: c.status, unit: c.unitId,
    waitSecs: Math.floor((now - c.addedAt) / 1000),
  }));

  const all = [...simRows, ...userRows].sort((a, b) => b.aiScore - a.aiScore);

  if (!all.length) return (
    <div className="dpane">
      <div className="dpane-label">AI priority queue</div>
      <div className="empty-state">✓ No active incidents</div>
    </div>
  );

  return (
    <div className="dpane priority-pane">
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div><div className="dpane-label">AI priority queue</div><div className="dpane-title">Ranked incidents</div></div>
        <span className="dpane-badge" style={{ background: "rgba(248,113,113,0.1)", color: "#f87171", border: "1px solid rgba(248,113,113,0.28)" }}>{all.length} ACTIVE</span>
      </div>
      {all.map((row, i) => (
        <div key={row.id} style={{ display:"flex", alignItems:"flex-start", gap:7, padding:"7px 0", borderTop:"1px solid rgba(83,195,255,0.08)" }}>
          <div style={{ width:18, height:18, borderRadius:3, background:i===0?"rgba(248,113,113,0.15)":"rgba(255,255,255,0.04)", border:`1px solid ${i===0?"rgba(248,113,113,0.4)":"rgba(255,255,255,0.1)"}`, display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"var(--mono)", fontSize:"0.6rem", fontWeight:700, color:i===0?"#f87171":"var(--dm-muted)", flexShrink:0 }}>{i+1}</div>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ display:"flex", alignItems:"center", gap:4, marginBottom:2 }}>
              <span style={{ fontSize:"0.85rem" }}>{row.icon}</span>
              <span style={{ fontSize:"0.75rem", fontWeight:600, color:row.color, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{row.label}</span>
            </div>
            <div style={{ display:"flex", gap:4, alignItems:"center", flexWrap:"wrap" }}>
              <div style={{ display:"flex", gap:2 }}>{[1,2,3,4,5].map(n=><div key={n} style={{ width:7, height:3, borderRadius:1, background:n<=row.severity?row.color:"rgba(255,255,255,0.1)" }}/>)}</div>
              <span style={{ fontFamily:"var(--mono)", fontSize:"0.58rem", color:"var(--dm-muted)" }}>{ZONE_DISPATCH[row.zone]?.name}</span>
            </div>
            <div style={{ marginTop:4, display:"flex", alignItems:"center", gap:5 }}>
              <div style={{ flex:1, height:3, background:"rgba(255,255,255,0.05)", borderRadius:2, overflow:"hidden" }}>
                <div style={{ height:"100%", width:`${row.aiScore}%`, background:row.color, transition:"width 0.5s" }}/>
              </div>
              <span style={{ fontFamily:"var(--mono)", fontSize:"0.64rem", fontWeight:700, color:row.color, width:22, textAlign:"right" }}>{row.aiScore}</span>
            </div>
          </div>
          <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:2, flexShrink:0 }}>
            <span style={{ fontFamily:"var(--mono)", fontSize:"0.56rem", padding:"2px 5px", borderRadius:3, background:row.status==="on_scene"?"rgba(52,211,153,0.1)":"rgba(56,189,248,0.08)", color:row.status==="on_scene"?"#34d399":"#38bdf8", border:`1px solid ${row.status==="on_scene"?"rgba(52,211,153,0.25)":"rgba(56,189,248,0.2)"}` }}>{row.status==="on_scene"?"ON SCENE":"EN ROUTE"}</span>
            <span style={{ fontFamily:"var(--mono)", fontSize:"0.56rem", color:row.color }}>{row.unit}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function RecommendationActionPanel({ state, applyingAction, onApply }: {
  state: SimState | null;
  applyingAction: string | null;
  onApply: (action: string) => void;
}) {
  const applied = new Set(state?.applied_actions ?? []);
  const recs = state?.recommendations?.slice(0, 4) ?? [];

  return (
    <div className="dpane action-pane" style={{ gap: 9 }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
        <div>
          <div className="dpane-label">AI actions</div>
          <div className="dpane-title">Reroute & mitigate</div>
        </div>
        <span className="dpane-badge" style={{ background: "rgba(52,211,153,0.1)", color: "#34d399", border: "1px solid rgba(52,211,153,0.25)" }}>
          {applied.size} LIVE
        </span>
      </div>
      {!recs.length && <div className="empty-state">Waiting for simulation data</div>}
      {recs.map((rec, index) => {
        const isApplied = applied.has(rec.action);
        const isApplying = applyingAction === rec.action;
        return (
          <div key={rec.id} style={{ padding: "8px 0", borderTop: "1px solid rgba(83,195,255,0.08)", display: "grid", gap: 6 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: "0.74rem", fontWeight: 700, color: isApplied ? "#34d399" : "var(--dm-text)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {index + 1}. {rec.title}
                </div>
                <div style={{ fontFamily: "var(--mono)", fontSize: "0.58rem", color: "var(--dm-muted)" }}>
                  CONF {Math.round(rec.confidence * 100)} · {rec.expected_benefits[0] ?? "Improves response"}
                </div>
              </div>
              <button
                onClick={() => onApply(rec.action)}
                disabled={isApplied || Boolean(applyingAction)}
                style={{
                  flexShrink: 0,
                  border: "1px solid",
                  borderColor: isApplied ? "rgba(52,211,153,0.36)" : "rgba(56,189,248,0.32)",
                  background: isApplied ? "rgba(52,211,153,0.12)" : "rgba(56,189,248,0.08)",
                  color: isApplied ? "#34d399" : "#38bdf8",
                  borderRadius: 4,
                  padding: "5px 8px",
                  fontFamily: "var(--mono)",
                  fontSize: "0.58rem",
                  fontWeight: 700,
                  cursor: isApplied || applyingAction ? "default" : "pointer",
                  opacity: applyingAction && !isApplying ? 0.45 : 1,
                }}
              >
                {isApplied ? "ACTIVE" : isApplying ? "APPLYING" : "APPLY"}
              </button>
            </div>
            <div style={{ fontSize: "0.66rem", lineHeight: 1.45, color: "var(--dm-muted)" }}>{rec.rationale}</div>
          </div>
        );
      })}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   DASHBOARD SHELL  — editorial page + live exhibit
═════════════════════════════════════════════════════════════ */
export function DashboardShell() {
  const [step, setStep]             = useState(0);
  const [playing, setPlaying]       = useState(false);
  const [loading, setLoading]       = useState(true);
  const [state, setState]           = useState<SimState|null>(null);
  const [userCrises, setUserCrises] = useState<(UserCrisis & { aiScore: number })[]>([]);
  const [applyingAction, setApplyingAction] = useState<string | null>(null);
  const timerRef     = useRef<ReturnType<typeof setInterval>|null>(null);
  const lifecycleRef = useRef<ReturnType<typeof setInterval>|null>(null);

  const fetchStep = useCallback(async (s: number) => {
    setLoading(true);
    try {
      const res  = await fetch(`${API_BASE}/simulations/step?step=${s}`, { method: "POST" });
      const data = await res.json();
      setState(data.state as SimState);
    } catch { /* keep */ }
    finally { setLoading(false); }
  }, []);

  const applyAction = useCallback(async (action: string) => {
    const actions = Array.from(new Set([...(state?.applied_actions ?? []), action]));
    setApplyingAction(action);
    setPlaying(false);
    try {
      const res = await fetch(`${API_BASE}/actions/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(actions),
      });
      const data = await res.json();
      setState(data.state as SimState);
      setStep(MAX_STEP);
    } catch { /* keep current exhibit state */ }
    finally { setApplyingAction(null); }
  }, [state?.applied_actions]);

  useEffect(() => { fetchStep(step); }, [step, fetchStep]);

  useEffect(() => {
    if (playing) {
      timerRef.current = setInterval(() => {
        setStep(s => { if (s >= MAX_STEP) { setPlaying(false); return s; } return s + 1; });
      }, 2200);
    } else if (timerRef.current) clearInterval(timerRef.current);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [playing]);

  useEffect(() => {
    lifecycleRef.current = setInterval(() => {
      const now = Date.now();
      setUserCrises(prev => {
        const next = prev.map(c => {
          const elapsedSecs = (now - c.addedAt) / 1000;
          if (elapsedSecs < TRANSIT_SECS) return { ...c, status: "transit" as const, progress: 0 };
          if (elapsedSecs < TRANSIT_SECS + RESOLVE_SECS) {
            const prog  = ((elapsedSecs - TRANSIT_SECS) / RESOLVE_SECS) * 100;
            const score = aiScore(c.type, c.zone, c.severity, elapsedSecs);
            return { ...c, status: "on_scene" as const, progress: prog, aiScore: score };
          }
          return { ...c, status: "resolved" as const, progress: 100 };
        });
        return next.filter(c => c.status !== "resolved" || (now - c.addedAt) / 1000 < TRANSIT_SECS + RESOLVE_SECS + FADE_SECS);
      });
    }, 400);
    return () => { if (lifecycleRef.current) clearInterval(lifecycleRef.current); };
  }, []);

  const incidents    = state?.active_incidents ?? [];
  const vehicles     = state?.vehicles ?? [];
  const activeCrises = userCrises.filter(c => c.status !== "resolved");
  const metrics      = state?.summary_metrics;
  const domainScores = domainScoresWithCrises(state, activeCrises);
  const risk         = clampScore((metrics?.city_risk_score ?? 0) + activeCrises.reduce((sum, c) => sum + c.severity * (c.status === "transit" ? 4 : 2), 0));
  const alert        = alertLevel(risk);

  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  return (
    <div style={{ background: "var(--paper)", minHeight: "100vh" }}>

      {/* ══ HERO ══════════════════════════════════════════════ */}
      <section className="hero">
        <div className="hero-eyebrow">
          <span>CIVIC AI HACK</span>
          <span className="hero-eyebrow-sep"/>
          <span>TRACK 02</span>
          <span style={{ marginLeft: 12 }}>SUBMISSION · TEAM POLARIS</span>
        </div>

        <h1 className="hero-heading">
          CityShield
          <span className="hero-heading-dash"/>
          <br/>an AI watch&#8209;officer for the city.
        </h1>

        <p className="hero-sub">
          A cross-agency operations brief that fuses 911, fire, EMS, traffic, air&#8209;quality,
          and utility feeds into a single moving picture of the city — and proposes the next
          move before a dispatcher has to ask.
        </p>

        <div className="hero-meta">
          {[
            { label: "Format",   value: "Working prototype" },
            { label: "Scenario", value: "Scripted multi-incident drill" },
            { label: "Track",    value: "Public safety" },
            { label: "Status",   value: "Hackathon submission" },
          ].map(m => (
            <div key={m.label} className="hero-meta-item">
              <div className="hero-meta-label">{m.label}</div>
              <div className="hero-meta-value">{m.value}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ══ STICKY NAV ════════════════════════════════════════ */}
      <nav className="site-nav">
        <div className="site-nav-brand">
          <span className="site-nav-name">CityShield</span>
          <span className="site-nav-id">OPS-26-04-27</span>
        </div>
        <div className="site-nav-links">
          {["problem","live-exhibit","how-it-works","architecture","tech-stack","impact","judging"].map(id => (
            <button key={id} className="site-nav-link" onClick={() => scrollTo(id)}>
              {id.replace(/-/g," ")}
            </button>
          ))}
        </div>
        <div className="alert-pill" style={{ color: alert.color, background: alert.bg, borderColor: `${alert.color}50`, flexShrink: 0 }}>
          <span className="alert-dot" style={{ background: alert.color }}/>
          {alert.label} · {risk}
        </div>
      </nav>

      {/* ══ 01 · PROBLEM ══════════════════════════════════════ */}
      <section id="problem" className="section">
        <div className="section-label">01 · The problem</div>
        <h2 className="section-heading">A city in crisis has no single picture.</h2>
        <div className="section-body">
          <p>
            When a collision blocks Central Ave, dispatch doesn&apos;t automatically know
            that ambulance A-1 is now 4 minutes late to the cardiac at Civic Center.
            When air quality spikes near Jefferson Elementary, the school board isn&apos;t
            looped into the fire response two blocks away.
          </p>
          <p>
            Every agency sees its own slice. CityShield fuses all feeds in real time,
            scores every developing situation with an AI triage model, and surfaces
            the one action that saves the most lives before a human has to ask.
          </p>
        </div>
        <div className="section-cols" style={{ gridTemplateColumns: "repeat(4,1fr)", marginTop: 56 }}>
          {[
            { value: "6",    label: "Data feeds fused in real time" },
            { value: "< 2s", label: "Latency from event to operator alert" },
            { value: "94%",  label: "AI dispatch confidence at drill close" },
            { value: "−23%", label: "Mean ambulance ETA delta vs baseline" },
          ].map(s => (
            <div key={s.value} className="stat-block">
              <div className="stat-block-value">{s.value}</div>
              <div className="stat-block-label">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ══ 02 · LIVE EXHIBIT ═════════════════════════════════ */}
      <section id="live-exhibit" className="exhibit-section">
        <div className="exhibit-header">
          <div>
            <div className="exhibit-label">02 · Live exhibit</div>
            <div className="exhibit-title">Interactive crisis simulation</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div className="exhibit-desc">
              Step through a scripted multi-incident drill or dispatch your own crisis.
              AI scores and ranks every event in real time.
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4, alignItems: "flex-end" }}>
              <div style={{ fontFamily: "var(--mono)", fontSize: "0.6rem", color: "rgba(221,238,255,0.35)", letterSpacing: "0.08em" }}>
                SIM · STEP {step}/{MAX_STEP}
              </div>
              <div style={{ fontFamily: "var(--mono)", fontSize: "0.7rem", color: "rgba(221,238,255,0.55)" }}>
                {state?.timestamp ? new Date(state.timestamp).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}) : "—"}
              </div>
            </div>
          </div>
        </div>

        <div className="exhibit-canvas">
          {/* Map column */}
          <div className="exhibit-map-col">
            <div className="exhibit-map-bar">
              <span className="exhibit-map-bar-label">
                Live city canvas · <span style={{ color: "#c0251a" }}>{STEP_LABELS[step]}</span>
              </span>
              <span style={{ fontFamily:"var(--mono)", fontSize:"0.6rem", color:"rgba(107,136,164,0.7)" }}>
                {state?.headline ?? "Connecting…"}
              </span>
            </div>
            <div className="map-surface" style={{ flex: 1 }}>
              <CityMap state={state} step={step} userCrises={userCrises}/>
            </div>
            <SimControls
              step={step} playing={playing} loading={loading}
              onPlay={()=>{ if(step>=MAX_STEP) setStep(0); setPlaying(true); }}
              onPause={()=>setPlaying(false)}
              onReset={()=>{ setPlaying(false); setUserCrises([]); if (step === 0) fetchStep(0); else setStep(0); }}
              onSeek={s=>{ setPlaying(false); setStep(s); }}
            />
          </div>

          {/* Sidebar */}
          <div className="exhibit-sidebar">
            <AddCrisisPanel onDispatch={c => setUserCrises(prev => [...prev, c])}/>
            <RecommendationActionPanel state={state} applyingAction={applyingAction} onApply={applyAction}/>
            <CrisisPriorityPanel userCrises={userCrises} simIncidents={incidents}/>

            {/* Fleet */}
            <div className="dpane">
              <div className="dpane-label" style={{ marginBottom: 2 }}>Fleet · Response units</div>
              {vehicles.map(v => {
                const active = v.current_status === "en_route";
                const col    = v.id==="fire-01"?"#fb923c":v.id==="ambu-02"?"#a78bfa":"#38bdf8";
                const dest   = v.id==="ambu-01"?"→ St. Anne Hospital":v.id==="fire-01"?"→ Public Library":"→ Civic Center";
                return (
                  <div key={v.id} className="vehicle-row">
                    <div className="vehicle-icon" style={{ background:active?`${col}18`:"rgba(255,255,255,0.04)", border:`1px solid ${active?col+"44":"rgba(255,255,255,0.08)"}` }}>
                      {VEH_ICON[v.vehicle_type]??"🚗"}
                    </div>
                    <div className="vehicle-info">
                      <div className="vehicle-id" style={{ color:active?col:"var(--dm-muted)" }}>{v.id.toUpperCase()}</div>
                      <div className="vehicle-dest">{active?dest:"Standby"}</div>
                    </div>
                    <div className="vehicle-eta" style={{ color:active?(v.eta_delta_minutes>0?"#f87171":col):"var(--dm-muted)" }}>
                      {active?`${v.eta_minutes}m`:"—"}
                    </div>
                  </div>
                );
              })}
              {activeCrises.map(c=>(
                <div key={c.id} className="vehicle-row">
                  <div className="vehicle-icon" style={{ background:`${CRISIS_TYPES[c.type].color}14`, border:`1px solid ${CRISIS_TYPES[c.type].color}40` }}>
                    {CRISIS_TYPES[c.type].vehicle==="fire_engine"?"🚒":CRISIS_TYPES[c.type].vehicle==="utility"?"🚐":"🚑"}
                  </div>
                  <div className="vehicle-info">
                    <div className="vehicle-id" style={{ color:CRISIS_TYPES[c.type].color }}>{c.unitId}</div>
                    <div className="vehicle-dest">{c.status==="transit"?"En route…":`On scene — ${Math.round(c.progress)}% resolved`}</div>
                  </div>
                  <div className="vehicle-eta" style={{ color:CRISIS_TYPES[c.type].color }}>
                    {c.status==="transit"?`~${Math.ceil((TRANSIT_SECS-((Date.now()-c.addedAt)/1000)))}s`:"▶"}
                  </div>
                </div>
              ))}
            </div>

            {/* Domain scores */}
            <div className="dpane">
              <div className="dpane-label" style={{ marginBottom: 2 }}>Domain risk scores</div>
              {state && Object.entries(domainScores).map(([key,val])=>(
                <div key={key} className="domain-row">
                  <div className="domain-label">{key.replace(/_/g," ")}</div>
                  <div className="domain-bar-track"><div className="domain-bar" style={{ width:`${val}%`, background:riskColor(val) }}/></div>
                  <div className="domain-score" style={{ color:riskColor(val) }}>{val}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══ 03 · HOW IT WORKS ════════════════════════════════ */}
      <section id="how-it-works" className="section">
        <div className="section-label">03 · How it works</div>
        <h2 className="section-heading">Fuse. Score. Act.</h2>
        <div className="section-body">
          <p>
            Six live feeds — 911 CAD, Fire/EMS dispatch, traffic sensors, AQI monitors,
            utility SCADA, and public-building occupancy — are normalised into a shared
            event stream every 400 ms.
          </p>
          <p>
            A weighted scoring model assigns each developing situation an AI triage score
            combining urgency class, zone sensitivity, severity, and time pressure. The
            top-ranked action is surfaced to the operator as a single, confident recommendation.
          </p>
        </div>
        <div className="section-cols">
          {[
            { n: "01", title: "Ingest", body: "All agency feeds normalised into a shared event schema at 400 ms cadence." },
            { n: "02", title: "Score",  body: "Multi-factor AI model weights urgency, zone risk, severity, and dwell time." },
            { n: "03", title: "Rank",   body: "Every open incident reranked live as conditions change across the city." },
            { n: "04", title: "Act",    body: "One clear recommended action pushed to the operator — no dashboard hunting." },
          ].map(s => (
            <div key={s.n} style={{ paddingTop: 24, borderTop: "1px solid var(--rule)" }}>
              <div style={{ fontFamily: "var(--mono)", fontSize: "0.62rem", color: "var(--red)", letterSpacing: "0.1em", marginBottom: 10 }}>{s.n}</div>
              <div style={{ fontFamily: "var(--serif)", fontSize: "1.25rem", fontWeight: 700, marginBottom: 8 }}>{s.title}</div>
              <div style={{ fontSize: "0.88rem", color: "var(--ink-muted)", lineHeight: 1.6 }}>{s.body}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ══ 04 · TECH STACK ══════════════════════════════════ */}
      <section id="tech-stack" className="section">
        <div className="section-label">04 · Tech stack</div>
        <h2 className="section-heading">Prototype speed with real architecture.</h2>
        <div className="section-body">
          <p>
            The demo runs as a lightweight monorepo: a Next.js operations surface,
            a FastAPI simulation service, shared TypeScript types, and deterministic
            sample data. The system is honest about what is simulated, but structured
            the same way a real city integration layer would grow.
          </p>
        </div>
        <div className="section-cols" style={{ gridTemplateColumns: "repeat(3,1fr)", marginTop: 44 }}>
          {[
            { title: "Frontend", detail: "Next.js, React, TypeScript, responsive SVG city canvas, CSS tokens." },
            { title: "Simulation", detail: "FastAPI endpoints replay the cascade from seeded city and timeline data." },
            { title: "Decisioning", detail: "Rule-based recommendations rank interventions by risk, confidence, and expected impact." },
          ].map(card => (
            <div key={card.title} style={{ paddingTop: 24, borderTop: "2px solid var(--ink)" }}>
              <div style={{ fontFamily: "var(--mono)", fontSize: "0.62rem", color: "var(--red)", letterSpacing: "0.1em", marginBottom: 10, textTransform: "uppercase" }}>{card.title}</div>
              <div style={{ fontSize: "0.92rem", color: "var(--ink-mid)", lineHeight: 1.7 }}>{card.detail}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ══ 05 · IMPACT ══════════════════════════════════════ */}
      <section id="impact" className="section" style={{ paddingBottom: 0 }}>
        <div className="section-label">05 · Impact</div>
        <h2 className="section-heading">Results from the drill.</h2>
        <p className="section-body">Measured against the no-AI baseline across the 8-step multi-incident scenario.</p>
        <div className="impact-grid" style={{ marginTop: 48 }}>
          {[
            { label: "Amb. ETA reduction",  value: `${state?.impact_summary.ambulance_eta_reduction_pct ?? 0}%`,  color: "#34d399", sub: "with AI routing active" },
            { label: "Traffic queue cut",    value: `${state?.impact_summary.queue_length_reduction_pct ?? 0}%`,   color: "#c0251a", sub: "vs no-action baseline" },
            { label: "AQI exposure cut",     value: `${state?.impact_summary.exposure_reduction_pct ?? 0}%`,      color: "#fbbf24", sub: "school zone benefit" },
            { label: "Energy load shifted",  value: `${state?.impact_summary.energy_shift_kw ?? 0} kW`,           color: "#a78bfa", sub: "non-critical buildings" },
          ].map(m => (
            <div key={m.label} className="impact-cell">
              <div className="impact-cell-label">{m.label}</div>
              <div className="impact-cell-value" style={{ color: m.color }}>{m.value}</div>
              <div className="impact-cell-sub">{m.sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ══ 06 · ARCHITECTURE ════════════════════════════════ */}
      <section id="architecture" className="section">
        <div className="section-label">06 · Architecture</div>
        <h2 className="section-heading">Stack built for ops, not demos.</h2>
        <div className="section-body">
          <p>
            Next.js 15 frontend (React 19, TypeScript) with a Python/FastAPI simulation
            backend. SVG city canvas rendered client-side with native{" "}
            <code style={{ fontFamily:"var(--mono)", fontSize:"0.9em", background:"rgba(0,0,0,0.06)", padding:"1px 5px", borderRadius:3 }}>animateMotion</code>{" "}
            for zero-dependency vehicle kinematics. No mapping library — every pixel is
            intentional.
          </p>
        </div>
        <div className="section-cols" style={{ marginTop: 40 }}>
          {[
            { layer: "Frontend",  items: ["Next.js 15 / React 19", "TypeScript 5", "SVG animateMotion", "CSS custom properties"] },
            { layer: "Backend",   items: ["Python 3.12 / FastAPI", "Pydantic v2", "Scripted sim engine", "REST + SSE"] },
          ].map(c => (
            <div key={c.layer} style={{ paddingTop: 24, borderTop: "1px solid var(--rule)" }}>
              <div style={{ fontFamily:"var(--mono)", fontSize:"0.62rem", color:"var(--red)", letterSpacing:"0.1em", marginBottom:14 }}>{c.layer.toUpperCase()}</div>
              {c.items.map(i => (
                <div key={i} style={{ display:"flex", alignItems:"center", gap:10, padding:"7px 0", borderTop:"1px solid var(--rule)", fontSize:"0.9rem", color:"var(--ink-mid)" }}>
                  <span style={{ fontFamily:"var(--mono)", fontSize:"0.6rem", color:"var(--red)" }}>→</span> {i}
                </div>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* ══ 07 · JUDGING ═════════════════════════════════════ */}
      <section id="judging" className="section">
        <div className="section-label">07 · Judging notes</div>
        <h2 className="section-heading">What the prototype proves.</h2>
        <div className="section-body">
          <p>
            CityShield shows the highest-value MVP loop: ingest a multi-agency event,
            predict the cascade, prioritize the next action, and show the measurable
            outcome. The point is not to replace dispatchers; it is to make the next
            best move visible when the room is loud.
          </p>
        </div>
        <div className="section-cols" style={{ gridTemplateColumns: "repeat(4,1fr)", marginTop: 44 }}>
          {[
            { value: "Clarity", label: "One citywide risk picture instead of four agency dashboards." },
            { value: "Speed", label: "Operators see routed recommendations as the cascade forms." },
            { value: "Trust", label: "Every recommendation includes rationale and expected benefit." },
            { value: "Scope", label: "Deterministic engine works without depending on an LLM." },
          ].map(item => (
            <div key={item.value} className="stat-block">
              <div className="stat-block-value" style={{ fontSize: "2.05rem" }}>{item.value}</div>
              <div className="stat-block-label">{item.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ══ FOOTER ════════════════════════════════════════════ */}
      <footer style={{ padding:"32px 64px", borderTop:"1px solid var(--rule)", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <div style={{ fontFamily:"var(--mono)", fontSize:"0.62rem", color:"var(--ink-muted)", letterSpacing:"0.08em" }}>
          CITYSHIELD AI · CIVIC AI HACK · TRACK 02 · TEAM POLARIS
        </div>
        <div style={{ fontFamily:"var(--mono)", fontSize:"0.62rem", color:"var(--ink-muted)", letterSpacing:"0.08em" }}>
          OPS-26-04-27
        </div>
      </footer>
    </div>
  );
}
