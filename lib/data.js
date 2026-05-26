export const TEAM_DEFAULT = [
  { name:"Mega Gengar", role:"CORE", clr:"#AFA9EC", bg:"#2D2040",
    types:["Ghost","Poison"], ab:"Shadow Tag (post-mega)", item:"Gengarite",
    mv:["Shadow Ball","Perish Song","Protect","Disable"],
    spe:"173 (battle)", stats:{HP:167,Atk:76,Def:94,SpA:151,SpD:106,Spe:151},
    note:"Always in 4. Post-mega SPE = 173 (Timid 8SP). Scarf Disable tech: permanently locks Scarf users via Shadow Tag." },
  { name:"Incineroar", role:"PIVOT", clr:"#F0997B", bg:"#3D1A0A",
    types:["Fire","Dark"], ab:"Intimidate", item:"Shuca Berry",
    mv:["Darkest Lariat","Parting Shot","Fake Out","Protect"],
    spe:"82", stats:{HP:202,Atk:135,Def:156,SpA:90,SpD:110,Spe:82},
    note:"Default lead. Shuca Berry for Garchomp EQ. NEVER Parting Shot into Kingambit. Dark type = Prankster fails." },
  { name:"Sableye", role:"DISRUPTOR", clr:"#B4B2A9", bg:"#222220",
    types:["Dark","Ghost"], ab:"Prankster", item:"Focus Sash",
    mv:["Disable","Encore","Fake Out","Detect"],
    spe:"70", stats:{HP:157,Atk:95,Def:139,SpA:76,SpD:87,Spe:70},
    note:"Priority Disable/Encore via Prankster. Dark types immune to ALL Prankster moves." },
  { name:"Primarina", role:"BACKUP PS", clr:"#ED93B1", bg:"#3A1525",
    types:["Water","Fairy"], ab:"Torrent", item:"Sitrus Berry",
    mv:["Draining Kiss","Flip Turn","Perish Song","Protect"],
    spe:"83", stats:{HP:186,Atk:84,Def:137,SpA:146,SpD:137,Spe:83},
    note:"Slow Flip Turn fires LAST — safely returns Gengar mid-loop. Resists Dragon + Dark (Hydreigon counter)." },
  { name:"Kommo-o", role:"PS IMMUNE", clr:"#5DCAA5", bg:"#0E2A1E",
    types:["Dragon","Fighting"], ab:"Soundproof", item:"Leftovers",
    mv:["Body Press","Draco Meteor","Iron Defense","Protect"],
    spe:"105", stats:{HP:182,Atk:117,Def:194,SpA:120,SpD:127,Spe:105},
    note:"Soundproof = immune to Perish Song. Mid-loop switch target. Body Press 1HKOs Tyranitar/Kingambit." },
  { name:"Tinkaton", role:"FLEX", clr:"#85B7EB", bg:"#0E1E30",
    types:["Steel","Fairy"], ab:"Mold Breaker", item:"Metal Coat",
    mv:["Gigaton Hammer","Encore","Fake Out","Protect"],
    spe:"155 (Jolly)", stats:{HP:192,Atk:97,Def:102,SpA:81,SpD:125,Spe:155},
    note:"Mold Breaker bypasses: Magic Bounce, Armor Tail, Queenly Majesty, Mimikyu Disguise → Gigaton Hammer 1HKOs." },
];

