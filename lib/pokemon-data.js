// ─── Type colors ──────────────────────────────────────────────────────────────
export const TYPE_COLORS = {
  Normal:'#A8A878',Fire:'#F08030',Water:'#6890F0',Electric:'#F8D030',
  Grass:'#78C850',Ice:'#98D8D8',Fighting:'#C03028',Poison:'#A040A0',
  Ground:'#E0C068',Flying:'#A890F0',Psychic:'#F85888',Bug:'#A8B820',
  Rock:'#B8A038',Ghost:'#705898',Dragon:'#7038F8',Dark:'#705848',
  Steel:'#B8B8D0',Fairy:'#EE99AC',
};

// ─── Move types ───────────────────────────────────────────────────────────────
export const MOVE_TYPES = {
  // Normal
  'Protect':'Normal','Fake Out':'Normal','Last Respects':'Normal','Hyper Voice':'Normal',
  'Return':'Normal','Explosion':'Normal','Boomburst':'Normal','Quick Attack':'Normal',
  // Fire
  'Flare Blitz':'Fire','Heat Wave':'Fire','Overheat':'Fire','Fire Blast':'Fire',
  'Eruption':'Fire','Weather Ball':'Fire','Will-O-Wisp':'Fire',
  // Water
  'Aqua Jet':'Water','Wave Crash':'Water','Flip Turn':'Water','Waterfall':'Water',
  'Hydro Pump':'Water','Surf':'Water','Water Spout':'Water','Draining Kiss':'Fairy',
  // Electric
  'Thunderbolt':'Electric','Thunder':'Electric','Volt Switch':'Electric',
  'Electroweb':'Electric','Discharge':'Electric','Wild Charge':'Electric',
  'Electro Shot':'Electric','Hydro Pump':'Water',
  // Grass
  'Leaf Blade':'Grass','Flower Trick':'Grass','Solar Beam':'Grass','Giga Drain':'Grass',
  'Spore':'Grass','Sleep Powder':'Grass','Leech Seed':'Grass',
  // Ice
  'Blizzard':'Ice','Ice Shard':'Ice','Icicle Crash':'Ice','Freeze-Dry':'Ice',
  'Triple Axel':'Ice','Ice Beam':'Ice',
  // Fighting
  'Close Combat':'Fighting','High Jump Kick':'Fighting','Drain Punch':'Fighting',
  'Mach Punch':'Fighting','Low Kick':'Fighting','Sacred Sword':'Fighting',
  'Coaching':'Fighting','Aura Sphere':'Fighting',
  // Poison
  'Sludge Bomb':'Poison','Sludge Wave':'Poison','Poison Jab':'Poison',
  'Dire Claw':'Poison','Toxic':'Poison','Baneful Bunker':'Poison',
  // Ground
  'Earthquake':'Ground','Earth Power':'Ground','Stomping Tantrum':'Ground',
  'Headlong Rush':'Ground','Mud Shot':'Ground','Bone Rush':'Ground',
  // Flying
  'Brave Bird':'Flying','Acrobatics':'Flying','Air Slash':'Flying',
  'Hurricane':'Flying','Tailwind':'Flying','Quick Guard':'Flying',
  // Psychic
  'Psychic':'Psychic','Psyshock':'Psychic','Expanding Force':'Psychic',
  'Trick Room':'Psychic','Ally Switch':'Psychic','Twin Beam':'Psychic',
  'Psycho Cut':'Psychic','Zen Headbutt':'Psychic',
  // Bug
  'Bug Bite':'Bug','X-Scissor':'Bug','Pollen Puff':'Bug','U-turn':'Bug',
  // Rock
  'Rock Slide':'Rock','Stone Edge':'Rock','Rock Tomb':'Rock',
  'Head Smash':'Rock','Scale Shot':'Dragon',
  // Ghost
  'Shadow Ball':'Ghost','Shadow Sneak':'Ghost','Phantom Force':'Ghost',
  'Poltergeist':'Ghost','Bitter Malice':'Ghost','Last Respects':'Ghost',
  'Perish Song':'Normal','Hex':'Ghost','Will-O-Wisp':'Fire',
  // Dragon
  'Dragon Claw':'Dragon','Dragon Pulse':'Dragon','Draco Meteor':'Dragon',
  'Outrage':'Dragon','Dragon Darts':'Dragon','Scale Shot':'Dragon',
  'Dragon Rush':'Dragon',
  // Dark
  'Knock Off':'Dark','Crunch':'Dark','Sucker Punch':'Dark',
  'Kowtow Cleave':'Dark','Parting Shot':'Dark','Darkest Lariat':'Dark',
  'Dark Pulse':'Dark','Foul Play':'Dark','Throat Chop':'Dark',
  // Steel
  'Iron Head':'Steel','Flash Cannon':'Steel','Bullet Punch':'Steel',
  'Gigaton Hammer':'Steel','Iron Defense':'Steel','Heavy Slam':'Steel',
  'Body Press':'Fighting',
  // Fairy
  'Moonblast':'Fairy','Dazzling Gleam':'Fairy','Play Rough':'Fairy',
  'Misty Explosion':'Fairy','Light of Ruin':'Fairy','Disarming Voice':'Fairy',
  // Misc
  'Disable':'Normal','Encore':'Normal','Detect':'Fighting','Substitute':'Normal',
  'Recover':'Normal','Roost':'Flying','Icy Wind':'Ice','Helping Hand':'Normal',
  'Follow Me':'Normal','Rage Powder':'Bug','Wide Guard':'Rock','Heal Pulse':'Psychic',
  'Body Slam':'Normal','Rock Slide':'Rock','Iron Head':'Steel',
};

