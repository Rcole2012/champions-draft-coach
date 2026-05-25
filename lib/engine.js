// ─── Threat lists ──────────────────────────────────────────────────────────────
const GHOST_LIST = [
  'mimikyu','zoroark-h','basculegion','sinistcha','dragapult',
  'froslass','aegislash','hisui typhlosion','mismagius','chandelure',
  'gourgeist','drifblim','jellicent','gengar'
];
const DEFIANT_LIST = ['kingambit'];
const ARMOR_TAIL_LIST = ['farigiraf','serperior'];
const MAGIC_BOUNCE_LIST = ['hatterene'];
const SCRAPPY_LIST = ['kangaskhan','mega lopunny'];
const WEATHER_SUN = ['torkoal','charizard-y','mega charizard y','charizard y'];
const WEATHER_RAIN = ['pelipper','politoed'];
const TRICK_ROOM_SETTERS = ['hatterene','oranguru','farigiraf','mega camerupt','camerupt','mega golurk','musharna','dusknoir','slowbro'];
const PIVOT_MOVES = ['rotom-wash','rotom-heat','rotom-frost','rotom-fan','rotom-mow'];
const REDIRECT_LIST = ['sinistcha','maushold','togekiss'];

function norm(s){ return (s||'').toLowerCase().trim(); }
function has(list, opp){ return opp.some(o => list.some(l => norm(o).includes(norm(l)))); }
function find(list, opp){ return opp.filter(o => list.some(l => norm(o).includes(norm(l)))); }
function hasName(name, opp){ return opp.some(o => norm(o).includes(norm(name))); }

// ─── Flag detection ────────────────────────────────────────────────────────────
function detectFlags(opponents) {
  const opp = opponents.filter(Boolean);
  return {
    opp,
    ghosts:         find(GHOST_LIST, opp),
    hasDefiant:     has(DEFIANT_LIST, opp),
    hasArmorTail:   has(ARMOR_TAIL_LIST, opp),
    hasMagicBounce: has(MAGIC_BOUNCE_LIST, opp),
    hasScrappy:     has(SCRAPPY_LIST, opp),
    hasTR:          has(TRICK_ROOM_SETTERS, opp),
    hasSun:         has(WEATHER_SUN, opp),
    hasRain:        has(WEATHER_RAIN, opp),
    hasMimikyu:     hasName('mimikyu', opp),
    hasHydreigon:   hasName('hydreigon', opp),
    hasSneasler:    hasName('sneasler', opp),
    hasKingambit:   hasName('kingambit', opp),
    hasKommoOpp:    hasName('kommo-o', opp),
    hasGallade:     hasName('gallade', opp),
    hasFarigiraf:   hasName('farigiraf', opp),
    hasSerperior:   hasName('serperior', opp),
    hasHatterene:   hasName('hatterene', opp),
    hasGarchomp:    hasName('garchomp', opp),
    hasBasculegion: hasName('basculegion', opp),
    hasDragapult:   hasName('dragapult', opp),
    hasZoroark:     hasName('zoroark', opp),
    hasGolurk:      hasName('golurk', opp),
    hasTyranitar:   hasName('tyranitar', opp),
    hasRotom:       has(PIVOT_MOVES, opp),
    hasCharizardY:  opp.some(o => norm(o).includes('charizard-y') || norm(o).includes('charizard y') || (norm(o).includes('charizard') && norm(o).includes('y'))),
    hasLopunny:     hasName('lopunny', opp),
    hasAegislash:   hasName('aegislash', opp),
    hasDelphox:     hasName('delphox', opp),
    hasSinistcha:   hasName('sinistcha', opp),
    hasOranguru:    hasName('oranguru', opp),
  };
}