export const THREATS_STATIC = [
  { name:"Mimikyu", tier:"S", isG:true, detail:"Ghost (escapes trap). Disguise converts 2HKOs into 3HKOs. Lake2 S-tier pick.", counter:"Tinkaton Mold Breaker bypasses Disguise — Gigaton Hammer 1HKOs. Only answer." },
  { name:"Zoroark-H", tier:"S", isG:true, detail:"Disguises as any ally — can't confirm targets. Scarf Bitter Malice threatens Gengar 1HKO.", counter:"Assume present all game. Kommo-o / Incineroar safe switches." },
  { name:"Hydreigon", tier:"S", isG:false, detail:"Dark type = Prankster immune. Scarf potentially outspeeds Gengar. Dark Pulse threatening.", counter:"Primarina resists Dragon + Dark. Disable Scarf = permanent lockout via Shadow Tag." },
  { name:"Mega Golurk", tier:"S", isG:false, detail:"Unseen Fist bypasses Protect with Headlong Rush. Your stall mechanic doesn't stop it.", counter:"Double attack T1 instead of Protect. Do not stall vs this." },
  { name:"Mega Lopunny", tier:"S", isG:false, detail:"Scrappy Fake Out hits Ghost types. Normal = Shadow Ball immune. U-turn escapes.", counter:"Tinkaton Fake Out wins priority. Must KO directly — can't trap." },
  { name:"Kingambit", tier:"S", isG:false, hasD:true, detail:"DEFIANT — +2 Atk from Parting Shot or Intimidate. Sucker Punch threatens Gengar.", counter:"NEVER Parting Shot/Intimidate into it. Kommo-o Body Press ignores Atk boosts." },
  { name:"Kangaskhan", tier:"S", isG:false, detail:"Scrappy Fake Out hits Ghosts. TR teams. With Farigiraf = disaster.", counter:"Tinkaton Mold Breaker Fake Out wins priority. Disable Last Resort." },
  { name:"Delphox", tier:"S", isG:false, detail:"~134 base speed — faster than Mega Gengar (130 base). Psychic 1HKO vs Gengar.", counter:"Sableye Prankster Disable/Encore fires first regardless of speed." },
  { name:"Mega Gardevoir", tier:"A", isG:false, detail:"Psychic hits Gengar + Kommo-o simultaneously. Moonblast vs Kommo-o.", counter:"Tinkaton Gigaton Hammer. Shadow Ball if Gengar faster. Keep Kommo-o away." },
  { name:"Hatterene", tier:"A", isG:false, detail:"Magic Bounce reflects Encore + Disable. TR anchor. Fairy/Psychic hits Gengar+Kommo-o.", counter:"Tinkaton Mold Breaker ignores Magic Bounce. Gigaton Hammer hits hard." },
  { name:"Gallade", tier:"A", isG:false, detail:"Scarf + Sharpness Psycho Cut = 1HKO Gengar. Leaf Blade hits Primarina.", counter:"Disable Scarf = permanent lockout. Incineroar Fake Out T1." },
  { name:"Charizard-Y", tier:"A", isG:false, detail:"Drought. Heat Wave spread. Cannot escape Shadow Tag — perfect trap target.", counter:"Fake Out Charizard + Gengar Perish Song. Sableye Disable/Encore." },
  { name:"Serperior", tier:"A", isG:false, detail:"Queenly Majesty blocks ALL Fake Out. Sableye offline. Triple Axle vs Kommo-o.", counter:"Tinkaton Mold Breaker Fake Out bypasses Queenly Majesty." },
  { name:"Farigiraf", tier:"A", isG:false, detail:"Armor Tail blocks all Fake Out. Normal/Psychic = Ghost immune. TR setter.", counter:"Tinkaton Mold Breaker Fake Out bypasses Armor Tail. Disable Trick Room." },
  { name:"Basculegion", tier:"A", isG:true, detail:"Ghost (escapes trap). Scarf Last Respects can outspeed Gengar after KO.", counter:"Shadow Ball immediately. NEVER Perish Song. Keep KO count low." },
  { name:"Rotom-Wash", tier:"A", isG:false, detail:"Volt Switch escapes Shadow Tag. Threatens Primarina.", counter:"Disable Volt Switch = permanently locked. Shadow Ball. Kommo-o resists Electric." },
  { name:"Aegislash", tier:"A", isG:true, detail:"Ghost (escapes trap). Shield form near-undamageable. Shadow Sneak priority.", counter:"Double attack T1 in Blade form. Better in opponent back 2." },
  { name:"Sneasler", tier:"LOVE", isG:false, detail:"Cannot Fake Out Ghosts. Close Combat = 0 to Ghosts. Dire Claw only option.", counter:"Lead Sableye+Gengar. Encore into Fake Out/CC. Disable Dire Claw. WANT this." },
  { name:"Mega Aggron", tier:"LOVE", isG:false, detail:"Body Press does nothing to Ghosts. Encore Iron Defense = locked.", counter:"Encore Iron Defense. Disable Heavy Slam. Perish Song trap — can't escape." },
];

