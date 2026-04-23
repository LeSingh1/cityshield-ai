# Backend API Specification

## 1. API design principles

1. Keep endpoints resource oriented
2. Return map friendly JSON
3. Separate raw state from computed recommendations
4. Keep simulation controls explicit
5. Support both dashboard mode and demo playback mode

## 2. Base URL

`/api/v1`

## 3. Main endpoint groups

1. health
2. entities
3. snapshots
4. incidents
5. risk
6. recommendations
7. simulations
8. explanations
9. metrics

## 4. Endpoint catalog

### 4.1 Health

#### GET `/health`

Purpose:
Check backend availability

Response:
```json
{
  "status": "ok",
  "service": "cityshield-api",
  "version": "0.1.0"
}
```

### 4.2 Dashboard bootstrap

#### GET `/dashboard/overview`

Purpose:
Load top level dashboard state in one request

Response:
```json
{
  "city_name": "MetroSim",
  "current_time": "2026-04-22T14:05:00Z",
  "mode": "simulation",
  "active_incidents": 1,
  "city_risk_score": 74,
  "dominant_factor": "emergency_delay",
  "summary_metrics": {
    "avg_congestion_index": 68,
    "avg_aqi": 112,
    "ambulance_eta_delta_minutes": 3.4,
    "public_building_strain_avg": 59
  },
  "headline": "Crash near Central Ave is causing congestion spillback and elevated school zone exposure risk."
}
```

### 4.3 Entities

#### GET `/entities/zones`

Returns all zones.

#### GET `/entities/road-segments`

Returns all road segments.

#### GET `/entities/facilities`

Returns all facilities.

#### GET `/entities/public-buildings`

Returns all public buildings.

### 4.4 Map layers

#### GET `/map/layers`

Purpose:
Return all renderable map layers in one response

Query params:
1. `include_dynamic=true|false`

Response:
```json
{
  "zones": [],
  "road_segments": [],
  "facilities": [],
  "public_buildings": [],
  "incidents": [],
  "emergency_vehicles": []
}
```

### 4.5 Snapshots

#### GET `/snapshots/traffic`

Query params:
1. `road_segment_id`
2. `latest_only`
3. `since`

#### GET `/snapshots/air-quality`

Query params:
1. `zone_id`
2. `latest_only`
3. `since`

#### GET `/snapshots/energy`

Query params:
1. `public_building_id`
2. `latest_only`
3. `since`

#### GET `/snapshots/city-risk`

Query params:
1. `zone_id`
2. `latest_only`
3. `since`

### 4.6 Incidents

#### GET `/incidents`

Returns active or historical incidents.

Query params:
1. `status`
2. `severity_gte`
3. `zone_id`

#### POST `/incidents`

Purpose:
Create a manual incident

Request:
```json
{
  "incident_type": "collision",
  "severity": 4,
  "zone_id": "zone-central",
  "road_segment_id": "segment-r08",
  "lat": 37.1002,
  "lng": -122.1008,
  "description": "Two vehicle crash blocking one lane"
}
```

#### GET `/incidents/{incident_id}`

Returns incident detail.

### 4.7 Risk

#### GET `/risk/summary`

Purpose:
Return current domain and composite risk

Response:
```json
{
  "city_risk_score": 74,
  "by_domain": {
    "traffic": 71,
    "air_quality": 66,
    "emergency_delay": 83,
    "energy_strain": 52
  },
  "top_zones": [
    {
      "zone_id": "zone-central",
      "unified_risk": 88,
      "dominant_factor": "emergency_delay"
    }
  ]
}
```

#### GET `/risk/zones/{zone_id}`

Purpose:
Return zone level risk details

#### GET `/risk/corridors/{corridor_id}`

Purpose:
Return corridor level risk details for grouped road segments

### 4.8 Recommendations

#### GET `/recommendations`

Purpose:
Return ranked recommendations