// ─── Archetype detection ───────────────────────────────────────────────────────
function detectArchetype(f) {
  if (f.hasTR && f.hasRain) return { label: 'Trick Room Rain', clr: '#85B7EB' };
  if (f.hasTR && f.hasSun)  return { label: 'Trick Room Sun', clr: '#F0997B' };
  if (f.hasTR)              return { label: 'Trick Room', clr: '#C8A2E8' };
  if (f.hasSun)             return { label: 'Sun (Drought)', clr: '#F0997B' };
  if (f.hasRain)            return { label: 'Rain', clr: '#85B7EB' };
  if (f.ghosts.length >= 2) return { label: 'Ghost-Heavy', clr: '#AFA9EC' };
  if (has(REDIRECT_LIST, f.opp)) return { label: 'Redirection', clr: '#97C459' };
  const isHO = (f.hasSneasler || f.hasGarchomp) && (f.hasKingambit || f.hasBasculegion);
  if (isHO) return { label: 'Hyper Offense', clr: '#D85A30' };
  return { label: 'Balanced', clr: '#B4B2A9' };
}

// ─── Bring 4 ───────────────────────────────────────────────────────────────────
function determineBring4(f) {
  // Score each flex slot against this opponent
  const scores = {
    Incineroar: 5,   // always strong default
    Sableye:    3,
    Primarina:  2,
    'Kommo-o':  3,
    Tinkaton:   2,
  };
  const reasons = {};

  // Tinkaton
  if (f.hasFarigiraf || f.hasSerperior) { scores.Tinkaton += 5; }
  if (f.hasHatterene)                   { scores.Tinkaton += 4; }
  if (f.hasMimikyu)                     { scores.Tinkaton += 5; }
  if (f.hasScrappy)                     { scores.Tinkaton += 3; }
  if (f.ghosts.length > 0)              { scores.Tinkaton += 1; }
  if (f.hasLopunny)                     { scores.Tinkaton += 3; }

  // Primarina
  if (f.hasHydreigon)   { scores.Primarina += 6; }
  if (f.hasKommoOpp)    { scores.Primarina += 4; }
  if (f.hasBasculegion) { scores.Primarina += 3; }
  if (f.ghosts.length >= 2) { scores.Primarina += 1; }

  // Kommo-o
  if (f.hasKingambit)  { scores['Kommo-o'] += 4; }
  if (f.hasTyranitar)  { scores['Kommo-o'] += 3; }
  if (f.hasGallade)    { scores['Kommo-o'] += 2; }
  if (f.hasTR)         { scores['Kommo-o'] += 1; }

  // Sableye
  if (f.hasSneasler) { scores.Sableye += 4; }
  if (f.hasTR)       { scores.Sableye += 2; }
  if (f.hasSun)      { scores.Sableye += 1; }
  if (f.hasDefiant)  { scores.Sableye -= 1; }

  // Incineroar
  if (f.hasDefiant)          { scores.Incineroar -= 1; }
  if (f.ghosts.length >= 3)  { scores.Incineroar -= 1; }
  if (f.hasSun)              { scores.Incineroar += 1; }

  // Reason strings
  reasons.Incineroar = f.hasDefiant
    ? 'Fake Out + Intimidate pivot. Parting Shot ONLY into non-Kingambit targets.'
    : 'Default Fake Out + Intimidate pivot. Parting Shot into Kommo-o T2.';
  reasons.Sableye = f.hasSneasler
    ? 'Sneasler is a bot vs Sableye/Gengar — cannot Fake Out Ghosts, cannot CC. Priority Encore locks it.'
    : f.hasTR ? 'Prankster Encore on TR setup is priority — fires before TR goes up.'
    : 'Priority Disable/Encore disruption via Prankster.';
  reasons.Primarina = f.hasHydreigon
    ? 'Resists Dragon + Dark — essential answer to Hydreigon.'
    : f.hasKommoOpp ? 'Moonblast 1HKOs opposing Kommo-o. Alt PS loop via Flip Turn.'
    : 'Alt PS loop — slow Flip Turn safely returns Gengar mid-trap.';
  reasons['Kommo-o'] = f.hasKingambit
    ? 'Body Press ignores Kingambit Atk boosts from Defiant. Safe PS-immune switch.'
    : f.hasTyranitar ? 'Body Press 1HKOs Tyranitar. Soundproof = immune to Perish Song.'
    : 'Soundproof = immune to Perish Song. Safe mid-loop switch target.';
  reasons.Tinkaton = f.hasFarigiraf || f.hasSerperior
    ? 'Mold Breaker Fake Out bypasses Armor Tail / Queenly Majesty — critical T1 play.'
    : f.hasMimikyu ? 'Mold Breaker bypasses Mimikyu Disguise — Gigaton Hammer 1HKOs directly.'
    : f.hasHatterene ? 'Mold Breaker ignores Magic Bounce — can Encore and Fake Out Hatterene normally.'
    : f.hasScrappy ? 'Mold Breaker Fake Out wins priority vs Scrappy users.'
    : 'Mold Breaker flex — bypasses key opponent abilities.';

  // Pick top 3 flex
  const sorted = Object.entries(scores)
    .sort((a, b) => b[1] - a[1])
    .map(([name]) => name);
  const top3 = sorted.slice(0, 3);
  const picks = ['Mega Gengar', ...top3];
  const picksReasons = { 'Mega Gengar': 'Core trapper — always brought.' };
  top3.forEach(n => { picksReasons[n] = reasons[n]; });
  return { picks, reasons: picksReasons };
}

