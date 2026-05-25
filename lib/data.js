export const TEAM = [
  { name:"Mega Gengar", role:"CORE", clr:"#AFA9EC", bg:"#2D2040", ab:"Shadow Tag (post-mega)", item:"Gengarite", mv:["Shadow Ball","Perish Song","Protect","Disable / Sub"], spe:"173 (battle)", stats:{HP:167,Atk:76,Def:94,SpA:151,SpD:106,Spe:151}, note:"Always brought. Stat screen shows 151 (pre-mega) — actual battle speed is 173 post-mega. Scarf Disable tech: permanently locks Scarf users since Shadow Tag prevents escape after their only move is disabled." },
  { name:"Incineroar", role:"PIVOT", clr:"#F0997B", bg:"#3D1A0A", ab:"Intimidate", item:"Shuca Berry", mv:["Darkest Lariat","Parting Shot","Fake Out","Protect"], spe:"82", stats:{HP:202,Atk:135,Def:156,SpA:90,SpD:110,Spe:82}, note:"Default lead partner. Shuca Berry specifically for Garchomp EQ. NEVER Parting Shot into Kingambit — Defiant +2 Atk. Dark type = immune to all Prankster moves." },
  { name:"Sableye", role:"DISRUPTOR", clr:"#B4B2A9", bg:"#222220", ab:"Prankster", item:"Focus Sash", mv:["Disable","Encore","Fake Out","Detect"], spe:"70", stats:{HP:157,Atk:95,Def:139,SpA:76,SpD:87,Spe:70}, note:"Priority Disable/Encore via Prankster. Dark types are immune to ALL Prankster moves. Combo: Sableye Encore + Gengar Disable locks both opponents simultaneously." },
  { name:"Primarina", role:"BACKUP PS", clr:"#ED93B1", bg:"#3A1525", ab:"Torrent", item:"Sitrus Berry", mv:["Draining Kiss","Flip Turn","Perish Song","Protect"], spe:"83", stats:{HP:186,Atk:84,Def:137,SpA:146,SpD:137,Spe:83}, note:"Bold — intentionally slow. Flip Turn fires LAST, safely returning Gengar during the mid-loop switch. Resists Dragon + Dark (good vs Hydreigon). Backup PS user." },
  { name:"Kommo-o", role:"PS IMMUNE", clr:"#5DCAA5", bg:"#0E2A1E", ab:"Soundproof", item:"Leftovers", mv:["Body Press","Draco Meteor","Iron Defense","Protect"], spe:"105", stats:{HP:182,Atk:117,Def:194,SpA:120,SpD:127,Spe:105}, note:"Soundproof = immune to Perish Song. Primary mid-loop switch target. Body Press 1HKOs Tyranitar and Kingambit. 24.7% teammate rate with Mega Gengar on ladder. Haban Berry variant better vs Hydreigon." },
  { name:"Tinkaton", role:"FLEX", clr:"#85B7EB", bg:"#0E1E30", ab:"Mold Breaker", item:"Metal Coat", mv:["Gigaton Hammer","Encore","Fake Out","Protect"], spe:"155 (Jolly)", stats:{HP:192,Atk:97,Def:102,SpA:81,SpD:125,Spe:155}, note:"Mold Breaker bypasses: Magic Bounce (Hatterene), Armor Tail / Queenly Majesty (Farigiraf / Serperior), and Mimikyu Disguise — Gigaton Hammer 1HKOs through Disguise. 3rd Fake Out option." },
];

