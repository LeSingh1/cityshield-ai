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
