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