// ─── Lead ─────────────────────────────────────────────────────────────────────
function determineLead(picks, f) {
  if (f.hasFarigiraf && picks.includes('Tinkaton'))
    return { lead: ['Mega Gengar','Tinkaton'], why: 'Tinkaton Mold Breaker Fake Out bypasses Armor Tail — critical T1 play vs Farigiraf.' };
  if (f.hasSerperior && picks.includes('Tinkaton'))
    return { lead: ['Mega Gengar','Tinkaton'], why: 'Tinkaton Mold Breaker bypasses Queenly Majesty. Sableye is completely offline vs Serperior.' };
  if (f.hasHatterene && picks.includes('Tinkaton'))
    return { lead: ['Mega Gengar','Tinkaton'], why: 'Tinkaton bypasses Hatterene Magic Bounce — can Encore and Fake Out without reflection.' };
  if (f.hasMimikyu && picks.includes('Tinkaton'))
    return { lead: ['Mega Gengar','Tinkaton'], why: 'Tinkaton Gigaton Hammer 1HKOs Mimikyu through Disguise via Mold Breaker.' };
  if (f.hasSneasler && picks.includes('Sableye'))
    return { lead: ['Mega Gengar','Sableye'], why: 'Sneasler cannot touch Sableye/Gengar combo — cannot Fake Out Ghosts, CC does zero damage. Encore it and it\'s useless.' };
  if (f.hasScrappy && picks.includes('Tinkaton'))
    return { lead: ['Mega Gengar','Tinkaton'], why: 'Scrappy opponent can Fake Out Gengar — Tinkaton Mold Breaker Fake Out wins the priority race and outspeeds.' };
  if (picks.includes('Incineroar'))
    return { lead: ['Mega Gengar','Incineroar'], why: 'Default lead. Incineroar Fake Out one target T1, Gengar Protects. Perish Song T2, Parting Shot → Kommo-o.' };
  if (picks.includes('Sableye'))
    return { lead: ['Mega Gengar','Sableye'], why: 'Prankster priority Encore/Disable. Sableye Fake Out, then priority disruption to cover Gengar.' };
  if (picks.includes('Tinkaton'))
    return { lead: ['Mega Gengar','Tinkaton'], why: 'Tinkaton Fake Out support + Gigaton Hammer offensive pressure alongside Gengar.' };
  return { lead: ['Mega Gengar','Primarina'], why: 'Alt loop — Primarina Perish Song T1 + Gengar Protect. Flip Turn T2 returns Gengar safely.' };
}

