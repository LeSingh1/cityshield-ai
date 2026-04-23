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
