# PRAGATI — Production Deployment Guide

This guide covers deploying the PRAGATI Infrastructure Risk & Monitoring Platform to production using standard, battle-tested, free-tier-friendly cloud providers:
- **Database**: Supabase PostgreSQL (or Neon / Railway PostgreSQL)
- **Backend API**: Render (or Railway / Fly.io)
- **Frontend SPA**: Vercel (or Netlify / Cloudflare Pages)
- **Custom Domain**: Any DNS registrar (Cloudflare, GoDaddy, Namecheap) with automated SSL/TLS

---

## Architecture Overview

```
                          ┌──────────────────────────┐
                          │     User's Browser       │
                          └─────────────┬────────────┘
                                        │ HTTPS
                     ┌──────────────────┴──────────────────┐
                     │                                     │
                     ▼                                     ▼
        ┌─────────────────────────┐           ┌─────────────────────────┐
        │  Vercel / Netlify       │           │  Render Web Service     │
        │  React 19 + Vite SPA    │  API      │  FastAPI + ML Pipeline  │
        │  https://pragati.domain ├──────────►│  https://api.domain     │
        └─────────────────────────┘  Bearer   └────────────┬────────────┘
                                     Token                 │
                                                           │ SQLAlchemy
                                                           ▼
                                              ┌─────────────────────────┐
                                              │  Supabase PostgreSQL    │
                                              │  Managed Database       │
                                              └─────────────────────────┘
```

---

## 1. Production PostgreSQL (Supabase)

1. Go to [https://supabase.com](https://supabase.com) and create a free project named `pragati-production`.
2. Under **Project Settings > Database**, find the **Connection String (URI)**:
   ```text
   postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-ap-south-1.pooler.supabase.com:6543/postgres
   ```
3. Save this connection URI; you will pass it to the backend environment as `DATABASE_URL`.

---

## 2. Backend Deployment (Render)

### Option A: Using `render.yaml` (Recommended)
1. Push your repository to GitHub.
2. In [Render Dashboard](https://dashboard.render.com), click **Blueprints > New Blueprint Instance**.
3. Connect your repository (`Adiylikeorange/project_pragati`). Render will read `render.yaml`.
4. Fill in the prompted environment variables:
   - `DATABASE_URL`: Your Supabase connection string.
   - `ALLOWED_ORIGINS`: Your frontend production domain, e.g. `https://pragati.yourdomain.com,https://pragati-web.onrender.com`
   - `FRONTEND_URL`: `https://pragati.yourdomain.com`

### Option B: Manual Web Service Setup
1. In Render, click **New > Web Service**.
2. **Repository**: `Adiylikeorange/project_pragati`
3. **Root Directory**: `backend`
4. **Environment**: `Python 3`
5. **Build Command**:
   ```bash
   pip install -r requirements.txt && alembic upgrade head
   ```
6. **Start Command**:
   ```bash
   uvicorn main:app --host 0.0.0.0 --port $PORT
   ```
7. **Environment Variables**:
   ```text
   ENV=production
   APP_NAME=PRAGATI
   DATABASE_URL=postgresql://postgres:pass@host:5432/postgres
   SECRET_KEY=[Generate a 32+ char hex key]
   JWT_SECRET=[Generate a separate 32+ char hex key]
   JWT_ALGORITHM=HS256
   ACCESS_TOKEN_EXPIRE_MINUTES=30
   REFRESH_TOKEN_EXPIRE_DAYS=7
   ALLOWED_ORIGINS=https://pragati.yourdomain.com
   FRONTEND_URL=https://pragati.yourdomain.com
   EMAIL_ENABLED=false (or true if using SMTP)
   ```

*To generate strong 256-bit secrets:*
```bash
python3 -c "import secrets; print(secrets.token_hex(32))"
```

---

## 3. Frontend Deployment (Vercel)

1. Go to [https://vercel.com](https://vercel.com) and click **Add New > Project**.
2. Import `Adiylikeorange/project_pragati`.
3. Framework Preset: **Vite**.
4. Root Directory: `./`
5. Build Command: `npm run build`
6. Output Directory: `dist`
7. **Environment Variables**:
   ```text
   VITE_API_BASE_URL=https://pragati-api.onrender.com
   VITE_APP_NAME=PRAGATI
   ```
8. Click **Deploy**.

---

## 4. Custom Domain & DNS Configuration

When you connect a custom domain (e.g. `pragati.gov.in` or `pragati-ai.com`):

| Type  | Host / Name | Value / Target | Notes |
|-------|-------------|----------------|-------|
| `CNAME` | `app` or `@` | `cname.vercel-dns.com` | Directs web traffic to Vercel |
| `CNAME` | `api`       | `pragati-api.onrender.com` | Directs backend calls to Render |

### After updating DNS:
1. In Render backend settings: Update `ALLOWED_ORIGINS` to `https://app.yourdomain.com`.
2. In Render backend settings: Update `FRONTEND_URL` to `https://app.yourdomain.com`.
3. In Vercel frontend settings: Update `VITE_API_BASE_URL` to `https://api.yourdomain.com`.
4. Trigger a rebuild on Vercel (`git commit` or manual redeploy).

---

## 5. Running Database Migrations

Alembic migrations run automatically on Render deployment during the build step:
```bash
cd backend && alembic upgrade head
```

To run manually against production from your local machine:
```bash
DATABASE_URL="postgresql://user:pass@remote-host/db" alembic upgrade head
```

---

## 6. Production Security Checklist

- [x] Passwords hashed with bcrypt (cost factor 12)
- [x] JWT access tokens expire after 30 minutes
- [x] Refresh tokens rotated on every use and revocable
- [x] Generic error messages on login to prevent user enumeration
- [x] Rate limiting enabled on auth endpoints (via slowapi)
- [x] Stack traces hidden from API responses in production (`ENV=production`)
- [x] Interactive `/docs` and `/redoc` disabled in production
- [x] Strict CORS origin validation
- [x] Environment files (`.env`, `*.db`) excluded from git
