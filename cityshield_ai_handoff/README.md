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
