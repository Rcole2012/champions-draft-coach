# Champions Draft Coach v7

Perish Song trap team analyzer for Pokemon Champions Regulation M-A.
Powered by Google Gemini (free tier). Data from ChampionsMeta + PokeSynergy.

## Deploy to Vercel

1. Push this folder to your GitHub repo (replace all existing files)
2. Vercel auto-deploys on push
3. GEMINI_API_KEY must be set in Vercel Environment Variables

## Run Locally

```bash
npm install
echo "GEMINI_API_KEY=your-key" > .env.local
npm run dev
```

## Tabs

- **Draft Coach** — enter opponent 6, get AI game plan + set predictions for each Pokemon
- **PS Guide** — turn-by-turn flowcharts for all 3 archetypes (Lake2 video analysis)
- **Speed Tiers** — full speed tier list with Scarf calculations, filter by mine/threats/ghost
- **My Roster** — edit your team in-app, saves to browser permanently
- **Meta Threats** — tiered threat list with images, type badges, counters
- **Win Cons** — strategy guide per archetype
- **Match Log** — log W/L with stats by archetype and lead pair over time

## Features

- Pokemon sprites on every card (PokemonShowdown CDN)
- Type-colored move badges on all moves
- Set predictor: move/item/ability % for each opponent Pokemon (no API call needed)
- Danger score 1-10 as you type names
- Known core detector with counterplay
- Lead predictor based on meta frequency data
- Roster editor with stat bars highlighting focused stats
- Full speed tier calculator with Scarf multiplier
- Match log saves to localStorage, stats by archetype and lead
