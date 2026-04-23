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
        road_segments = []
        for segment in seed["road_segments"]:
            road_segments.append(
                {
                    **segment,
                    "congestion_index": 22 if segment["id"] != "segment-r10" else 18,
                    "status": "normal",
                }
            )

        zones = []
        for zone in seed["zones"]:
            zones.append(
                {
                    **zone,
                    "aqi": 54 if zone["id"] != "zone-school-east" else 58,
                    "unified_risk": 24 if zone["id"] != "zone-central" else 31,
                    "dominant_factor": "traffic" if zone["id"] == "zone-central" else "baseline",
                }
            )

        state = {
            "city_name": seed["city_name"],
            "timestamp": datetime(2026, 4, 22, 14, 5, tzinfo=timezone.utc).isoformat(),
            "mode": "simulation",
            "headline": "City operating within normal thresholds.",
            "active_incidents": [],
            "zones": zones,
            "facilities": deepcopy(seed["facilities"]),
            "public_buildings": [
                {**building, "current_kw": round(building["max_kw"] * 0.58, 1)}
                for building in seed["public_buildings"]
            ],
            "road_segments": road_segments,
            "emergency_vehicle": {
                **deepcopy(seed["emergency_vehicle"]),
                "eta_delta_minutes": 0.0,
            },
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
        state = self.state_for_step(len(self.timeline))
        for action in actions:
            if action not in state["applied_actions"]:
                state["applied_actions"].append(action)

        metrics = state["summary_metrics"]
        if "ambulance_green_wave" in actions:
            state["emergency_vehicle"]["eta_minutes"] = 6.9
            state["emergency_vehicle"]["eta_delta_minutes"] = -0.9
        metrics["city_risk_score"] = 58
        metrics["avg_congestion_index"] = 49
        metrics["avg_aqi"] = 89
        metrics["ambulance_eta_delta_minutes"] = 1.6
        metrics["public_building_strain_avg"] = 45
        state["headline"] = "Interventions are reducing corridor stress and improving emergency travel time."
        state["domain_scores"] = {
            "traffic": 57,
            "air_quality": 61,
            "emergency_delay": 54,
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
            state["active_incidents"] = [
                {
                    "id": payload["incident_id"],
                    "title": "Central Ave collision",
                    "severity": payload["severity"],
                    "road_segment_id": payload["road_segment_id"],
                    "description": payload["description"],
                    "status": "active",
                }
            ]
            state["headline"] = "Crash detected on Central Ave. Corridor monitoring elevated."
            self._update_segment(state, payload["road_segment_id"], 71, "critical")
            return

        if event_type == "traffic_spillback":
            for segment_id in payload["affected_segments"]:
                self._update_segment(state, segment_id, 78 if segment_id != "segment-r10" else 64, "stressed")
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
            state["emergency_vehicle"]["eta_minutes"] = payload["eta_minutes"]
            state["emergency_vehicle"]["eta_delta_minutes"] = payload["eta_delta_minutes"]
            state["summary_metrics"]["ambulance_eta_delta_minutes"] = payload["eta_delta_minutes"]
            state["summary_metrics"]["city_risk_score"] = 74
            state["domain_scores"]["emergency_delay"] = 83
            state["headline"] = "Emergency route delay is now the dominant citywide risk."
            return

        if event_type == "actions_applied":
            state["applied_actions"] = list(payload["actions"])
            state["summary_metrics"]["public_building_strain_avg"] = 52
            state["domain_scores"]["energy_strain"] = 52
            return

        if event_type == "impact_summary_available":
            state["impact_summary"] = {
                "ambulance_eta_reduction_pct": payload["ambulance_eta_reduction_pct"],
                "queue_length_reduction_pct": payload["queue_length_reduction_pct"],
                "exposure_reduction_pct": payload["exposure_reduction_pct"],
                "energy_shift_kw": payload["energy_shift_kw"],
            }

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
        return sorted(recs, key=lambda rec: rec["score"], reverse=True)

    def _build_impact_summary(self, state: dict[str, Any]) -> dict[str, Any]:
        applied = set(state["applied_actions"])
        base_eta = 18 if "ambulance_green_wave" not in applied else 38
        base_queue = 9 if "reroute_general_traffic" not in applied else 19
        base_exposure = 12 if "issue_sensitive_zone_alert" not in applied else 21
        base_energy = 18 if "reduce_non_critical_hvac_load" not in applied else 74
        if state["summary_metrics"]["city_risk_score"] < 40:
            return {
                "ambulance_eta_reduction_pct": 0,
                "queue_length_reduction_pct": 0,
                "exposure_reduction_pct": 0,
                "energy_shift_kw": 0,
            }
        return {
            "ambulance_eta_reduction_pct": base_eta,
            "queue_length_reduction_pct": base_queue,
            "exposure_reduction_pct": base_exposure,
            "energy_shift_kw": base_energy,
        }


simulation_service = SimulationService()