Query params:
1. `incident_id`
2. `zone_id`
3. `status`

Response:
```json
{
  "items": [
    {
      "id": "rec-01",
      "type": "ambulance_green_wave",
      "priority_rank": 1,
      "confidence_score": 0.92,
      "target": {
        "entity_type": "corridor",
        "entity_id": "corridor-hospital-east"
      },
      "expected_impact": {
        "delay_reduction_pct": 38,
        "exposure_reduction_pct": 8,
        "energy_shift_kw": 0
      },
      "rationale": "Ambulance route intersects current congestion hotspot and has highest life critical priority."
    }
  ]
}
```

#### POST `/recommendations/recompute`

Purpose:
Force recomputation after simulation state change

### 4.9 Explanations

#### POST `/explanations/generate`

Purpose:
Generate natural language summary for current state or recommendation set

Request:
```json
{
  "scope": "incident",
  "incident_id": "inc-01",
  "style": "operator_brief",
  "llm_enabled": true
}
```

Response:
```json
{
  "summary": "Crash activity on Central Ave is increasing ambulance delay and school zone exposure risk. Prioritize the hospital corridor, reroute general traffic, and reduce non critical building load nearby."
}
```

### 4.10 Simulations

#### POST `/simulations/start`

Purpose:
Start a named scenario

Request:
```json
{
  "scenario_name": "school_corridor_collision"
}
```

#### POST `/simulations/step`

Purpose:
Advance simulation one step

Request:
```json
{
  "scenario_run_id": "run-01"
}
```

#### POST `/simulations/play`

Purpose:
Begin timed playback

Request:
```json
{
  "scenario_run_id": "run-01",
  "speed_multiplier": 1
}
```

#### POST `/simulations/pause`

Purpose:
Pause playback

#### POST `/simulations/reset`

Purpose:
Reset scenario state to baseline

#### GET `/simulations/{scenario_run_id}`

Purpose:
Get current scenario state and event timeline

### 4.11 Actions

#### POST `/actions/apply`

Purpose:
Simulate applying a recommendation

Request:
```json
{
  "action_type": "reroute_general_traffic",
  "target_entity_id": "segment-r08"
}
```

Response:
```json
{
  "status": "applied",
  "expected_effect": {
    "queue_length_delta_pct": -19,
    "ambulance_eta_delta_minutes": -1.3
  }
}
```

### 4.12 Metrics

#### GET `/metrics/impact-summary`

Purpose:
Return before and after metrics for current scenario

Response:
```json
{
  "before": {
    "ambulance_eta_minutes": 11.2,
    "avg_aqi_sensitive_zone": 126,
    "corridor_queue_length_m": 420
  },
  "after": {
    "ambulance_eta_minutes": 7.9,
    "avg_aqi_sensitive_zone": 103,
    "corridor_queue_length_m": 341
  }
}
```

## 5. Suggested service layer mapping

1. `dashboard_service`
2. `entity_service`
3. `snapshot_service`
4. `incident_service`
5. `risk_service`
6. `recommendation_service`
7. `simulation_service`
8. `explanation_service`
9. `metrics_service`

## 6. Error shape

Use consistent errors.

```json
{
  "error": {
    "code": "SCENARIO_NOT_FOUND",
    "message": "Scenario school_corridor_collision was not found"
  }
}
```

## 7. Response conventions

1. Timestamps in ISO 8601
2. GeoJSON for spatial payloads where possible
3. Snake case in backend
4. Frontend can transform to camel case if needed
5. Domain scores normalized to 0 through 100

## 8. Authentication

For MVP:
1. no auth or demo token only

For future:
1. JWT auth
2. role based access control

## 9. Streaming options

If real time updates are desired, add:
1. `GET /stream/dashboard`
2. `GET /stream/simulation/{scenario_run_id}`

Use Server Sent Events payloads for:
1. state_update
2. incident_created
3. risk_updated
4. recommendations_updated
5. action_applied
