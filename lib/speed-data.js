// Champions Speed Tier Data — sourced from Pikalytics speed-tiers page
// Formula: stat = floor((base + SP + 20) × nature_multiplier)
// Nature: +spe = ×1.1, neutral = ×1.0, -spe = ×0.9
// Megas cannot hold Choice Scarf — locked to Mega Stone

function calc(base, sp, nature) {
  const m = nature === '+' ? 1.1 : nature === '-' ? 0.9 : 1.0;
  return Math.floor((base + sp + 20) * m);
}

// isMega: true = cannot hold scarf
// isGhost: true = escapes Shadow Tag
// Neutral 0 SP = base + 20 (base stat in Champions)
// All base speeds verified against Pikalytics Champions speed tier table
export const ALL_POKEMON = [
  {name:'Mega Aerodactyl',      base:150, isMega:true,  types:['Rock','Flying']},
  {name:'Mega Alakazam',        base:150, isMega:true,  types:['Psychic']},
  {name:'Mega Beedrill',        base:145, isMega:true,  types:['Bug','Poison']},
  {name:'Dragapult',            base:142, isMega:false, types:['Dragon','Ghost'], isGhost:true},
  {name:'Mega Greninja',        base:142, isMega:true,  types:['Water','Dark']},
  {name:'Mega Lopunny',         base:135, isMega:true,  types:['Normal','Fighting']},
  {name:'Mega Manectric',       base:135, isMega:true,  types:['Electric']},
  {name:'Mega Delphox',         base:134, isMega:true,  types:['Fire','Psychic']},
  {name:'Aerodactyl',           base:130, isMega:false, types:['Rock','Flying']},
  {name:'Jolteon',              base:130, isMega:false, types:['Electric']},
  {name:'Mega Gengar',          base:130, isMega:true,  types:['Ghost','Poison'], isGhost:true, isMyMon:true},
  {name:'Talonflame',           base:126, isMega:false, types:['Fire','Flying']},
  {name:'Weavile',              base:125, isMega:false, types:['Dark','Ice']},
  {name:'Meowstic',            base:104, isMega:false, types:['Psychic']},
  {name:'Mega Meowstic',       base:114, isMega:true,  types:['Psychic']},
  {name:'Meowscarada',          base:123, isMega:false, types:['Grass','Dark']},
  {name:'Noivern',              base:123, isMega:false, types:['Flying','Dragon']},
  {name:'Greninja',             base:122, isMega:false, types:['Water','Dark']},
  {name:'Mega Pidgeot',         base:121, isMega:true,  types:['Normal','Flying']},
  {name:'Alakazam',             base:120, isMega:false, types:['Psychic']},
  {name:'Mega Froslass',        base:120, isMega:true,  types:['Ice','Ghost'], isGhost:true},
  {name:'Mega Starmie',         base:120, isMega:true,  types:['Water','Psychic']},
  {name:'Sneasler',             base:120, isMega:false, types:['Fighting','Poison']},
  {name:'Hawlucha',             base:118, isMega:false, types:['Fighting','Flying']},
  {name:'Mega Hawlucha',        base:118, isMega:true,  types:['Fighting','Flying']},
  {name:'Salazzle',             base:117, isMega:false, types:['Poison','Fire']},
  {name:'Whimsicott',           base:116, isMega:false, types:['Grass','Fairy']},
  {name:'Archaludon',           base:116, isMega:false, types:['Steel','Dragon']},
  {name:'Mega Absol',           base:115, isMega:true,  types:['Dark']},
  {name:'Mega Houndoom',        base:115, isMega:true,  types:['Dark','Fire']},
  {name:'Starmie',              base:115, isMega:false, types:['Water','Psychic']},
  {name:'Serperior',            base:113, isMega:false, types:['Grass']},
  {name:'Lycanroc',             base:112, isMega:false, types:['Rock']},
  {name:'Mega Lucario',         base:112, isMega:true,  types:['Fighting','Steel']},
  {name:'Maushold',             base:111, isMega:false, types:['Normal']},
  {name:'Espeon',               base:110, isMega:false, types:['Psychic']},
  {name:'Froslass',             base:110, isMega:false, types:['Ice','Ghost'], isGhost:true},
  {name:'Gengar',               base:110, isMega:false, types:['Ghost','Poison'], isGhost:true},
  {name:'Mega Gallade',         base:110, isMega:true,  types:['Psychic','Fighting']},
  {name:'Mega Skarmory',        base:110, isMega:true,  types:['Steel','Flying']},
  {name:'Raichu',               base:110, isMega:false, types:['Electric']},
  {name:'Raichu-Alola',         base:110, isMega:false, types:['Electric','Psychic']},
  {name:'Tauros',               base:110, isMega:false, types:['Normal']},
  {name:'Zoroark-Hisui',        base:110, isMega:false, types:['Normal','Ghost'], isGhost:true},
  {name:'Heliolisk',            base:109, isMega:false, types:['Electric','Normal']},
  {name:'Ninetales-Alola',      base:109, isMega:false, types:['Ice','Fairy']},
  {name:'Infernape',            base:108, isMega:false, types:['Fire','Fighting']},
  {name:'Liepard',              base:106, isMega:false, types:['Dark']},
  {name:'Espathra',             base:105, isMega:false, types:['Psychic']},
  {name:'Lopunny',              base:105, isMega:false, types:['Normal']},
  {name:'Manectric',            base:105, isMega:false, types:['Electric']},
  {name:'Rotom-Wash',           base:104, isMega:false, types:['Electric','Water']},
  {name:'Rotom-Heat',           base:104, isMega:false, types:['Electric','Fire']},
  {name:'Rotom-Frost',          base:104, isMega:false, types:['Electric','Ice']},
  {name:'Rotom-Fan',            base:104, isMega:false, types:['Electric','Flying']},
  {name:'Rotom-Mow',            base:104, isMega:false, types:['Electric','Grass']},
  {name:'Garchomp',             base:102, isMega:false, types:['Dragon','Ground']},
  {name:'Tinkaton',             base:94,  isMega:false, types:['Steel','Fairy'], isMyMon:true},
  // Base 100
  {name:'Charizard',            base:100, isMega:false, types:['Fire','Flying']},
  {name:'Mega Charizard X',     base:100, isMega:true,  types:['Fire','Dragon']},
  {name:'Mega Charizard Y',     base:100, isMega:true,  types:['Fire','Flying']},
  {name:'Mega Salamence',       base:100, isMega:true,  types:['Dragon','Flying']},
  {name:'Pidgeot',              base:100, isMega:false, types:['Normal','Flying']},
  {name:'Mega Blaziken',        base:100, isMega:true,  types:['Fire','Fighting']},
  // Base 98
  {name:'Hydreigon',            base:98,  isMega:false, types:['Dark','Dragon']},
  // Base 95
  {name:'Mega Altaria',         base:95,  isMega:true,  types:['Dragon','Fairy']},
  {name:'Mega Camerupt',        base:20,  isMega:true,  types:['Fire','Ground']},
  // Base 92
  {name:'Mega Garchomp',        base:92,  isMega:true,  types:['Dragon','Ground']},
  // Base 90
  // REMOVED: Electivire - not in Champions Reg M-A roster
  {name:'Dragonite',            base:80,  isMega:false, types:['Dragon','Flying']},
  {name:'Mega Dragonite',       base:100, isMega:true,  types:['Dragon','Flying']},
  // Base 88 - Mega Metagross
  // REMOVED: Mega Metagross - not in Champions Reg M-A roster
  // Base 87
  {name:'Gallade',              base:80,  isMega:false, types:['Psychic','Fighting']},
  // Base 85
  {name:'Kommo-o',              base:85,  isMega:false, types:['Dragon','Fighting'], isMyMon:true},
  {name:'Krookodile',           base:92,  isMega:false, types:['Ground','Dark']},
  {name:'Arcanine',             base:95,  isMega:false, types:['Fire']},
  {name:'Kleavor',              base:92,  isMega:false, types:['Bug','Rock']},
  // Base 86
  {name:'Salamence',            base:100, isMega:false, types:['Dragon','Flying']},
  // Base 82
  {name:'Kingambit',            base:50,  isMega:false, types:['Dark','Steel']},
  // Base 81
  {name:'Milotic',              base:81,  isMega:false, types:['Water']},
  // Base 80
  {name:'Mega Ampharos',        base:80,  isMega:true,  types:['Electric','Dragon']},
  {name:'Mega Gyarados',        base:81,  isMega:true,  types:['Water','Dark']},
  {name:'Gyarados',             base:81,  isMega:false, types:['Water','Flying']},
  // Based on verified data
  {name:'Heracross',            base:85,  isMega:false, types:['Bug','Fighting']},
  {name:'Mega Heracross',       base:75,  isMega:true,  types:['Bug','Fighting']},
  {name:'Excadrill',            base:88,  isMega:false, types:['Ground','Steel']},
  {name:'Lucario',              base:90,  isMega:false, types:['Fighting','Steel']},
  {name:'Tyranitar',            base:61,  isMega:false, types:['Rock','Dark']},
  {name:'Mega Tyranitar',       base:71,  isMega:true,  types:['Rock','Dark']},
  {name:'Gardevoir',            base:80,  isMega:false, types:['Psychic','Fairy']},
  {name:'Mega Gardevoir',       base:100, isMega:true,  types:['Psychic','Fairy']},
  {name:'Blaziken',             base:80,  isMega:false, types:['Fire','Fighting']},
  {name:'Medicham',             base:60,  isMega:false, types:['Fighting','Psychic']},
  {name:'Mega Medicham',        base:100, isMega:true,  types:['Fighting','Psychic']},
  // Basculegion - base speed differs in Champions
  {name:'Basculegion',          base:78,  isMega:false, types:['Water','Ghost'], isGhost:true},
  // Sinistcha
  {name:'Sinistcha',            base:70,  isMega:false, types:['Grass','Ghost'], isGhost:true},
  // Key Pokemon
  {name:'Primarina',            base:60,  isMega:false, types:['Water','Fairy'], isMyMon:true},
  {name:'Incineroar',           base:60,  isMega:false, types:['Fire','Dark'], isMyMon:true},
  {name:'Sableye',              base:50,  isMega:false, types:['Dark','Ghost'], isMyMon:true},
  {name:'Pelipper',             base:65,  isMega:false, types:['Water','Flying']},
  {name:'Politoed',             base:70,  isMega:false, types:['Water']},
  {name:'Hatterene',            base:29,  isMega:false, types:['Psychic','Fairy']},
  {name:'Farigiraf',            base:60,  isMega:false, types:['Normal','Psychic']},
  {name:'Mimikyu',              base:96,  isMega:false, types:['Ghost','Fairy'], isGhost:true},
  {name:'Aegislash',            base:60,  isMega:false, types:['Steel','Ghost'], isGhost:true},
  {name:'Whimsicott',           base:116, isMega:false, types:['Grass','Fairy']},
  {name:'Torkoal',              base:20,  isMega:false, types:['Fire']},
  {name:'Corviknight',          base:67,  isMega:false, types:['Steel','Flying']},
  {name:'Scizor',               base:65,  isMega:false, types:['Bug','Steel']},
  {name:'Mega Scizor',          base:75,  isMega:true,  types:['Bug','Steel']},
  {name:'Mega Kangaskhan',      base:100, isMega:true,  types:['Normal']},
  {name:'Kangaskhan',           base:90,  isMega:false, types:['Normal']},
  {name:'Oranguru',             base:60,  isMega:false, types:['Normal','Psychic']},
  // REMOVED: Togekiss - not in Champions Reg M-A roster
  {name:'Vivillon',             base:89,  isMega:false, types:['Bug','Flying']},
  {name:'Ampharos',             base:55,  isMega:false, types:['Electric']},
  {name:'Altaria',              base:80,  isMega:false, types:['Dragon','Flying']},
  {name:'Camerupt',             base:40,  isMega:false, types:['Fire','Ground']},
  {name:'Aggron',               base:50,  isMega:false, types:['Steel','Rock']},
  {name:'Mega Aggron',          base:50,  isMega:true,  types:['Steel']},
  // REMOVED: Metagross - not in Champions Reg M-A roster
  {name:'Goodra',               base:80,  isMega:false, types:['Dragon']},
  {name:'Palafin',              base:100, isMega:false, types:['Water']},
  {name:'Quaquaval',            base:85,  isMega:false, types:['Water','Fighting']},
  {name:'Ceruledge',            base:85,  isMega:false, types:['Fire','Ghost'], isGhost:true},
  {name:'Gholdengo',            base:84,  isMega:false, types:['Steel','Ghost'], isGhost:true},
  {name:'Baxcalibur',           base:87,  isMega:false, types:['Dragon','Ice']},
  {name:'Glimmora',             base:86,  isMega:false, types:['Rock','Poison']},
  {name:'Skeledirge',           base:66,  isMega:false, types:['Fire','Ghost'], isGhost:true},
  {name:'Scovillain',           base:75,  isMega:false, types:['Grass','Fire']},
  {name:'Mega Scovillain',      base:95,  isMega:true,  types:['Grass','Fire']},
  {name:'Klefki',               base:75,  isMega:false, types:['Steel','Fairy']},
  {name:'Gourgeist',            base:84,  isMega:false, types:['Ghost','Grass'], isGhost:true},
  {name:'Sylveon',              base:60,  isMega:false, types:['Fairy']},
  {name:'Umbreon',              base:65,  isMega:false, types:['Dark']},
  {name:'Vaporeon',             base:65,  isMega:false, types:['Water']},
  {name:'Flareon',              base:65,  isMega:false, types:['Fire']},
  {name:'Leafeon',              base:95,  isMega:false, types:['Grass']},
  {name:'Glaceon',              base:65,  isMega:false, types:['Ice']},
  {name:'Meganium',             base:80,  isMega:false, types:['Grass']},
  {name:'Typhlosion',           base:100, isMega:false, types:['Fire']},
  {name:'Typhlosion-Hisui',     base:100, isMega:false, types:['Fire','Ghost'], isGhost:true},
  {name:'Feraligatr',           base:78,  isMega:false, types:['Water']},
  {name:'Slowbro',              base:30,  isMega:false, types:['Water','Psychic']},
  {name:'Mega Slowbro',         base:30,  isMega:true,  types:['Water','Psychic']},
  {name:'Snorlax',              base:30,  isMega:false, types:['Normal']},
  {name:'Chandelure',           base:80,  isMega:false, types:['Ghost','Fire'], isGhost:true},
  {name:'Hydreigon',            base:98,  isMega:false, types:['Dark','Dragon']},
  {name:'Zoroark',              base:105, isMega:false, types:['Dark']},
  // REMOVED: Mismagius - not in Champions Reg M-A roster
  // REMOVED: Drifblim - not in Champions Reg M-A roster
  {name:'Volcarona',            base:100, isMega:false, types:['Bug','Fire']},
  {name:'Golurk',               base:55,  isMega:false, types:['Ground','Ghost'], isGhost:true},
  {name:'Mega Golurk',          base:75,  isMega:true,  types:['Ground','Ghost'], isGhost:true},
  // REMOVED: Hitmontop - not in Champions Reg M-A roster
  {name:'Abomasnow',            base:60,  isMega:false, types:['Grass','Ice']},
  {name:'Banette',              base:65,  isMega:false, types:['Ghost'], isGhost:true},
  {name:'Mega Banette',         base:65,  isMega:true,  types:['Ghost'], isGhost:true},
  // REMOVED: Dusknoir - not in Champions Reg M-A roster
  {name:'Armarouge',            base:75,  isMega:false, types:['Fire','Psychic']},
  // REMOVED: Latias - not in Champions Reg M-A roster
  // REMOVED: Latios - not in Champions Reg M-A roster
  // REMOVED: Flyeon - not in Champions Reg M-A roster
  {name:'Talonflame',           base:126, isMega:false, types:['Fire','Flying']},
  {name:'Florges',              base:75,  isMega:false, types:['Fairy']},
  {name:'Floette-Eternal',      base:92,  isMega:false, types:['Fairy']},
  {name:'Wishiwashi',           base:40,  isMega:false, types:['Water']},
];

// Remove duplicates by name
const seen = new Set();
export const SPEED_DATA = ALL_POKEMON.filter(p => {
  if (seen.has(p.name)) return false;
  seen.add(p.name);
  return true;
}).sort((a, b) => b.base - a.base);

// Compute speed for given SP and nature
export function getSpeed(base, sp, nature) {
  const m = nature === '+' ? 1.1 : nature === '-' ? 0.9 : 1.0;
  return Math.floor((base + sp + 20) * m);
}

// Scarf speed (only for non-megas)
export function getScarfSpeed(base, sp, nature) {
  return Math.floor(getSpeed(base, sp, nature) * 1.5);
}
