# Data Model

## 1. Data model goals

1. Support a map based dashboard
2. Store time varying metrics cleanly
3. Keep incident and recommendation history
4. Enable deterministic simulation
5. Stay simple enough for MVP implementation

## 2. Core entities

### 2.1 zones

Represents city regions or operational districts.

Fields:
1. id
2. name
3. zone_type
4. polygon_geojson
5. priority_level
6. population_sensitivity_score

Example zone types:
1. residential
2. school_zone
3. hospital_corridor
4. downtown
5. civic_center
6. industrial

### 2.2 intersections

Represents signalized intersections.

Fields:
1. id
2. name
3. lat
4. lng
5. zone_id
6. signal_group
7. baseline_cycle_seconds

### 2.3 road_segments

Represents navigable roadway segments between intersections.

Fields:
1. id
2. name
3. start_intersection_id
4. end_intersection_id
5. zone_id
6. geometry_geojson
7. lane_count
8. speed_limit_mph
9. baseline_capacity
10. segment_type

### 2.4 facilities

Represents important public locations.

Fields:
1. id
2. name
3. facility_type
4. zone_id
5. lat
6. lng
7. priority_score

Facility types:
1. hospital
2. school
3. clinic
4. fire_station
5. city_hall
6. emergency_ops_center

### 2.5 public_buildings

Represents municipal buildings with energy load.

Fields:
1. id
2. name
3. zone_id
4. lat
5. lng
6. building_type
7. max_kw
8. criticality_level
9. load_shedding_allowed

### 2.6 incidents

Represents active or historical incidents.

Fields:
1. id
2. incident_type
3. status
4. severity
5. zone_id
6. road_segment_id
7. lat
8. lng
9. started_at
10. resolved_at
11. source
12. description

### 2.7 emergency_vehicles

Represents ambulances or emergency vehicles in the demo.

Fields:
1. id
2. vehicle_type
3. current_lat
4. current_lng
5. current_status
6. destination_facility_id
7. eta_minutes
8. route_geojson

### 2.8 recommendations

Represents generated system actions.

Fields:
1. id
2. incident_id
3. recommendation_type
4. target_entity_type
5. target_entity_id
6. priority_rank
7. confidence_score
8. expected_delay_reduction_pct
9. expected_exposure_reduction_pct
10. expected_energy_shift_kw
11. rationale
12. status
13. created_at

### 2.9 scenario_runs

Represents a demo or simulation session.

Fields:
1. id
2. name
3. current_step
4. state
5. started_at
6. ended_at

### 2.10 scenario_events

Represents timed events inside a scenario.

Fields:
1. id
2. scenario_run_id
3. event_order
4. event_type
5. effective_at
6. payload_json
7. applied

## 3. Time series tables

### 3.1 traffic_snapshots

Fields:
1. id
2. recorded_at
3. road_segment_id
4. avg_speed_mph
5. volume_count
6. occupancy_pct
7. queue_length_m
8. congestion_index

### 3.2 air_quality_snapshots

Fields:
1. id
2. recorded_at
3. zone_id
4. pm25
5. pm10
6. no2
7. ozone
8. aqi
9. exposure_risk_level

### 3.3 energy_snapshots

Fields:
1. id
2. recorded_at
3. public_building_id
4. current_kw
5. hvac_kw
6. lighting_kw
7. demand_response_state
8. strain_score

### 3.4 emergency_route_snapshots

Fields:
1. id
2. recorded_at
3. emergency_vehicle_id
4. route_segment_count
5. route_risk_score
6. eta_minutes
7. blocked_segments_count

### 3.5 city_risk_snapshots

Fields:
1. id
2. recorded_at
3. zone_id
4. traffic_risk
5. air_quality_risk
6. emergency_delay_risk
7. energy_strain_risk
8. unified_risk
9. dominant_factor

## 4. Relationships

1. one zone has many intersections
2. one zone has many road segments
3. one zone has many facilities
4. one zone has many public buildings
5. one road segment has many traffic snapshots
6. one zone has many air quality snapshots
7. one building has many energy snapshots
8. one incident may generate many recommendations
9. one scenario run has many scenario events