export const THREATS_STATIC = [
  { name:"Mimikyu", tier:"S", isG:true, detail:"Ghost (escapes trap). Disguise converts 2HKOs into 3HKOs. Lake2's S-tier surprise pick.", counter:"Tinkaton Mold Breaker bypasses Disguise — Gigaton Hammer 1HKOs. Only reliable answer." },
  { name:"Zoroark-H", tier:"S", isG:true, detail:"Disguises as any ally — you never confirm who to target. Scarf Shadow Ball threatens Gengar 1HKO.", counter:"Assume it's present all game. Kommo-o / Incineroar safe switches. Tinkaton Gigaton Hammer." },
  { name:"Hydreigon", tier:"S", isG:false, detail:"Dark type = immune to all Prankster moves. Scarf potentially outspeeds Gengar. Can't hit with Shadow Ball effectively.", counter:"Primarina resists Dragon + Dark. Haban Berry Kommo-o. Disable Scarf = permanent lockout." },
  { name:"Mega Golurk", tier:"S", isG:false, detail:"Unseen Fist bypasses Protect with contact moves like Headlong Rush.", counter:"Double attack T1 instead of relying on Protect. Don't stall vs this Pokemon." },
  { name:"Mega Lopunny", tier:"S", isG:false, detail:"Scrappy Fake Out hits Ghost types — Gengar and Sableye. Normal type = Shadow Ball immune. U-turn escapes.", counter:"Tinkaton Fake Out wins priority. Must KO directly. Trapping unreliable due to U-turn." },
  { name:"Kingambit", tier:"S", isG:false, hasD:true, detail:"DEFIANT — +2 Atk from Parting Shot or Intimidate. Sucker Punch threats Gengar. Shadow Ball does nothing.", counter:"NEVER Parting Shot or Intimidate into it. Sableye Fake Out + Disable Kowtow Cleave. Kommo-o Body Press ignores Atk." },
  { name:"Kangaskhan", tier:"S", isG:false, detail:"Scrappy Fake Out hits Ghost types. Common Trick Room team anchor. Farigiraf next to it = nightmare.", counter:"Tinkaton Mold Breaker Fake Out wins priority. Disable Last Resort. Gengar Protect T1." },
  { name:"Delphox", tier:"S", isG:false, detail:"~134 base speed = faster than Mega Gengar (130 base). Psychic 1HKO potential vs Gengar.", counter:"Sableye Prankster Disable/Encore fires first regardless of speed." },
  { name:"Mega Gardevoir", tier:"A", isG:false, detail:"Psychic hits Gengar + Kommo-o super-effectively simultaneously. Moonblast threatens Kommo-o.", counter:"Tinkaton Gigaton Hammer. Shadow Ball from Gengar if faster. Keep Kommo-o away." },
  { name:"Hatterene", tier:"A", isG:false, detail:"Magic Bounce reflects Encore + Disable — Prankster or not. Trick Room anchor. Fairy/Psychic.", counter:"Tinkaton Mold Breaker ignores Magic Bounce — Encore/Fake Out work. Gigaton Hammer." },
  { name:"Gallade", tier:"A", isG:false, detail:"Scarf + Sharpness Psycho Cut = 1HKO Gengar. Leaf Blade hits Primarina. Sacred Sword hits Incineroar.", counter:"Disable Scarf = permanent lockout via Shadow Tag. Incineroar Fake Out T1." },
  { name:"Charizard-Mega-Y", tier:"A", isG:false, detail:"Drought. Heat Wave spread. Smart players alternate moves to dodge Disable.", counter:"Fake Out Charizard + Gengar Perish Song. Cannot escape Shadow Tag. Sableye Disable." },
  { name:"Serperior", tier:"A", isG:false, detail:"Queenly Majesty blocks ALL Fake Out. Sableye completely offline. Triple Axle vs Kommo-o.", counter:"Tinkaton Mold Breaker Fake Out bypasses Queenly Majesty. Hard switch Gengar." },
  { name:"Farigiraf", tier:"A", isG:false, detail:"Armor Tail blocks all Fake Out. Normal/Psychic = immune to Ghost moves. TR setter.", counter:"Tinkaton Mold Breaker Fake Out bypasses Armor Tail. Disable Trick Room." },
  { name:"Basculegion", tier:"A", isG:true, detail:"Ghost (escapes trap). Scarf Last Respects can outspeed + 1HKO Gengar after any KO.", counter:"Shadow Ball immediately. Never Perish Song. Keep KO count low." },
  { name:"Rotom-Wash", tier:"A", isG:false, detail:"Volt Switch escapes Shadow Tag like a pivot. Threatens Primarina with Electric.", counter:"Disable Volt Switch = permanently locked by Shadow Tag. Kommo-o resists Electric." },
  { name:"Aegislash", tier:"A", isG:true, detail:"Ghost (escapes trap). Shield form nearly undamageable. Shadow Sneak priority.", counter:"Double attack T1 in Blade form. Better handled in back 2 via Perish countdown." },
  { name:"Sneasler", tier:"LOVE", isG:false, detail:"Lake2: 'A complete bot vs Sableye/Gengar.' Can't Fake Out Ghosts. CC does 0. Dire Claw only option.", counter:"Lead Sableye + Gengar. Encore into Fake Out / CC. Disable Dire Claw. WANT to see this." },
  { name:"Mega Aggron", tier:"LOVE", isG:false, detail:"Lake2: 'Love to see.' Body Press does nothing into Ghosts. Encore Iron Defense = locked.", counter:"Encore Iron Defense. Disable Heavy Slam. Perish Song trap — cannot escape." },
];

