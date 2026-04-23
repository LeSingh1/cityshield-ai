<!-- FILE: README.md -->

# CityShield AI

CityShield AI is a smart city operations platform that predicts traffic congestion, air quality risk, emergency response slowdowns, and energy strain in one unified dashboard.

This folder is a full handoff package for Claude Code or any coding agent inside VS Code.

## What this project is

CityShield AI is built around one core belief:

A city problem rarely stays in one lane.

A crash can become a congestion problem.
Congestion can become an ambulance delay problem.
Delay can become a healthcare risk problem.
Pollution can become a school zone exposure problem.
Heat and grid strain can become a public energy management problem.

Instead of building five separate dashboards, CityShield AI combines all of them into one city command system.

## What is inside this folder

1. `docs/00-project-overview.md`
   High level product summary, problem, solution, value, and demo framing.

2. `docs/01-product-requirements-document.md`
   Full PRD with users, scope, requirements, features, and success metrics.

3. `docs/02-user-personas-and-flows.md`
   User roles, workflows, and user journey details.

4. `docs/03-system-architecture.md`
   End to end system design, services, data flow, and deployment notes.

5. `docs/04-data-model.md`
   Entity design, table schema proposals, and data relationships.

6. `docs/05-backend-api-spec.md`
   REST endpoints, payloads, and service responsibilities.

7. `docs/06-ai-and-prediction-engine.md`
   Risk engine, forecasting logic, recommendation engine, and explainability layer.

8. `docs/07-frontend-dashboard-spec.md`
   UX, page layout, map behavior, components, and interactions.

9. `docs/08-demo-scenario-and-script.md`
   End to end judge demo story, event timeline, and talk track.

10. `docs/09-engineering-roadmap.md`
    Build phases, milestone plan, and implementation order.

11. `docs/10-testing-observability-security.md`
    Testing plan, logging, monitoring, reliability, and basic security model.

12. `docs/11-claude-code-build-brief.md`
    Direct instructions for Claude Code to start coding this project.

13. `docs/12-repo-structure.md`
    Suggested monorepo structure and file layout.

14. `docs/13-prioritized-backlog.md`
    Concrete tickets in build order.

15. `specs/openapi.yaml`
    Machine readable API specification for the backend.

16. `prompts/llm-prompts.md`
    Prompt templates for explanation generation and action summarization.

17. `samples/sample_data.json`
    Mock data for development and demos.

18. `samples/demo_event_timeline.json`
    Timed simulation events for the main demo sequence.

## Recommended stack

1. Frontend
   Next.js
   TypeScript
   Tailwind CSS
   shadcn/ui
   Mapbox GL JS
   Recharts
   Framer Motion

2. Backend
   FastAPI
   Python
   Pydantic
   SQLAlchemy
   Redis

3. Database
   PostgreSQL

4. Optional infrastructure
   Docker Compose
   Celery or background workers
   WebSocket or Server Sent Events for live updates

## Recommended MVP principle

Make the experience look smarter than it is, but keep the system honest.

That means:
1. deterministic simulation and scoring first
2. lightweight forecasting second
3. LLM generated natural language explanations third
4. real integrations last

The project should still work if the LLM is turned off.

## Recommended build order

1. Build the frontend shell
2. Add city map and synthetic data overlays
3. Add incident simulation engine
4. Add risk scoring engine
5. Add recommendation engine
6. Add live event timeline playback
7. Add LLM explanation panel
8. Polish transitions, charts, and metrics

## Core demo sentence

"CityShield AI helps cities predict where traffic, pollution, emergency delay, and energy strain will collide, then recommends actions before residents feel the damage."



<!-- FILE: docs/00-project-overview.md -->

# CityShield AI Project Overview

## 1. Project name

CityShield AI

## 2. One sentence summary

CityShield AI is a city operations intelligence platform that fuses traffic, air quality, emergency response, public safety, and public building energy signals into one real time decision system.

## 3. Problem

Modern cities usually monitor traffic, safety, environment, public health, and infrastructure in separate systems. That separation causes slow response and poor coordination.

A single incident can quickly cascade across multiple systems:
1. A vehicle crash causes lane blockage
2. Congestion grows around nearby intersections
3. Idling vehicles increase local particulate pollution
4. Ambulance routes slow down
5. Residents near the corridor face elevated respiratory risk
6. Public buildings near the hotspot continue consuming energy without adapting to conditions

Most current tools show what has already happened.
Cities need a system that predicts what is about to happen and tells operators what to do next.

## 4. Solution

CityShield AI combines multiple urban data streams into one city command layer. It does four things:

1. Detects and ingests events
   It consumes traffic flow, incidents, air quality readings, emergency routes, facility load, and building energy data.

2. Predicts near term urban stress
   It estimates congestion growth, pollution exposure risk, ambulance delay risk, and localized energy strain.

3. Recommends actions
   It proposes signal retiming, route redirection, public alerting, ambulance corridor prioritization, and nearby public building load reduction.

4. Explains decisions in plain English
   It shows why the risk matters, who is affected, what the recommended action is, and what impact is expected.

## 5. Why this project looks high effort

This project scores well on apparent effort because it visibly combines:
1. maps
2. live events
3. analytics
4. simulation
5. AI explanations
6. multiple categories in one platform

Judges can immediately see system breadth.

## 6. Categories covered

This single project covers all of the following categories:

1. Smart Traffic and Mobility Systems
2. Environmental Monitoring for Air and Water, with air as the MVP focus
3. Smart Energy Management
4. Urban Healthcare AI Solutions
5. Public Safety and Surveillance

## 7. Primary users

1. City traffic operations managers
2. Emergency response coordinators
3. Environmental monitoring staff
4. Public health planners
5. Smart infrastructure program managers
6. Judges or demo viewers during presentation mode

## 8. Main value proposition

CityShield AI helps cities move from reactive monitoring to proactive coordination.

Instead of saying:
"Traffic is bad right now."

It says:
"Traffic will become severe in 12 minutes, air quality in this school corridor is trending unsafe, ambulance delay is increasing, and signal timing plus rerouting can reduce the expected impact."

## 9. Core product principles

1. Unified over fragmented
   One command view beats five isolated dashboards.

2. Predictive over reactive
   Near term forecasting is more valuable than post event reporting.

3. Actionable over descriptive
   The platform must propose what to do, not just what is wrong.

4. Explainable over black box
   Every recommendation needs a clear reason and expected impact.

5. Demo first architecture
   The MVP should be easy to simulate and visually compelling.

## 10. MVP boundaries

The MVP is a simulation driven smart city platform, not a production city control system.

The MVP should include:
1. synthetic or mock data ingestion
2. live or simulated map layers
3. risk scoring
4. action recommendations
5. impact estimation
6. event playback timeline
7. optional LLM explanation panel

The MVP does not need:
1. real traffic light hardware control
2. real hospital integration
3. real 911 dispatch integration
4. real utility grid control
5. high fidelity surveillance analytics

## 11. MVP scenario

A crash occurs near a school corridor during a warm afternoon.

This triggers:
1. lane blockage
2. congestion increase
3. ambulance reroute
4. pollution accumulation from idling vehicles
5. elevated asthma risk in a nearby school zone
6. higher cooling load in nearby public buildings

CityShield AI detects the chain reaction and recommends:
1. activate green wave for ambulance route
2. reroute general traffic around the blocked segment
3. issue micro alert for air quality around the school zone
4. temporarily reduce non critical HVAC load at nearby city offices
5. prioritize intersection timing around the hospital corridor

## 12. Demo wow moments

1. Animated city map with layered overlays
2. Incident appears and spreads through adjacent systems
3. Risk panel updates in real time
4. AI explanation summarizes what is happening
5. Action panel shows specific next steps
6. Impact card shows predicted improvement from intervention

## 13. Success criteria for the demo

A strong MVP should let a judge understand all of the following within 30 to 60 seconds:

1. this is a city command platform
2. it spans more than one category
3. it predicts problems, not just reports them
4. it recommends actions
5. it quantifies impact

## 14. Elevator pitch

CityShield AI is an urban intelligence platform that predicts where traffic, pollution, emergency delay, and energy strain will collide, then recommends city actions before residents feel the damage.



<!-- FILE: docs/01-product-requirements-document.md -->

# Product Requirements Document

## 1. Product name

CityShield AI

## 2. Product vision

Create a city operations platform that helps public agencies anticipate and coordinate around high impact urban events by combining mobility, environmental, health, safety, and energy signals into one explainable decision layer.

