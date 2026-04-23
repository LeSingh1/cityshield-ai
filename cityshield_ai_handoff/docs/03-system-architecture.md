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