export const WINCONS = [
  { arch:"Weather (Rain / Sun)", icon:"🌦", clr:"#85B7EB", plan:"Trap the weather setter first — Pelipper, Torkoal, Charizard-Y cannot escape Shadow Tag. Encore Weather Ball with no weather = Normal move that hits nothing. Stall weather turns with Protect." },
  { arch:"Trick Room", icon:"🔄", clr:"#C8A2E8", plan:"PS countdown ignores speed — they die in 3 turns regardless. Protect through all 5 TR turns. Sableye Prankster Encore on TR setup. Hatterene blocks Encore = use Tinkaton Mold Breaker." },
  { arch:"Hyper Offense", icon:"⚡", clr:"#D85A30", plan:"Fake Out T1, PS T2, survive T3 via Protect/Kommo-o switch. Sneasler is a gift. Scarfed Garchomp: Disable its only move = permanently locked. Never Parting Shot into Kingambit." },
  { arch:"Ghost-Heavy", icon:"👻", clr:"#AFA9EC", plan:"Ghost types escape Shadow Tag. Shadow Ball any Ghost immediately. Zoroark-H: can't confirm targets — play cautiously all game." },
  { arch:"Redirection", icon:"🔀", clr:"#97C459", plan:"Tinkaton Mold Breaker bypasses Armor Tail and Queenly Majesty. Target redirector first. Sinistcha = Shadow Ball. Rage Powder diverts Body Press from Kingambit." },
  { arch:"Normal-Type Blockers", icon:"🚫", clr:"#EF9F27", plan:"Shadow Ball does zero to Normal types. Scrappy Fake Out hits your Ghosts. Tinkaton Gigaton Hammer is primary damage answer. Disable/Encore their other moves." },
];

export const SPEEDS = [
  ["Garchomp Scarfed","153","#D85A30"],
  ["Sneasler Jolly","189","#5DCAA5"],
  ["Basculegion Scarfed","117","#AFA9EC"],
  ["Gengar (battle)","173","#AFA9EC"],
  ["Delphox","~165","#FF4444"],
  ["Dragapult","162","#888"],
  ["A-Ninetales","161","#97C459"],
  ["Tinkaton","155","#85B7EB"],
  ["Archaludon","116","#85B7EB"],
  ["Charizard-Y","145","#F0997B"],
  ["Aerodactyl","130","#EF9F27"],
  ["Kommo-o","105","#5DCAA5"],
  ["Primarina","83","#ED93B1"],
  ["Incineroar","82","#F0997B"],
  ["Sableye","70","#B4B2A9"],
];

export const POKEMON_LIST = [
  "Venusaur","Mega Venusaur","Charizard","Mega Charizard X","Mega Charizard Y","Blastoise","Mega Blastoise",
  "Snorlax","Aerodactyl","Mega Aerodactyl","Starmie","Kangaskhan","Mega Kangaskhan","Alakazam","Mega Alakazam",
  "Slowbro","Mega Slowbro","Gengar","Mega Gengar","Scizor","Mega Scizor","Heracross","Mega Heracross",
  "Tyranitar","Meganium","Typhlosion","Hisui Typhlosion","Espeon","Umbreon","Politoed","Ampharos","Mega Ampharos",
  "Blaziken","Mega Blaziken","Gardevoir","Mega Gardevoir","Aggron","Mega Aggron","Manectric","Mega Manectric",
  "Altaria","Mega Altaria","Salamence","Mega Salamence","Metagross","Mega Metagross","Camerupt","Mega Camerupt",
  "Torkoal","Flygon","Milotic","Medicham","Mega Medicham","Lucario","Mega Lucario","Garchomp",
  "Gallade","Mega Gallade","Froslass","Mega Froslass","Rotom-Wash","Rotom-Heat","Rotom-Frost",
  "Excadrill","Whimsicott","Serperior","Hydreigon","Chandelure","Volcarona","Golurk","Mega Golurk",
  "Sylveon","Hawlucha","Mega Hawlucha","Goodra","Aegislash","Talonflame","Gourgeist","Mega Gourgeist",
  "Floette-Eternal","Delphox","Greninja","Mega Greninja","Gyarados","Mega Gyarados",
  "Primarina","Incineroar","Kommo-o","Mimikyu","Ninetales-Alola","Oranguru","Maushold","Palafin",
  "Dragapult","Corviknight","Archaludon","Kingambit","Basculegion","Sneasler","Sinistcha","Hatterene",
  "Zoroark-H","Meowscarada","Tinkaton","Ceruledge","Gholdengo","Baxcalibur","Farigiraf","Quaquaval",
  "Sableye","Pelipper","Dragonite","Mega Dragonite","Scovillain","Mega Scovillain","Togekiss","Klefki",
  "Lopunny","Mega Lopunny","Wash-Rotom","Archaludon","Kingambit","Sneasler",
];