## 3. Problem statement

City operations are fragmented. Teams watch separate dashboards for roads, air quality, emergency response, and public infrastructure. When something goes wrong, data arrives too late, teams respond in silos, and the city reacts after harm is already happening.

The product must help operators answer five questions quickly:
1. What is happening right now
2. What will happen next if nothing changes
3. Who is affected
4. What action should we take
5. How much improvement should we expect

## 4. Target users

### 4.1 Primary users

1. Traffic operations center manager
2. Emergency mobility coordinator
3. Urban environment analyst
4. Public health response planner
5. Smart city innovation lead

### 4.2 Secondary users

1. City leadership
2. Public works staff
3. Researchers
4. Hackathon judges
5. Demo audiences

## 5. User pain points

1. Data is split across tools
2. Operators lack a combined view of cross system risk
3. Incident impact is hard to estimate quickly
4. Teams do not know which action has the highest value
5. Decision explanations are inconsistent and slow
6. Public impact near sensitive locations like schools or hospitals is easy to miss

## 6. Goals

### 6.1 Primary goals

1. Show a live map with multi layer city intelligence
2. Simulate or ingest incident events
3. Predict short term risk across traffic, health, environment, and emergency delay
4. Generate ranked actions
5. Quantify expected impact
6. Explain recommendations in natural language

### 6.2 Secondary goals

1. Provide a polished demo experience
2. Make the backend architecture credible
3. Make it easy for a coding agent to implement
4. Keep the system modular for future expansion

## 7. Non goals for MVP

1. Real city sensor procurement
2. Real time control of physical traffic signals
3. Live hospital bed integration
4. Citizen facing mobile app
5. Water quality forecasting in the first version
6. Computer vision object detection from raw CCTV in the first version
7. Full dispatch integration with police, fire, or EMS systems

## 8. Product scope

### 8.1 In scope

1. Map based city dashboard
2. Synthetic or mock data pipelines
3. Incident generation and timeline playback
4. Risk engine
5. Recommendation engine
6. Impact estimator
7. Notification or alert panel
8. LLM explanation layer
9. Historical and live mode toggle

### 8.2 Out of scope

1. Hardware integration
2. Regulatory approvals
3. Operator identity management beyond simple demo auth
4. Real surveillance model deployment
5. Mobile native apps

## 9. User stories

### 9.1 Traffic operator

As a traffic operator, I want to see congestion hotspots and nearby incidents so I can react before gridlock spreads.

### 9.2 Emergency coordinator

As an emergency coordinator, I want to know whether an ambulance route is at risk so I can prioritize corridors and reduce response delay.

### 9.3 Environmental analyst

As an environmental analyst, I want to see pollution growth near sensitive areas so I can assess exposure risk.

### 9.4 Public health planner

As a public health planner, I want to know when air quality and mobility issues affect schools or hospitals so I can identify vulnerable populations.

### 9.5 Infrastructure manager

As a public building manager, I want to reduce non critical building load in nearby zones during strain events so the city can shift resources intelligently.

### 9.6 Judge or demo viewer

As a demo viewer, I want to understand within one minute what the platform does and why it matters.

## 10. Functional requirements

### 10.1 Map and city view

1. The system shall display a city map with layers for roads, incidents, air quality, facilities, emergency vehicles, and public buildings.
2. The system shall allow users to toggle layers on and off.
3. The system shall support animated hotspot overlays.

### 10.2 Incident and simulation engine

1. The system shall create or load synthetic incidents.
2. The system shall update downstream metrics over time.
3. The system shall support playback of a predefined event sequence.
4. The system shall allow pause, resume, and reset.

### 10.3 Risk engine

1. The system shall compute traffic congestion risk per road segment or zone.
2. The system shall compute air quality exposure risk per zone.
3. The system shall compute emergency response delay risk.
4. The system shall compute energy strain risk for public assets.
5. The system shall produce a unified city risk score.

### 10.4 Recommendation engine

1. The system shall generate ranked recommended actions.
2. The system shall assign a confidence score to each action.
3. The system shall estimate expected improvement for each action.
4. The system shall identify which populations or facilities benefit.

### 10.5 Explanation layer

1. The system shall generate plain language summaries.
2. The system shall explain why each recommendation is being made.
3. The system shall cite the main signals used in the recommendation.
4. The system shall work in both deterministic and LLM enhanced modes.

### 10.6 Metrics and reporting

1. The system shall display predicted delay reduction.
2. The system shall display risk reduction estimates.
3. The system shall display exposure reduction estimates.
4. The system shall display energy shift or savings estimates.

## 11. Non functional requirements

1. MVP should load dashboard within 3 seconds on typical laptop hardware.
2. Incident playback should feel real time and smooth.
3. System should degrade gracefully if LLM calls fail.
4. Synthetic demo mode should work offline after data is bundled.
5. Architecture should remain modular and easy to extend.

## 12. Success metrics

### 12.1 Product metrics

1. Time to detect main risk within first 15 seconds of demo
2. Time to understand recommended action within first 30 seconds
3. Number of categories visibly integrated, target at least 4
4. Number of meaningful recommendations shown, target 3 to 5
5. Number of impact metrics shown, target at least 3

### 12.2 Demo success metrics

1. Viewer can explain project in one sentence after one minute
2. Viewer can name at least three integrated systems
3. Viewer can see before and after intervention effect
4. Platform appears technically credible and visually advanced

## 13. MVP feature list by priority

### 13.1 Must have

1. Map dashboard
2. Incident simulation
3. Risk scores
4. Action recommendations
5. Impact cards
6. Demo event timeline

### 13.2 Should have

1. LLM explanation panel
2. Animation polish
3. Layer toggles
4. Historical trends charts
5. Facility specific drill down

### 13.3 Nice to have

1. Camera thumbnail cards
2. Water quality module
3. Citizen alert simulation
4. Multi scenario comparison
5. Scenario generator

## 14. Risks

1. Scope becomes too broad
2. Data realism may be weak if not well simulated
3. LLM explanations may sound generic
4. Map UI could become cluttered
5. Hard to implement everything if team starts with backend first

## 15. Mitigation plan

1. Build a single killer scenario first
2. Use deterministic data relationships
3. Keep the UI focused on one city corridor at demo time
4. Make the action cards and impact metrics highly visible
5. Treat LLM explanation as enhancement, not dependency



<!-- FILE: docs/02-user-personas-and-flows.md -->

# User Personas and Flows

## 1. Personas

### 1.1 Maya, Traffic Operations Manager

Role:
City traffic control operator

Goals:
1. Identify congestion before it spreads
2. Keep key corridors moving
3. Reduce spillback near critical facilities

Needs:
1. Fast visibility into blocked segments
2. Predicted congestion spread
3. Recommended signal and reroute actions

### 1.2 Daniel, Emergency Mobility Coordinator

Role:
Emergency route and corridor manager

Goals:
1. Keep ambulance paths clear
2. Reduce route delay during incidents
3. Coordinate across city systems quickly

Needs:
1. Route visibility
2. Delay prediction
3. Corridor priority suggestions

### 1.3 Priya, Environmental Health Analyst

Role:
Urban air quality and public health analyst

Goals:
1. Track air quality near sensitive locations
2. Understand exposure risk
3. Support evidence based alerts

Needs:
1. AQI and PM2.5 trend visibility
2. Location aware risk overlays
3. School and hospital highlighting

### 1.4 Luis, Public Building Energy Manager

Role:
Municipal infrastructure and building operations lead

Goals:
1. Shift non critical building load during strain events
2. Reduce waste
3. Support citywide resilience during incidents

Needs:
1. Nearby building load visibility
2. Suggested short term load shedding actions
3. Estimated energy impact

### 1.5 Olivia, City Innovation Director

Role:
Executive stakeholder or public demo viewer

Goals:
1. Understand platform value fast
2. See cross department coordination
3. Assess innovation credibility

Needs:
1. Clean summary
2. Top risks
3. Measurable outcomes

## 2. Core flows

### 2.1 Live monitoring flow

1. User lands on dashboard
2. Map loads with active layers
3. City risk summary loads at top
4. User sees hotspots and alerts
5. User clicks hotspot or incident
6. Side panel shows cause, affected assets, recommendations, and estimated outcomes

### 2.2 Incident response flow

1. New crash event appears on map
2. Traffic risk score rises
3. Nearby AQI trend worsens
4. Ambulance ETA rises
5. System creates recommended actions
6. User reviews action list
7. User applies virtual intervention
8. Dashboard shows predicted improvement