// ─── Turn 1 ───────────────────────────────────────────────────────────────────
function determineTurn1(lead, f) {
  const partner = lead.lead[1];
  if (partner === 'Primarina') {
    return {
      'Mega Gengar': { move: 'Protect', note: 'Protected from T1 damage. Switch to Kommo-o T2 while Primarina Flip Turns last.' },
      Primarina: { move: 'Perish Song', note: 'Starts the countdown. Flip Turn T2 — fires last due to low speed, safely returning Gengar.' },
    };
  }
  if (partner === 'Incineroar') {
    const foTarget = f.hasSneasler ? 'non-Sneasler target (Sneasler can\'t Fake Out back)' : 'the bigger immediate threat';
    return {
      'Mega Gengar': { move: 'Protect', note: 'Blocked from Fake Out and priority. Perish Song T2 after field is safe.' },
      Incineroar: { move: `Fake Out (${foTarget})`, note: f.hasDefiant ? 'DO NOT Parting Shot into Kingambit T2 — use Parting Shot only on non-Defiant targets.' : 'Parting Shot → Kommo-o T2 to complete the loop.' },
    };
  }
  if (partner === 'Sableye') {
    const gengarMove = f.ghosts.length > 0 ? 'Shadow Ball (Ghost type on field — do NOT Perish Song)' : 'Protect';
    return {
      'Mega Gengar': { move: gengarMove, note: f.ghosts.length > 0 ? 'Ghost escapes Shadow Tag — KO immediately. Perish Song only after Ghost is gone.' : 'Protect from priority. Perish Song T2.' },
      Sableye: { move: f.hasSneasler ? 'Encore (Sneasler is locked — cannot touch you)' : f.hasTR ? 'Encore (lock TR user before it goes up)' : 'Fake Out', note: f.hasSneasler ? 'Sneasler Encored into Fake Out / CC vs Ghosts = it does literally nothing.' : 'Priority Disable/Encore support for Gengar.' },
    };
  }
  if (partner === 'Tinkaton') {
    const tinMove = f.hasMimikyu ? 'Gigaton Hammer (1HKO through Disguise)'
      : f.hasFarigiraf ? 'Fake Out (Mold Breaker — Armor Tail ignored)'
      : f.hasSerperior ? 'Fake Out (Mold Breaker — Queenly Majesty ignored)'
      : 'Fake Out';
    return {
      'Mega Gengar': { move: 'Protect', note: 'Protect T1. Perish Song T2 once field is controlled.' },
      Tinkaton: { move: tinMove, note: f.hasMimikyu ? 'Mold Breaker ignores Disguise — Gigaton Hammer lands and KOs outright.' : f.hasFarigiraf ? 'Mold Breaker means Armor Tail has no effect — Fake Out flinches Farigiraf normally.' : 'Mold Breaker Fake Out. Encore or Gigaton Hammer T2.' },
    };
  }
  return {};
}

// ─── Game Plan ─────────────────────────────────────────────────────────────────
function generateGamePlan(arch, f) {
  const lines = [];
  if (arch.label.includes('Trick Room')) {
    lines.push('Protect through all 5 Trick Room turns to waste their timer — Perish Song countdown does not care about speed, they die regardless.');
    if (f.hasHatterene) lines.push('Hatterene Magic Bounce blocks Encore — use Tinkaton Mold Breaker exclusively against it.');
    else lines.push('Sableye Prankster Encore on TR setup goes first regardless of speed.');
  } else if (arch.label.includes('Sun')) {
    lines.push('Charizard-Y cannot escape Shadow Tag — it\'s a perfect Perish Song trap target. Fake Out Charizard T1, Perish Song T2. Incineroar resists all Fire moves throughout.');
    lines.push('Sableye Disable or Encore into Heat Wave / Weather Ball to lock their offense. Encore into Weather Ball with no sun = Normal-type move that cannot hit Gengar or Sableye.');
  } else if (arch.label.includes('Rain')) {
    lines.push('Trap the rain setter (Pelipper / Politoed) immediately — cannot escape Shadow Tag. Once trapped, rain expires during the Perish Song countdown naturally.');
    lines.push('Encore into Weather Ball with no rain = useless Normal-type move. Stall rain turns with Protect if needed.');
  } else if (arch.label.includes('Ghost-Heavy')) {
    lines.push('Multiple Ghost types escape Shadow Tag — do NOT Perish Song them. Shadow Ball any Ghost immediately and stay healthy. Trap only the non-Ghost Pokemon.');
    lines.push('Consider Alt Loop with Primarina + Gengar if Incineroar faces too many Ghost-immune scenarios.');
  } else if (arch.label.includes('Hyper Offense')) {
    lines.push('Their win condition is killing Gengar before Perish Song activates. Fake Out T1 steals tempo, Perish Song T2, survive T3 via Protect and Kommo-o switch.');
    if (f.hasKingambit) lines.push('Never Parting Shot or Intimidate into Kingambit — Defiant. Use Kommo-o Body Press which ignores all Atk boosts.');
  } else {
    lines.push('Execute primary loop: Incineroar Fake Out + Gengar Protect T1 → Gengar Perish Song + Incineroar Parting Shot into Kommo-o T2 → Gengar Protect T3 → both opponents die T4.');
  }
  if (f.hasSneasler && !arch.label.includes('Ghost')) lines.push('Sneasler is a free turn — it cannot Fake Out Ghosts, Close Combat does zero, only Dire Claw is an option. Encore it immediately.');
  if (f.hasZoroark) lines.push('Zoroark-H may be disguised as any ally — play cautiously all game. Do not confirm target assumptions early.');
  return lines.slice(0, 3).join(' ');
}