## 5. Suggested PostgreSQL schema

### 5.1 zones

```sql
create table zones (
  id uuid primary key,
  name text not null,
  zone_type text not null,
  polygon_geojson jsonb not null,
  priority_level int not null default 1,
  population_sensitivity_score numeric(5,2) not null default 0
);
```

### 5.2 road_segments

```sql
create table road_segments (
  id uuid primary key,
  name text not null,
  start_intersection_id uuid,
  end_intersection_id uuid,
  zone_id uuid not null references zones(id),
  geometry_geojson jsonb not null,
  lane_count int not null,
  speed_limit_mph numeric(5,2) not null,
  baseline_capacity int not null,
  segment_type text not null
);
```

### 5.3 incidents

```sql
create table incidents (
  id uuid primary key,
  incident_type text not null,
  status text not null,
  severity int not null,
  zone_id uuid references zones(id),
  road_segment_id uuid references road_segments(id),
  lat numeric(9,6),
  lng numeric(9,6),
  started_at timestamptz not null,
  resolved_at timestamptz,
  source text,
  description text
);
```

### 5.4 recommendations

```sql
create table recommendations (
  id uuid primary key,
  incident_id uuid references incidents(id),
  recommendation_type text not null,
  target_entity_type text not null,
  target_entity_id uuid,
  priority_rank int not null,
  confidence_score numeric(5,2) not null,
  expected_delay_reduction_pct numeric(5,2),
  expected_exposure_reduction_pct numeric(5,2),
  expected_energy_shift_kw numeric(10,2),
  rationale text not null,
  status text not null default 'proposed',
  created_at timestamptz not null default now()
);
```

### 5.5 traffic_snapshots

```sql
create table traffic_snapshots (
  id uuid primary key,
  recorded_at timestamptz not null,
  road_segment_id uuid not null references road_segments(id),
  avg_speed_mph numeric(6,2) not null,
  volume_count int not null,
  occupancy_pct numeric(5,2) not null,
  queue_length_m numeric(8,2) not null,
  congestion_index numeric(5,2) not null
);
```

### 5.6 air_quality_snapshots

```sql
create table air_quality_snapshots (
  id uuid primary key,
  recorded_at timestamptz not null,
  zone_id uuid not null references zones(id),
  pm25 numeric(8,2) not null,
  pm10 numeric(8,2),
  no2 numeric(8,2),
  ozone numeric(8,2),
  aqi numeric(8,2) not null,
  exposure_risk_level text not null
);
```

### 5.7 energy_snapshots

```sql
create table energy_snapshots (
  id uuid primary key,
  recorded_at timestamptz not null,
  public_building_id uuid not null,
  current_kw numeric(10,2) not null,
  hvac_kw numeric(10,2),
  lighting_kw numeric(10,2),
  demand_response_state text not null,
  strain_score numeric(5,2) not null
);
```

## 6. Derived fields and computed views

### 6.1 unified risk

This should be computed, not directly edited by users.

Suggested formula:
1. normalize domain scores into 0 to 100
2. apply weights
3. return weighted sum

Example:
`unified_risk = 0.35 * traffic_risk + 0.25 * air_quality_risk + 0.25 * emergency_delay_risk + 0.15 * energy_strain_risk`

### 6.2 dominant factor

Set dominant factor to the highest weighted component at each zone or corridor.

Possible values:
1. traffic
2. air_quality
3. emergency_delay
4. energy

## 7. MVP seed data recommendation

The demo city should include:
1. 4 to 6 zones
2. 10 to 15 road segments
3. 6 to 10 intersections
4. 1 school
5. 1 hospital
6. 3 public buildings
7. 1 ambulance
8. 2 scenario incident types

## 8. Data model design notes

1. Use GeoJSON for easiest frontend integration
2. Keep time series rows simple
3. Avoid over modeling real utility systems in MVP
4. Store explanations and recommendations for replay and audit