### 2.3 Environmental health drill down flow

1. User turns on air quality and sensitive zone layers
2. User sees school zone highlighted in warning state
3. User clicks zone
4. Panel shows PM2.5 trend, affected population type, and likely source contributors
5. System suggests alerting and traffic reroute actions

### 2.4 Demo playback flow

1. User opens presentation mode
2. Demo sequence begins at baseline
3. Crash event is injected
4. Congestion and AQI rise over time
5. Ambulance appears on route
6. CityShield AI recommends actions
7. Intervention is applied
8. After state metrics improve
9. Final impact summary is shown

## 3. User interface states

### 3.1 Baseline state

Purpose:
Show city in healthy operating mode

Visible elements:
1. Low to moderate traffic heatmap
2. Normal AQI zones
3. No active critical incident
4. Energy load in normal range

### 3.2 Warning state

Purpose:
Show emerging risk

Visible elements:
1. Traffic hotspot turns amber
2. AQI around corridor rises
3. Alert list shows risk prediction
4. Recommendation queue begins populating

### 3.3 Critical state

Purpose:
Show cascading urban stress

Visible elements:
1. Incident marker turns red
2. Ambulance delay warning appears
3. Sensitive location alert appears
4. Unified risk score spikes

### 3.4 Intervention state

Purpose:
Show city action and expected recovery

Visible elements:
1. Action cards are marked active
2. Route changes animate on map
3. Risk trends begin falling
4. Impact cards update with estimated gains

## 4. Critical user questions and system answers

### 4.1 What is happening

Answer format:
Crash on 8th and Central has blocked one lane and is causing congestion spillback into the hospital corridor.

### 4.2 Who is affected

Answer format:
Affected areas include Jefferson Elementary, St. Anne Hospital access route, and two nearby public office buildings.

### 4.3 What should we do

Answer format:
Prioritize ambulance green wave, reroute general traffic around Segment R08, and reduce non critical HVAC load in Zone C.

### 4.4 Why now

Answer format:
Congestion rose 22 percent in 6 minutes, PM2.5 crossed warning threshold, and ambulance ETA increased by 3.4 minutes.

### 4.5 What improvement can we expect

Answer format:
Predicted ambulance delay reduction is 38 percent, exposure window reduction is 21 percent, and intersection queue length reduction is 19 percent.

## 5. Information hierarchy

The dashboard should answer questions in this order:
1. overall city health
2. urgent hotspot
3. recommended action
4. expected impact
5. deeper technical detail

## 6. Design principles for flow

1. One glance should reveal the problem
2. One click should reveal the action
3. One intervention should reveal the impact
4. Technical detail should exist but never block fast understanding



<!-- FILE: docs/03-system-architecture.md -->

# System Architecture

## 1. Architecture goals

1. Be easy to prototype quickly
2. Be believable as a real smart city platform
3. Support live simulation and future real integrations
4. Keep the AI layer optional
5. Separate presentation, data, scoring, and recommendation concerns

## 2. Recommended architecture overview

### 2.1 Frontend

Use a modern web dashboard built with:
1. Next.js
2. TypeScript
3. Tailwind CSS
4. shadcn/ui
5. Mapbox GL JS
6. Recharts
7. Framer Motion

Responsibilities:
1. map rendering
2. UI panels and controls
3. charts and metric cards
4. incident timeline playback
5. action and explanation display
6. live updates via polling or streaming

### 2.2 Backend API

Use FastAPI with modular service layers.

Responsibilities:
1. serve city entities and snapshots
2. run simulation updates
3. calculate risk scores
4. generate recommendations
5. expose explanation endpoints
6. stream event state to frontend

### 2.3 Database

Use PostgreSQL.

Responsibilities:
1. store map entities
2. store snapshots and time series
3. store incidents
4. store recommendations
5. store scenario definitions
6. store demo sessions if needed

### 2.4 Cache and queue

Use Redis.

Responsibilities:
1. cache hot map queries
2. support pub sub for live updates
3. support background jobs if LLM or scoring gets slow

### 2.5 Optional background worker

Use Celery, RQ, or FastAPI background tasks.

Responsibilities:
1. precompute forecast windows
2. generate explanation text
3. process scenario playback steps
4. write historical event logs

## 3. Logical system diagram

1. Data sources
   traffic
   air quality
   facilities
   incidents
   energy snapshots
   emergency routes

2. Ingestion and normalization layer
   adapters convert raw or synthetic input into common internal models

3. Risk engine
   computes domain specific and unified risk scores

4. Recommendation engine
   generates ranked actions from current and predicted state

5. Explanation engine
   converts technical state into readable action summaries

6. API layer
   serves data to dashboard and accepts simulation control actions

7. Frontend dashboard
   displays map, metrics, recommendations, timeline, and explanations

## 4. Architecture style

Use a modular monolith for MVP.

Why:
1. faster to build
2. easier for Claude Code to scaffold
3. fewer deployment problems
4. easy to split later if needed

Suggested module boundaries:
1. `ingestion`
2. `simulation`
3. `risk`
4. `recommendations`
5. `explanations`
6. `api`
7. `persistence`

## 5. Data flow

### 5.1 Baseline data flow

1. Load static entities
   roads, zones, facilities, buildings, school zones, hospitals

2. Load dynamic snapshots
   traffic speeds, AQI values, energy usage, vehicle positions

3. Risk engine computes current state
4. Recommendation engine produces ranked actions
5. API returns dashboard state
6. Frontend renders map and side panels

### 5.2 Incident flow

1. Incident is created or loaded from scenario
2. Simulation service mutates affected segments and zones
3. Traffic and AQI metrics update
4. Emergency route ETA recalculates
5. Risk engine recomputes scores
6. Recommendation engine recomputes actions
7. Explanation engine produces summary
8. Frontend receives updates and animates changes

## 6. Core backend modules

### 6.1 Entity service

Stores and serves:
1. zones
2. road segments
3. intersections
4. facilities
5. buildings
6. sensitive locations

### 6.2 Snapshot service

Stores and serves:
1. traffic snapshots
2. air quality snapshots
3. energy snapshots
4. emergency vehicle positions

### 6.3 Simulation service

Responsibilities:
1. create incident events
2. apply deterministic effects
3. advance scenario clock
4. reset scenario
5. store simulation state

### 6.4 Risk service

Responsibilities:
1. compute traffic risk
2. compute exposure risk
3. compute emergency delay risk
4. compute energy strain risk
5. compute composite risk

### 6.5 Recommendation service

Responsibilities:
1. map risk patterns to action templates
2. rank actions
3. estimate effect sizes
4. flag sensitive population impact

### 6.6 Explanation service

Responsibilities:
1. deterministic summary generation
2. optional LLM natural language rewrite
3. concise action rationale output

## 7. Static versus dynamic data

### 7.1 Static data

1. road network
2. zones
3. school locations
4. hospital locations
5. public building metadata
6. action catalog

### 7.2 Dynamic data

1. traffic speed
2. queue length
3. congestion level
4. PM2.5 and AQI
5. incident status
6. emergency route ETA
7. building load
8. city risk score

## 8. Event model

An event is any state change that affects system risk.

Types:
1. collision
2. stalled vehicle
3. road closure
4. pollution spike
5. ambulance dispatch
6. building demand surge
7. severe weather trigger
8. manual intervention

Each event should include:
1. id
2. type
3. timestamp
4. location
5. severity
6. affected entities
7. duration
8. status

## 9. Real time update strategy

For MVP, use one of these:
1. client polling every 2 to 3 seconds
2. Server Sent Events for timeline updates
3. WebSocket for richer interactivity

Recommendation:
Start with polling because it is simplest. Add SSE or WebSocket only if time allows.

## 10. Deployment options

### 10.1 Local development

1. frontend on port 3000
2. backend on port 8000
3. postgres on port 5432
4. redis on port 6379

### 10.2 Demo deployment

1. Vercel for frontend
2. Railway or Render for backend
3. Neon or Supabase Postgres
4. Upstash or Redis Cloud for cache

### 10.3 Fully local demo

For hackathon reliability, keep a Docker Compose setup that runs everything locally.

## 11. Architecture credibility upgrades

If there is time, add:
1. map based corridor segmentation
2. zone level historical trend cards
3. event sourcing table for every simulation step
4. scenario playback with signed URLs for seed files
5. OpenAPI docs page
6. role based views for traffic, health, and energy modes

## 12. Why this architecture is strong for a judging setting

