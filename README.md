# Champions Draft Coach — Gemini Edition

Perish Song trap team analyzer for Pokemon Champions Regulation M-A doubles.
**Powered by Google Gemini (completely free — no credit card needed).**

## Step 1 — Get your free Gemini API key

1. Go to https://aistudio.google.com
2. Sign in with your Google account
3. Click **Get API Key** → **Create API Key**
4. Copy the key

Free tier limits: 15 requests/minute, 1 million tokens/day. More than enough.

## Step 2 — Deploy to Vercel

1. Go to https://vercel.com → sign up with GitHub
2. Click **Add New Project** → upload this zip
3. Before clicking Deploy, go to **Environment Variables** and add:
   - Name: `GEMINI_API_KEY`
   - Value: your key from Step 1
4. Click **Deploy**

Done. Free URL, free AI, no ongoing costs.

## Run Locally

```bash
npm install
echo "GEMINI_API_KEY=your-key-here" > .env.local
npm run dev
```

Open http://localhost:3000