export const WINCONS = [
  { arch:"Weather (Rain / Sun)", icon:"🌦", clr:"#85B7EB", plan:"Trap the weather setter first — Pelipper, Torkoal, Charizard-Y cannot escape Shadow Tag. Encore into Weather Ball with no weather active = Normal-type that cannot hit Gengar or Sableye. Stall weather turns with Protect to run out the clock." },
  { arch:"Trick Room", icon:"🔄", clr:"#C8A2E8", plan:"Perish Song countdown ignores speed — they still die in 3 turns regardless of TR. Protect through all 5 TR turns to waste the timer. Sableye Prankster Encore on TR setup fires first. Hatterene blocks Encore with Magic Bounce — use Tinkaton Mold Breaker exclusively." },
  { arch:"Hyper Offense", icon:"⚡", clr:"#D85A30", plan:"Their win condition: kill Gengar before PS activates. Your win condition: Fake Out T1 to steal tempo, PS T2, survive T3 via Protect / Kommo-o switch. Sneasler is a gift. Scarfed Garchomp: Disable its only move = permanently locked. Never Parting Shot into Kingambit." },
  { arch:"Ghost-Heavy Teams", icon:"👻", clr:"#AFA9EC", plan:"Ghost types escape Shadow Tag freely — your trap core fails against them. Must KO with Shadow Ball instead. Zoroark-H is the worst case — deception means you can't confirm targets. Shadow Ball any Ghost immediately, save PS for non-Ghost targets." },
  { arch:"Redirection (Sinistcha / Farigiraf)", icon:"🔀", clr:"#97C459", plan:"Tinkaton Mold Breaker Fake Out bypasses Armor Tail and Queenly Majesty — critical T1 play. Target the redirector first. Sinistcha is Ghost = Shadow Ball. Rage Powder redirects Body Press away from Kingambit next to it — be aware of this interaction." },
  { arch:"Normal-Type Blockers", icon:"🚫", clr:"#EF9F27", plan:"Shadow Ball does zero to Normal types (Lopunny, Kangaskhan). Scrappy Fake Out hits your Ghost types. Tinkaton Gigaton Hammer is your primary damage answer. Disable / Encore their other moves to lock them. Cannot rely on Gengar for damage vs these." },
];

export const SPEEDS = [
  ["Garchomp Scarfed","208","#D85A30"],
  ["Sneasler Jolly","189","#5DCAA5"],
  ["Gengar (battle)","173","#AFA9EC"],
  ["Delphox","~165","#FF4444"],
  ["Dragapult","162","#888"],
  ["A-Ninetales","161","#97C459"],
  ["Tinkaton","155","#85B7EB"],
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
  "Lopunny","Mega Lopunny",
];