1. It looks enterprise grade
2. It is modular but not overengineered
3. It can support fake data today and real data later
4. It keeps the project believable
5. It gives Claude Code clear module boundaries



<!-- FILE: docs/04-data-model.md -->

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



<!-- FILE: docs/05-backend-api-spec.md -->

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



<!-- FILE: docs/06-ai-and-prediction-engine.md -->

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



<!-- FILE: docs/07-frontend-dashboard-spec.md -->

# Frontend Dashboard Specification

## 1. Frontend goals

1. Look visually advanced within seconds
2. Make the city feel alive
3. Keep the story of the incident clear
4. Show recommendations and impact without clutter
5. Make the demo controllable and smooth

## 2. Recommended stack

1. Next.js App Router
2. TypeScript
3. Tailwind CSS
4. shadcn/ui
5. Mapbox GL JS
6. Recharts
7. Framer Motion
8. Zustand or React Context for state

## 3. Main pages

### 3.1 Dashboard page

Path:
`/dashboard`

Purpose:
Primary live city interface

Sections:
1. top summary bar
2. left control rail
3. center map canvas
4. right intelligence panel
5. bottom timeline and metrics strip

### 3.2 Scenario page

Path:
`/scenarios`

Purpose:
Select scenario and enter playback mode

### 3.3 Presentation mode

Path:
`/presentation`

Purpose:
Cleaner full screen demo mode with bigger visuals and guided sequence

## 4. Main layout

### 4.1 Top summary bar

Contents:
1. city name
2. current mode
3. current time
4. unified risk score
5. active incidents count
6. one sentence headline

### 4.2 Left control rail

Contents:
1. layer toggles
2. scenario selector
3. playback controls
4. risk domain filters
5. map legend
6. reset button

### 4.3 Map canvas

Contents:
1. zone overlays
2. road segments colored by congestion
3. incident markers
4. ambulance route
5. school and hospital markers
6. public building markers
7. pollution heat circles
8. animated action overlays

### 4.4 Right intelligence panel

Tabs:
1. Overview
2. Incident
3. Recommendations
4. Impact
5. Explain

### 4.5 Bottom strip

Contents:
1. event timeline
2. before and after metrics
3. mini trend charts
4. action confirmation states

## 5. Component list

### 5.1 Core components

1. `CityMap`
2. `TopSummaryBar`
3. `LayerTogglePanel`
4. `IncidentCard`
5. `RecommendationList`
6. `ImpactMetricsCard`
7. `EventTimeline`
8. `RiskBreakdownChart`
9. `ExplanationPanel`
10. `ScenarioControls`

### 5.2 Optional components

1. `FacilityDetailDrawer`
2. `BuildingLoadCard`
3. `EmergencyRoutePanel`
4. `MiniCameraFeedCard`
5. `PlaybackNarrationBanner`

## 6. Visual design language

The UI should feel:
1. operational
2. premium
3. slightly futuristic
4. data dense but readable

Recommended style:
1. dark dashboard background
2. bright map signals
3. strong contrast metric cards
4. smooth animated transitions
5. soft glass style panels if performance allows

## 7. Color and state semantics

1. green means normal or improved
2. amber means warning
3. red means critical
4. blue means informational or selected
5. purple can be used for energy related state if desired

Do not overuse too many colors. The main visual focus should be:
1. red incident
2. amber to red corridor stress
3. bright route line for ambulance
4. glowing recommendation emphasis

## 8. Dashboard interactions

### 8.1 Clicking an incident

Should:
1. center the map
2. open incident tab
3. show cause and affected entities
4. highlight related recommendations

### 8.2 Clicking a facility

Should:
1. show facility metadata
2. show local risk score
3. show why it matters
4. show nearby actions

### 8.3 Applying an action

Should:
1. animate state transition
2. mark action as applied
3. update impact metrics
4. optionally trigger explanation refresh

### 8.4 Playback timeline

Should:
1. show discrete scenario events
2. support pause and resume
3. show current step marker
4. let user scrub if time allows

## 9. Key widgets

### 9.1 Unified risk card

Fields:
1. score
2. arrow trend
3. dominant factor
4. top affected zone

### 9.2 Recommendation card

Fields:
1. action title
2. priority rank
3. confidence
4. one sentence rationale
5. expected benefit chips

### 9.3 Impact metrics card

Fields:
1. ambulance ETA reduction
2. AQI or exposure reduction
3. queue reduction
4. energy shift

### 9.4 Explanation panel

States:
1. deterministic summary
2. LLM enhanced summary
3. loading state
4. fallback state

## 10. Frontend data contract expectations

The frontend should expect:
1. static map entities at page load
2. dynamic snapshot refresh every few seconds
3. scenario state as structured JSON
4. all scores normalized 0 to 100
5. GeoJSON ready geometries where possible

## 11. Presentation mode guidance

Presentation mode should:
1. hide low priority controls
2. enlarge key metrics
3. make timeline more dramatic
4. keep right side explanation panel highly readable
5. prioritize one story over full operator functionality

## 12. Performance guidance

1. do not rerender all map layers unnecessarily
2. memoize heavy chart transforms
3. keep dynamic updates shallow
4. avoid giant GeoJSON payloads
5. prebundle scenario data locally if needed

## 13. MVP frontend quality bar

A strong MVP should include:
1. smooth map
2. clear risk score
3. attractive recommendations
4. visible before and after metrics
5. no confusing navigation



<!-- FILE: docs/08-demo-scenario-and-script.md -->

# Demo Scenario and Script

## 1. Demo objective

Show that CityShield AI can detect a city incident, predict cascading impact across traffic, healthcare, environment, and energy, and recommend actions with measurable outcomes.

## 2. Ideal demo length

3 to 4 minutes

## 3. Main scenario

Scenario name:
School Corridor Collision

Setting:
A weekday afternoon near a school and hospital corridor.

Starting condition:
Traffic is normal to moderate. Air quality is acceptable. Public buildings are operating normally.

Trigger event:
A two vehicle collision blocks one lane on Central Ave near Jefferson Elementary and downstream from the St. Anne Hospital access corridor.

## 4. Script structure

### 4.1 Opening, 20 to 30 seconds

Say:
"CityShield AI is a city command platform that predicts where traffic, pollution, emergency delay, and energy strain will collide, then recommends what a city should do next."

Show:
1. dashboard overview
2. city map with layers
3. unified risk score in healthy baseline state

### 4.2 Baseline view, 20 seconds

Say:
"At baseline, traffic is stable, AQI is normal, emergency response routes are clear, and public building load is within range."

Show:
1. map in calm state
2. low risk cards
3. school, hospital, and public buildings on map

### 4.3 Incident injection, 20 to 30 seconds

Say:
"Now a collision blocks one lane on Central Ave."

Show:
1. red incident marker appears
2. congestion begins to intensify on nearby segments
3. risk score starts climbing

### 4.4 Cross system cascade, 30 to 45 seconds

Say:
"This is where CityShield AI becomes useful. It is not only tracking the crash. It is predicting the cascade."

Show:
1. ambulance route intersects impacted corridor
2. ETA increases
3. AQI around the school zone shifts from normal to warning
4. nearby public building load stays high during corridor stress
5. right panel highlights affected assets

### 4.5 Recommendations, 30 to 45 seconds

Say:
"The system now ranks the best actions based on urgency, impact, and who is affected."

Show recommendation list:
1. prioritize ambulance green wave
2. reroute general traffic around Segment R08
3. issue school zone air quality alert
4. reduce non critical HVAC load in nearby city offices

### 4.6 Intervention, 30 seconds

Say:
"When we apply these interventions, CityShield AI estimates how much the city can recover."

Show:
1. action chips move to applied state
2. corridor animation changes
3. queue lengths begin falling
4. ambulance ETA decreases
5. AQI growth slows

### 4.7 Impact summary, 20 to 30 seconds

Say:
"In one platform, we reduced emergency delay, lowered local exposure risk, and coordinated traffic and energy response before the damage spread further."

Show:
1. before and after card
2. ambulance ETA reduction
3. queue reduction
4. AQI or exposure reduction
5. energy shift metric

### 4.8 Closing, 10 to 15 seconds

Say:
"Cities do not experience problems in isolation. CityShield AI helps them respond that way too."

## 5. Exact recommended talking points

### 5.1 Opening line

"Most city tools tell you what just happened. CityShield AI tells you what will happen next and what to do about it."

### 5.2 Problem line

"A crash is not just a crash. It becomes a congestion issue, a health issue, an emergency response issue, and sometimes an infrastructure issue too."

