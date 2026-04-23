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
