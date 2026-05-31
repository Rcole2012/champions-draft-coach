import { META_DB, TYPE_COLORS, MOVE_TYPES } from './pokemon-data';

// ── Type effectiveness chart ──────────────────────────────────────────────────
const EFF = {
  Normal:  {Rock:0.5,Steel:0.5,Ghost:0},
  Fire:    {Fire:0.5,Water:0.5,Rock:0.5,Dragon:0.5,Grass:2,Ice:2,Bug:2,Steel:2},
  Water:   {Water:0.5,Grass:0.5,Dragon:0.5,Fire:2,Ground:2,Rock:2},
  Electric:{Electric:0.5,Grass:0.5,Dragon:0.5,Ground:0,Flying:2,Water:2},
  Grass:   {Fire:0.5,Grass:0.5,Poison:0.5,Flying:0.5,Bug:0.5,Steel:0.5,Dragon:0.5,Water:2,Ground:2,Rock:2},
  Ice:     {Water:0.5,Ice:0.5,Fire:2,Fighting:2,Rock:2,Steel:2,Grass:2,Flying:2,Ground:2,Dragon:2},
  Fighting:{Poison:0.5,Bug:0.5,Psychic:0.5,Flying:0.5,Fairy:0.5,Ghost:0,Normal:2,Ice:2,Rock:2,Dark:2,Steel:2},
  Poison:  {Poison:0.5,Ground:0.5,Rock:0.5,Ghost:0.5,Steel:0,Grass:2,Fairy:2},
  Ground:  {Grass:0.5,Bug:0.5,Flying:0,Fire:2,Electric:2,Poison:2,Rock:2,Steel:2},
  Flying:  {Electric:0.5,Rock:0.5,Steel:0.5,Ground:0,Grass:2,Fighting:2,Bug:2},
  Psychic: {Psychic:0.5,Steel:0.5,Dark:0,Fighting:2,Poison:2},
  Bug:     {Fire:0.5,Fighting:0.5,Flying:0.5,Ghost:0.5,Steel:0.5,Fairy:0.5,Grass:2,Psychic:2,Dark:2},
  Rock:    {Fighting:0.5,Ground:0.5,Steel:0.5,Fire:2,Ice:2,Flying:2,Bug:2},
  Ghost:   {Normal:0,Dark:0.5,Ghost:2,Psychic:2},
  Dragon:  {Steel:0.5,Fairy:0,Dragon:2},
  Dark:    {Fighting:0.5,Dark:0.5,Fairy:0.5,Ghost:2,Psychic:2},
  Steel:   {Fire:0.5,Water:0.5,Electric:0.5,Steel:0.5,Ice:2,Rock:2,Fairy:2},
  Fairy:   {Fire:0.5,Poison:0.5,Steel:0.5,Fighting:2,Dragon:2,Dark:2},
};

export function typeEffectiveness(moveType, defenderTypes) {
  let mult = 1;
  (defenderTypes || []).forEach(t => {
    const row = EFF[moveType] || {};
    mult *= (row[t] !== undefined ? row[t] : 1);
  });
  return mult;
}

// ── Rough damage tier estimator ───────────────────────────────────────────────
// Returns label based on rough estimate — not a precise calc, gives Gemini useful context
export function roughDamageTier(atkStat, defStat, moveBP, moveType, atkTypes, defTypes, hpStat = 150) {
  const stab = (atkTypes || []).includes(moveType) ? 1.5 : 1;
  const eff = typeEffectiveness(moveType, defTypes);
  if (eff === 0) return { label: 'No Effect', pct: 0 };
  // Simplified: (2×level/5+2) × power × atk/def / 50 + 2 with level=50
  const raw = (22 * moveBP * atkStat) / (defStat * 50) + 2;
  const dmg = raw * stab * eff;
  const pct = Math.round((dmg / hpStat) * 100);
  let label;
  if (eff === 0.25) label = 'Quad Resisted';
  else if (eff === 0.5) label = 'Resisted';
  else if (eff === 2) label = 'Super Effective';
  else if (eff === 4) label = 'Quad Effective';
  else label = 'Neutral';
  const ko = pct >= 100 ? '1HKO' : pct >= 50 ? '2HKO likely' : pct >= 33 ? '3HKO' : 'Chip';
  return { label, eff, pct, ko };
}

// ── Build context string about opponent Pokemon from META_DB ──────────────────
function oppPokemonContext(name) {
  const n = (name || '').toLowerCase().trim();
  const data = Object.values(META_DB).find(d =>
    (d.name || '').toLowerCase() === n ||
    n.includes((d.name || '').toLowerCase().split('-')[0].split(' ').slice(-1)[0]) ||
    (d.name || '').toLowerCase().includes(n.split(' ').slice(-1)[0])
  );
  if (!data) return `${name}: no meta data available.`;
  const topMoves = (data.moves || []).slice(0, 4).map(m => `${m.m}(${m.pct}%)`).join(', ');
  const topItems = (data.items || []).slice(0, 3).map(i => `${i.i}(${i.pct}%)`).join(', ');
  const topAb = (data.abilities || []).slice(0, 1).map(a => `${a.a}(${a.pct}%)`).join(', ');
  const hasScarf = (data.items || []).find(i => i.i === 'Choice Scarf');
  const scarfNote = hasScarf ? ` [${hasScarf.pct}% Scarf — speed ×1.5]` : '';
  return `${data.name}(${data.types?.join('/')||'?'}) Usage:${data.usage}% WR:${data.wr}% | Moves:${topMoves} | Items:${topItems}${scarfNote} | Ability:${topAb}`;
}

