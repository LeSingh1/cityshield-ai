"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const API = "http://localhost:8000";
const MAX_STEP = 8;

/* ── Timing ─────────────────────────────────────────────── */
const TRANSIT_SECS = 11;   // vehicle drives to scene
const RESOLVE_SECS = 12;   // resolution ring fills
const FADE_SECS    = 2;    // brief "RESOLVED" flash before removal

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

/* Dispatch routes follow the street grid exactly.
   Each zone has: path (animateMotion route), x/y (destination on map). */
const ZONE_DISPATCH = {
  "zone-central":     { name: "Central Corridor", sensitivity: 0.92, path: "M 720 208 L 370 208",                                                                      x: 370, y: 208 },
  "zone-school-east": { name: "School East",       sensitivity: 0.95, path: "M 720 100 L 542 100 L 542 88 L 610 88",                                                   x: 610, y: 88  },
  "zone-downtown":    { name: "Downtown Core",     sensitivity: 0.62, path: "M 720 403 L 370 403",                                                                      x: 370, y: 403 },
  "zone-civic":       { name: "Civic Center",      sensitivity: 0.55, path: "M 720 302 L 262 302 Q 250 302 250 314 L 250 355 L 205 355",                               x: 205, y: 355 },
} as const;

type ZoneKey = keyof typeof ZONE_DISPATCH;

/* ── AI scoring ──────────────────────────────────────────── */
function aiScore(type: CrisisType, zone: ZoneKey, severity: number, waitSecs: number): number {
  const urgency     = CRISIS_TYPES[type].urgency;
  const sensitivity = ZONE_DISPATCH[zone].sensitivity;
  const timePres    = Math.min(waitSecs / 120, 1);
  return Math.round(((severity / 5) * 0.35 + urgency * 0.30 + sensitivity * 0.20 + timePres * 0.15) * 100);
}

