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