// ── Build full system prompt dynamically from any team ────────────────────────
export function buildSystemPrompt(team, format = 'doubles') {
  const isDoubles = format === 'doubles';
  const teamStr = (team || []).map(p =>
    `${p.name}(${(p.types||[]).join('/')})[${p.ab}][${p.item}] Moves:${(p.mv||[]).join('/')} Stats:HP${p.stats?.HP||'?'} Atk${p.stats?.Atk||'?'} Def${p.stats?.Def||'?'} SpA${p.stats?.SpA||'?'} SpD${p.stats?.SpD||'?'} Spe${p.stats?.Spe||'?'}`
  ).join('\n  ');

  const basePrompt = `You are an expert Pokemon Champions (Regulation M-A ${isDoubles ? 'DOUBLES' : 'SINGLES'}) coach. Give precise, tactical, no-filler analysis.

FORMAT: ${isDoubles ? 'DOUBLES — analyze in pairs, consider spread moves, Fake Out, redirection, Protect, pivots.' : 'SINGLES — 1v1, no partners, switch timing matters most, no spread moves or Fake Out.'}

MY TEAM:
  ${teamStr}

ANALYSIS FRAMEWORK — for each opponent Pokemon consider:
1. TYPE MATCHUPS: What does my team hit SE/resisted/immune? What hits my Pokemon SE?
2. SPEED: Does opponent outspeed my Pokemon at neutral/scarf? Which of mine outspeed them?
3. DAMAGE: Rough estimate — does my best attacker likely 1HKO, 2HKO, or just chip?
4. THEIR LIKELY SET: Use provided meta data (items%, moves%) to predict their build
5. SCARF WARNING: If they commonly run Scarf, flag which of my Pokemon they outspeed
6. KEY ABILITY: Note if their ability creates specific interactions (Defiant, Magic Bounce, etc.)
${isDoubles ? `7. DOUBLES SPECIFIC: Consider Fake Out users, spread moves (Earthquake, Rock Slide, Heat Wave), redirection, Protect stalling, pivot moves (Parting Shot, Volt Switch, U-turn, Flip Turn).` : '7. SINGLES SPECIFIC: Consider switch-ins, entry hazards, setup opportunities, 1v1 win conditions.'}`;

  // Check if this is a Perish Song team
  const hasGengar = (team || []).some(p => p.name?.toLowerCase().includes('gengar'));
  const hasSableye = (team || []).some(p => p.name?.toLowerCase().includes('sableye'));
  const isPS = hasGengar && isDoubles;

  if (isPS) {
    const psExtra = `
PERISH SONG STRATEGY (this team runs Shadow Tag + Perish Song):
- Mega Gengar has Shadow Tag post-mega — nothing non-Ghost escapes
- Ghost types ESCAPE Shadow Tag — Shadow Ball them immediately, NEVER Perish Song
- Disable on Scarfed Pokemon = permanent lockout (Shadow Tag + disabled only move)
- PS LOOP (Primary): T1 Fake Out + Gengar Protect → T2 Gengar PS + Parting Shot → T3 Protect → T4 both die
- DEFIANT warning: NEVER Parting Shot or Intimidate into Kingambit
- Prankster fails on Dark types

`;
    return basePrompt + psExtra + OUTPUT_FORMAT(isDoubles);
  }

  return basePrompt + '\n' + OUTPUT_FORMAT(isDoubles);
}

function OUTPUT_FORMAT(isDoubles) {
  if (isDoubles) {
    return `
Output ONLY these sections, no intro:
**BRING 4:** [which 4 + specific reason for each]
**LEAD:** [which 2 + detailed why]
**TURN 1:** [exact move for each lead + reasoning]
**GAME PLAN:** [3 tactical sentences for this specific matchup]
**THREATS:** [each dangerous opponent + type matchup + speed check + damage estimate + counter]
**BACKUP LINE:** [if primary plan fails]
**ARCHETYPE:** [opponent team type + 1 sentence read]`;
  }
  return `
Output ONLY these sections, no intro:
**LEAD WITH:** [which Pokemon to lead + why]
**GAME PLAN:** [3 tactical sentences — opening, mid-game, win condition]
**KEY MATCHUPS:** [for each opponent: type advantage, speed, damage tier, best counter from your team]
**THREATS:** [dangerous Pokemon + how your team handles it]
**SWITCH PLAN:** [when to switch and into what]`;
}