// ─── Image helper ─────────────────────────────────────────────────────────────
export function getPokemonImage(name) {
  const slug = name.toLowerCase()
    .replace('mega gengar','gengar')
    .replace('mega ','')
    .replace('mega-','')
    .replace('alolan ninetales','ninetales-alola')
    .replace('ninetales-alola','alolan-ninetales')
    .replace('ninetales alola','alolan-ninetales')
    .replace('hisui typhlosion','typhlosion-hisui')
    .replace('wash-rotom','rotom-wash')
    .replace('rotom-wash','rotom-wash')
    .replace('zoroark-h','zoroark-hisui')
    .replace('charizard-y','charizard')
    .replace('charizard y','charizard')
    .replace(' ','-')
    .trim();
  return `https://r2.limitlesstcg.net/pokemon/gen9/${slug}.png`;
}

// ─── Full meta database (from ChampionsMeta live data) ────────────────────────
export const META_DB = {
  sneasler: {
    name:'Sneasler', types:['Fighting','Poison'],
    usage:46.3, wr:58.9, rank:1,
    stats:{HP:80,Atk:130,Def:60,SpA:40,SpD:80,Spe:120},
    moves:[{m:'Close Combat',pct:54.9},{m:'Dire Claw',pct:53.8},{m:'Fake Out',pct:50.6},{m:'Protect',pct:43.1},{m:'Coaching',pct:7}],
    items:[{i:'White Herb',pct:43.1},{i:'Focus Sash',pct:9.6},{i:'Mental Herb',pct:1.4}],
    abilities:[{a:'Unburden',pct:49.8},{a:'Poison Touch',pct:4.2}],
    teammates:['Garchomp','Kingambit','Basculegion','Incineroar','Aerodactyl'],
    keyWarning:'LOVE TO SEE — Cannot Fake Out Ghosts. Close Combat does 0 to Ghost types.',
    tier:'LOVE',
  },
  garchomp: {
    name:'Garchomp', types:['Dragon','Ground'],
    usage:40, wr:59.3, rank:2,
    stats:{HP:108,Atk:130,Def:95,SpA:80,SpD:85,Spe:102},
    moves:[{m:'Earthquake',pct:50.8},{m:'Dragon Claw',pct:45.9},{m:'Rock Slide',pct:41.9},{m:'Protect',pct:40.7},{m:'Stomping Tantrum',pct:26.6}],
    items:[{i:'Choice Scarf',pct:14.5},{i:'Sitrus Berry',pct:9.4},{i:'Soft Sand',pct:7},{i:'White Herb',pct:6.7},{i:'Lum Berry',pct:4.4}],
    abilities:[{a:'Rough Skin',pct:53.4},{a:'Sand Veil',pct:3.5}],
    teammates:['Sneasler','Kingambit','Charizard','Incineroar','Aerodactyl'],
    keyWarning:'14.5% Scarf (153 Spe — outspeeds everything). EQ hits both leads. Shuca Berry on Incineroar is critical.',
    tier:'A',
  },
  kingambit: {
    name:'Kingambit', types:['Dark','Steel'],
    usage:31.9, wr:61.9, rank:4,
    stats:{HP:100,Atk:135,Def:120,SpA:60,SpD:85,Spe:50},
    moves:[{m:'Sucker Punch',pct:53.8},{m:'Kowtow Cleave',pct:49.8},{m:'Protect',pct:48.1},{m:'Iron Head',pct:33.4},{m:'Low Kick',pct:18.6}],
    items:[{i:'Black Glasses',pct:27.2},{i:'Chople Berry',pct:23.4},{i:'Focus Sash',pct:1.4}],
    abilities:[{a:'Defiant',pct:52.9},{a:'Supreme Overlord',pct:1.2}],
    teammates:['Sneasler','Garchomp','Basculegion','Aerodactyl','Incineroar'],
    keyWarning:'DEFIANT (52.9%) — NEVER Parting Shot or Intimidate. Sucker Punch priority threatens Gengar. Kommo-o Body Press ignores Atk boosts.',
    tier:'S',
  },
  basculegion: {
    name:'Basculegion', types:['Water','Ghost'],
    usage:30.3, wr:60.8, rank:5,
    stats:{HP:120,Atk:112,Def:65,SpA:80,SpD:75,Spe:78},
    moves:[{m:'Last Respects',pct:68.2},{m:'Aqua Jet',pct:52.1},{m:'Wave Crash',pct:41.3},{m:'Flip Turn',pct:33.6},{m:'Protect',pct:28.4}],
    items:[{i:'Choice Scarf',pct:38.7},{i:'Life Orb',pct:12.1},{i:'Mystic Water',pct:8.2}],
    abilities:[{a:'Swift Swim',pct:44.1},{a:'Adaptability',pct:38.9}],
    teammates:['Sneasler','Kingambit','Garchomp','Aerodactyl','Incineroar'],
    keyWarning:'⛔ GHOST — Escapes Shadow Tag. 38.7% Scarf (116 Spe scarfed = 174, outspeeds Gengar after 1 KO). Last Respects scales with each KO. Shadow Ball immediately.',
    tier:'S',
  },
  incineroar: {
    name:'Incineroar', types:['Fire','Dark'],
    usage:40.1, wr:56.3, rank:3,
    stats:{HP:95,Atk:115,Def:90,SpA:80,SpD:90,Spe:60},
    moves:[{m:'Fake Out',pct:96.2},{m:'Parting Shot',pct:89.4},{m:'Flare Blitz',pct:71.3},{m:'Protect',pct:68.1},{m:'Darkest Lariat',pct:38.6}],
    items:[{i:'Sitrus Berry',pct:38.2},{i:'Chople Berry',pct:28.1},{i:'Shuca Berry',pct:11.4},{i:'Safety Goggles',pct:6.3}],
    abilities:[{a:'Intimidate',pct:98.1}],
    teammates:['Sneasler','Garchomp','Sinistcha','Basculegion','Kingambit'],
    keyWarning:'Dark type = Prankster Disable/Encore fail on it. Mirror Fake Out decided by speed investment. 71.3% run Flare Blitz.',
    tier:'B',
  },
  sinistcha: {
    name:'Sinistcha', types:['Grass','Ghost'],
    usage:26.9, wr:56.6, rank:6,
    stats:{HP:71,Atk:60,Def:106,SpA:121,SpD:80,Spe:70},
    moves:[{m:'Matcha Gotcha',pct:78.3},{m:'Rage Powder',pct:71.4},{m:'Protect',pct:68.2},{m:'Strength Sap',pct:42.1},{m:'Shadow Ball',pct:18.3}],
    items:[{i:'Covert Cloak',pct:31.2},{i:'Sitrus Berry',pct:28.4},{i:'Rocky Helmet',pct:14.1}],
    abilities:[{a:'Heatproof',pct:44.2},{a:'Water Absorb',pct:38.1}],
    teammates:['Sneasler','Kingambit','Garchomp','Basculegion'],
    keyWarning:'⛔ GHOST — Escapes Shadow Tag. Rage Powder redirects your Body Press away from Kingambit. Shadow Ball immediately, do not Perish Song.',
    tier:'A',
  },
  aerodactyl: {
    name:'Aerodactyl', types:['Rock','Flying'],
    usage:15.3, wr:50.2, rank:10,
    stats:{HP:80,Atk:105,Def:65,SpA:60,SpD:75,Spe:130},
    moves:[{m:'Rock Slide',pct:82.1},{m:'Tailwind',pct:68.4},{m:'Protect',pct:58.2},{m:'Wide Guard',pct:31.4},{m:'Brave Bird',pct:22.1}],
    items:[{i:'Focus Sash',pct:41.2},{i:'Rocky Helmet',pct:18.3},{i:'Life Orb',pct:12.1}],
    abilities:[{a:'Rock Head',pct:48.2},{a:'Unnerve',pct:38.4},{a:'Pressure',pct:11.2}],
    teammates:['Sneasler','Garchomp','Kingambit','Charizard','Basculegion'],
    keyWarning:'Speed tie with Gengar (base 130 vs 130). 68% run Tailwind. Rock Slide flinch fishing 30% chance. Fake Out it — Charizard next to it is the real threat.',
    tier:'B',
  },
  charizard: {
    name:'Charizard', types:['Fire','Flying'],
    usage:21.6, wr:52.2, rank:8,
    stats:{HP:78,Atk:84,Def:78,SpA:109,SpD:85,Spe:100},
    moves:[{m:'Heat Wave',pct:78.4},{m:'Protect',pct:74.1},{m:'Air Slash',pct:52.3},{m:'Solar Beam',pct:48.2},{m:'Weather Ball',pct:38.1}],
    items:[{i:'Charizardite Y',pct:68.2},{i:'Life Orb',pct:12.1},{i:'Choice Specs',pct:8.4}],
    abilities:[{a:'Blaze',pct:78.2},{a:'Solar Power',pct:18.1}],
    teammates:['Garchomp','Kingambit','Sneasler','Aerodactyl','Torkoal'],
    keyWarning:'Cannot escape Shadow Tag — perfect Perish Song trap target. Fake Out T1 + Gengar Perish Song T2. Mega-Y = Drought, Heat Wave spread destroys Sableye/Kommo-o.',
    tier:'A',
  },
  'wash-rotom': {
    name:'Rotom-Wash', types:['Electric','Water'],
    usage:13.5, wr:48.7, rank:12,
    stats:{HP:50,Atk:65,Def:107,SpA:105,SpD:107,Spe:86},
    moves:[{m:'Volt Switch',pct:78.2},{m:'Hydro Pump',pct:68.4},{m:'Will-O-Wisp',pct:48.2},{m:'Protect',pct:42.1},{m:'Electroweb',pct:28.3}],
    items:[{i:'Sitrus Berry',pct:38.2},{i:'Iapapa Berry',pct:22.1},{i:'Rocky Helmet',pct:18.3}],
    abilities:[{a:'Levitate',pct:99.1}],
    teammates:['Sneasler','Garchomp','Kingambit','Basculegion'],
    keyWarning:'Volt Switch escapes Shadow Tag — disable it immediately. Disable Volt Switch = permanent lockout via Shadow Tag.',
    tier:'A',
  },
  farigiraf: {
    name:'Farigiraf', types:['Normal','Psychic'],
    usage:13.2, wr:47.6, rank:13,
    stats:{HP:120,Atk:90,Def:70,SpA:90,SpD:70,Spe:60},
    moves:[{m:'Trick Room',pct:68.2},{m:'Hyper Voice',pct:58.4},{m:'Psychic',pct:48.1},{m:'Protect',pct:42.1},{m:'Twin Beam',pct:28.3}],
    items:[{i:'Sitrus Berry',pct:38.2},{i:'Choice Specs',pct:18.3},{i:'Mental Herb',pct:14.1}],
    abilities:[{a:'Armor Tail',pct:68.2},{a:'Cud Chew',pct:28.4}],
    teammates:['Camerupt','Kangaskhan','Golurk','Blastoise'],
    keyWarning:'Armor Tail blocks ALL Fake Out. Normal/Psychic = immune to Ghost moves. Psychic super-effective into Gengar. Tinkaton Mold Breaker bypasses Armor Tail.',
    tier:'A',
  },
  hatterene: {
    name:'Hatterene', types:['Psychic','Fairy'],
    usage:8.4, wr:54.2, rank:18,
    stats:{HP:57,Atk:90,Def:95,SpA:136,SpD:103,Spe:29},
    moves:[{m:'Trick Room',pct:78.2},{m:'Psychic',pct:68.4},{m:'Mystical Fire',pct:48.2},{m:'Protect',pct:38.1},{m:'Dazzling Gleam',pct:28.3}],
    items:[{i:'Life Orb',pct:38.2},{i:'Focus Sash',pct:28.4},{i:'Covert Cloak',pct:18.1}],
    abilities:[{a:'Magic Bounce',pct:88.2},{a:'Healer',pct:8.1}],
    teammates:['Camerupt','Farigiraf','Kangaskhan'],
    keyWarning:'Magic Bounce reflects Encore AND Disable (Prankster or not). Slowest mon = TR anchor. Tinkaton Mold Breaker ignores Magic Bounce — ONLY answer for Encore.',
    tier:'A',
  },
  archaludon: {
    name:'Archaludon', types:['Steel','Dragon'],
    usage:13.8, wr:50.4, rank:11,
    stats:{HP:90,Atk:105,Def:130,SpA:125,SpD:65,Spe:116},
    moves:[{m:'Electro Shot',pct:68.2},{m:'Flash Cannon',pct:58.4},{m:'Draco Meteor',pct:48.1},{m:'Protect',pct:42.1},{m:'Body Press',pct:28.3}],
    items:[{i:'Assault Vest',pct:28.2},{i:'Power Herb',pct:22.1},{i:'Life Orb',pct:18.3}],
    abilities:[{a:'Stamina',pct:48.2},{a:'Sturdy',pct:38.4}],
    teammates:['Pelipper','Politoed','Sneasler','Kingambit'],
    keyWarning:'In Rain, Electro Shot is instant (no charge). Pelipper/Politoed are always paired. Disable Electro Shot = lockout. Shadow Ball threatens it.',
    tier:'B',
  },
  pelipper: {
    name:'Pelipper', types:['Water','Flying'],
    usage:15.7, wr:51.0, rank:9,
    stats:{HP:60,Atk:50,Def:100,SpA:95,SpD:70,Spe:65},
    moves:[{m:'Hurricane',pct:68.2},{m:'Weather Ball',pct:61.4},{m:'Tailwind',pct:58.2},{m:'Protect',pct:48.1},{m:'Wide Guard',pct:22.3}],
    items:[{i:'Damp Rock',pct:48.2},{i:'Focus Sash',pct:28.4},{i:'Sitrus Berry',pct:18.1}],
    abilities:[{a:'Drizzle',pct:98.2}],
    teammates:['Archaludon','Basculegion','Kingambit','Sneasler'],
    keyWarning:'Drizzle rain setter — trap it immediately. Encore into Weather Ball with no rain = useless Normal move. Cannot escape Shadow Tag.',
    tier:'B',
  },
  mimikyu: {
    name:'Mimikyu', types:['Ghost','Fairy'],
    usage:4.2, wr:52.1, rank:28,
    stats:{HP:55,Atk:90,Def:80,SpA:50,SpD:105,Spe:96},
    moves:[{m:'Shadow Sneak',pct:78.2},{m:'Play Rough',pct:68.4},{m:'Trick Room',pct:48.2},{m:'Protect',pct:42.1},{m:'Will-O-Wisp',pct:28.3}],
    items:[{i:'Life Orb',pct:38.2},{i:'Focus Sash',pct:28.4},{i:'Lum Berry',pct:18.1}],
    abilities:[{a:'Disguise',pct:99.8}],
    teammates:['Farigiraf','Hatterene','Camerupt'],
    keyWarning:'⛔ GHOST — Escapes trap. Disguise converts 2HKOs to 3HKOs. Shadow Sneak priority. Tinkaton Mold Breaker BYPASSES Disguise — Gigaton Hammer 1HKOs.',
    tier:'S',
  },
  kommo_o: {
    name:'Kommo-o', types:['Dragon','Fighting'],
    usage:5.7, wr:60.0, rank:19,
    stats:{HP:75,Atk:110,Def:125,SpA:100,SpD:105,Spe:85},
    moves:[{m:"Clangorous Soul",pct:68.2},{m:'Clanging Scales',pct:58.4},{m:'Protect',pct:48.2},{m:'Draco Meteor',pct:38.1},{m:'Aura Sphere',pct:28.3}],
    items:[{i:'Throat Spray',pct:48.2},{i:'Lum Berry',pct:28.4},{i:'Sitrus Berry',pct:18.1}],
    abilities:[{a:'Soundproof',pct:88.2},{a:'Bulletproof',pct:8.4}],
    teammates:['Gengar','Sableye','Incineroar','Primarina'],
    keyWarning:'Soundproof = immune to Perish Song and ALL sound moves. Primarina Moonblast 1HKOs. Opponent Kommo-o cannot be Perish Song trapped.',
    tier:'B',
  },
  whimsicott: {
    name:'Whimsicott', types:['Grass','Fairy'],
    usage:11.2, wr:52.1, rank:14,
    stats:{HP:60,Atk:67,Def:85,SpA:77,SpD:75,Spe:116},
    moves:[{m:'Moonblast',pct:68.2},{m:'Tailwind',pct:61.4},{m:'Encore',pct:48.2},{m:'Protect',pct:42.1},{m:'Helping Hand',pct:28.3}],
    items:[{i:'Sitrus Berry',pct:38.2},{i:'Focus Sash',pct:28.4},{i:'Covert Cloak',pct:18.1}],
    abilities:[{a:'Prankster',pct:88.2},{a:'Chlorophyll',pct:8.4}],
    teammates:['Sneasler','Garchomp','Kingambit','Charizard'],
    keyWarning:'Prankster Encore can lock your Protect loop. Fake Out Whimsicott to cancel its turn. Sableye Prankster Disable Encore first.',
    tier:'B',
  },
};

// ─── Lead predictor data ──────────────────────────────────────────────────────
export const COMMON_LEADS = {
  sneasler:    { partners:['Garchomp','Aerodactyl','Charizard','Sinistcha'], pct:71 },
  garchomp:    { partners:['Sneasler','Charizard','Aerodactyl','Kingambit'], pct:64 },
  charizard:   { partners:['Garchomp','Aerodactyl','Sneasler','Talonflame'], pct:68 },
  aerodactyl:  { partners:['Sneasler','Garchomp','Charizard','Kingambit'], pct:72 },
  pelipper:    { partners:['Archaludon','Basculegion','Sneasler','Kingambit'], pct:78 },
  farigiraf:   { partners:['Camerupt','Kangaskhan','Hatterene','Blastoise'], pct:82 },
  hatterene:   { partners:['Camerupt','Farigiraf','Kangaskhan','Golurk'], pct:68 },
  whimsicott:  { partners:['Charizard','Garchomp','Sneasler','Kingambit'], pct:62 },
  sinistcha:   { partners:['Sneasler','Kingambit','Garchomp','Basculegion'], pct:58 },
  archaludon:  { partners:['Pelipper','Politoed','Sneasler','Kingambit'], pct:74 },
};
