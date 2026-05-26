# Champions Draft Coach v6

Perish Song trap team analyzer for Pokemon Champions Regulation M-A.
Powered by Google Gemini (free tier — no credit card needed).

## Deploy to Vercel

1. Push this folder to a GitHub repo
2. Import to Vercel
3. Add environment variable: GEMINI_API_KEY = your key from aistudio.google.com
4. Deploy

## Run Locally

```bash
npm install
echo "GEMINI_API_KEY=your-key" > .env.local
npm run dev
```

## Features

- Draft Coach: AI matchup analysis via Gemini
- Set Predictor: Move/item/ability % for each opponent Pokemon
- Danger Score: Instant threat rating 1-10
- Archetype Detector: Auto-labels opponent team type
- Known Core Alerts: Flags dangerous 2-mon combos with counterplay
- Lead Predictor: Shows opponent's most likely lead pair
- Roster Editor: Edit your team in-app, saved to localStorage
- Match Log: Log W/L with stats by archetype and lead pair
- Speed Tiers: Reference chart with Scarf calcs
- Meta Threats: Tiered threat list with counters
- Win Cons: Strategy guides per archetype
