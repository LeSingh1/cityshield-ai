# CityShield AI

CityShield AI is a demo-first smart city operations platform that visualizes cascading impacts across traffic, air quality, emergency response, and public building energy systems.

## Monorepo

- `apps/web`: Next.js dashboard shell
- `apps/api`: FastAPI simulation API
- `packages/shared`: shared TypeScript types for the dashboard
- `samples`: deterministic demo scenario data

## Quick start

### API

```bash
cd apps/api
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

The API runs at `http://127.0.0.1:8000` and exposes the initial MVP endpoints under `/api/v1`.

### Web

```bash
cd apps/web
npm install
npm run dev
```

The dashboard expects `NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000/api/v1`.

## Implemented in this initial build

- Deterministic seeded city state
- Dashboard bootstrap, map-layer, risk, recommendation, simulation, action, and impact endpoints
- First-pass Next.js dashboard shell with a premium operations UI and mock data integration
- Seeded scenario playback model that can run without any LLM dependency

## Notes

- The frontend scaffold is included, but Node.js is required locally to run it.
- The backend is self-contained and uses local JSON data from `samples/`.

