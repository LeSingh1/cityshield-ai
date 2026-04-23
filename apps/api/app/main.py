from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.services.simulation import simulation_service


app = FastAPI(title="CityShield API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "service": "cityshield-api", "version": "0.1.0"}


@app.get("/api/v1/dashboard/overview")
def dashboard_overview(step: int = 5) -> dict:
    state = simulation_service.state_for_step(step)
    metrics = state["summary_metrics"]
    return {
        "city_name": state["city_name"],
        "current_time": state["timestamp"],
        "mode": state["mode"],
        "active_incidents": len(state["active_incidents"]),
        "city_risk_score": metrics["city_risk_score"],
        "dominant_factor": max(state["domain_scores"], key=state["domain_scores"].get),
        "summary_metrics": metrics,
        "headline": state["headline"],
    }


@app.get("/api/v1/map/layers")
def map_layers(step: int = 5) -> dict:
    state = simulation_service.state_for_step(step)
    return {
        "zones": state["zones"],
        "road_segments": state["road_segments"],
        "facilities": state["facilities"],
        "public_buildings": state["public_buildings"],
        "incidents": state["active_incidents"],
        "emergency_vehicles": [state["emergency_vehicle"]],
    }


@app.get("/api/v1/risk/summary")
def risk_summary(step: int = 5) -> dict:
    state = simulation_service.state_for_step(step)
    zone_risks = sorted(state["zones"], key=lambda zone: zone["unified_risk"], reverse=True)
    return {
        "city_risk_score": state["summary_metrics"]["city_risk_score"],
        "by_domain": state["domain_scores"],
        "top_zones": [
            {
                "zone_id": zone["id"],
                "unified_risk": zone["unified_risk"],
                "dominant_factor": zone["dominant_factor"],
            }
            for zone in zone_risks[:3]
        ],
    }


@app.get("/api/v1/recommendations")
def recommendations(step: int = 5) -> dict:
    state = simulation_service.state_for_step(step)
    return {"items": state["recommendations"]}


@app.post("/api/v1/simulations/start")
def start_simulation() -> dict:
    state = simulation_service.state_for_step(0)
    return {"step": 0, "state": state}


@app.post("/api/v1/simulations/step")
def step_simulation(step: int = 1) -> dict:
    state = simulation_service.state_for_step(step)
    return {"step": step, "state": state}


@app.post("/api/v1/actions/apply")
def apply_actions(actions: list[str]) -> dict:
    state = simulation_service.apply_actions(actions)
    return {"state": state}


@app.get("/api/v1/metrics/impact-summary")
def impact_summary(step: int = 5) -> dict:
    state = simulation_service.state_for_step(step)
    return state["impact_summary"]

