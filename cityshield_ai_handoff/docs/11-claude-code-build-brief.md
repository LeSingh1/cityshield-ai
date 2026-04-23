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
