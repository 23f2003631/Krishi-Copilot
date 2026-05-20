# Syngenta Krishi Campaign Copilot

Day-1 implementation of a mock-first AI operations control room for Syngenta campaign planning.

## Structure

- `frontend/` - Next.js App Router, TypeScript, TailwindCSS, shadcn-style primitives, Recharts, Lucide.
- `backend/` - FastAPI mock API with contract-first response models.
- `demo/` - Demo script and presentation notes.

## Local Run

```powershell
cd frontend
npm.cmd install
npm.cmd run dev
```

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
.\.venv\Scripts\python.exe -m uvicorn app.main:app --reload --port 8000
```

The frontend works in demo mode without the backend. Set `NEXT_PUBLIC_API_BASE_URL=http://localhost:8000` to connect live APIs later.

## Deploy on Vercel (multi-service)

This repo includes a root `vercel.json` for Vercel’s experimental **Services** preset (Next.js + FastAPI on one project).

1. Import the repo in Vercel and choose the **Services** application preset (or confirm `frontend` + `backend` are detected).
2. Ensure root `vercel.json` is committed. Use `routePrefix: "/api"` for the backend (not `/../backend` from the UI hint).
3. In the Vercel project **Environment Variables**:
   - `NEXT_PUBLIC_DEMO_MODE=false` when using the live API
   - `CORS_ORIGINS` — include your deployment URL if you call the API from a different origin
   - `DATA_MODE=mock` or `local` for hackathon/demo (pandas/sklearn can exceed serverless size limits)
   - Optional: `GEMINI_API_KEY`, Supabase vars per `backend/.env.example`
4. After deploy, Vercel sets `NEXT_PUBLIC_BACKEND_URL`; the frontend uses it when `NEXT_PUBLIC_API_BASE_URL` is unset.

Local multi-service preview: `vercel dev` from the repo root (requires [Vercel CLI](https://vercel.com/docs/cli)).