### 5.3 Value line

"Instead of five disconnected dashboards, we give city operators one coordinated decision layer."

### 5.4 Technical credibility line

"Under the hood, the platform uses event simulation, risk scoring, recommendation ranking, and explainable AI summaries."

### 5.5 Impact line

"What matters is not just detecting an incident. It is quantifying how to reduce harm."

## 6. Recommended demo metrics to show

1. Unified city risk score
2. Ambulance ETA delta
3. Sensitive zone AQI or exposure score
4. Corridor queue length
5. Building energy shift potential

## 7. Things judges should remember

1. It covers multiple categories at once
2. It predicts cascading urban harm
3. It recommends actions, not just alerts
4. It shows measurable outcomes
5. It feels like a real city operating system

## 8. Fallback demo plan

If live playback fails:
1. keep static screenshots or seeded states
2. click through baseline, warning, critical, and intervention states manually
3. speak to the before and after metrics directly

## 9. Winning framing

Frame the product as:
1. proactive city resilience
2. AI assisted municipal coordination
3. multimodal urban operations intelligence
4. explainable smart city intervention platform

## 10. Suggested 30 second version

"CityShield AI is a smart city operations platform that predicts when traffic, air pollution, emergency delay, and energy strain will compound into a high impact urban event. We simulate the incident, rank the best interventions, and quantify how much harm each action can reduce."



<!-- FILE: docs/09-engineering-roadmap.md -->

# Engineering Roadmap

## 1. Overall plan

Build this project in layers, not all at once.

The correct order is:
1. believable data model
2. good looking frontend shell
3. deterministic simulation
4. risk engine
5. recommendations
6. polish and explanations

## 2. Milestone plan

### Milestone 1: Repository and local environment

Deliverables:
1. monorepo setup
2. frontend app boots
3. backend app boots
4. postgres and redis services run locally
5. sample data loader works

Estimated output:
A healthy repo that runs locally with placeholder endpoints

### Milestone 2: Static city map and entities

Deliverables:
1. map page
2. zones, roads, facilities, and buildings rendered
3. mock summary bar
4. layer controls
5. seed data in database or JSON fixtures

Estimated output:
A polished baseline city view

### Milestone 3: Dynamic snapshots and metrics

Deliverables:
1. traffic snapshots endpoint
2. AQI snapshots endpoint
3. energy snapshots endpoint
4. top summary metrics
5. mini charts

Estimated output:
The city feels alive even before incidents exist

### Milestone 4: Incident simulation engine

Deliverables:
1. scenario loader
2. simulation start, step, play, pause, reset endpoints
3. road segment state mutation
4. incident marker rendering
5. timeline UI

Estimated output:
You can trigger a collision and watch city state change

### Milestone 5: Risk engine

Deliverables:
1. traffic risk model
2. air quality risk model
3. emergency delay risk model
4. energy strain model
5. unified city risk score

Estimated output:
The system can explain severity numerically

### Milestone 6: Recommendation engine

Deliverables:
1. action catalog
2. rule based recommendation logic
3. ranking and confidence scoring
4. impact estimates
5. apply action endpoint

Estimated output:
The system can now tell users what to do

### Milestone 7: Explanation layer

Deliverables:
1. deterministic summary templates
2. optional LLM summary endpoint
3. explanation panel UI
4. fallback behavior if model unavailable

Estimated output:
The system sounds intelligent, not just numeric

### Milestone 8: Demo polish

Deliverables:
1. presentation mode
2. animations and transitions
3. before and after cards
4. smooth event sequence
5. strong opening and closing state

Estimated output:
Judges can understand the project in under a minute

## 3. Suggested time boxed implementation order

### Day 1

1. initialize repo
2. set up frontend and backend
3. create seed data
4. render map with roads and facilities

### Day 2

1. build snapshots API
2. build top summary cards
3. build scenario engine
4. show incident marker and timeline

### Day 3

1. implement risk scoring
2. implement recommendations
3. implement action application
4. wire impact metrics

### Day 4

1. add explanation panel
2. add animation polish
3. script demo
4. fix visual quality issues

## 4. Implementation dependencies

1. Frontend map depends on seeded spatial data
2. Risk engine depends on dynamic snapshots
3. Recommendation engine depends on risk outputs
4. Explanation engine depends on structured recommendation outputs
5. Demo mode depends on stable scenario playback

## 5. Priority matrix

### Highest priority

1. map quality
2. incident simulation
3. recommendation clarity
4. impact cards

### Medium priority

1. LLM explanation
2. detailed charts
3. advanced configuration

### Low priority

1. auth
2. camera feed simulation
3. multi tenant setup
4. real external integrations

## 6. Scope control rules

If build time gets tight:
1. cut water module
2. keep only one main scenario
3. keep only one ambulance
4. keep only one school and one hospital
5. keep LLM optional
6. avoid complicated user auth

## 7. Definition of done for MVP

1. map loads with multiple city layers
2. one scenario plays start to finish
3. incident causes risk changes
4. system generates ranked actions
5. user can apply actions
6. before and after metrics update
7. the demo story is coherent and polished



<!-- FILE: docs/10-testing-observability-security.md -->

# Testing, Observability, and Security

## 1. Testing goals

1. prevent broken demo flows
2. make the simulation deterministic
3. validate risk and recommendation logic
4. ensure UI updates when scenario state changes

## 2. Backend testing

### 2.1 Unit tests

Test:
1. risk scoring formulas
2. recommendation ranking logic
3. action impact estimator
4. simulation step state mutations
5. explanation template generation

Examples:
1. collision severity 4 should reduce segment capacity by expected factor
2. ambulance green wave should lower ETA estimate
3. school zone AQI increase should raise exposure risk

### 2.2 Integration tests

Test:
1. scenario start and step endpoints
2. risk recomputation after incident
3. recommendation generation after risk changes
4. action apply flow
5. impact summary endpoint

### 2.3 Data validation tests

Test:
1. invalid GeoJSON is rejected
2. missing zone references are rejected
3. negative metrics are rejected where impossible
4. timestamps parse correctly

## 3. Frontend testing

### 3.1 Component tests

Test:
1. summary cards render metrics
2. recommendation cards render impact chips
3. explanation panel handles loading and fallback
4. timeline updates correctly

### 3.2 End to end tests

Use Playwright if time allows.

Test:
1. dashboard loads
2. scenario starts
3. incident appears
4. recommendations appear
5. action apply updates metrics

## 4. Manual demo checklist

Before any presentation:
1. run full scenario once locally
2. verify map tiles load
3. verify seed data present
4. verify backend health endpoint
5. verify explanation panel fallback
6. verify before and after cards update
7. verify reset works

## 5. Observability

### 5.1 Logging

Log:
1. scenario start
2. scenario step
3. incident creation
4. risk recomputation
5. recommendation generation
6. action application
7. explanation generation

### 5.2 Metrics

Track:
1. API latency
2. simulation step duration
3. recommendation generation duration
4. LLM request success rate
5. frontend boot time

### 5.3 Error handling

Important error types:
1. scenario not found
2. bad seed data
3. explanation provider unavailable
4. invalid action target
5. map layer fetch failure

## 6. Security for MVP

For a demo project, security should be reasonable but simple.

Minimum:
1. validate inputs with Pydantic
2. use environment variables for secrets
3. avoid exposing provider keys to frontend
4. sanitize logs
5. rate limit expensive explanation endpoints if public

## 7. Future security if productionized

1. JWT auth
2. role based access
3. audit logging
4. signed control commands
5. provider isolation
6. encryption at rest and in transit

## 8. Reliability guidance

1. ensure deterministic fallback for explanation text
2. never block dashboard if LLM fails
3. ship a preseeded scenario locally
4. keep all critical assets cached for demo mode



<!-- FILE: docs/11-claude-code-build-brief.md -->

# Claude Code Build Brief

## 1. Mission

Build CityShield AI as a polished full stack web application for demo use.

The application should look like a smart city command platform that combines traffic, air quality, emergency response, and public building energy signals into one map based dashboard.

## 2. Non negotiable goals

1. The UI must look strong immediately
2. The app must run locally without needing real city integrations
3. The app must support a deterministic scenario playback
4. The app must compute risk scores and recommendations
5. The app must show before and after intervention metrics
6. The app must still function if the LLM layer is disabled

## 3. Recommended stack

Frontend:
1. Next.js
2. TypeScript
3. Tailwind CSS
4. shadcn/ui
5. Mapbox GL JS
6. Recharts
7. Framer Motion

