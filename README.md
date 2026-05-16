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