// ─── Threats ───────────────────────────────────────────────────────────────────
function identifyThreats(f) {
  const T = [];
  if (f.hasMimikyu)     T.push({ name:'Mimikyu', type:'S', detail:'Ghost — escapes trap. Disguise turns 2HKOs into 3HKOs.', counter:'Tinkaton Gigaton Hammer 1HKOs through Disguise (Mold Breaker).' });
  if (f.hasZoroark)     T.push({ name:'Zoroark-H', type:'S', detail:'Ghost — escapes trap. Disguised as ally — cannot confirm targets.', counter:'Assume it\'s always present. Kommo-o / Incineroar as safe switches.' });
  if (f.hasHydreigon)   T.push({ name:'Hydreigon', type:'S', detail:'Dark type — Prankster immune. Scarf may outspeed Gengar (130 base).', counter:'Primarina resists Dragon + Dark. Disable Scarf = permanently locked by Shadow Tag.' });
  if (f.hasKingambit)   T.push({ name:'Kingambit', type:'S', detail:'DEFIANT — +2 Atk from Parting Shot or Intimidate. Sucker Punch threatens Gengar.', counter:'NEVER Parting Shot or Intimidate into it. Kommo-o Body Press ignores all Atk boosts.' });
  if (f.hasHatterene)   T.push({ name:'Hatterene', type:'A', detail:'Magic Bounce reflects Encore and Disable. TR anchor. Fairy/Psychic hits Gengar + Kommo-o.', counter:'Tinkaton Mold Breaker bypasses Magic Bounce — Encore and Fake Out work normally.' });
  if (f.hasFarigiraf)   T.push({ name:'Farigiraf', type:'A', detail:'Armor Tail blocks all Fake Out. Normal/Psychic — immune to Ghost moves. Psychic hits Gengar.', counter:'Tinkaton Mold Breaker Fake Out bypasses Armor Tail completely. Target it first.' });
  if (f.hasGolurk)      T.push({ name:'Mega Golurk', type:'S', detail:'Unseen Fist bypasses Protect with contact moves like Headlong Rush.', counter:'Double attack T1 instead of relying on Protect. Do not stall vs this Pokemon.' });
  if (f.hasScrappy)     T.push({ name:'Mega Lopunny / Kangaskhan', type:'S', detail:'Scrappy Fake Out hits Ghost types — including Gengar and Sableye. Normal immune to Shadow Ball.', counter:'Tinkaton Fake Out wins priority. Must KO directly — cannot trap due to Normal immunity.' });
  if (f.hasBasculegion) T.push({ name:'Basculegion', type:'A', detail:'Ghost — escapes trap. Last Respects scales with each KO. Scarf may outspeed Gengar.', counter:'Shadow Ball immediately. Keep KO count low. Kommo-o resists Water.' });
  if (f.hasDragapult)   T.push({ name:'Dragapult', type:'A', detail:'Ghost — escapes trap. Fastest Ghost — outspeeds Gengar at base speed. Phantom Force bypasses Protect.', counter:'Shadow Ball immediately — Gengar outspeeds with EVs. Never attempt to trap.' });
  if (f.hasGallade)     T.push({ name:'Gallade', type:'A', detail:'Scarf + Sharpness Psycho Cut potentially 1HKOs Gengar. Leaf Blade hits Primarina.', counter:'Disable Scarf = permanent lockout via Shadow Tag. Incineroar Fake Out T1.' });
  if (f.hasGarchomp)    T.push({ name:'Garchomp', type:'A', detail:'Earthquake spread hits both leads. May be Choice Scarfed (208 Spe — outspeeds everything).', counter:'Shuca Berry on Incineroar absorbs EQ. Disable Scarf. Shadow Ball from Gengar.' });
  if (f.hasDelphox)     T.push({ name:'Delphox', type:'S', detail:'~134 base speed — faster than Mega Gengar (130 base). Psychic 1HKO potential vs Gengar.', counter:'Sableye Prankster Disable/Encore fires first regardless of speed.' });
  if (f.hasAegislash)   T.push({ name:'Aegislash', type:'A', detail:'Ghost — escapes trap. Shield form nearly undamageable. Shadow Sneak priority.', counter:'Double attack T1 in Blade form. Better when it\'s in opponent\'s back 2.' });
  if (f.hasSerperior)   T.push({ name:'Serperior', type:'A', detail:'Queenly Majesty blocks all Fake Out — Sableye offline. Triple Axle threatens Kommo-o.', counter:'Tinkaton Mold Breaker Fake Out bypasses Queenly Majesty. Hard switch Gengar to safety.' });
  if (f.hasSneasler)    T.push({ name:'Sneasler', type:'LOVE', detail:'Cannot Fake Out Ghost types. Close Combat does zero to Ghosts. Dire Claw only option.', counter:'Lead Sableye + Gengar. Encore it into Fake Out / CC. Disable Dire Claw. WANT to see this.' });
  // Remaining ghosts catch-all
  const named = ['mimikyu','zoroark','basculegion','dragapult','froslass','aegislash','hisui typhlosion'];
  const otherGhosts = f.ghosts.filter(g => !named.some(n => norm(g).includes(n)));
  if (otherGhosts.length) T.push({ name:`Ghost type — ${otherGhosts.join(', ')}`, type:'A', detail:'Escapes Shadow Tag freely. Do NOT Perish Song.', counter:'Shadow Ball immediately. Never attempt to trap.' });
  if (!T.length) T.push({ name:'No major threats identified', type:'OK', detail:'Standard team — no special counters required.', counter:'Execute primary PS loop without deviation.' });
  return T.slice(0, 5);
}