Backend:
1. FastAPI
2. Python
3. SQLAlchemy
4. PostgreSQL
5. Redis

## 4. Build order for Claude Code

### Step 1
Create a monorepo with:
1. `apps/web`
2. `apps/api`
3. `packages/shared`

### Step 2
Implement local development with:
1. Docker Compose for Postgres and Redis
2. simple `.env.example` files
3. setup scripts

### Step 3
Create seed data for:
1. zones
2. road segments
3. facilities
4. public buildings
5. one school
6. one hospital
7. one ambulance
8. one demo scenario

### Step 4
Build the dashboard page first.
Do not start with backend heavy abstractions.
The frontend should show a beautiful mock city with map layers quickly.

### Step 5
Implement backend endpoints in this order:
1. `/health`
2. `/dashboard/overview`
3. `/map/layers`
4. `/simulations/start`
5. `/simulations/step`
6. `/risk/summary`
7. `/recommendations`
8. `/actions/apply`
9. `/metrics/impact-summary`

### Step 6
Implement deterministic simulation logic before any LLM work.

### Step 7
Add optional explanation generation only after the core flow works.

## 5. Functional requirements for first working version

1. Load dashboard with map and summary cards
2. Start a seeded scenario
3. Show incident marker
4. Update road congestion colors
5. Update AQI warning zone near a school
6. Show ambulance route and ETA change
7. Generate 3 ranked recommendations
8. Apply actions and update metrics

## 6. Design guidance for Claude Code

1. Use a dark premium dashboard style
2. Keep one dominant narrative on screen
3. Make the map the hero
4. Put recommendations and impact in a right side panel
5. Use subtle motion, not chaotic motion
6. Keep labels readable

## 7. Data guidance

1. Use local JSON seed files for speed
2. Load them into the backend on startup or first run
3. Keep IDs human readable during development
4. Store GeoJSON for all spatial objects

## 8. Simulation guidance

Implement a simple engine where:
1. baseline snapshots are loaded
2. a scenario event mutates segment capacity and congestion
3. affected neighboring segments update too
4. zone AQI rises based on congestion
5. ambulance ETA rises if route crosses stressed segments
6. recommendations recompute after each update

## 9. Recommendation engine guidance

Use rule based logic.

Required actions:
1. ambulance green wave
2. reroute general traffic
3. issue school zone air alert
4. reduce non critical HVAC load

Each recommendation must include:
1. priority rank
2. confidence
3. rationale
4. expected benefits

## 10. Explanation guidance

Implement deterministic templates first.

Optional LLM provider:
1. accept provider key via environment variable
2. use structured input only
3. return concise explanation paragraph
4. add robust fallback if unavailable

## 11. Coding standards

1. clear module boundaries
2. typed interfaces everywhere
3. no giant single file logic
4. use service classes or clearly separated modules
5. write a few tests for scoring and simulation

## 12. Deliverable standard

A successful build should let someone open the app, click start scenario, watch a city incident unfold, and understand how CityShield AI reduces harm across multiple city systems.



<!-- FILE: docs/12-repo-structure.md -->

# Suggested Repository Structure

## 1. Monorepo layout

```text
cityshield-ai/
  README.md
  docker-compose.yml
  .env.example
  apps/
    web/
      package.json
      next.config.ts
      src/
        app/
          layout.tsx
          page.tsx
          dashboard/
            page.tsx
          presentation/
            page.tsx
        components/
          map/
            CityMap.tsx
            LayerLegend.tsx
            ZoneLayer.tsx
            RoadSegmentLayer.tsx
            IncidentLayer.tsx
            FacilityLayer.tsx
            EmergencyRouteLayer.tsx
          dashboard/
            TopSummaryBar.tsx
            RiskCard.tsx
            RecommendationList.tsx
            ImpactSummary.tsx
            EventTimeline.tsx
            ExplanationPanel.tsx
            ScenarioControls.tsx
          ui/
        lib/
          api.ts
          types.ts
          format.ts
        store/
          dashboardStore.ts
        styles/
    api/
      requirements.txt
      app/
        main.py
        core/
          config.py
          logging.py
        api/
          routes/
            health.py
            dashboard.py
            entities.py
            incidents.py
            risk.py
            recommendations.py
            simulations.py
            actions.py
            explanations.py
            metrics.py
        models/
          zone.py
          road_segment.py
          facility.py
          public_building.py
          incident.py
          recommendation.py
          snapshot.py
          scenario.py
        schemas/
          zone.py
          road_segment.py
          facility.py
          incident.py
          recommendation.py
          dashboard.py
        services/
          entity_service.py
          snapshot_service.py
          simulation_service.py
          risk_service.py
          recommendation_service.py
          explanation_service.py
          metrics_service.py
        db/
          session.py
          base.py
          seed.py
        tests/
          test_risk_service.py
          test_recommendation_service.py
          test_simulation_service.py
  packages/
    shared/
      src/
        constants.ts
        types.ts
        scenario.ts
  docs/
  prompts/
  samples/
```

## 2. Frontend structure notes

1. keep the dashboard route focused on composition
2. isolate map layers into individual components
3. centralize data fetching in one api helper
4. use a small shared store for simulation state and selected incident
5. make presentation mode reuse dashboard components

## 3. Backend structure notes

1. keep routes thin
2. keep logic inside services
3. keep schemas separate from DB models
4. keep simulation and risk logic easy to test
5. keep seed loading simple

## 4. Shared package notes

Use shared types for:
1. risk scores
2. recommendation items
3. scenario event payloads
4. dashboard overview objects

## 5. Suggested environment variables

### 5.1 Frontend

1. `NEXT_PUBLIC_API_BASE_URL`
2. `NEXT_PUBLIC_MAPBOX_TOKEN`

### 5.2 Backend

1. `DATABASE_URL`
2. `REDIS_URL`
3. `OPENAI_API_KEY` or `ANTHROPIC_API_KEY`
4. `LLM_PROVIDER`
5. `MAPBOX_TOKEN` if backend does any static asset generation

## 6. Docker Compose suggestion

Services:
1. postgres
2. redis
3. api
4. web

The demo can also run with web and api locally outside Docker if preferred.



<!-- FILE: docs/13-prioritized-backlog.md -->

# Prioritized Backlog

## P0: Must build first

### Ticket 1
Set up monorepo and local development environment

Acceptance criteria:
1. frontend boots
2. backend boots
3. postgres boots
4. redis boots
5. README includes run instructions

### Ticket 2
Create seed city dataset

Acceptance criteria:
1. at least 4 zones
2. at least 10 road segments
3. 1 school
4. 1 hospital
5. 3 public buildings
6. 1 ambulance
7. 1 collision scenario

### Ticket 3
Render static city map

Acceptance criteria:
1. roads visible
2. zones visible
3. facilities visible
4. public buildings visible
5. map is styled and usable

### Ticket 4
Build dashboard overview cards

Acceptance criteria:
1. city risk score
2. active incident count
3. headline summary
4. domain mini metrics

### Ticket 5
Create scenario start and reset endpoints

Acceptance criteria:
1. can start scenario
2. can reset scenario
3. scenario state is persisted in memory or db

## P1: Core simulation and intelligence

### Ticket 6
Implement incident playback timeline

Acceptance criteria:
1. event order is visible
2. current step is highlighted
3. user can step through scenario

### Ticket 7
Implement traffic risk calculation

Acceptance criteria:
1. congestion score updates when segment capacity drops
2. neighboring segments are affected

### Ticket 8
Implement AQI and exposure risk calculation

Acceptance criteria:
1. school zone risk rises with traffic pressure
2. AQI card updates

### Ticket 9
Implement emergency delay risk calculation

Acceptance criteria:
1. ambulance ETA changes when route crosses stressed corridor
2. risk score updates

### Ticket 10
Implement energy strain risk calculation

Acceptance criteria:
1. nearby building load is visible
2. system can recommend load reduction

### Ticket 11
Implement composite city risk score

Acceptance criteria:
1. city risk score updates after each simulation step
2. dominant factor is shown

### Ticket 12
Implement recommendation engine

Acceptance criteria:
1. at least 3 recommendations returned
2. each includes rationale, confidence, and expected impact

### Ticket 13
Implement action apply flow

Acceptance criteria:
1. clicking apply updates state
2. impact metrics improve
3. action card state changes

## P2: Polish and demo strength

### Ticket 14
Add explanation panel