/* ── Types ───────────────────────────────────────────────── */
interface UserCrisis {
  id: string;
  type: CrisisType;
  zone: ZoneKey;
  severity: number;
  addedAt: number;
  status: "transit" | "on_scene" | "resolved";
  progress: number;   // 0-100 for resolution ring
  unitId: string;
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

interface Rec {
  id: string; title: string; rationale: string; confidence: number;
  expected_benefits: string[]; action: string;
}

interface SimState {
  city_name: string; timestamp: string; headline: string;
  active_incidents: Incident[];
  zones: { id: string; unified_risk: number; dominant_factor: string; aqi: number }[];
  road_segments: { id: string; congestion_index: number; status: string }[];
  summary_metrics: { city_risk_score: number; avg_congestion_index: number; avg_aqi: number; ambulance_eta_delta_minutes: number; public_building_strain_avg: number };
  domain_scores: { traffic: number; air_quality: number; emergency_delay: number; energy_strain: number };
  recommendations: Rec[];
  impact_summary: { ambulance_eta_reduction_pct: number; queue_length_reduction_pct: number; exposure_reduction_pct: number; energy_shift_kw: number };
  vehicles: Vehicle[];
}

const STEP_LABELS = [
  "City normal","Baseline","Collision","Spillback",
  "AQI warning","Amb delay","Fire","Cardiac","Water main",
];

/* ── Helpers ─────────────────────────────────────────────── */
function riskColor(v: number) { return v >= 70 ? "var(--red)" : v >= 50 ? "var(--amber)" : "var(--green)"; }
function alertLevel(risk: number) {
  if (risk >= 80) return { label: "CRITICAL", color: "var(--red)",   bg: "rgba(248,113,113,0.1)" };
  if (risk >= 60) return { label: "ELEVATED", color: "var(--amber)", bg: "rgba(251,191,36,0.1)"  };
  if (risk >= 30) return { label: "GUARDED",  color: "var(--blue)",  bg: "rgba(56,189,248,0.1)"  };
  return               { label: "NORMAL",   color: "var(--green)", bg: "rgba(52,211,153,0.1)"  };
}
const VEH_ICON: Record<string,string> = { ambulance: "🚑", fire_engine: "🚒" };

/* ── City Map ─────────────────────────────────────────────── */
function CityMap({ state, step, userCrises }: { state: SimState|null; step: number; userCrises: UserCrisis[] }) {
  const segs  = state?.road_segments ?? [];
  const incs  = state?.active_incidents ?? [];
  const zones = state?.zones ?? [];
  const vehs  = state?.vehicles ?? [];

  const segStatus = (id: string) => segs.find(s => s.id === id)?.status ?? "normal";
  const roadFill  = (id: string) => {
    const s = segStatus(id);
    return s === "blocked"  ? "rgba(248,113,113,0.55)" :
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

  const ambu1Path = step >= 2
    ? "M 700 208 L 408 208 Q 396 208 396 196 L 396 112 Q 396 100 384 100 L 100 100 Q 88 100 88 112 L 88 96"
    : "M 700 208 L 140 208 Q 128 208 128 196 L 128 112 Q 128 100 116 100 L 88 100 L 88 96";
  const ambu2Path = "M 700 403 L 152 403 Q 140 403 140 391 L 140 326";
  const fire1Path = "M 530 0 L 530 290 Q 530 302 518 302 L 275 302 Q 263 302 263 314 L 263 396 Q 263 408 251 408 L 236 408";

  const circ = 2 * Math.PI * 26;

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

      {/* Background */}
      <rect width={720} height={480} fill="#030b14"/>

      {/* City blocks */}
      {([
        [0,0,128,100],[140,0,122,100],[274,0,122,100],[408,0,122,100],[542,0,178,100],
        [0,112,128,90],[140,112,122,90],[274,112,122,90],[408,112,122,90],[542,112,178,90],
        [0,214,128,80],[140,214,122,80],[274,214,122,80],[408,214,122,80],[542,214,178,80],
        [0,306,128,90],[140,306,122,90],[274,306,122,90],[408,306,122,90],[542,306,178,90],
        [0,408,128,72],[140,408,122,72],[274,408,122,72],[408,408,122,72],[542,408,178,72],
      ] as [number,number,number,number][]).map(([x,y,w,h],i)=>(
        <rect key={i} x={x} y={y} width={w} height={h} fill="#060f1c" rx={1}/>
      ))}

      {/* Street base */}
      {[100,202,296,398].map(y=><rect key={`hy${y}`} x={0} y={y} width={720} height={10} fill="rgba(56,189,248,0.055)"/>)}
      {[128,262,396,530].map(x=><rect key={`vx${x}`} x={x} y={0} width={12} height={480} fill="rgba(56,189,248,0.055)"/>)}

      {/* Major roads */}
      <rect x={0}   y={202} width={720} height={12} fill={roadFill("segment-r08")}/>
      <rect x={0}   y={202} width={262} height={12} fill={roadFill("segment-r09")} opacity={0.75}/>
      <rect x={262} y={0}   width={12}  height={480} fill={roadFill("segment-r10")} opacity={0.5}/>
      <rect x={530} y={0}   width={12}  height={202} fill={roadFill("segment-r10")} opacity={0.4}/>
      <rect x={0}   y={398} width={430} height={10} fill={roadFill("segment-r11")}/>
      <rect x={128} y={296} width={12}  height={112} fill={roadFill("segment-r12")} opacity={0.65}/>

      {/* Street labels */}
      <text x={420} y={211} fill="rgba(56,189,248,0.32)" fontSize={7} fontFamily="JetBrains Mono,monospace">CENTRAL AVE E</text>
      <text x={16}  y={211} fill="rgba(56,189,248,0.32)" fontSize={7} fontFamily="JetBrains Mono,monospace">CENTRAL AVE W</text>
      <text x={438} y={406} fill="rgba(56,189,248,0.32)" fontSize={7} fontFamily="JetBrains Mono,monospace">MARKET ST</text>
      <text x={268} y={470} fill="rgba(56,189,248,0.32)" fontSize={7} fontFamily="JetBrains Mono,monospace" transform="rotate(-90,268,470)">3RD ST</text>
      <text x={402} y={450} fill="rgba(56,189,248,0.32)" fontSize={7} fontFamily="JetBrains Mono,monospace" transform="rotate(-90,402,450)">5TH AVE</text>
      <text x={536} y={430} fill="rgba(56,189,248,0.32)" fontSize={7} fontFamily="JetBrains Mono,monospace" transform="rotate(-90,536,430)">7TH AVE</text>
      <text x={134} y={355} fill="rgba(56,189,248,0.32)" fontSize={7} fontFamily="JetBrains Mono,monospace" transform="rotate(-90,134,355)">CIVIC DR</text>
      <text x={134} y={165} fill="rgba(56,189,248,0.32)" fontSize={7} fontFamily="JetBrains Mono,monospace" transform="rotate(-90,134,165)">1ST AVE</text>

      {/* Congestion badges */}
      {congLabel("segment-r08") && <g><rect x={310} y={184} width={74} height={14} rx={2} fill="rgba(251,191,36,0.14)" stroke="rgba(251,191,36,0.5)" strokeWidth={0.6}/><text x={347} y={194} textAnchor="middle" fill="#fbbf24" fontSize={7} fontWeight="700" fontFamily="JetBrains Mono,monospace">{congLabel("segment-r08")}</text></g>}
      {congLabel("segment-r09") && <g><rect x={80}  y={184} width={74} height={14} rx={2} fill="rgba(248,113,113,0.14)" stroke="rgba(248,113,113,0.5)" strokeWidth={0.6}/><text x={117} y={194} textAnchor="middle" fill="#f87171" fontSize={7} fontWeight="700" fontFamily="JetBrains Mono,monospace">{congLabel("segment-r09")}</text></g>}
      {congLabel("segment-r11") && <g><rect x={106} y={381} width={60} height={13} rx={2} fill="rgba(251,146,60,0.14)" stroke="rgba(251,146,60,0.5)" strokeWidth={0.6}/><text x={136} y={391} textAnchor="middle" fill="#fb923c" fontSize={7} fontWeight="700" fontFamily="JetBrains Mono,monospace">{congLabel("segment-r11")}</text></g>}

      {/* Zone hazes */}
      {hasAqi   && <ellipse cx={595} cy={88}  rx={118} ry={78} fill="url(#gAqi)"/>}
      {hasFire  && <ellipse cx={210} cy={408} rx={96}  ry={52} fill="url(#gSmoke)"/>}
      {hasWater && <ellipse cx={134} cy={208} rx={48}  ry={20} fill="url(#gWater)"/>}

      {/* Sim route previews */}
      {ambu1?.current_status==="en_route" && <path d={ambu1Path} fill="none" stroke={ambu1.eta_delta_minutes>0?"#f87171":"#38bdf8"} strokeWidth={1.5} strokeDasharray="7 5" opacity={0.35}/>}
      {ambu2?.current_status==="en_route" && <path d={ambu2Path} fill="none" stroke="#a78bfa" strokeWidth={1.5} strokeDasharray="7 5" opacity={0.35}/>}
      {fire1?.current_status==="en_route" && <path d={fire1Path} fill="none" stroke="#fb923c" strokeWidth={1.5} strokeDasharray="7 5" opacity={0.35}/>}

      {/* ── User crisis route previews ── */}
      {userCrises.filter(c=>c.status==="transit").map(c=>(
        <path key={`route-${c.id}`} d={ZONE_DISPATCH[c.zone].path} fill="none"
          stroke={CRISIS_TYPES[c.type].color} strokeWidth={1.2} strokeDasharray="6 5" opacity={0.28}/>
      ))}

      {/* Sim incident pulses */}
      {hasCollision && <g filter="url(#glow)"><circle cx={274} cy={208} r={20} fill="rgba(248,113,113,0.15)"><animate attributeName="r" values="20;32;20" dur="2s" repeatCount="indefinite"/><animate attributeName="opacity" values="0.9;0.2;0.9" dur="2s" repeatCount="indefinite"/></circle><circle cx={274} cy={208} r={8} fill="#f87171"/><circle cx={274} cy={208} r={3.5} fill="#fff" opacity={0.9}/></g>}
      {hasFire      && <g filter="url(#glow2)"><circle cx={210} cy={405} r={16} fill="rgba(251,146,60,0.2)"><animate attributeName="r" values="16;26;16" dur="1.5s" repeatCount="indefinite"/></circle><circle cx={210} cy={405} r={8} fill="#fb923c"/><circle cx={210} cy={405} r={3.5} fill="#fff4e6" opacity={0.9}/></g>}
      {hasCardiac   && <g filter="url(#glow)"><circle cx={152} cy={340} r={14} fill="rgba(167,139,250,0.2)"><animate attributeName="r" values="14;22;14" dur="1.0s" repeatCount="indefinite"/></circle><circle cx={152} cy={340} r={7} fill="#a78bfa"/><circle cx={152} cy={340} r={3} fill="#faf5ff" opacity={0.9}/></g>}
      {hasWater     && <g filter="url(#glow)"><circle cx={134} cy={208} r={11} fill="rgba(56,189,248,0.25)"><animate attributeName="r" values="11;17;11" dur="2.2s" repeatCount="indefinite"/></circle><circle cx={134} cy={208} r={5.5} fill="#38bdf8"/><circle cx={134} cy={208} r={2.2} fill="#e0f7ff" opacity={0.9}/></g>}

      {/* Sim incident labels */}
      {hasCollision && <text x={274} y={189} textAnchor="middle" fill="#f87171" fontSize={8} fontWeight="700" fontFamily="JetBrains Mono,monospace" filter="url(#glow)">COLLISION</text>}
      {hasFire      && <text x={210} y={388} textAnchor="middle" fill="#fb923c" fontSize={8} fontWeight="700" fontFamily="JetBrains Mono,monospace" filter="url(#glow)">FIRE</text>}
      {hasCardiac   && <text x={152} y={325} textAnchor="middle" fill="#a78bfa" fontSize={8} fontWeight="700" fontFamily="JetBrains Mono,monospace" filter="url(#glow)">CARDIAC</text>}
      {hasWater     && <text x={134} y={193} textAnchor="middle" fill="#38bdf8" fontSize={8} fontWeight="700" fontFamily="JetBrains Mono,monospace" filter="url(#glow)">WATER MAIN</text>}

      {/* ── User crisis: diamond markers at incident location (offset from vehicle) ── */}
      {userCrises.filter(c=>c.status!=="resolved").map(c=>{
        const disp  = ZONE_DISPATCH[c.zone];
        const color = CRISIS_TYPES[c.type].color;
        const mx = disp.x - 34;
        const my = disp.y - 28;
        return (
          <g key={`marker-${c.id}`} filter="url(#glow)">
            <polygon points={`${mx},${my-11} ${mx+11},${my} ${mx},${my+11} ${mx-11},${my}`} fill={color} opacity={0.9}>
              <animate attributeName="opacity" values="0.9;0.35;0.9" dur="1.6s" repeatCount="indefinite"/>
            </polygon>
            <text x={mx} y={my-15} textAnchor="middle" fill={color} fontSize={7} fontWeight="700" fontFamily="JetBrains Mono,monospace">
              {CRISIS_TYPES[c.type].label.toUpperCase()}
            </text>
          </g>
        );
      })}

      {/* ── Sim vehicles (ambulances + fire engine) ── */}
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

      {/* ── User dispatch vehicles ── */}
      {userCrises.filter(c=>c.status!=="resolved").map(c=>{
        const disp  = ZONE_DISPATCH[c.zone];
        const color = CRISIS_TYPES[c.type].color;
        const isOnScene = c.status === "on_scene";

        return (
          <g key={`unit-${c.id}`}
            filter="url(#vshadow)"
            transform={isOnScene ? `translate(${disp.x},${disp.y})` : undefined}>

            {/* Vehicle body */}
            <rect x="-10" y="-5" width="20" height="10" rx="2.5" fill={color} stroke="#030b14" strokeWidth="0.8" opacity="0.95"/>
            <text x="0" y="4" textAnchor="middle" fill="#030b14" fontSize="6.5" fontWeight="700"
              fontFamily="JetBrains Mono,monospace">{c.unitId}</text>
            {/* Flashing light bar */}
            <rect x="-4.5" y="-8" width="9" height="2.5" rx="1">
              <animate attributeName="fill" values={`${color};#ffffff;${color}`} dur="0.55s" repeatCount="indefinite"/>
            </rect>
            {/* Wheels */}
            <rect x="-10" y="-7.5" width="3.5" height="3" rx="0.7" fill="#0f172a"/>
            <rect x="-10" y="4.5" width="3.5" height="3" rx="0.7" fill="#0f172a"/>
            <rect x="6.5" y="-7.5" width="3.5" height="3" rx="0.7" fill="#0f172a"/>
            <rect x="6.5" y="4.5" width="3.5" height="3" rx="0.7" fill="#0f172a"/>

            {/* Resolution ring + progress (only on scene) */}
            {isOnScene && (
              <>
                <circle r={26} fill="none" stroke={color} strokeWidth={1} opacity={0.18}/>
                <circle r={26} fill="none" stroke={color} strokeWidth={2.8}
                  strokeDasharray={circ}
                  strokeDashoffset={circ * (1 - c.progress / 100)}
                  transform="rotate(-90)"
                  opacity={0.88}/>
                <text x="0" y="-32" textAnchor="middle" fill={color} fontSize="8"
                  fontFamily="JetBrains Mono,monospace" fontWeight="700">
                  {Math.round(c.progress)}%
                </text>
                <text x="0" y="20" textAnchor="middle" fill={color} fontSize="6.5"
                  fontFamily="JetBrains Mono,monospace" opacity="0.75">RESOLVING</text>
              </>
            )}

            {/* Transit animation — stops at destination with fill="freeze" */}
            {!isOnScene && (
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              <animateMotion dur={`${TRANSIT_SECS}s`} fill="freeze" rotate="auto" {...{ path: disp.path } as any}/>
            )}
          </g>
        );
      })}

      {/* Facilities */}
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
      <text x={210} y={382} textAnchor="middle" fill="rgba(251,146,60,0.48)" fontSize={7} fontFamily="JetBrains Mono,monospace">PUB. LIBRARY</text>

      <rect x={134} y={312} width={52} height={22} rx={4} fill={hasCardiac?"rgba(167,139,250,0.22)":"rgba(167,139,250,0.08)"} stroke={hasCardiac?"rgba(167,139,250,0.85)":"rgba(167,139,250,0.28)"} strokeWidth={1.5}/>
      <text x={160} y={326} textAnchor="middle" fill="rgba(167,139,250,0.95)" fontSize={8} fontWeight="700" fontFamily="JetBrains Mono,monospace">CIVIC CTR</text>

      {ambu1?.current_status==="en_route" && ambu1.eta_delta_minutes>0 && <g><rect x={392} y={148} width={84} height={14} rx={2} fill="rgba(248,113,113,0.13)" stroke="rgba(248,113,113,0.38)" strokeWidth={0.7}/><text x={434} y={158} textAnchor="middle" fill="#f87171" fontSize={7.5} fontWeight="700" fontFamily="JetBrains Mono,monospace">A-1 DELAY +{ambu1.eta_delta_minutes}m</text></g>}
      {ambu2?.current_status==="en_route" && ambu2.eta_delta_minutes>0 && <g><rect x={430} y={330} width={84} height={14} rx={2} fill="rgba(167,139,250,0.13)" stroke="rgba(167,139,250,0.38)" strokeWidth={0.7}/><text x={472} y={340} textAnchor="middle" fill="#a78bfa" fontSize={7.5} fontWeight="700" fontFamily="JetBrains Mono,monospace">A-2 DELAY +{ambu2.eta_delta_minutes}m</text></g>}

      <text x={14} y={470} fill="rgba(56,189,248,0.22)" fontSize={7} fontFamily="JetBrains Mono,monospace">N↑  MetroSim · AI-optimal routing active</text>
    </svg>
  );
}

/* ── Add Crisis Panel ─────────────────────────────────────── */
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
    const crisis: UserCrisis = {
      id, type: selType, zone: selZone, severity: selSeverity,
      addedAt: now, status: "transit", progress: 0,
      unitId: `${prefix}-${unitCounter++}`,
    };
    onDispatch({ ...crisis, aiScore: score } as UserCrisis & { aiScore: number });
    setDispatched(true);
    setTimeout(() => setDispatched(false), 1500);
  };

  return (
    <div className="pane" style={{ gap: 8 }}>
      <div className="pane-header">
        <div><div className="pane-title">Dispatch control</div><div className="pane-title-main">Add crisis</div></div>
      </div>

      {/* Type grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 4 }}>
        {(Object.entries(CRISIS_TYPES) as [CrisisType, typeof CRISIS_TYPES[CrisisType]][]).map(([key, cfg]) => (
          <button key={key} onClick={() => setSelType(key)}
            style={{
              padding: "5px 4px", borderRadius: 5, border: `1px solid`,
              borderColor: selType === key ? cfg.color : "rgba(255,255,255,0.08)",
              background: selType === key ? `${cfg.color}18` : "rgba(255,255,255,0.03)",
              color: selType === key ? cfg.color : "var(--muted)",
              cursor: "pointer", fontSize: "0.62rem", fontFamily: "var(--mono)",
              display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
            }}>
            <span style={{ fontSize: "1rem" }}>{cfg.icon}</span>
            <span style={{ lineHeight: 1.2, textAlign: "center" }}>{cfg.label.split(" ").slice(-1)[0]}</span>
          </button>
        ))}
      </div>

      {/* Severity */}
      <div>
        <div style={{ fontSize: "0.6rem", color: "var(--muted)", fontFamily: "var(--mono)", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.1em" }}>Severity</div>
        <div style={{ display: "flex", gap: 4 }}>
          {[1,2,3,4,5].map(n => (
            <button key={n} onClick={() => setSelSeverity(n)}
              style={{
                flex: 1, height: 28, borderRadius: 4, border: "1px solid",
                borderColor: selSeverity >= n ? riskColor(n * 20) : "rgba(255,255,255,0.08)",
                background: selSeverity >= n ? `${riskColor(n * 20)}18` : "rgba(255,255,255,0.03)",
                color: selSeverity >= n ? riskColor(n * 20) : "var(--muted)",
                cursor: "pointer", fontSize: "0.75rem", fontFamily: "var(--mono)", fontWeight: 600,
              }}>{n}</button>
          ))}
        </div>
      </div>

      {/* Zone */}
      <div>
        <div style={{ fontSize: "0.6rem", color: "var(--muted)", fontFamily: "var(--mono)", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.1em" }}>Zone</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4 }}>
          {(Object.entries(ZONE_DISPATCH) as [ZoneKey, typeof ZONE_DISPATCH[ZoneKey]][]).map(([key, z]) => (
            <button key={key} onClick={() => setSelZone(key)}
              style={{
                padding: "5px 8px", borderRadius: 4, border: "1px solid",
                borderColor: selZone === key ? "var(--blue)" : "rgba(255,255,255,0.08)",
                background: selZone === key ? "rgba(56,189,248,0.12)" : "rgba(255,255,255,0.03)",
                color: selZone === key ? "var(--blue)" : "var(--muted)",
                cursor: "pointer", fontSize: "0.66rem", fontFamily: "var(--mono)",
              }}>{z.name}</button>
          ))}
        </div>
      </div>

      {/* Dispatch button */}
      <button onClick={dispatch}
        style={{
          padding: "9px", borderRadius: 6, border: "1px solid",
          borderColor: dispatched ? "var(--green)" : CRISIS_TYPES[selType].color,
          background: dispatched ? "rgba(52,211,153,0.12)" : `${CRISIS_TYPES[selType].color}18`,
          color: dispatched ? "var(--green)" : CRISIS_TYPES[selType].color,
          cursor: "pointer", fontFamily: "var(--mono)", fontSize: "0.75rem", fontWeight: 700,
          letterSpacing: "0.08em", transition: "all 0.2s",
        }}>
        {dispatched ? "✓ UNIT DISPATCHED" : `▶ AI DISPATCH — ${CRISIS_TYPES[selType].icon} ${CRISIS_TYPES[selType].label}`}
      </button>
    </div>
  );
}

/* ── Crisis Priority Panel ───────────────────────────────── */
function CrisisPriorityPanel({ userCrises, simIncidents }: { userCrises: (UserCrisis & { aiScore: number })[]; simIncidents: Incident[] }) {
  const now = Date.now();

  // Combine sim incidents with a computed score
  const simRows = simIncidents.map(inc => ({
    id: inc.id, label: inc.title,
    icon: inc.type === "fire" ? "🔥" : inc.type === "medical" ? "🫀" : inc.type === "infrastructure" ? "💧" : "💥",
    color: inc.type === "fire" ? "#fb923c" : inc.type === "medical" ? "#a78bfa" : inc.type === "infrastructure" ? "#38bdf8" : "#f87171",
    severity: inc.severity,
    zone: "zone-central",
    aiScore: aiScore(inc.type === "medical" ? "medical" : inc.type === "fire" ? "fire" : inc.type === "infrastructure" ? "infrastructure" : "collision", "zone-central", inc.severity, 120),
    status: "responding" as const,
    unit: "A-1 / F-1",
    waitSecs: 120,
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
    <div className="pane">
      <div className="pane-title">AI priority queue</div>
      <div className="empty-state">✓ No active incidents</div>
    </div>
  );

  return (
    <div className="pane" style={{ flex: 1, overflowY: "auto", minHeight: 0 }}>
      <div className="pane-header">
        <div><div className="pane-title">AI priority queue</div><div className="pane-title-main">Ranked incidents</div></div>
        <span className="pane-badge" style={{ background: "rgba(248,113,113,0.1)", color: "var(--red)", border: "1px solid rgba(248,113,113,0.28)" }}>
          {all.length} ACTIVE
        </span>
      </div>
      {all.map((row, i) => (
        <div key={row.id} style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "8px 0", borderTop: "1px solid var(--line)" }}>
          {/* Rank */}
          <div style={{ width: 20, height: 20, borderRadius: 4, background: i === 0 ? "rgba(248,113,113,0.2)" : "rgba(255,255,255,0.05)", border: `1px solid ${i === 0 ? "rgba(248,113,113,0.5)" : "rgba(255,255,255,0.1)"}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--mono)", fontSize: "0.65rem", fontWeight: 700, color: i === 0 ? "var(--red)" : "var(--muted)", flexShrink: 0 }}>
            {i + 1}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            {/* Title row */}
            <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 3 }}>
              <span style={{ fontSize: "0.88rem" }}>{row.icon}</span>
              <span style={{ fontSize: "0.78rem", fontWeight: 600, color: row.color, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{row.label}</span>
            </div>
            {/* Meta row */}
            <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
              {/* Severity pips */}
              <div style={{ display: "flex", gap: 2 }}>
                {[1,2,3,4,5].map(n=><div key={n} style={{ width: 8, height: 3, borderRadius: 1, background: n <= row.severity ? row.color : "rgba(255,255,255,0.1)" }}/>)}
              </div>
              <span style={{ fontFamily: "var(--mono)", fontSize: "0.62rem", color: "var(--muted)" }}>
                {ZONE_DISPATCH[row.zone as ZoneKey]?.name ?? row.zone}
              </span>
              <span style={{ fontFamily: "var(--mono)", fontSize: "0.62rem", color: "var(--muted)" }}>
                {row.waitSecs < 60 ? `${row.waitSecs}s` : `${Math.floor(row.waitSecs/60)}m`} ago
              </span>
            </div>
            {/* Score bar */}
            <div style={{ marginTop: 4, display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ flex: 1, height: 4, background: "rgba(255,255,255,0.05)", borderRadius: 2, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${row.aiScore}%`, background: row.color, borderRadius: 2, transition: "width 0.5s ease" }}/>
              </div>
              <span style={{ fontFamily: "var(--mono)", fontSize: "0.68rem", fontWeight: 700, color: row.color, width: 24, textAlign: "right" }}>{row.aiScore}</span>
            </div>
          </div>
          {/* Status + unit */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 3, flexShrink: 0 }}>
            <span style={{ fontFamily: "var(--mono)", fontSize: "0.6rem", padding: "2px 5px", borderRadius: 3,
              background: row.status === "on_scene" ? "rgba(52,211,153,0.12)" : row.status === "transit" || row.status === "responding" ? "rgba(56,189,248,0.1)" : "rgba(255,255,255,0.05)",
              color: row.status === "on_scene" ? "var(--green)" : row.status === "transit" || row.status === "responding" ? "var(--blue)" : "var(--muted)",
              border: `1px solid ${row.status === "on_scene" ? "rgba(52,211,153,0.3)" : row.status === "transit" || row.status === "responding" ? "rgba(56,189,248,0.25)" : "rgba(255,255,255,0.08)"}`,
            }}>
              {row.status === "on_scene" ? "ON SCENE" : row.status === "transit" ? "EN ROUTE" : "RESPONDING"}
            </span>
            <span style={{ fontFamily: "var(--mono)", fontSize: "0.6rem", color: row.color }}>{row.unit}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── Sim controls ────────────────────────────────────────── */
function SimControls({ step, playing, loading, onPlay, onPause, onReset, onSeek }: {
  step: number; playing: boolean; loading: boolean;
  onPlay: () => void; onPause: () => void; onReset: () => void; onSeek: (s: number) => void;
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

/* ── Dashboard ───────────────────────────────────────────── */
export function DashboardShell() {
  const [step, setStep]           = useState(0);
  const [playing, setPlaying]     = useState(false);
  const [loading, setLoading]     = useState(true);
  const [state, setState]         = useState<SimState|null>(null);
  const [userCrises, setUserCrises] = useState<(UserCrisis & { aiScore: number })[]>([]);
  const timerRef  = useRef<ReturnType<typeof setInterval>|null>(null);
  const lifecycleRef = useRef<ReturnType<typeof setInterval>|null>(null);

  const fetchStep = useCallback(async (s: number) => {
    setLoading(true);
    try {
      const res  = await fetch(`${API}/api/v1/simulations/step?step=${s}`, { method: "POST" });
      const data = await res.json();
      setState(data.state as SimState);
    } catch { /* keep */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchStep(step); }, [step, fetchStep]);

  useEffect(() => {
    if (playing) {
      timerRef.current = setInterval(() => {
        setStep(s => { if (s >= MAX_STEP) { setPlaying(false); return s; } return s + 1; });
      }, 2200);
    } else if (timerRef.current) clearInterval(timerRef.current);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [playing]);

  // ── Crisis lifecycle engine ──
  useEffect(() => {
    lifecycleRef.current = setInterval(() => {
      const now = Date.now();
      setUserCrises(prev => {
        const next = prev.map(c => {
          const elapsedSecs = (now - c.addedAt) / 1000;
          if (elapsedSecs < TRANSIT_SECS)  return { ...c, status: "transit"  as const, progress: 0 };
          if (elapsedSecs < TRANSIT_SECS + RESOLVE_SECS) {
            const prog = ((elapsedSecs - TRANSIT_SECS) / RESOLVE_SECS) * 100;
            const score = aiScore(c.type, c.zone, c.severity, elapsedSecs);
            return { ...c, status: "on_scene" as const, progress: prog, aiScore: score };
          }
          return { ...c, status: "resolved" as const, progress: 100 };
        });
        // Remove resolved crises after FADE_SECS extra
        return next.filter(c => {
          if (c.status !== "resolved") return true;
          return (now - c.addedAt) / 1000 < TRANSIT_SECS + RESOLVE_SECS + FADE_SECS;
        });
      });
    }, 400);
    return () => { if (lifecycleRef.current) clearInterval(lifecycleRef.current); };
  }, []);

  const metrics   = state?.summary_metrics;
  const risk      = metrics?.city_risk_score ?? 0;
  const alert     = alertLevel(risk);
  const incidents = state?.active_incidents ?? [];
  const vehicles  = state?.vehicles ?? [];
  const ambu1     = vehicles.find(v => v.id === "ambu-01");
  const activeCrises = userCrises.filter(c => c.status !== "resolved");

  const handleDispatch = (c: UserCrisis & { aiScore: number }) => {
    setUserCrises(prev => [...prev, c]);
  };

  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100vh" }}>

      {/* Header */}
      <header className="cmd-header">
        <div className="cmd-header-brand">
          <div className="cmd-header-logo">CS</div>
          <div><div className="cmd-header-title">CityShield AI</div><div className="cmd-header-sub">Emergency Command Platform</div></div>
        </div>
        <div className="cmd-header-stats">
          <div className="cmd-stat"><div className="cmd-stat-label">City risk</div><div className="cmd-stat-value" style={{ color: riskColor(risk) }}>{risk}</div></div>
          <div className="cmd-stat"><div className="cmd-stat-label">Active incidents</div>
            <div className="cmd-stat-value" style={{ color: incidents.length + activeCrises.length >= 3 ? "var(--red)" : incidents.length + activeCrises.length > 0 ? "var(--amber)" : "var(--green)" }}>
              {incidents.length + activeCrises.length}
            </div>
          </div>
          <div className="cmd-stat"><div className="cmd-stat-label">Avg AQI</div><div className="cmd-stat-value" style={{ color: (metrics?.avg_aqi??0)>100?"var(--amber)":"var(--green)" }}>{metrics?.avg_aqi??"–"}</div></div>
          <div className="cmd-stat"><div className="cmd-stat-label">Amb-1 ETA Δ</div><div className="cmd-stat-value" style={{ color: (ambu1?.eta_delta_minutes??0)>0?"var(--red)":"var(--green)" }}>{ambu1?.eta_delta_minutes?`+${ambu1.eta_delta_minutes}m`:"—"}</div></div>
          <div style={{ flex:1, fontSize:"0.76rem", color:"var(--muted)", paddingLeft:12, borderLeft:"1px solid var(--line)" }}>{state?.headline??"Loading…"}</div>
        </div>
        <div className="cmd-header-right">
          <div className="alert-level" style={{ color:alert.color, background:alert.bg, borderColor:`${alert.color}44` }}>
            <span className="alert-dot" style={{ background:alert.color }}/>{alert.label}
          </div>
          <div className="sim-badge">SIM · STEP {step}/{MAX_STEP}</div>
        </div>
      </header>

      {/* Body */}
      <div style={{ flex:1, display:"flex", flexDirection:"column", minHeight:0 }}>
        <div className="cmd-body" style={{ flex:1 }}>

          {/* Map */}
          <div className="cmd-map-col">
            <div style={{ padding:"7px 14px 5px", borderBottom:"1px solid var(--line)", display:"flex", justifyContent:"space-between", flexShrink:0 }}>
              <span style={{ fontFamily:"var(--mono)", fontSize:"0.65rem", color:"var(--muted)", textTransform:"uppercase", letterSpacing:"0.1em" }}>
                Live city canvas · <span style={{ color:"var(--blue)" }}>{STEP_LABELS[step]}</span>
              </span>
              <span style={{ fontFamily:"var(--mono)", fontSize:"0.65rem", color:"var(--muted)" }}>
                {state?.timestamp ? new Date(state.timestamp).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}) : ""}
              </span>
            </div>
            <div className="map-surface" style={{ flex:1 }}>
              <CityMap state={state} step={step} userCrises={userCrises}/>
            </div>
            <SimControls step={step} playing={playing} loading={loading}
              onPlay={()=>{ if(step>=MAX_STEP) setStep(0); setPlaying(true); }}
              onPause={()=>setPlaying(false)}
              onReset={()=>{ setPlaying(false); setStep(0); }}
              onSeek={s=>{ setPlaying(false); setStep(s); }}/>
          </div>

          {/* Sidebar */}
          <div className="cmd-sidebar">

            {/* Add Crisis */}
            <AddCrisisPanel onDispatch={handleDispatch}/>

            {/* AI Priority */}
            <CrisisPriorityPanel userCrises={userCrises} simIncidents={incidents}/>

            {/* Fleet */}
            <div className="pane">
              <div className="pane-title" style={{ marginBottom:4 }}>Fleet · Response units</div>
              {vehicles.map(v => {
                const active = v.current_status === "en_route";
                const col = v.id==="fire-01"?"var(--orange)":v.id==="ambu-02"?"var(--purple)":"var(--blue)";
                const dest = v.id==="ambu-01"?"→ St. Anne Hospital":v.id==="fire-01"?"→ Public Library":"→ Civic Center";
                return (
                  <div key={v.id} className="vehicle-row">
                    <div className="vehicle-icon" style={{ background:active?`${col}20`:"rgba(255,255,255,0.04)", border:`1px solid ${active?col+"55":"rgba(255,255,255,0.08)"}` }}>
                      {VEH_ICON[v.vehicle_type]??"🚗"}
                    </div>
                    <div className="vehicle-info">
                      <div className="vehicle-id" style={{ color:active?col:"var(--muted)" }}>{v.id.toUpperCase()}</div>
                      <div className="vehicle-dest">{active?dest:"Standby"}</div>
                    </div>
                    <div className="vehicle-eta" style={{ color:active?(v.eta_delta_minutes>0?"var(--red)":col):"var(--muted)" }}>
                      {active?`${v.eta_minutes}m`:"—"}
                    </div>
                  </div>
                );
              })}
              {/* User-dispatched units */}
              {activeCrises.map(c=>(
                <div key={c.id} className="vehicle-row">
                  <div className="vehicle-icon" style={{ background:`${CRISIS_TYPES[c.type].color}18`, border:`1px solid ${CRISIS_TYPES[c.type].color}44` }}>
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
            <div className="pane">
              <div className="pane-title" style={{ marginBottom:2 }}>Domain risk scores</div>
              {state && Object.entries(state.domain_scores).map(([key, val])=>(
                <div key={key} className="domain-row">
                  <div className="domain-label">{key.replace(/_/g," ")}</div>
                  <div className="domain-bar-track"><div className="domain-bar" style={{ width:`${val}%`, background:riskColor(val) }}/></div>
                  <div className="domain-score" style={{ color:riskColor(val) }}>{val}</div>
                </div>
              ))}
            </div>

          </div>
        </div>

        {/* Bottom impact bar */}
        <div className="cmd-bottom">
          {[
            { label:"Amb. ETA reduction",    value:`${state?.impact_summary.ambulance_eta_reduction_pct??0}%`,  color:"var(--green)",  sub:"with AI interventions" },
            { label:"Traffic queue cut",      value:`${state?.impact_summary.queue_length_reduction_pct??0}%`,  color:"var(--blue)",   sub:"vs no-action baseline" },
            { label:"AQI exposure cut",       value:`${state?.impact_summary.exposure_reduction_pct??0}%`,     color:"var(--amber)",  sub:"school zone benefit" },
            { label:"Energy load shifted",    value:`${state?.impact_summary.energy_shift_kw??0} kW`,          color:"var(--purple)", sub:"non-critical buildings" },
          ].map(m=>(
            <div key={m.label} className="pane" style={{ padding:"10px 16px" }}>
              <div className="pane-title">{m.label}</div>
              <div className="impact-value" style={{ color:m.color }}>{m.value}</div>
              <div className="impact-label">{m.sub}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