export const SYSTEM_PROMPT = `You are an expert Pokemon Champions (Regulation M-A doubles) Perish Song trap coach. No filler. Precise and tactical.

MY TEAM:
1. Mega Gengar — Shadow Tag (post-mega), Gengarite | Shadow Ball/Perish Song/Protect/Disable. SPE 173 battle (Timid 8SP). ALWAYS in 4.
2. Incineroar — Intimidate, Shuca Berry | Darkest Lariat/Parting Shot/Fake Out/Protect. SPE 82. NEVER Parting Shot into Kingambit. Dark type = Prankster fails.
3. Sableye — Prankster, Focus Sash | Disable/Encore/Fake Out/Detect. SPE 70. Prankster fails on Dark types.
4. Primarina — Torrent, Sitrus Berry | Draining Kiss/Flip Turn/Perish Song/Protect. SPE 83. Slow Flip Turn fires last = returns Gengar safely.
5. Kommo-o — Soundproof, Leftovers | Body Press/Draco Meteor/Iron Defense/Protect. SPE 105. Immune to PS.
6. Tinkaton — Mold Breaker, Metal Coat | Gigaton Hammer/Encore/Fake Out/Protect. SPE 155. Bypasses Magic Bounce/Armor Tail/Disguise.

META (ChampionsMeta live data): Sneasler #1 (46.3% usage, 58.9% WR) — White Herb 43%, Unburden 50%, CC+DireClaw+FakeOut. Cannot touch Ghosts. Garchomp #2 (40%, 59.3% WR) — 14.5% Scarf (153 Spe). Kingambit #4 (31.9%, 61.9% WR) — 52.9% Defiant, NEVER Parting Shot. Basculegion #5 (30.3%, 60.8% WR) — Ghost, 38.7% Scarf, Last Respects. Incineroar #3 (40.1%, 56.3% WR) — 71.3% Flare Blitz.

S-TIER: Mimikyu(Ghost+Disguise→Tinkaton), Zoroark-H(Ghost+deception), Hydreigon(Dark,Prankster-immune→Primarina), Mega Golurk(Unseen Fist bypasses Protect), Mega Lopunny(Scrappy FO hits Ghosts,U-turn), Kingambit(Defiant→Kommo-o Body Press), Kangaskhan(Scrappy FO→Tinkaton).
A-TIER: Gardevoir, Hatterene(Magic Bounce→Tinkaton), Gallade(Scarf Psycho Cut 1HKO), Charizard-Y(trap it), Serperior(Queenly Majesty→Tinkaton), Farigiraf(Armor Tail→Tinkaton), Basculegion(Ghost), Rotom-Wash(Volt Switch→Disable), Aegislash(Ghost).
LOVE: Sneasler, Mega Aggron, Mega Kangaskhan.

KEY RULES: Ghost types escape Shadow Tag — Shadow Ball, NEVER PS. Disable on Scarf = permanent lockout. Tinkaton bypasses Magic Bounce/Armor Tail/Disguise. Prankster fails on Dark types.

PS LOOPS: Primary: T1 Incineroar Fake Out + Gengar Protect → T2 Gengar PS + Incineroar Parting Shot→Kommo-o → T3 Gengar Protect → T4 both die. Alt: Lead Primarina+Gengar → T1 Prim PS + Gengar Protect → T2 Gengar→Kommo-o + Prim Flip Turn(last)→Gengar → T3 Gengar Protect → T4 both die.

Output ONLY these sections:
**BRING 4:** [list all 4 Pokemon with specific reason for each — who stays home and why]
**LEAD:** [2 leads + detailed why]
**TURN 1:** [exact move each lead + reasoning]
**GAME PLAN:** [3 tactical sentences specific to this matchup]
**THREATS:** [each dangerous Pokemon + specific counter]
**BACKUP LINE:** [if primary fails]
**ARCHETYPE:** [team type + 1 sentence]`;
