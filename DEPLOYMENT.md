# Deploy Vector-Shift to Render

This guide walks you through deploying the full-stack app (React frontend + FastAPI backend) to [Render](https://render.com) using the free tier.

## Prerequisites

- GitHub account with this repo pushed
- Render account (free at [render.com](https://render.com))
- OpenAI API key (for LLM features; optional for parse-only)

## Step 1: Connect Repository

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **New** → **Blueprint**
3. Connect your GitHub account and select the `Vector-Shift` repository
4. Render will detect `render.yaml` and create both services

## Step 2: Deploy Backend First

1. After the blueprint is created, open the **vectorshift-api** service
2. Go to **Environment** and add:
   - **OPENAI_API_KEY** (optional): Your OpenAI API key for LLM execution
   - **ALLOWED_ORIGINS**: Leave empty for now; add after frontend deploys (see Step 4)
3. Click **Manual Deploy** → **Deploy latest commit**
4. Wait for the deploy to finish
5. Copy the service URL (e.g. `https://vectorshift-api.onrender.com`)

## Step 3: Configure and Deploy Frontend

1. Open the **vectorshift** (frontend) service
2. Go to **Environment** and add:
   - **REACT_APP_API_URL**: Your backend URL, e.g. `https://vectorshift-api.onrender.com`
   - Do not include a trailing slash
3. Save changes
4. Go to **Manual Deploy** → **Deploy latest commit**
5. After deploy, copy the frontend URL (e.g. `https://vectorshift.onrender.com`)

## Step 4: Update Backend CORS

1. Go back to **vectorshift-api** → **Environment**
2. Set **ALLOWED_ORIGINS** to your frontend URL, e.g. `https://vectorshift.onrender.com`
3. Save (this will trigger a redeploy)

## Done

Your app should be live at the frontend URL. The pipeline builder will:

- Run entirely in the browser (simulated LLM, client-side propagation)
- Submit Pipeline: calls the backend for DAG validation
- Run Pipeline (LLM): uses backend + OpenAI for real LLM execution (if OPENAI_API_KEY is set)

## Alternative: Deploy Services Manually

If you prefer not to use the blueprint:

### Backend (Web Service)

- **Root Directory**: `backend`
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
- **Environment**: `OPENAI_API_KEY`, `ALLOWED_ORIGINS`

### Frontend (Static Site)

- **Root Directory**: `frontend`
- **Build Command**: `npm install && npm run build`
- **Publish Directory**: `build`
- **Environment**: `REACT_APP_API_URL` (your backend URL)

## Other Platforms

- **Vercel** + **Railway**: Deploy frontend to Vercel, backend to Railway
- **Netlify** + **Render**: Same pattern; set `REACT_APP_API_URL` and backend CORS accordingly
