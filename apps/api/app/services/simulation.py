from __future__ import annotations

from copy import deepcopy
from datetime import datetime, timezone
from typing import Any

from app.core.data import load_seed_data, load_timeline


def clamp(value: float, low: float = 0, high: float = 100) -> float:
    return max(low, min(high, value))


class SimulationService:
    def __init__(self) -> None:
        self.seed = load_seed_data()
        self.timeline = load_timeline()["events"]

    def initial_state(self) -> dict[str, Any]:
        seed = deepcopy(self.seed)
        baseline = seed["baseline_metrics"]

        road_segments = [
            {**seg, "congestion_index": 18 if seg["id"] == "segment-r10" else 22, "status": "normal"}
            for seg in seed["road_segments"]
        ]

        zones = [
            {
                **zone,
                "aqi": 58 if zone["id"] == "zone-school-east" else 54,
                "unified_risk": 31 if zone["id"] == "zone-central" else 24,
                "dominant_factor": "traffic" if zone["id"] == "zone-central" else "baseline",
            }
            for zone in seed["zones"]
        ]

        vehicles = [
            {**deepcopy(v), "eta_delta_minutes": 0.0}
            for v in seed["vehicles"]
        ]

        state: dict[str, Any] = {
            "city_name": seed["city_name"],
            "timestamp": datetime(2026, 4, 22, 14, 5, tzinfo=timezone.utc).isoformat(),
            "mode": "simulation",
            "headline": "City operating within normal thresholds.",
            "active_incidents": [],
            "zones": zones,
            "facilities": deepcopy(seed["facilities"]),
            "public_buildings": [
                {**b, "current_kw": round(b["max_kw"] * 0.58, 1)}
                for b in seed["public_buildings"]
            ],
            "road_segments": road_segments,
            "vehicles": vehicles,
            "summary_metrics": deepcopy(baseline),
            "domain_scores": {
                "traffic": 28,
                "air_quality": 24,
                "emergency_delay": 31,
                "energy_strain": 22,
            },
            "applied_actions": [],
        }
        state["recommendations"] = self._build_recommendations(state)
        state["impact_summary"] = self._build_impact_summary(state)
        return state

    def state_for_step(self, step: int) -> dict[str, Any]:
        state = self.initial_state()
        for event in self.timeline[:step]:
            self._apply_event(state, event)
        state["recommendations"] = self._build_recommendations(state)
        state["impact_summary"] = self._build_impact_summary(state)
        return state

    def apply_actions(self, actions: list[str]) -> dict[str, Any]:
        state = self.state_for_step(len(self.timeline) - 1)
        for action in actions:
            if action not in state["applied_actions"]:
                state["applied_actions"].append(action)

        metrics = state["summary_metrics"]
        for v in state["vehicles"]:
            if v["id"] == "ambu-01" and "ambulance_green_wave" in actions:
                v["eta_minutes"] = 6.9
                v["eta_delta_minutes"] = -0.9
            if v["id"] == "ambu-02" and "dispatch_ambu02_priority_route" in actions:
                v["eta_minutes"] = 5.2
                v["eta_delta_minutes"] = -1.4

        if "reroute_general_traffic" in actions:
            self._update_segment(state, "segment-r08", 44, "managed")
            self._update_segment(state, "segment-r09", 39, "managed")
            self._update_segment(state, "segment-r10", 36, "managed")

        if "fire_lane_clearance" in actions:
            self._update_segment(state, "segment-r11", 42, "managed")

        metrics["city_risk_score"] = 58
        metrics["avg_congestion_index"] = 49
        metrics["avg_aqi"] = 89
        metrics["ambulance_eta_delta_minutes"] = 0.8
        metrics["public_building_strain_avg"] = 45
        state["headline"] = "Coordinated interventions active. All three incidents being managed simultaneously."
        state["domain_scores"] = {
            "traffic": 55,
            "air_quality": 58,
            "emergency_delay": 51,
            "energy_strain": 41,
        }
        state["recommendations"] = self._build_recommendations(state)
        state["impact_summary"] = self._build_impact_summary(state)
        return state

    def _apply_event(self, state: dict[str, Any], event: dict[str, Any]) -> None:
        event_type = event["event_type"]
        payload = event["payload"]

        if event_type == "baseline_loaded":
            state["headline"] = payload["headline"]
            return

        if event_type == "collision_created":
            state["active_incidents"].append({
                "id": payload["incident_id"],
                "title": "Vehicle collision — Central Ave",
                "type": "collision",
                "severity": payload["severity"],
                "road_segment_id": payload["road_segment_id"],
                "description": payload["description"],
                "status": "active",
            })
            state["headline"] = "Crash detected on Central Ave. Corridor monitoring elevated."
            self._update_segment(state, payload["road_segment_id"], 71, "critical")
            return

        if event_type == "traffic_spillback":
            for seg_id in payload["affected_segments"]:
                self._update_segment(state, seg_id, 78 if seg_id != "segment-r10" else 64, "stressed")
            state["summary_metrics"]["avg_congestion_index"] = 68
            state["summary_metrics"]["city_risk_score"] = 61
            state["domain_scores"]["traffic"] = 71
            state["headline"] = "Spillback is spreading into adjacent corridors and school connectors."
            return

        if event_type == "school_zone_aqi_warning":
            for zone in state["zones"]:
                if zone["id"] == payload["zone_id"]:
                    zone["aqi"] = payload["aqi"]
                    zone["unified_risk"] = 82
                    zone["dominant_factor"] = "air_quality"
            state["summary_metrics"]["avg_aqi"] = 112
            state["summary_metrics"]["city_risk_score"] = 69
            state["domain_scores"]["air_quality"] = 66
            state["headline"] = "School East air quality is moving into an unsafe range."
            return

        if event_type == "ambulance_eta_increase":
            for v in state["vehicles"]:
                if v["id"] == payload["vehicle_id"]:
                    v["eta_minutes"] = payload["eta_minutes"]
                    v["eta_delta_minutes"] = payload["eta_delta_minutes"]
            state["summary_metrics"]["ambulance_eta_delta_minutes"] = payload["eta_delta_minutes"]
            state["summary_metrics"]["city_risk_score"] = 74
            state["domain_scores"]["emergency_delay"] = 83
            state["headline"] = "Emergency route delay is now the dominant citywide risk."
            return

        if event_type == "structure_fire_created":
            state["active_incidents"].append({
                "id": payload["incident_id"],
                "title": "Structure fire — Downtown Library",
                "type": "fire",
                "severity": payload["severity"],
                "road_segment_id": payload["road_segment_id"],
                "description": payload["description"],
                "status": "active",
            })
            self._update_segment(state, payload["road_segment_id"], 91, "blocked")
            for v in state["vehicles"]:
                if v["id"] == "fire-01":
                    v["current_status"] = "en_route"
                    v["destination_facility_id"] = "fac-library-01"
                    v["eta_minutes"] = 4.2
                    v["eta_delta_minutes"] = 0.0
            state["summary_metrics"]["avg_aqi"] = max(state["summary_metrics"]["avg_aqi"], 121)
            state["summary_metrics"]["city_risk_score"] = 81
            state["domain_scores"]["air_quality"] = max(state["domain_scores"]["air_quality"], 77)
            state["domain_scores"]["traffic"] = max(state["domain_scores"]["traffic"], 79)
            state["headline"] = "Structure fire downtown. Fire engine dispatched. Smoke worsening air quality city-wide."
            return

        if event_type == "cardiac_emergency_created":
            state["active_incidents"].append({
                "id": payload["incident_id"],
                "title": "Cardiac arrest — Civic Center",
                "type": "medical",
                "severity": payload["severity"],
                "road_segment_id": payload["road_segment_id"],
                "description": payload["description"],
                "status": "active",
            })
            self._update_segment(state, payload["road_segment_id"], 55, "stressed")
            for v in state["vehicles"]:
                if v["id"] == "ambu-02":
                    v["current_status"] = "en_route"
                    v["destination_facility_id"] = "fac-civic-center"
                    v["eta_minutes"] = 9.1
                    v["eta_delta_minutes"] = 2.8
            state["summary_metrics"]["city_risk_score"] = 87
            state["domain_scores"]["emergency_delay"] = 91
            state["headline"] = "Cardiac arrest at Civic Center. Ambulance 2 dispatched. Emergency corridors saturated."
            return

        if event_type == "water_main_break":
            state["active_incidents"].append({
                "id": payload["incident_id"],
                "title": "Water main break — Central Ave W",
                "type": "infrastructure",
                "severity": payload["severity"],
                "road_segment_id": payload["road_segment_id"],
                "description": payload["description"],
                "status": "active",
            })
            self._update_segment(state, payload["road_segment_id"], 95, "blocked")
            state["summary_metrics"]["city_risk_score"] = 91
            state["domain_scores"]["traffic"] = 89
            state["headline"] = "Water main rupture blocks Central Ave Westbound. Three simultaneous crises active."
            return

        if event_type == "actions_applied":
            state["applied_actions"] = list(payload["actions"])
            state["summary_metrics"]["public_building_strain_avg"] = 52
            state["domain_scores"]["energy_strain"] = 52
            return

    def _update_segment(self, state: dict[str, Any], segment_id: str, congestion: float, status: str) -> None:
        for segment in state["road_segments"]:
            if segment["id"] == segment_id:
                segment["congestion_index"] = congestion
                segment["status"] = status
                break

    def _build_recommendations(self, state: dict[str, Any]) -> list[dict[str, Any]]:
        emergency_delay = state["domain_scores"]["emergency_delay"]
        traffic = state["domain_scores"]["traffic"]
        air_quality = state["domain_scores"]["air_quality"]
        energy = state["domain_scores"]["energy_strain"]
        incident_types = {inc["type"] for inc in state["active_incidents"]}
        has_fire = "fire" in incident_types
        has_cardiac = "medical" in incident_types

        recs = [
            {
                "id": "rec-01",
                "title": "Activate ambulance green wave",
                "action": "ambulance_green_wave",
                "priority": 1,
                "confidence": 0.94,
                "rationale": "Emergency corridor delay is the highest-risk domain and a live ambulance route is affected.",
                "expected_benefits": ["Lower ETA by 20-40%", "Preserve hospital corridor access"],
                "score": 0.30 * 96 + 0.25 * emergency_delay + 0.20 * 89 + 0.15 * 94 + 0.10 * 82,
            },
            {
                "id": "rec-02",
                "title": "Reroute general traffic",
                "action": "reroute_general_traffic",
                "priority": 2,
                "confidence": 0.89,
                "rationale": "Adjacent segments are showing spillback and alternate capacity exists downtown.",
                "expected_benefits": ["Reduce queue growth by 10-25%", "Slow AQI deterioration near the school"],
                "score": 0.30 * 90 + 0.25 * traffic + 0.20 * 82 + 0.15 * 89 + 0.10 * 73,
            },
            {
                "id": "rec-03",
                "title": "Issue school zone air alert",
                "action": "issue_sensitive_zone_alert",
                "priority": 3,
                "confidence": 0.86,
                "rationale": "AQI near Jefferson Elementary has crossed the sensitive-population warning threshold.",
                "expected_benefits": ["Reduce exposure window", "Support proactive school messaging"],
                "score": 0.30 * 82 + 0.25 * air_quality + 0.20 * 76 + 0.15 * 86 + 0.10 * 91,
            },
            {
                "id": "rec-04",
                "title": "Reduce non-critical HVAC load",
                "action": "reduce_non_critical_hvac_load",
                "priority": 4,
                "confidence": 0.81,
                "rationale": "Nearby civic buildings can shed load while corridor stress remains elevated.",
                "expected_benefits": ["Shift up to 74 kW", "Create headroom for sustained operations"],
                "score": 0.30 * 68 + 0.25 * energy + 0.20 * 64 + 0.15 * 81 + 0.10 * 88,
            },
        ]

        if has_fire:
            recs.append({
                "id": "rec-05",
                "title": "Clear fire lane on Market St",
                "action": "fire_lane_clearance",
                "priority": 1,
                "confidence": 0.97,
                "rationale": "Fire engine route is partially obstructed. Clearing Market St reduces arrival time.",
                "expected_benefits": ["Faster fire suppression", "Reduce smoke spread window"],
                "score": 0.30 * 97 + 0.25 * traffic + 0.20 * air_quality + 0.15 * 97 + 0.10 * 85,
            })

        if has_cardiac:
            recs.append({
                "id": "rec-06",
                "title": "Priority route for Ambulance 2",
                "action": "dispatch_ambu02_priority_route",
                "priority": 1,
                "confidence": 0.95,
                "rationale": "Cardiac arrest survival drops 10% per minute. Ambulance 2 needs a clear corridor to Civic Center.",
                "expected_benefits": ["Cut response time by ~3 min", "Maximize cardiac survival odds"],
                "score": 0.30 * 98 + 0.25 * emergency_delay + 0.20 * 91 + 0.15 * 95 + 0.10 * 80,
            })

        return sorted(recs, key=lambda r: r["score"], reverse=True)

    def _build_impact_summary(self, state: dict[str, Any]) -> dict[str, Any]:
        applied = set(state["applied_actions"])
        if state["summary_metrics"]["city_risk_score"] < 40:
            return {"ambulance_eta_reduction_pct": 0, "queue_length_reduction_pct": 0, "exposure_reduction_pct": 0, "energy_shift_kw": 0}
        return {
            "ambulance_eta_reduction_pct": 38 if "ambulance_green_wave" in applied else 18,
            "queue_length_reduction_pct": 19 if "reroute_general_traffic" in applied else 9,
            "exposure_reduction_pct": 21 if "issue_sensitive_zone_alert" in applied else 12,
            "energy_shift_kw": 74 if "reduce_non_critical_hvac_load" in applied else 18,
        }


simulation_service = SimulationService()
