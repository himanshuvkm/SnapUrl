# Upstash Redis Setup Guide for SnapURL

This guide walks you through creating and configuring your managed **Upstash Redis** database for SnapURL.

---

## 1. Create an Upstash Redis Database

1. Go to [upstash.com](https://upstash.com) and log in or create a free account.
2. Click **Create Database**.
3. **Database Name**: `snapurl-redis` (or your preferred name).
4. **Type**: Regional / Global (Free tier allows Regional).
5. **Region**: Select the region closest to your serverless deployment (e.g. `us-east-1` or `eu-west-1` to match your Supabase/Vercel region).
6. Click **Create**.

---

## 2. Obtain Upstash REST Credentials

1. Once created, open your database dashboard page on Upstash.
2. Scroll down to the **REST API** section.
3. Locate:
   - **`UPSTASH_REDIS_REST_URL`** (e.g. `https://xxx-xxx-xxx.upstash.io`)
   - **`UPSTASH_REDIS_REST_TOKEN`** (e.g. `AXxxACQg...`)

---

## 3. Configure Local & Production Environment Variables

### Local Environment (`.env`)
Add your Upstash REST credentials to your local `.env` file:
```env
UPSTASH_REDIS_REST_URL="https://[YOUR-DATABASE].upstash.io"
UPSTASH_REDIS_REST_TOKEN="[YOUR-REST-TOKEN]"
```
> **Note**: If `UPSTASH_REDIS_REST_URL` is omitted, SnapURL automatically falls back to local Docker Redis (`redis://localhost:6379`).

### Vercel / Deployment Environment
When deploying to Vercel (or any serverless provider), add the following environment variables under **Project Settings -> Environment Variables**:
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`
- `DATABASE_URL`
- `DIRECT_URL`
- `JWT_SECRET`
- `NEXT_PUBLIC_BASE_URL`

---

## 4. Verification

### Test Health Endpoint
Start the dev server:
```bash
npm run dev
```
Visit `http://localhost:3000/api/health`. You should see:
```json
{
  "status": "healthy",
  "database": "connected",
  "redis": "connected",
  "timestamp": "2026-07-25T23:45:00.000Z"
}
```

### Test Cache & Rate Limiting
1. **Shorten a link**: Submit a long URL on the dashboard.
2. **First redirect**: Access `http://localhost:3000/[slug]`. Notice the console output `Cache MISS for [slug]`.
3. **Second redirect**: Access `http://localhost:3000/[slug]` again. Notice the console output `Cache HIT for [slug]`.
4. **Rate Limiting**: Exceed 100 requests in 60s from the same IP to receive a `429 Too Many Requests` response.
