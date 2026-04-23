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