// ─── Backup line ───────────────────────────────────────────────────────────────
function generateBackup(lead, f, picks) {
  const lines = [];
  if (lead.lead[1] === 'Incineroar') {
    lines.push('If Incineroar is threatened T1, pivot to Alt Loop: lead Primarina + Gengar → Primarina Perish Song + Gengar Protect → Flip Turn T2 returns Gengar safely.');
  }
  if (f.ghosts.length > 0) {
    lines.push('If Ghosts lead, use Shadow Ball instead of Perish Song. Save Perish Song for after the Ghost is KO\'d or they\'ve switched.');
  }
  if (f.hasKingambit) {
    lines.push('If Kingambit leads: Sableye Fake Out Kingambit + Gengar Disable Kowtow Cleave. Double Protect T2. Never Parting Shot.');
  }
  if (f.hasTR) {
    lines.push('If Trick Room goes up, Protect through all 5 turns — PS countdown ignores speed. Resume primary loop after TR expires.');
  }
  if (!lines.length) {
    lines.push('If primary loop is disrupted, switch Gengar to Kommo-o and use Sableye Prankster Encore to lock the opponent. Re-enter Gengar when field is safe.');
  }
  return lines.slice(0, 2).join(' ');
}

// ─── Main entry ───────────────────────────────────────────────────────────────
export function analyzeTeam(opponents) {
  const opp = opponents.filter(Boolean);
  if (opp.length < 2) return null;
  const f = detectFlags(opp);
  const arch = detectArchetype(f);
  const { picks, reasons } = determineBring4(f);
  const lead = determineLead(picks, f);
  const turn1 = determineTurn1(lead, f);
  const threats = identifyThreats(f);
  const gamePlan = generateGamePlan(arch, f);
  const backup = generateBackup(lead, f, picks);
  return { picks, reasons, lead, turn1, threats, gamePlan, backup, archetype: arch };
}