Acceptance criteria:
1. deterministic summary available
2. optional LLM summary available
3. fallback works if provider unavailable

### Ticket 15
Add before and after impact summary

Acceptance criteria:
1. ambulance ETA difference shown
2. queue difference shown
3. AQI or exposure difference shown
4. energy shift shown

### Ticket 16
Add presentation mode

Acceptance criteria:
1. reduced clutter
2. stronger visuals
3. larger metrics
4. scenario still controllable

### Ticket 17
Add motion and visual polish

Acceptance criteria:
1. transitions feel smooth
2. incident and recommendation states animate
3. no distracting jitter

## P3: Stretch features

### Ticket 18
Add scenario selector with multiple incidents

### Ticket 19
Add water monitoring placeholder module

### Ticket 20
Add historical trend playback

### Ticket 21
Add mini CCTV or camera cards with placeholder images

### Ticket 22
Add operator notes export or incident summary export



<!-- FILE: prompts/llm-prompts.md -->

# LLM Prompt Templates

## 1. Operator brief prompt

### System prompt

You are an urban operations assistant.
You receive structured smart city risk data.
Your job is to produce a concise operator brief.
Do not invent facts.
Do not add numbers that are not in the input.
Be direct and clear.
Keep the response under 90 words.

### User prompt template

Generate a concise operator brief from the following structured city state.

Incident:
{{incident_json}}

Risk summary:
{{risk_summary_json}}

Top recommendations:
{{recommendations_json}}

Return:
1. what is happening
2. why it matters
3. what actions should happen next

## 2. Executive summary prompt

### System prompt

You are writing for city leadership.
Summarize the situation in plain English.
Explain the cross system impact clearly.
Keep it under 80 words.
Do not use technical jargon unless necessary.

### User prompt template

Create an executive summary for this city event.

State:
{{state_json}}

## 3. Judge demo narration prompt

### System prompt

You are narrating a hackathon demo for judges.
Make the product sound impressive but grounded.
Focus on cross system coordination, prediction, and measurable impact.
Keep it under 100 words.

### User prompt template

Create a short narration for this demo state.

Scenario:
{{scenario_json}}

Current metrics:
{{metrics_json}}

Recommendations:
{{recommendations_json}}

## 4. Public alert simulation prompt

### System prompt

You are drafting a localized public safety and air quality advisory.
Be calm, direct, and short.
Do not create panic.
Mention location and practical guidance only if present in the data.
Keep it under 60 words.

### User prompt template

Write a local advisory for the following state.

Sensitive zone:
{{zone_json}}

Air quality:
{{air_json}}

Traffic state:
{{traffic_json}}



<!-- FILE: specs/openapi.yaml -->

openapi: 3.1.0
info:
  title: CityShield AI API
  version: 0.1.0
  description: API for a smart city operations dashboard that combines traffic, air quality, emergency delay, and energy management.
servers:
  - url: http://localhost:8000/api/v1
paths:
  /health:
    get:
      summary: Health check
      responses:
        "200":
          description: Service is healthy
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/HealthResponse"

  /dashboard/overview:
    get:
      summary: Get top level dashboard state
      responses:
        "200":
          description: Dashboard overview
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/DashboardOverview"

  /map/layers:
    get:
      summary: Get renderable map layers
      parameters:
        - in: query
          name: include_dynamic
          schema:
            type: boolean
            default: true
      responses:
        "200":
          description: Map layers
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/MapLayersResponse"

  /incidents:
    get:
      summary: List incidents
      parameters:
        - in: query
          name: status
          schema:
            type: string
        - in: query
          name: zone_id
          schema:
            type: string
      responses:
        "200":
          description: Incident list
          content:
            application/json:
              schema:
                type: object
                properties:
                  items:
                    type: array
                    items:
                      $ref: "#/components/schemas/Incident"
    post:
      summary: Create an incident
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/CreateIncidentRequest"
      responses:
        "201":
          description: Incident created
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/Incident"

  /risk/summary:
    get:
      summary: Get current risk summary
      responses:
        "200":
          description: Risk summary
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/RiskSummary"

  /recommendations:
    get:
      summary: Get ranked recommendations
      parameters:
        - in: query
          name: incident_id
          schema:
            type: string
        - in: query
          name: zone_id
          schema:
            type: string
      responses:
        "200":
          description: Recommendations
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/RecommendationsResponse"

  /simulations/start:
    post:
      summary: Start a scenario run
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/StartSimulationRequest"
      responses:
        "200":
          description: Scenario started
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/SimulationState"

  /simulations/step:
    post:
      summary: Advance simulation one step
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/SimulationStepRequest"
      responses:
        "200":
          description: Scenario stepped
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/SimulationState"

  /simulations/reset:
    post:
      summary: Reset simulation
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/SimulationStepRequest"
      responses:
        "200":
          description: Scenario reset
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/SimulationState"

  /actions/apply:
    post:
      summary: Apply a recommended action
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/ApplyActionRequest"
      responses:
        "200":
          description: Action applied
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/ActionApplyResponse"

  /metrics/impact-summary:
    get:
      summary: Get before and after impact metrics
      responses:
        "200":
          description: Impact summary
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/ImpactSummary"

  /explanations/generate:
    post:
      summary: Generate natural language explanation
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/GenerateExplanationRequest"
      responses:
        "200":
          description: Explanation generated
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/ExplanationResponse"

components:
  schemas:
    HealthResponse:
      type: object
      properties:
        status:
          type: string
        service:
          type: string
        version:
          type: string
      required: [status, service, version]

    DashboardOverview:
      type: object
      properties:
        city_name:
          type: string
        current_time:
          type: string
          format: date-time
        mode:
          type: string
        active_incidents:
          type: integer
        city_risk_score:
          type: number
        dominant_factor:
          type: string
        summary_metrics:
          type: object
          additionalProperties: true
        headline:
          type: string
      required:
        [city_name, current_time, mode, active_incidents, city_risk_score, dominant_factor, summary_metrics, headline]

    GeoPoint:
      type: object
      properties:
        lat:
          type: number
        lng:
          type: number
      required: [lat, lng]

    Zone:
      type: object
      properties:
        id:
          type: string
        name:
          type: string
        zone_type:
          type: string
        polygon_geojson:
          type: object
        priority_level:
          type: integer
        population_sensitivity_score:
          type: number
      required: [id, name, zone_type, polygon_geojson, priority_level, population_sensitivity_score]

    RoadSegment:
      type: object
      properties:
        id:
          type: string
        name:
          type: string
        zone_id:
          type: string
        geometry_geojson:
          type: object
        lane_count:
          type: integer
        speed_limit_mph:
          type: number
        baseline_capacity:
          type: integer
        segment_type:
          type: string
      required: [id, name, zone_id, geometry_geojson, lane_count, speed_limit_mph, baseline_capacity, segment_type]

    Facility:
      type: object
      properties:
        id:
          type: string
        name:
          type: string
        facility_type:
          type: string
        zone_id:
          type: string
        lat:
          type: number
        lng:
          type: number
        priority_score:
          type: number
      required: [id, name, facility_type, zone_id, lat, lng, priority_score]

    PublicBuilding:
      type: object
      properties:
        id:
          type: string
        name:
          type: string
        zone_id:
          type: string
        lat:
          type: number
        lng:
          type: number
        building_type:
          type: string
        max_kw:
          type: number
        criticality_level:
          type: integer
        load_shedding_allowed:
          type: boolean
      required: [id, name, zone_id, lat, lng, building_type, max_kw, criticality_level, load_shedding_allowed]

    Incident:
      type: object
      properties:
        id:
          type: string
        incident_type:
          type: string
        status:
          type: string
        severity:
          type: integer
        zone_id:
          type: string
        road_segment_id:
          type: string
        lat:
          type: number
        lng:
          type: number
        started_at:
          type: string
          format: date-time
        resolved_at:
          type: [string, "null"]
          format: date-time
        source:
          type: string
        description:
          type: string
      required: [id, incident_type, status, severity, zone_id, road_segment_id, lat, lng, started_at, source, description]

    CreateIncidentRequest:
      type: object
      properties:
        incident_type:
          type: string
        severity:
          type: integer
        zone_id:
          type: string
        road_segment_id:
          type: string
        lat:
          type: number
        lng:
          type: number
        description:
          type: string
      required: [incident_type, severity, zone_id, road_segment_id, lat, lng, description]

    RiskSummary:
      type: object
      properties:
        city_risk_score:
          type: number
        by_domain:
          type: object
          properties:
            traffic:
              type: number
            air_quality:
              type: number
            emergency_delay:
              type: number
            energy_strain:
              type: number
        top_zones:
          type: array
          items:
            type: object
            properties:
              zone_id:
                type: string
              unified_risk:
                type: number
              dominant_factor:
                type: string
      required: [city_risk_score, by_domain, top_zones]

    Recommendation:
      type: object
      properties:
        id:
          type: string
        type:
          type: string
        priority_rank:
          type: integer
        confidence_score:
          type: number
        target:
          type: object
          properties:
            entity_type:
              type: string
            entity_id:
              type: string
        expected_impact:
          type: object
          properties:
            delay_reduction_pct:
              type: number
            exposure_reduction_pct:
              type: number
            energy_shift_kw:
              type: number
        rationale:
          type: string
      required: [id, type, priority_rank, confidence_score, target, expected_impact, rationale]

    RecommendationsResponse:
      type: object
      properties:
        items:
          type: array
          items:
            $ref: "#/components/schemas/Recommendation"
      required: [items]

    StartSimulationRequest:
      type: object
      properties:
        scenario_name:
          type: string
      required: [scenario_name]

    SimulationStepRequest:
      type: object
      properties:
        scenario_run_id:
          type: string
      required: [scenario_run_id]

    SimulationState:
      type: object
      properties:
        scenario_run_id:
          type: string
        scenario_name:
          type: string
        current_step:
          type: integer
        state:
          type: string
        active_incident_ids:
          type: array
          items:
            type: string
      required: [scenario_run_id, scenario_name, current_step, state, active_incident_ids]

    ApplyActionRequest:
      type: object
      properties:
        action_type:
          type: string
        target_entity_id:
          type: string
      required: [action_type, target_entity_id]

    ActionApplyResponse:
      type: object
      properties:
        status:
          type: string
        expected_effect:
          type: object
          additionalProperties: true
      required: [status, expected_effect]

    ImpactSummary:
      type: object
      properties:
        before:
          type: object
          additionalProperties: true
        after:
          type: object
          additionalProperties: true
      required: [before, after]

    GenerateExplanationRequest:
      type: object
      properties:
        scope:
          type: string
        incident_id:
          type: string
        style:
          type: string
        llm_enabled:
          type: boolean
      required: [scope, style, llm_enabled]

    ExplanationResponse:
      type: object
      properties:
        summary:
          type: string
      required: [summary]

    MapLayersResponse:
      type: object
      properties:
        zones:
          type: array
          items:
            $ref: "#/components/schemas/Zone"
        road_segments:
          type: array
          items:
            $ref: "#/components/schemas/RoadSegment"
        facilities:
          type: array
          items:
            $ref: "#/components/schemas/Facility"
        public_buildings:
          type: array
          items:
            $ref: "#/components/schemas/PublicBuilding"
        incidents:
          type: array
          items:
            $ref: "#/components/schemas/Incident"
        emergency_vehicles:
          type: array
          items:
            type: object
            additionalProperties: true
      required: [zones, road_segments, facilities, public_buildings, incidents, emergency_vehicles]



