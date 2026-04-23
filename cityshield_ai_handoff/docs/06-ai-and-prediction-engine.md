# AI and Prediction Engine

## 1. Design philosophy

The intelligence layer should be powerful but grounded.

The product should not depend on a black box model for correctness. The best MVP is a hybrid system:

1. deterministic simulation for causal state changes
2. heuristic or lightweight predictive models for near term risk
3. optional LLM layer for natural language explanations

## 2. Intelligence layers

### 2.1 Layer 1: Deterministic event engine

Purpose:
Simulate what happens when an incident occurs

Example rules:
1. collision on road segment reduces effective capacity
2. lower capacity increases congestion index on that segment
3. spillback affects adjacent segments
4. higher congestion increases idling related pollution
5. rising congestion increases emergency route ETA
6. extreme local load may trigger energy optimization suggestions

This layer is the most important part of the MVP.

### 2.2 Layer 2: Forecasting and prediction

Purpose:
Estimate near future risk, usually 5 to 20 minutes ahead

Methods:
1. weighted trend extrapolation
2. exponential smoothing
3. moving average delta
4. simple gradient based queue growth model

The forecast does not need full machine learning for MVP. It only needs to look credible and behave consistently.

### 2.3 Layer 3: Recommendation engine

Purpose:
Map current and predicted state into ranked interventions

This can be implemented as a rule based scoring system.

### 2.4 Layer 4: Explanation engine

Purpose:
Convert technical outputs into clear operator language

Use:
1. deterministic templates first
2. optional LLM rewrite for polish

## 3. Risk domains

### 3.1 Traffic risk

Inputs:
1. average speed
2. occupancy
3. queue length
4. segment capacity reduction
5. adjacent segment pressure

Example normalized score:
`traffic_risk = clamp(0.35*congestion_index + 0.25*queue_pressure + 0.20*speed_drop + 0.20*spillback_factor, 0, 100)`

### 3.2 Air quality risk

Inputs:
1. PM2.5
2. AQI
3. local traffic density
4. presence of sensitive populations
5. trend velocity

Example normalized score:
`air_quality_risk = clamp(0.40*aqi_score + 0.20*pm25_score + 0.20*traffic_density_score + 0.20*sensitivity_multiplier, 0, 100)`

### 3.3 Emergency delay risk

Inputs:
1. ambulance ETA delta
2. blocked route segments
3. corridor congestion
4. hospital proximity
5. incident severity

Example:
`emergency_delay_risk = clamp(0.45*eta_delta_score + 0.25*corridor_congestion + 0.20*blocked_route_factor + 0.10*hospital_criticality, 0, 100)`

### 3.4 Energy strain risk

Inputs:
1. public building load
2. HVAC share
3. local heat or demand condition
4. load shedding availability
5. zone stress level

Example:
`energy_strain_risk = clamp(0.40*current_load_pct + 0.20*hvac_dependency + 0.20*zone_stress + 0.20*load_inflexibility, 0, 100)`

### 3.5 Composite unified risk

Suggested weighting:
1. traffic 35 percent
2. air quality 25 percent
3. emergency delay 25 percent
4. energy strain 15 percent

Final:
`unified_risk = 0.35*T + 0.25*A + 0.25*E + 0.15*G`

## 4. Recommendation engine

### 4.1 Recommendation types

1. ambulance_green_wave
2. reroute_general_traffic
3. issue_sensitive_zone_alert
4. activate_dynamic_signals
5. reduce_non_critical_hvac_load
6. dispatch_field_verification
7. restrict_turn_movements_temporarily
8. prioritize_hospital_corridor

### 4.2 Recommendation logic format

Each recommendation can be scored using:
1. relevance
2. urgency
3. confidence
4. expected impact
5. implementation ease

Suggested formula:
`recommendation_score = 0.30*relevance + 0.25*urgency + 0.20*impact + 0.15*confidence + 0.10*ease`

### 4.3 Example recommendation rules

#### Rule A
If emergency delay risk is above 75 and ambulance is active on the corridor:
1. recommend ambulance green wave
2. set high urgency
3. target corridor intersections

#### Rule B
If traffic risk is above 70 and alternate route capacity exists:
1. recommend reroute general traffic
2. estimate queue reduction

#### Rule C
If AQI is above threshold in a sensitive zone:
1. recommend issue sensitive zone alert
2. link school or clinic in explanation

#### Rule D
If nearby public buildings have load shedding allowed and energy strain is above 55:
1. recommend reduce non critical HVAC load
2. estimate shifted kilowatts

## 5. Impact estimator

The system should estimate outcomes, not just actions.

Possible estimated outcomes:
1. ambulance ETA reduction
2. corridor queue length reduction
3. exposure window reduction
4. AQI improvement over next window
5. energy shift in kilowatts

Simple methods are acceptable for MVP:
1. percentage based deterministic deltas
2. scenario calibrated adjustment tables
3. action multiplier tables

Example:
If green wave applied:
1. reduce ambulance ETA by 20 to 40 percent depending on congestion severity
2. reduce cross corridor queue only slightly

If reroute applied:
1. reduce queue by 10 to 25 percent
2. reduce local AQI growth slightly
3. possibly increase load elsewhere

## 6. LLM explanation layer

### 6.1 Purpose

The LLM should turn structured state into concise, readable operator guidance.

### 6.2 Guardrails

1. Do not let LLM invent metrics
2. Pass structured inputs only
3. Require concise output
4. Keep deterministic fallback

### 6.3 Suggested output formats

1. operator brief
2. executive summary
3. judge mode narrative
4. public alert simulation

### 6.4 Example structured input

```json
{
  "incident_type": "collision",
  "zone": "Central Corridor",
  "traffic_risk": 81,
  "air_quality_risk": 67,
  "emergency_delay_risk": 89,
  "top_recommendations": [
    "ambulance_green_wave",
    "reroute_general_traffic",
    "issue_sensitive_zone_alert"
  ]
}
```

### 6.5 Example explanation output

"Crash conditions in Central Corridor are sharply increasing ambulance delay and local exposure risk near Jefferson Elementary. Prioritize the hospital route first, reroute non emergency traffic next, and issue a localized air advisory if current PM2.5 growth continues."

## 7. Simulation first intelligence plan

### 7.1 Phase 1

Build rule based city physics:
1. incidents affect capacity
2. capacity affects traffic
3. traffic affects pollution
4. traffic affects emergency routes
5. system recommends actions

### 7.2 Phase 2

Add forecast windows:
1. next 5 minutes
2. next 10 minutes
3. next 15 minutes

### 7.3 Phase 3

Add explanation rewrite and ranking polish

## 8. Why this AI approach is strong

1. It looks advanced
2. It is easy to implement
3. It stays trustworthy
4. It avoids fake magic
5. Claude Code can build it reliably