export const SYSTEM_PROMPT = `You are an expert Pokemon Champions (Regulation M-A doubles) Perish Song trap coach. No filler. Precise and tactical.

MY TEAM:
1. Mega Gengar — Shadow Tag (post-mega), Gengarite | Shadow Ball/Perish Song/Protect/Disable-or-Sub. SPE 173 battle (Timid 8SP). ALWAYS in 4.
2. Incineroar — Intimidate, Shuca Berry | Darkest Lariat/Parting Shot/Fake Out/Protect. SPE 82. NEVER Parting Shot into Kingambit. Dark type = Prankster fails.
3. Sableye — Prankster, Focus Sash | Disable/Encore/Fake Out/Detect. SPE 70. Prankster fails on Dark types.
4. Primarina — Torrent, Sitrus Berry | Draining Kiss/Flip Turn/Perish Song/Protect. SPE 83. Slow Flip Turn fires last = returns Gengar safely. Good vs Hydreigon.
5. Kommo-o — Soundproof, Leftovers | Body Press/Draco Meteor/Iron Defense/Protect. SPE 105. Immune to PS. Body Press 1HKOs Tyranitar/Kingambit.
6. Tinkaton — Mold Breaker, Metal Coat | Gigaton Hammer/Encore/Fake Out/Protect. SPE 155. Bypasses Magic Bounce, Armor Tail, Queenly Majesty, Mimikyu Disguise.

SPEED TIERS: Gengar(battle)=173 > Tinkaton=155 > Kommo-o=105 > Primarina=83 > Incineroar=82 > Sableye=70

S-TIER THREATS: Mimikyu(Ghost+Disguise→Tinkaton 1HKO), Zoroark-H(Ghost+deception), Hydreigon(Dark immune to Prankster,Scarf→Primarina), Mega Golurk(Unseen Fist bypasses Protect), Mega Lopunny(Scrappy FO hits Ghosts,U-turn), Kingambit(Defiant,NEVER PS/Intimidate→Kommo-o Body Press), Kangaskhan(Scrappy FO hits Ghosts), Delphox(faster than Gengar base,Psychic 1HKO).
A-TIER: Mega Gardevoir, Hatterene(Magic Bounce→Tinkaton), Gallade(Scarf Sharpness Psycho Cut 1HKOs), Charizard-Y, Serperior(Queenly Majesty→Tinkaton), Farigiraf(Armor Tail→Tinkaton), Basculegion(Ghost+Scarf LR), Rotom-Wash(Volt Switch escapes), Aegislash(Ghost).
LOVE TO SEE: Sneasler(cannot touch Sableye/Gengar), Mega Aggron, Mega Kangaskhan.

KEY RULES:
- Ghost types escape Shadow Tag — Shadow Ball immediately, NEVER Perish Song them
- Disable on Scarfed Pokemon = permanent lockout (Shadow Tag + disabled only move = useless)
- Tinkaton Mold Breaker bypasses Magic Bounce/Armor Tail/Queenly Majesty/Disguise
- Prankster fails on ALL Dark types
- Baton Pass transfers Perish Song counter to the Pokemon that switches in
- Phantom Force (Dragapult) bypasses Protect

PS LOOPS:
Primary: T1 Incineroar Fake Out + Gengar Protect → T2 Gengar Perish Song + Incineroar Parting Shot into Kommo-o → T3 Gengar Protect → T4 both opponents die.
Alt (when Incineroar unsafe): Lead Primarina+Gengar → T1 Prim Perish Song + Gengar Protect → T2 Gengar switches to Kommo-o + Prim Flip Turn (fires last due to low speed) returns Gengar → T3 Gengar Protect → T4 both die.

Output ONLY these sections, no intro text:
**BRING 4:** [which 4 + brief reason each]
**LEAD:** [which 2 leads + why]
**TURN 1:** [exact move for each lead Pokemon]
**GAME PLAN:** [2-3 tactical sentences specific to this matchup]
**THREATS:** [dangerous Pokemon in their team + specific counter]
**BACKUP LINE:** [if primary game plan fails]
**ARCHETYPE:** [team type label + 1 sentence read]`;