<!-- FILE: samples/sample_data.json -->

{
  "city_name": "MetroSim",
  "zones": [
    {
      "id": "zone-central",
      "name": "Central Corridor",
      "zone_type": "hospital_corridor",
      "priority_level": 5,
      "population_sensitivity_score": 0.92
    },
    {
      "id": "zone-school-east",
      "name": "School East",
      "zone_type": "school_zone",
      "priority_level": 5,
      "population_sensitivity_score": 0.95
    },
    {
      "id": "zone-civic",
      "name": "Civic Center",
      "zone_type": "civic_center",
      "priority_level": 3,
      "population_sensitivity_score": 0.55
    },
    {
      "id": "zone-downtown",
      "name": "Downtown Core",
      "zone_type": "downtown",
      "priority_level": 4,
      "population_sensitivity_score": 0.62
    }
  ],
  "facilities": [
    {
      "id": "fac-school-01",
      "name": "Jefferson Elementary",
      "facility_type": "school",
      "zone_id": "zone-school-east"
    },
    {
      "id": "fac-hospital-01",
      "name": "St. Anne Hospital",
      "facility_type": "hospital",
      "zone_id": "zone-central"
    }
  ],
  "public_buildings": [
    {
      "id": "bld-cityhall",
      "name": "City Hall Annex",
      "zone_id": "zone-civic",
      "building_type": "government_office",
      "max_kw": 520,
      "criticality_level": 3,
      "load_shedding_allowed": true
    },
    {
      "id": "bld-library",
      "name": "Public Library West",
      "zone_id": "zone-downtown",
      "building_type": "library",
      "max_kw": 310,
      "criticality_level": 2,
      "load_shedding_allowed": true
    },
    {
      "id": "bld-admin",
      "name": "Municipal Services Center",
      "zone_id": "zone-central",
      "building_type": "government_office",
      "max_kw": 440,
      "criticality_level": 3,
      "load_shedding_allowed": true
    }
  ],
  "road_segments": [
    {
      "id": "segment-r08",
      "name": "Central Ave Eastbound",
      "zone_id": "zone-central",
      "lane_count": 3,
      "speed_limit_mph": 35,
      "baseline_capacity": 1200,
      "segment_type": "arterial"
    },
    {
      "id": "segment-r09",
      "name": "Central Ave Westbound",
      "zone_id": "zone-central",
      "lane_count": 3,
      "speed_limit_mph": 35,
      "baseline_capacity": 1200,
      "segment_type": "arterial"
    },
    {
      "id": "segment-r10",
      "name": "School Connector",
      "zone_id": "zone-school-east",
      "lane_count": 2,
      "speed_limit_mph": 25,
      "baseline_capacity": 700,
      "segment_type": "collector"
    }
  ],
  "emergency_vehicle": {
    "id": "ambu-01",
    "vehicle_type": "ambulance",
    "current_status": "en_route",
    "destination_facility_id": "fac-hospital-01",
    "eta_minutes": 7.8
  },
  "baseline_metrics": {
    "city_risk_score": 26,
    "avg_congestion_index": 22,
    "avg_aqi": 54,
    "ambulance_eta_delta_minutes": 0.0,
    "public_building_strain_avg": 31
  }
}



<!-- FILE: samples/demo_event_timeline.json -->

{
  "scenario_name": "school_corridor_collision",
  "events": [
    {
      "event_order": 1,
      "offset_seconds": 0,
      "event_type": "baseline_loaded",
      "payload": {
        "headline": "City operating within normal thresholds"
      }
    },
    {
      "event_order": 2,
      "offset_seconds": 8,
      "event_type": "collision_created",
      "payload": {
        "incident_id": "inc-01",
        "road_segment_id": "segment-r08",
        "severity": 4,
        "description": "Two vehicle collision blocking one lane on Central Ave"
      }
    },
    {
      "event_order": 3,
      "offset_seconds": 16,
      "event_type": "traffic_spillback",
      "payload": {
        "affected_segments": ["segment-r08", "segment-r09", "segment-r10"],
        "avg_speed_drop_pct": 26,
        "queue_growth_pct": 34
      }
    },
    {
      "event_order": 4,
      "offset_seconds": 24,
      "event_type": "school_zone_aqi_warning",
      "payload": {
        "zone_id": "zone-school-east",
        "aqi": 112,
        "pm25": 39.4
      }
    },
    {
      "event_order": 5,
      "offset_seconds": 32,
      "event_type": "ambulance_eta_increase",
      "payload": {
        "vehicle_id": "ambu-01",
        "eta_minutes": 11.2,
        "eta_delta_minutes": 3.4
      }
    },
    {
      "event_order": 6,
      "offset_seconds": 40,
      "event_type": "recommendations_generated",
      "payload": {
        "recommendation_ids": ["rec-01", "rec-02", "rec-03", "rec-04"]
      }
    },
    {
      "event_order": 7,
      "offset_seconds": 52,
      "event_type": "actions_applied",
      "payload": {
        "actions": [
          "ambulance_green_wave",
          "reroute_general_traffic",
          "issue_sensitive_zone_alert",
          "reduce_non_critical_hvac_load"
        ]
      }
    },
    {
      "event_order": 8,
      "offset_seconds": 64,
      "event_type": "impact_summary_available",
      "payload": {
        "ambulance_eta_reduction_pct": 38,
        "queue_length_reduction_pct": 19,
        "exposure_reduction_pct": 21,
        "energy_shift_kw": 74
      }
    }
  ]
}
