import { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';
import { TEAM_DEFAULT, THREATS_STATIC, WINCONS, POKEMON_LIST } from '../lib/data';
import { META_DB, TYPE_COLORS, MOVE_TYPES, COMMON_LEADS, getPokemonImage } from '../lib/pokemon-data';
import { SPEED_DATA, getSpeed, getScarfSpeed } from '../lib/speed-data';

// ── Constants ─────────────────────────────────────────────────────────────────
const SC = {HP:'#5DCAA5',Atk:'#F0997B',Def:'#85B7EB',SpA:'#AFA9EC',SpD:'#97C459',Spe:'#EF9F27'};
const TIER_CLR = {S:'#FF4444',A:'#EF9F27',B:'#85B7EB',C:'#808080',LOVE:'#5DCAA5',CORE:'#AFA9EC'};
const TIER_LABEL = {S:'S — Cringe To See',A:'A — Big Threat',B:'B — Manageable',LOVE:'Love To See'};
const SEC_ICONS = {'BRING 4':'👥','LEAD':'▶','TURN 1':'⚔','GAME PLAN':'🗺','THREATS':'⚠','BACKUP LINE':'↩','ARCHETYPE':'🏷'};
const SEC_CLRS = {'BRING 4':'#5DCAA5','LEAD':'#AFA9EC','TURN 1':'#EF9F27','GAME PLAN':'#85B7EB','THREATS':'#F0997B','BACKUP LINE':'#ED93B1','ARCHETYPE':'#C8A2E8'};
const GHOST_LIST = ['gengar','basculegion','sinistcha','dragapult','froslass','aegislash','mimikyu','zoroark-h','zoroark-hisui','hisui typhlosion','typhlosion-hisui','mismagius','chandelure','gourgeist','drifblim','ceruledge','gholdengo','skeledirge','mega golurk'];
const DEFIANT_LIST = ['kingambit'];
const ARMOR_LIST = ['farigiraf','serperior'];
const MY_NAMES = ['Mega Gengar','Incineroar','Sableye','Primarina','Kommo-o','Tinkaton'];
const LEAD_PAIRS = ['Mega Gengar + Incineroar','Mega Gengar + Sableye','Mega Gengar + Tinkaton','Mega Gengar + Primarina','Mega Gengar + Kommo-o'];

function norm(s){return(s||'').toLowerCase().trim();}
function findMons(list,arr){return arr.filter(Boolean).filter(o=>list.some(l=>norm(o).includes(norm(l))));}

function detectArchetype(team){
  const o=team.map(p=>norm(p));
  if(o.some(p=>['farigiraf','hatterene','camerupt','golurk','oranguru','musharna'].some(k=>p.includes(k))))return'Trick Room';
  if(o.some(p=>['pelipper','politoed'].some(k=>p.includes(k))))return'Rain';
  if(o.some(p=>['torkoal'].some(k=>p.includes(k))||p.includes('charizard')))return'Sun';
  if(o.some(p=>['tyranitar','excadrill'].some(k=>p.includes(k))))return'Sand';
  if(o.some(p=>['ninetales-alola','abomasnow','froslass'].some(k=>p.includes(k))))return'Snow';
  if(o.filter(p=>GHOST_LIST.some(g=>p.includes(g))).length>=2)return'Ghost-Heavy';
  if(o.some(p=>['talonflame','aerodactyl','whimsicott','suicune'].some(k=>p.includes(k))))return'Tailwind';
  if(o.some(p=>['gengar'].some(k=>p.includes(k)))&&o.some(p=>['sableye','incineroar','primarina'].some(k=>p.includes(k))))return'Perish Trap';
  if(o.some(p=>['sneasler','kingambit'].some(k=>p.includes(k)))&&o.some(p=>['garchomp','basculegion'].some(k=>p.includes(k))))return'Hyper Offense';
  return'Balanced';
}

function dangerScore(team){
  let s=0;
  team.filter(Boolean).forEach(p=>{
    const n=norm(p);
    if(['kingambit','mimikyu','zoroark','golurk','lopunny','kangaskhan'].some(k=>n.includes(k)))s+=2;
    if(['hydreigon','gallade','hatterene','delphox','gardevoir'].some(k=>n.includes(k)))s+=1.5;
    if(GHOST_LIST.some(g=>n.includes(g)))s+=1.2;
    if(['serperior','farigiraf'].some(k=>n.includes(k)))s+=1;
    if(n.includes('sneasler'))s-=1;
  });
  return Math.min(10,Math.max(0,Math.round(s)));
}

function predictLeads(opponents){
  const opp=opponents.filter(Boolean).map(p=>norm(p));
  const leads=[];
  opp.forEach(p=>{
    for(const[key,data]of Object.entries(COMMON_LEADS)){
      if(p.includes(key)){
        const partner=data.partners.find(pt=>opp.some(o=>o.includes(norm(pt))))||data.partners[0];
        if(!leads.some(l=>l.p1.toLowerCase()===key))leads.push({p1:key.charAt(0).toUpperCase()+key.slice(1),p2:partner,pct:data.pct});
      }
    }
  });
  return leads.slice(0,2);
}

function parseResult(text){
  const keys=['BRING 4','LEAD','TURN 1','GAME PLAN','THREATS','BACKUP LINE','ARCHETYPE'];
  const out={};
  keys.forEach((k,i)=>{
    const p=new RegExp(`\\*\\*${k}[:\\*]*\\*?\\s*`,'i');
    const idx=text.search(p);
    if(idx===-1)return;
    let end=text.length;
    for(let j=i+1;j<keys.length;j++){
      const ni=text.search(new RegExp(`\\*\\*${keys[j]}[:\\*]*\\*?\\s*`,'i'));
      if(ni>idx&&ni<end){end=ni;break;}
    }
    out[k]=text.slice(idx,end).replace(p,'').replace(/\*\*/g,'').trim();
  });
  if(!Object.keys(out).length)out['ANALYSIS']=text;
  return out;
}

// ── Shared UI ─────────────────────────────────────────────────────────────────
function TypeBadge({type}){return <span className="type-badge" style={{background:TYPE_COLORS[type]||'#666'}}>{type}</span>;}

function MoveWithType({move}){
  const type=MOVE_TYPES[move];
  const bg=TYPE_COLORS[type]||null;
  return(
    <span className="move-pill">
      <span style={{color:'var(--text)'}}>{move}</span>
      {bg&&<span className="move-type-badge" style={{background:bg}}>{type}</span>}
    </span>
  );
}

function MetaCard({name}){
  const n=norm(name);
  const data=Object.values(META_DB).find(d=>norm(d.name)===n||n.includes(norm(d.name).split('-')[0].split(' ').slice(-1)[0])||norm(d.name).includes(n.split(' ').slice(-1)[0]));
  if(!data)return null;
  return(
    <div className="meta-card">
      <div style={{display:'flex',gap:14,alignItems:'flex-start',marginBottom:12}}>
        <img src={getPokemonImage(name)} className="poke-img-sm" alt={name} onError={e=>{e.target.style.display='none';}}/>
        <div style={{flex:1}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',flexWrap:'wrap',gap:6}}>
            <div>
              <span style={{fontSize:15,fontWeight:600,color:TIER_CLR[data.tier]||'var(--text)',marginRight:8}}>{data.name}</span>
              <div style={{display:'flex',gap:4,marginTop:4,flexWrap:'wrap'}}>
                {(data.types||[]).map(t=><TypeBadge key={t} type={t}/>)}
              </div>
            </div>
            <div style={{textAlign:'right'}}>
              <div className="mono" style={{fontSize:11,color:'var(--t3)'}}>Usage {data.usage}%</div>
              <div className="mono" style={{fontSize:13,fontWeight:700,color:data.wr>=58?'var(--teal)':data.wr>=54?'var(--amber)':'var(--coral)'}}>{data.wr}% WR</div>
            </div>
          </div>
          {data.keyWarning&&<p className="mono" style={{fontSize:11,color:data.tier==='S'?'#FF8888':data.tier==='LOVE'?'var(--teal)':'var(--amber)',marginTop:6,lineHeight:1.55}}>{data.keyWarning}</p>}
        </div>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
        <div>
          <span className="sec-label">Top Moves</span>
          {(data.moves||[]).slice(0,5).map(({m,pct})=>(
            <div key={m} style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:6}}>
              <MoveWithType move={m}/>
              <span className="mono" style={{fontSize:11,color:'var(--t3)',minWidth:38,textAlign:'right'}}>{pct}%</span>
            </div>
          ))}
        </div>
        <div>
          <span className="sec-label">Items</span>
          {(data.items||[]).slice(0,3).map(({i,pct})=>(
            <div key={i} style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:6}}>
              <span className="mono" style={{fontSize:12,color:'var(--t2)'}}>{i}</span>
              <span className="mono" style={{fontSize:11,color:'var(--amber)'}}>{pct}%</span>
            </div>
          ))}
          <span className="sec-label" style={{marginTop:10}}>Ability</span>
          {(data.abilities||[]).slice(0,2).map(({a,pct})=>(
            <div key={a} style={{display:'flex',justifyContent:'space-between',marginBottom:5}}>
              <span className="mono" style={{fontSize:12,color:'var(--purple)'}}>{a}</span>
              <span className="mono" style={{fontSize:11,color:'var(--t3)'}}>{pct}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Speed Tiers Tab ───────────────────────────────────────────────────────────
function SpeedTab(){
  const [nature,setNature]=useState('neutral');
  const [sp,setSp]=useState(32);
  const [search,setSearch]=useState('');

  const spOptions=[{v:32,l:'+32 SP'},{v:16,l:'+16 SP'},{v:8,l:'+8 SP'},{v:0,l:'0 SP'}];

  const data=SPEED_DATA.map(p=>{
    const spd=getSpeed(p.base,sp,nature==='+spe'?'+':nature==='-spe'?'-':'0');
    const scarfSpd=!p.isMega?getScarfSpeed(p.base,sp,nature==='+spe'?'+':nature==='-spe'?'-':'0'):null;
    return{...p,spd,scarfSpd};
  }).sort((a,b)=>b.spd-a.spd).filter(p=>!search||p.name.toLowerCase().includes(search.toLowerCase()));

  const myGengar=data.find(p=>p.name==='Mega Gengar');

  return(
    <div>
      {/* Controls */}
      <div className="card" style={{marginBottom:20}}>
        <div style={{display:'flex',gap:16,alignItems:'center',flexWrap:'wrap'}}>
          <div>
            <span className="sec-label">Nature</span>
            <div style={{display:'flex',gap:6}}>
              {[{v:'+spe',l:'+SPE',c:'var(--teal)'},{v:'neutral',l:'NEUTRAL',c:'var(--t2)'},{v:'-spe',l:'−SPE',c:'var(--coral)'}].map(n=>(
                <button key={n.v} className="btn-sm" onClick={()=>setNature(n.v)} style={nature===n.v?{background:n.c+'22',color:n.c,borderColor:n.c}:{}}>{n.l}</button>
              ))}
            </div>
          </div>
          <div>
            <span className="sec-label">Speed EVs (SP)</span>
            <div style={{display:'flex',gap:6}}>
              {spOptions.map(o=>(
                <button key={o.v} className="btn-sm" onClick={()=>setSp(o.v)} style={sp===o.v?{background:'var(--acc)',color:'#fff',borderColor:'var(--acc)'}:{}}>{o.l}</button>
              ))}
            </div>
          </div>
          <div style={{marginLeft:'auto'}}>
            <span className="sec-label">Search</span>
            <input className="pi" style={{width:200}} placeholder="Pokemon name..." value={search} onChange={e=>setSearch(e.target.value)}/>
          </div>
        </div>
        {myGengar&&(
          <div style={{marginTop:12,padding:'10px 14px',background:'rgba(83,74,183,0.1)',borderRadius:8,border:'1px solid rgba(83,74,183,0.3)'}}>
            <span className="mono" style={{fontSize:13,color:'var(--purple)',fontWeight:700}}>
              Your Mega Gengar: {myGengar.spd} speed
              <span style={{marginLeft:12,color:'var(--t3)',fontWeight:400}}>
                ({nature==='+spe'?'Timid':nature==='-spe'?'Modest':'Neutral'}, {sp} SP)
              </span>
            </span>
          </div>
        )}
      </div>

      {/* Legend */}
      <div style={{display:'flex',gap:20,marginBottom:14,flexWrap:'wrap'}}>
        <div style={{display:'flex',alignItems:'center',gap:8}}><div style={{width:18,height:18,borderRadius:4,background:'rgba(83,74,183,0.15)',border:'1px solid rgba(83,74,183,0.4)'}}/><span className="mono" style={{fontSize:12,color:'var(--t2)'}}>Your Team</span></div>
        <div style={{display:'flex',alignItems:'center',gap:8}}><div style={{width:18,height:18,borderRadius:4,background:'rgba(255,68,68,0.08)',border:'1px solid rgba(255,68,68,0.3)'}}/><span className="mono" style={{fontSize:12,color:'var(--t2)'}}>Ghost Type (Escapes Shadow Tag)</span></div>
        <div style={{display:'flex',alignItems:'center',gap:8}}><div style={{width:18,height:18,borderRadius:4,background:'rgba(239,159,39,0.1)',border:'1px solid rgba(239,159,39,0.3)'}}/><span className="mono" style={{fontSize:12,color:'var(--t2)'}}>Mega (no Scarf)</span></div>
        <div style={{marginLeft:'auto'}}><span className="mono" style={{fontSize:12,color:'var(--t3)'}}>Formula: (Base + SP + 20) × Nature</span></div>
      </div>

      <div style={{overflowX:'auto'}}>
        <table className="speed-table">
          <thead>
            <tr>
              <th style={{width:36}}></th>
              <th>Pokemon</th>
              <th>Types</th>
              <th className="num" style={{minWidth:90}}>Base Spe</th>
              <th className="num" style={{minWidth:90}}>Speed</th>
              <th className="num" style={{minWidth:100}}>Scarf ×1.5</th>
            </tr>
          </thead>
          <tbody>
            {data.map((p,i)=>{
              const prev=data[i-1];
              const bigGap=prev&&(prev.spd-p.spd)>=10;
              return(
                <>
                  {bigGap&&<tr key={`gap-${i}`}><td colSpan={6} style={{padding:'4px 0',borderBottom:'1px dashed var(--b2)'}}></td></tr>}
                  <tr key={p.name} className={`${p.isMyMon?'my-mon':''}${p.isGhost&&!p.isMyMon?' ghost-mon':''}${p.isMega&&!p.isMyMon?' mega-row':''}`}>
                    <td><img src={getPokemonImage(p.name)} className="poke-img-xs" alt={p.name} onError={e=>{e.target.style.display='none';}} style={{display:'block'}}/></td>
                    <td>
                      <span style={{fontWeight:600,color:p.isMyMon?'var(--purple)':p.isGhost?'#FF8888':'var(--text)',fontSize:14}}>
                        {p.name}
                      </span>
                      {p.isMyMon&&<span className="mono" style={{fontSize:10,color:'var(--purple)',marginLeft:8,background:'rgba(83,74,183,0.2)',padding:'1px 6px',borderRadius:4}}>YOURS</span>}
                      {p.isGhost&&!p.isMyMon&&<span className="mono" style={{fontSize:10,color:'#FF6666',marginLeft:8}}>⛔ Ghost</span>}
                      {p.isMega&&!p.isMyMon&&<span className="mono" style={{fontSize:10,color:'var(--amber)',marginLeft:8}}>Mega</span>}
                    </td>
                    <td><div style={{display:'flex',gap:4,flexWrap:'wrap'}}>{(p.types||[]).map(t=><TypeBadge key={t} type={t}/>)}</div></td>
                    <td className="num" style={{color:'var(--t3)'}}>{p.base}</td>
                    <td className="num" style={{fontSize:15,color:p.isMyMon?'var(--purple)':p.isGhost?'#FF8888':'var(--text)'}}>{p.spd}</td>
                    <td className="num">
                      {p.isMega?(
                        <span className="mono" style={{fontSize:11,color:'var(--t4)'}}>— Mega</span>
                      ):(
                        <span className="mono" style={{fontSize:13,color:'var(--amber)',fontWeight:700}}>{p.scarfSpd}</span>
                      )}
                    </td>
                  </tr>
                </>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Archetypes Tab ────────────────────────────────────────────────────────────
const ARCH_DEFS = [
  {id:'perish',name:'Perish Trap',sub:'Shadow Tag + Perish Song',clr:'#AFA9EC',bg:'linear-gradient(135deg,#1a0a2e,#2d1550)',icon:'👻'},
  {id:'rain',name:'Rain',sub:'Drizzle + Swift Swim',clr:'#85B7EB',bg:'linear-gradient(135deg,#0a1228,#1a3060)',icon:'🌧'},
  {id:'sun',name:'Sun',sub:'Drought + Solar Power',clr:'#EF9F27',bg:'linear-gradient(135deg,#1e0e00,#502800)',icon:'☀️'},
  {id:'sand',name:'Sand',sub:'Sand Stream + Sand Rush',clr:'#B4A080',bg:'linear-gradient(135deg,#1a1208,#3a2a10)',icon:'🏜'},
  {id:'snow',name:'Snow',sub:'Snow Warning + Slush Rush',clr:'#88CCDD',bg:'linear-gradient(135deg,#0a1820,#1a3040)',icon:'❄️'},
  {id:'tailwind',name:'Tailwind',sub:'Speed Control',clr:'#97C459',bg:'linear-gradient(135deg,#081808,#183018)',icon:'💨'},
  {id:'trick-room',name:'Trick Room',sub:'Slowest Mon Wins',clr:'#C8A2E8',bg:'linear-gradient(135deg,#180828,#301050)',icon:'🔄'},
  {id:'ho',name:'Hyper Offense',sub:'Raw Power',clr:'#F0997B',bg:'linear-gradient(135deg,#200808,#501818)',icon:'⚡'},
];

const PS_GUIDE_ARCHETYPES = {
  incineroar:{name:'Incineroar Lead',sub:'Most straightforward',clr:'#F0997B',summary:'Lead Incineroar + Gengar. Fake Out the biggest threat, Perish Song immediately. Most counters come from two simultaneous Gengar threats.',turns:[{c:'T1',p1:{m:'Incineroar',mv:'Fake Out (biggest threat)',d:'Priority — flinches target'},p2:{m:'Mega Gengar',mv:'Protect',d:'Safe from Fake Out and priority'},n:'Perish Song countdown starts T2 when you use PS.'},
  {c:'T2 (PS sets)',p1:{m:'Incineroar',mv:'Parting Shot → Kommo-o',d:'Slow speed fires late — Gengar enters safely'},p2:{m:'Mega Gengar',mv:'Perish Song',d:'Both opponents now trapped for 3 turns'},n:'Parting Shot debuffs AND brings Kommo-o in safely. Gengar enters after attacks fire.'},
  {c:'T3 (PS=2)',p1:{m:'Kommo-o',mv:'Protect',d:'Soundproof — immune to own PS'},p2:{m:'Mega Gengar',mv:'Protect',d:'Double protect. Count ticks to 2.'},n:'Optional: Disable/Encore if opponent threatens to disrupt. Kommo-o Disable is your second action.'},
  {c:'T4 (PS=1)',p1:{m:'Kommo-o',mv:'Hard Switch OUT',d:'Switch to bulky resist'},p2:{m:'Mega Gengar',mv:'Hard Switch OUT',d:'Switch to refresh PS timer'},n:'Both switch out simultaneously. On T5, trapped opponents die from PS=0.'},
  {c:'T5 (PS=0 — WIN)',p1:{m:'Switch-in',mv:'Protect',d:'Absorb final damage'},p2:{m:'Gengar returns',mv:'Protect',d:'Gengar back, PS-free, ready to reset'},n:'Both opponents die. You are up 4v2. Set PS immediately again.'}]},
  sableye:{name:'Sableye Lead',sub:'Most versatile, highest ceiling',clr:'#B4B2A9',summary:'Most flexible lead. Works vs almost anything. No pivot move — both Pokemon stay until PS count = 0. Best vs teams with Sneasler (completely useless vs Ghosts).',turns:[{c:'Option A',p1:{m:'Sableye',mv:'Fake Out (Prankster)',d:'Priority — target single biggest threat'},p2:{m:'Mega Gengar',mv:'Perish Song',d:'Immediate if only one Gengar threat'},n:'If only one threat to Gengar, mirror the Incineroar line from here.'},
  {c:'Option B',p1:{m:'Sableye',mv:'Disable (Prankster)',d:'Disable the FASTER threat regardless of speed'},p2:{m:'Mega Gengar',mv:'Disable',d:'Disable the SLOWER threat'},n:'Use when two threats exist. Double Protect first, then double Disable the moves they used.'},
  {c:'PS setup',p1:{m:'Sableye',mv:'Encore (Prankster)',d:'Lock disabled target into useless move'},p2:{m:'Mega Gengar',mv:'Perish Song',d:'Once opponents neutralized via Disable/Encore'},n:'Dream scenario: Encore one opponent, Disable the other = both offline simultaneously.'},
  {c:'Count 0 (no pivot)',p1:{m:'Sableye',mv:'Hard Switch OUT / Sacrifice',d:'No Flip Turn or Parting Shot available'},p2:{m:'Mega Gengar',mv:'Hard Switch OUT',d:'Both hard switch simultaneously'},n:"Lake2: 'Let Sableye go down sometimes if needed — Gengar enters off the KO. Shadow Tag never left the field.'"}]},
  primarina:{name:'Primarina Lead',sub:'Double PS — high risk/reward',clr:'#ED93B1',summary:'Whoever is threatened Protects, the other uses PS. Slow Flip Turn fires LAST safely returning Gengar. Substitute on Gengar makes this much cleaner.',turns:[{c:'T1 — Gengar threatened',p1:{m:'Primarina',mv:'Perish Song',d:'Safer slot uses PS'},p2:{m:'Mega Gengar',mv:'Protect',d:'Protected from threats'},n:'Gengar cannot Protect again T2 (consecutive Protect fails at 50%). Must act or switch.'},
  {c:'T1 — Prim threatened',p1:{m:'Primarina',mv:'Protect',d:'Protect threatened slot'},p2:{m:'Mega Gengar',mv:'Perish Song',d:'Gengar uses PS from safer position'},n:'Read which slot is safer. This is the core decision of Primarina archetype.'},
  {c:'T2 (PS=3→2)',p1:{m:'Primarina',mv:'Flip Turn (FIRES LAST)',d:'Low speed = fires after all attacks. Gengar safe.'},p2:{m:'Mega Gengar',mv:'Switch → Kommo-o',d:'Manual switch. Kommo-o immune to PS.'},n:'Gengar switches to Kommo-o, Prim Flip Turns last — returning Gengar. Gengar is now PS-free.'},
  {c:'T3-5',p1:{m:'Kommo-o slot',mv:'Hard Switch / Protect',d:''},p2:{m:'Mega Gengar',mv:'Protect then Switch',d:''},n:'Lake2: Substitute on Gengar turns this into a much cleaner loop — adds buffer turn for double Protect.'}]},
};

function PSGuideTab(){
  const [sel,setSel]=useState('incineroar');
  const arch=PS_GUIDE_ARCHETYPES[sel];
  return(
    <div>
      <div className="sub-tabs" style={{marginBottom:20}}>
        {Object.entries(PS_GUIDE_ARCHETYPES).map(([k,a])=>(
          <button key={k} className={`sub-tab${sel===k?' on':''}`} onClick={()=>setSel(k)} style={sel===k?{borderColor:a.clr,color:a.clr,background:`${a.clr}18`}:{}}>
            {a.name}
          </button>
        ))}
      </div>
      <div className="card" style={{borderLeft:`4px solid ${arch.clr}`,paddingLeft:20,marginBottom:20}}>
        <div style={{marginBottom:8}}>
          <span style={{fontSize:17,fontWeight:700,color:arch.clr}}>{arch.name}</span>
          <span className="mono" style={{fontSize:12,color:'var(--t3)',marginLeft:12}}>{arch.sub}</span>
        </div>
        <p style={{fontSize:14,color:'var(--t2)',lineHeight:1.7}}>{arch.summary}</p>
      </div>
      {arch.turns.map((t,i)=>(
        <div key={i} className="loop-box">
          <div className="mono" style={{fontSize:12,color:arch.clr,fontWeight:700,marginBottom:12,letterSpacing:'.08em'}}>{t.c}</div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14,marginBottom:t.n?12:0}}>
            {[t.p1,t.p2].map((slot,si)=>(
              <div key={si} style={{background:'var(--bg)',borderRadius:8,padding:'12px 14px',border:'1px solid var(--b1)'}}>
                <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:6}}>
                  <img src={getPokemonImage(slot.m.split('→')[0].trim().split(' ')[0]==='Hard'||slot.m.split('→')[0].trim().split(' ')[0]==='Switch'?'Kommo-o':slot.m.split('→')[0].trim())} className="poke-img-xs" alt={slot.m} onError={e=>{e.target.style.display='none';}}/>
                  <span className="mono" style={{fontSize:12,fontWeight:700,color:si===0?arch.clr:'var(--purple)'}}>{slot.m}</span>
                </div>
                <span style={{fontSize:13,color:'var(--text)',fontWeight:600,display:'block',marginBottom:4}}>{slot.mv}</span>
                {slot.d&&<p className="mono" style={{fontSize:11,color:'var(--t3)',lineHeight:1.45}}>{slot.d}</p>}
              </div>
            ))}
          </div>
          {t.n&&<div style={{background:'rgba(83,74,183,0.1)',border:'1px solid rgba(83,74,183,0.25)',borderRadius:8,padding:'10px 13px'}}>
            <p className="mono" style={{fontSize:12,color:'var(--purple)',lineHeight:1.55}}>💡 {t.n}</p>
          </div>}
        </div>
      ))}
    </div>
  );
}

// ── Roster & Match Log within a Team ─────────────────────────────────────────
function TeamDetail({team,onBack,allMatches,saveMatches}){
  const [innerTab,setInnerTab]=useState('roster');
  const [sel,setSel]=useState(null);
  const [editing,setEditing]=useState(null);
  const [draft,setDraft]=useState(null);
  const [form,setForm]=useState({opp:['','','','','',''],opp4:[],oppLead:'',my4:[],lead:'',result:'',notes:''});
  const [view,setView]=useState('log');
  const [del,setDel]=useState(null);

  const teamMatches=allMatches.filter(m=>m.teamId===team.id);
  const wins=teamMatches.filter(m=>m.result==='W').length;
  const total=teamMatches.length;
  const wr=total?Math.round(wins/total*100):0;

  const addMatch=()=>{
    if(!form.result)return;
    const m={id:Date.now(),teamId:team.id,date:new Date().toLocaleDateString(),opp:form.opp.filter(Boolean),opp4:form.opp4,oppLead:form.oppLead,my4:form.my4,lead:form.lead,result:form.result,notes:form.notes,archetype:detectArchetype(form.opp)};
    saveMatches([m,...allMatches]);
    setForm({opp:['','','','','',''],opp4:[],oppLead:'',my4:[],lead:'',result:'',notes:''});
    setView('log');
  };

  const OPP_LEAD_PAIRS=['Sneasler + Garchomp','Sneasler + Aerodactyl','Garchomp + Charizard','Pelipper + Archaludon','Farigiraf + Camerupt','Incineroar + Other','Other'];

  return(
    <div>
      <button className="btn-sm" onClick={onBack} style={{marginBottom:16}}>← Back To Teams</button>
      <div style={{display:'flex',gap:14,alignItems:'center',marginBottom:20}}>
        <div style={{display:'flex',gap:4}}>
          {(team.roster||[]).map((p,i)=>(
            <img key={i} src={getPokemonImage(p.name)} className="poke-img-sm" alt={p.name} onError={e=>{e.target.style.display='none';}}/>
          ))}
        </div>
        <div>
          <div style={{fontSize:17,fontWeight:700,color:'var(--purple)'}}>{team.name}</div>
          {total>0&&<div className="mono" style={{fontSize:12,color:wr>=50?'var(--teal)':'var(--coral)'}}>{wins}W {total-wins}L · {wr}% WR</div>}
        </div>
      </div>
      <div className="sub-tabs">
        {['roster','match-log'].map(t=>(
          <button key={t} className={`sub-tab${innerTab===t?' on':''}`} onClick={()=>setInnerTab(t)}>
            {t==='roster'?'Roster':t==='match-log'?`Match Log (${total})`:''}
          </button>
        ))}
      </div>

      {innerTab==='roster'&&(
        <div>
          {(team.roster||[]).map(p=>(
            <div key={p.name} style={{position:'relative'}}>
              {editing===p.name&&draft?(
                <div className="card" style={{borderColor:'var(--acc)'}}>
                  <span className="sec-label" style={{color:'var(--purple)'}}>Editing — {p.name}</span>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:12}}>
                    <div><label className="sec-label">Ability</label><input className="pi" value={draft.ab} onChange={e=>setDraft({...draft,ab:e.target.value})}/></div>
                    <div><label className="sec-label">Item</label><input className="pi" value={draft.item} onChange={e=>setDraft({...draft,item:e.target.value})}/></div>
                  </div>
                  <label className="sec-label">Moves (comma separated)</label>
                  <input className="pi" style={{marginBottom:12}} value={draft.mv.join(', ')} onChange={e=>setDraft({...draft,mv:e.target.value.split(',').map(s=>s.trim())})}/>
                  <label className="sec-label">Notes</label>
                  <textarea className="ta" style={{marginBottom:12}} value={draft.note} onChange={e=>setDraft({...draft,note:e.target.value})}/>
                  <div style={{display:'flex',gap:8}}><button className="abtn" onClick={()=>{/* save to team */setEditing(null);setDraft(null);}} style={{flex:1}}>Save</button><button className="btn-sm" onClick={()=>{setEditing(null);setDraft(null);}}>Cancel</button></div>
                </div>
              ):(
                <div className="card-click" style={{borderColor:sel===p.name?p.clr:'var(--b1)'}} onClick={()=>setSel(sel===p.name?null:p.name)}>
                  <div style={{display:'flex',gap:14,alignItems:'flex-start'}}>
                    <img src={getPokemonImage(p.name)} className="poke-img" alt={p.name} onError={e=>{e.target.style.display='none';}}/>
                    <div style={{flex:1}}>
                      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',flexWrap:'wrap',gap:8}}>
                        <div>
                          <span style={{fontSize:16,fontWeight:700,color:p.clr,marginRight:8}}>{p.name}</span>
                          <span className="rb" style={{background:p.bg,color:p.clr,border:`1px solid ${p.clr}40`}}>{p.role}</span>
                        </div>
                        <span className="mono" style={{fontSize:12,color:'var(--t3)'}}>Spe {p.spe}</span>
                      </div>
                      <div style={{display:'flex',gap:4,marginTop:6,flexWrap:'wrap'}}>
                        {(p.types||[]).map(t=><TypeBadge key={t} type={t}/>)}
                      </div>
                      <p className="mono" style={{fontSize:12,color:'var(--t2)',marginTop:5}}>{p.ab} · {p.item}</p>
                      <div style={{display:'flex',gap:8,flexWrap:'wrap',marginTop:5}}>
                        {(p.mv||[]).map(m=><MoveWithType key={m} move={m}/>)}
                      </div>
                      {sel===p.name&&(
                        <div style={{marginTop:14,paddingTop:14,borderTop:'1px solid var(--b1)'}}>
                          <p style={{fontSize:13,color:'var(--t2)',fontStyle:'italic',lineHeight:1.65,marginBottom:12}}>{p.note}</p>
                          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'4px 18px'}}>
                            {Object.entries(p.stats||{}).map(([k,v])=>(
                              <div key={k} style={{display:'flex',alignItems:'center',gap:8}}>
                                <span className="mono" style={{fontSize:11,color:'var(--t3)',minWidth:30}}>{k}</span>
                                <div className="sb"><div className="sbf" style={{width:`${Math.min(100,Math.round(v/220*100))}%`,background:SC[k]||'#888'}}/></div>
                                <span className="mono" style={{fontSize:11,color:'var(--t2)',minWidth:32,textAlign:'right'}}>{v}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
              {editing!==p.name&&<button onClick={e=>{e.stopPropagation();setDraft({...p,mv:[...p.mv],stats:{...p.stats}});setEditing(p.name);}} className="btn-sm" style={{position:'absolute',top:18,right:18,fontSize:11}}>Edit</button>}
            </div>
          ))}
        </div>
      )}

      {innerTab==='match-log'&&(
        <div>
          <div style={{display:'flex',gap:6,marginBottom:16,flexWrap:'wrap',alignItems:'center'}}>
            {['log','add','stats'].map(v=>(
              <button key={v} className={`sub-tab${view===v?' on':''}`} onClick={()=>setView(v)}>
                {v==='log'?`Log (${total})`:v==='add'?'+ Log Match':'Stats'}
              </button>
            ))}
            {total>0&&<div style={{marginLeft:'auto',display:'flex',gap:12,alignItems:'center'}}>
              <span className="mono" style={{fontSize:14,color:'var(--teal)',fontWeight:700}}>{wins}W</span>
              <span className="mono" style={{fontSize:14,color:'var(--coral)',fontWeight:700}}>{total-wins}L</span>
              <span className="mono" style={{fontSize:18,fontWeight:700,color:wr>=50?'var(--teal)':'var(--coral)'}}>{wr}%</span>
            </div>}
          </div>

          {view==='log'&&<div>
            {!teamMatches.length&&<div className="bench"><div style={{fontSize:36,marginBottom:12}}>📋</div><p className="mono" style={{fontSize:13,color:'var(--t3)'}}>No matches logged yet</p></div>}
            {teamMatches.map(m=>(
              <div key={m.id} className="card" style={{borderLeft:`3px solid ${m.result==='W'?'var(--teal)':'var(--coral)'}`,paddingLeft:16}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
                  <div style={{display:'flex',alignItems:'center',gap:12}}>
                    <span className={`win-pill ${m.result}`}>{m.result==='W'?'WIN':'LOSS'}</span>
                    <span className="rb" style={{background:'var(--bg4)',color:'var(--t2)',fontSize:11}}>{m.archetype}</span>
                    <span className="mono" style={{fontSize:11,color:'var(--t3)'}}>{m.date}</span>
                  </div>
                  <button onClick={()=>setDel(del===m.id?null:m.id)} style={{background:'none',border:'none',color:'var(--t3)',cursor:'pointer',fontSize:20}}>×</button>
                </div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:8}}>
                  <div>
                    <span className="sec-label">Opponent Team</span>
                    <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
                      {m.opp.map((p,i)=><div key={i} style={{display:'flex',alignItems:'center',gap:4}}>
                        <img src={getPokemonImage(p)} className="poke-img-xs" alt={p} onError={e=>{e.target.style.display='none';}}/>
                        <span className="mono" style={{fontSize:11,color:'var(--t2)'}}>{p}</span>
                      </div>)}
                    </div>
                    {m.opp4?.length>0&&<p className="mono" style={{fontSize:11,color:'var(--amber)',marginTop:5}}>Their 4: {m.opp4.join(', ')}</p>}
                    {m.oppLead&&<p className="mono" style={{fontSize:11,color:'var(--coral)',marginTop:3}}>Their Lead: {m.oppLead}</p>}
                  </div>
                  <div>
                    {m.my4?.length>0&&<><span className="sec-label">My Bring 4</span><p className="mono" style={{fontSize:11,color:'var(--teal)'}}>{m.my4.join(', ')}</p></>}
                    {m.lead&&<p className="mono" style={{fontSize:11,color:'var(--purple)',marginTop:5}}>My Lead: {m.lead}</p>}
                  </div>
                </div>
                {m.notes&&<p style={{fontSize:13,color:'var(--t2)',fontStyle:'italic',lineHeight:1.55}}>{m.notes}</p>}
                {del===m.id&&<div style={{marginTop:10,display:'flex',gap:8,alignItems:'center'}}>
                  <span className="mono" style={{fontSize:12,color:'var(--coral)'}}>Delete this match?</span>
                  <button onClick={()=>{saveMatches(allMatches.filter(x=>x.id!==m.id));setDel(null);}} style={{background:'var(--coral)',border:'none',borderRadius:6,padding:'5px 14px',color:'#fff',fontSize:12,fontFamily:'var(--mono)',cursor:'pointer',fontWeight:700}}>Yes</button>
                  <button onClick={()=>setDel(null)} className="btn-sm">No</button>
                </div>}
              </div>
            ))}
          </div>}

          {view==='add'&&<div>
            <span className="sec-label">Opponent Team (all 6)</span>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:16}}>
              {form.opp.map((v,i)=>(
                <div key={i} style={{display:'flex',alignItems:'center',gap:6}}>
                  <span className="mono" style={{fontSize:12,color:'var(--t3)',minWidth:16}}>{i+1}</span>
                  <input type="text" value={v} list="dex" className="pi" placeholder={`Pokemon ${i+1}`} onChange={e=>{const o=[...form.opp];o[i]=e.target.value;setForm({...form,opp:o});}}/>
                </div>
              ))}
            </div>

            <span className="sec-label">Opponent's Bring 4 (optional)</span>
            <div style={{display:'flex',gap:6,flexWrap:'wrap',marginBottom:6}}>
              {form.opp.filter(Boolean).map(p=>{const s=form.opp4.includes(p);return(
                <button key={p} onClick={()=>{if(s)setForm({...form,opp4:form.opp4.filter(x=>x!==p)});else if(form.opp4.length<4)setForm({...form,opp4:[...form.opp4,p]});}}
                  style={{display:'flex',alignItems:'center',gap:5,background:s?'rgba(240,153,123,0.2)':'var(--bg3)',border:`1px solid ${s?'var(--coral)':'var(--b2)'}`,borderRadius:6,padding:'6px 12px',color:s?'var(--coral)':'var(--t2)',fontSize:12,fontFamily:'var(--mono)',cursor:'pointer',fontWeight:700}}>
                  <img src={getPokemonImage(p)} className="poke-img-xs" alt={p} onError={e=>{e.target.style.display='none';}}/>
                  {p}
                </button>);})}
            </div>
            <p className="mono" style={{fontSize:11,color:'var(--t3)',marginBottom:16}}>{form.opp4.length}/4 selected</p>

            <span className="sec-label">Opponent Lead</span>
            <select value={form.oppLead} onChange={e=>setForm({...form,oppLead:e.target.value})} className="pi" style={{marginBottom:16}}>
              <option value="">— select their lead —</option>
              {OPP_LEAD_PAIRS.map(l=><option key={l} value={l}>{l}</option>)}
            </select>

            <span className="sec-label">My Bring 4</span>
            <div style={{display:'flex',gap:6,flexWrap:'wrap',marginBottom:6}}>
              {MY_NAMES.map(p=>{const s=form.my4.includes(p);return(
                <button key={p} onClick={()=>{if(s)setForm({...form,my4:form.my4.filter(x=>x!==p)});else if(form.my4.length<4)setForm({...form,my4:[...form.my4,p]});}}
                  style={{display:'flex',alignItems:'center',gap:5,background:s?'rgba(175,169,236,0.2)':'var(--bg3)',border:`1px solid ${s?'var(--purple)':'var(--b2)'}`,borderRadius:6,padding:'6px 12px',color:s?'var(--purple)':'var(--t2)',fontSize:12,fontFamily:'var(--mono)',cursor:'pointer',fontWeight:700}}>
                  <img src={getPokemonImage(p)} className="poke-img-xs" alt={p} onError={e=>{e.target.style.display='none';}}/>
                  {p}
                </button>);})}
            </div>
            <p className="mono" style={{fontSize:11,color:'var(--t3)',marginBottom:16}}>{form.my4.length}/4 selected</p>

            <span className="sec-label">My Lead Pair</span>
            <select value={form.lead} onChange={e=>setForm({...form,lead:e.target.value})} className="pi" style={{marginBottom:16}}>
              <option value="">— select my lead —</option>
              {LEAD_PAIRS.map(l=><option key={l} value={l}>{l}</option>)}
            </select>

            <span className="sec-label">Result</span>
            <div style={{display:'flex',gap:12,marginBottom:16}}>
              {['W','L'].map(r=>(
                <button key={r} onClick={()=>setForm({...form,result:r})} style={{flex:1,padding:'14px',border:`2px solid ${form.result===r?(r==='W'?'var(--teal)':'var(--coral)'):'var(--b2)'}`,borderRadius:10,background:form.result===r?(r==='W'?'rgba(93,202,165,0.12)':'rgba(240,153,123,0.12)'):'var(--bg3)',color:form.result===r?(r==='W'?'var(--teal)':'var(--coral)'):'var(--t2)',fontSize:16,fontWeight:700,fontFamily:'var(--mono)',cursor:'pointer',textTransform:'uppercase'}}>
                  {r==='W'?'✓ Win':'✗ Loss'}
                </button>
              ))}
            </div>

            <span className="sec-label">Notes</span>
            <textarea value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})} className="ta" placeholder="What worked? Key plays? Opponent patterns?" style={{marginBottom:16}}/>
            <button className="abtn" onClick={addMatch} disabled={!form.result}>Save Match →</button>
          </div>}

          {view==='stats'&&<div>
            {!total&&<div className="bench"><p className="mono" style={{fontSize:13}}>Log some matches first</p></div>}
            {total>0&&<>
              <div className="card" style={{marginBottom:14}}>
                <span className="sec-label">Overall Record</span>
                <div style={{display:'flex',gap:28,alignItems:'center'}}>
                  <div style={{textAlign:'center'}}><div style={{fontSize:36,fontWeight:700,color:'var(--teal)',fontFamily:'var(--mono)'}}>{wins}</div><div className="mono" style={{fontSize:12,color:'var(--t3)'}}>Wins</div></div>
                  <div style={{textAlign:'center'}}><div style={{fontSize:36,fontWeight:700,color:'var(--coral)',fontFamily:'var(--mono)'}}>{total-wins}</div><div className="mono" style={{fontSize:12,color:'var(--t3)'}}>Losses</div></div>
                  <div style={{textAlign:'center',marginLeft:'auto'}}><div style={{fontSize:48,fontWeight:700,color:wr>=50?'var(--teal)':'var(--coral)',fontFamily:'var(--mono)'}}>{wr}%</div><div className="mono" style={{fontSize:12,color:'var(--t3)'}}>Win Rate</div></div>
                </div>
              </div>
              {/* By archetype */}
              {(()=>{const byArch={};teamMatches.forEach(m=>{if(!byArch[m.archetype])byArch[m.archetype]={w:0,l:0};byArch[m.archetype][m.result==='W'?'w':'l']++;});return Object.keys(byArch).length>0&&(
                <div className="card" style={{marginBottom:14}}>
                  <span className="sec-label">By Archetype</span>
                  {Object.entries(byArch).sort((a,b)=>(b[1].w+b[1].l)-(a[1].w+a[1].l)).map(([arch,rec])=>{
                    const w2=Math.round(rec.w/(rec.w+rec.l)*100);
                    return <div key={arch} style={{display:'flex',alignItems:'center',gap:14,marginBottom:10}}>
                      <span className="mono" style={{fontSize:13,color:'var(--t2)',minWidth:140}}>{arch}</span>
                      <div style={{flex:1,height:8,background:'var(--b1)',borderRadius:4}}><div style={{width:`${w2}%`,height:8,background:w2>=50?'var(--teal)':'var(--coral)',borderRadius:4}}/></div>
                      <span className="mono" style={{fontSize:14,color:w2>=50?'var(--teal)':'var(--coral)',minWidth:50,textAlign:'right',fontWeight:700}}>{w2}%</span>
                      <span className="mono" style={{fontSize:12,color:'var(--t3)',minWidth:56}}>{rec.w}W {rec.l}L</span>
                    </div>;
                  })}
                </div>
              );})()}
              {/* By lead */}
              {(()=>{const byLead={};teamMatches.forEach(m=>{if(!m.lead)return;if(!byLead[m.lead])byLead[m.lead]={w:0,l:0};byLead[m.lead][m.result==='W'?'w':'l']++;});return Object.keys(byLead).length>0&&(
                <div className="card">
                  <span className="sec-label">By My Lead Pair</span>
                  {Object.entries(byLead).sort((a,b)=>(b[1].w/(b[1].w+b[1].l))-(a[1].w/(a[1].w+a[1].l))).map(([lead,rec])=>{
                    const w2=Math.round(rec.w/(rec.w+rec.l)*100);
                    return <div key={lead} style={{display:'flex',alignItems:'center',gap:14,marginBottom:10}}>
                      <span className="mono" style={{fontSize:12,color:'var(--purple)',minWidth:210}}>{lead}</span>
                      <div style={{flex:1,height:8,background:'var(--b1)',borderRadius:4}}><div style={{width:`${w2}%`,height:8,background:'var(--purple)',borderRadius:4}}/></div>
                      <span className="mono" style={{fontSize:14,color:'var(--purple)',minWidth:50,textAlign:'right',fontWeight:700}}>{w2}%</span>
                      <span className="mono" style={{fontSize:12,color:'var(--t3)',minWidth:56}}>{rec.w}W {rec.l}L</span>
                    </div>;
                  })}
                </div>
              );})()}
            </>}
          </div>}
        </div>
      )}
    </div>
  );
}

// ── Archetypes Section ────────────────────────────────────────────────────────
function ArchetypesSection({teams,setTeams,allMatches,saveMatches}){
  const [selArch,setSelArch]=useState(null);
  const [archTab,setArchTab]=useState('teams');
  const [selTeam,setSelTeam]=useState(null);

  const archTeams=(teams||[]).filter(t=>t.archetype===(selArch?.id||''));

  if(selTeam){
    return <TeamDetail team={selTeam} onBack={()=>setSelTeam(null)} allMatches={allMatches} saveMatches={saveMatches}/>;
  }

  if(!selArch){
    return(
      <div>
        <p style={{fontSize:15,color:'var(--t2)',marginBottom:20,lineHeight:1.6}}>Choose an archetype to view teams, guides, threats and win conditions.</p>
        <div className="arch-grid">
          {ARCH_DEFS.map(a=>(
            <div key={a.id} className="arch-card" onClick={()=>{setSelArch(a);setArchTab('teams');}}>
              <div className="arch-card-bg" style={{background:a.bg}}/>
              <div className="arch-card-overlay"/>
              <div className="arch-card-content">
                <div style={{fontSize:28,marginBottom:6}}>{a.icon}</div>
                <div className="arch-card-name" style={{color:a.clr}}>{a.name}</div>
                <div className="arch-card-sub">{a.sub}</div>
                {(teams||[]).filter(t=>t.archetype===a.id).length>0&&(
                  <div className="mono" style={{fontSize:11,color:a.clr,marginTop:6,opacity:.9}}>
                    {(teams||[]).filter(t=>t.archetype===a.id).length} team(s) saved
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return(
    <div>
      <button className="btn-sm" onClick={()=>setSelArch(null)} style={{marginBottom:16}}>← All Archetypes</button>
      <div style={{display:'flex',alignItems:'center',gap:14,marginBottom:20,padding:'16px 20px',background:selArch.bg,borderRadius:12,border:`1px solid ${selArch.clr}44`}}>
        <span style={{fontSize:32}}>{selArch.icon}</span>
        <div><div style={{fontSize:20,fontWeight:700,color:selArch.clr,fontFamily:'var(--mono)',letterSpacing:'.06em',textTransform:'uppercase'}}>{selArch.name}</div>
        <div style={{fontSize:13,color:'rgba(255,255,255,0.7)',marginTop:3}}>{selArch.sub}</div></div>
      </div>

      <div className="sub-tabs">
        {['teams','guides','threats','win-cons'].map(t=>(
          <button key={t} className={`sub-tab${archTab===t?' on':''}`} onClick={()=>setArchTab(t)}>
            {{teams:'Teams',guides:'Guides',threats:'Threats',winconstrs:'Win Cons','win-cons':'Win Cons'}[t]}
          </button>
        ))}
      </div>

      {archTab==='teams'&&(
        <div>
          {archTeams.length===0&&<div className="bench"><div style={{fontSize:36,marginBottom:12}}>{selArch.icon}</div><p className="mono" style={{fontSize:13}}>No teams added yet for {selArch.name}</p></div>}
          {archTeams.map(t=>{
            const tm=allMatches.filter(m=>m.teamId===t.id);
            const tw=tm.filter(m=>m.result==='W').length;
            const twr=tm.length?Math.round(tw/tm.length*100):null;
            return(
              <div key={t.id} className="team-card" onClick={()=>setSelTeam(t)}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
                  <div>
                    <div style={{fontSize:16,fontWeight:700,color:'var(--text)',marginBottom:4}}>{t.name}</div>
                    {twr!==null&&<span className="mono" style={{fontSize:12,color:twr>=50?'var(--teal)':'var(--coral)',fontWeight:700}}>{tw}W {tm.length-tw}L · {twr}%</span>}
                    {tm.length===0&&<span className="mono" style={{fontSize:11,color:'var(--t3)'}}>No matches logged</span>}
                  </div>
                  <span className="mono" style={{fontSize:11,color:'var(--t3)'}}>{t.roster?.length||0} Pokemon</span>
                </div>
                <div className="team-sprites">
                  {(t.roster||[]).map((p,i)=>(
                    <img key={i} src={getPokemonImage(p.name)} className="poke-img-sm" alt={p.name} onError={e=>{e.target.style.display='none';}}/>
                  ))}
                </div>
              </div>
            );
          })}
          {selArch.id==='perish'&&<button className="abtn" onClick={()=>{const newTeam={id:Date.now(),name:`PS Team ${archTeams.length+1}`,archetype:'perish',roster:TEAM_DEFAULT};setTeams(prev=>[...prev,newTeam]);}} style={{marginTop:12}}>+ Add Perish Trap Team</button>}
        </div>
      )}

      {archTab==='guides'&&selArch.id==='perish'&&<PSGuideTab/>}
      {archTab==='guides'&&selArch.id!=='perish'&&(
        <div className="card" style={{borderLeft:`3px solid ${selArch.clr}`,paddingLeft:16}}>
          <p style={{fontSize:14,color:'var(--t2)',lineHeight:1.7}}>Guides for {selArch.name} coming soon. This section will contain archetype-specific strategy, common leads, and team compositions.</p>
        </div>
      )}

      {archTab==='threats'&&(
        <div>
          {THREATS_STATIC.filter(t=>['S','A'].includes(t.tier)).map(t=>(
            <div key={t.name} className="card">
              <div style={{display:'flex',gap:12,alignItems:'flex-start',marginBottom:8}}>
                <img src={getPokemonImage(t.name)} className="poke-img-sm" alt={t.name} onError={e=>{e.target.style.display='none';}}/>
                <div style={{flex:1}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:6}}>
                    <div style={{display:'flex',alignItems:'center',gap:8}}>
                      <span style={{fontSize:15,fontWeight:700,color:TIER_CLR[t.tier]||'var(--text)'}}>{t.name}</span>
                      {t.isG&&<span className="rb" style={{background:'#1e0808',color:'#FF4444',border:'1px solid #FF444430',fontSize:11}}>ghost ⛔</span>}
                      {t.hasD&&<span className="rb" style={{background:'#1e1408',color:'var(--amber)',border:'1px solid #EF9F2730',fontSize:11}}>defiant ⚠</span>}
                    </div>
                    <span className="rb" style={{background:'var(--bg4)',color:TIER_CLR[t.tier]||'#888',fontSize:11}}>{t.tier}</span>
                  </div>
                  <p className="mono" style={{fontSize:12,color:'var(--t2)',marginTop:5,lineHeight:1.65}}>{t.detail}</p>
                  <p style={{fontSize:12,color:'var(--teal)',marginTop:6,lineHeight:1.5,fontStyle:'italic'}}>Counter: {t.counter}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {archTab==='win-cons'&&(
        <div>
          {WINCONS.map(w=>(
            <div key={w.arch} className="card" style={{borderLeft:`3px solid ${w.clr}`,paddingLeft:18}}>
              <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:10}}>
                <span style={{fontSize:22}}>{w.icon}</span>
                <span style={{fontSize:15,fontWeight:700,color:w.clr}}>{w.arch}</span>
              </div>
              <p style={{fontSize:14,color:'var(--t2)',lineHeight:1.7}}>{w.plan}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Draft Coach ───────────────────────────────────────────────────────────────
const KNOWN_CORES=[
  {p:['sneasler','garchomp'],note:'Sneasler FO + Garchomp EQ spread. Sableye+Gengar: Sneasler cannot touch Ghosts.'},
  {p:['sneasler','kingambit'],note:'Kingambit Defiant — NEVER Parting Shot. Kommo-o Body Press.'},
  {p:['garchomp','charizard'],note:'Highest WR core. Fake Out Charizard + Gengar PS T2.'},
  {p:['basculegion','kingambit'],note:'Ghost pivot + Defiant. Shadow Ball Basculegion, never PS it.'},
  {p:['pelipper','archaludon'],note:'Rain + Electro Shot. Disable Electro Shot = lockout.'},
  {p:['farigiraf','camerupt'],note:'Trick Room. Tinkaton Mold Breaker FO on Farigiraf.'},
  {p:['sinistcha','kingambit'],note:'Rage Powder diverts Body Press. Shadow Ball Sinistcha first.'},
];

function DraftCoachTab({team}){
  const [opponents,setOpponents]=useState(['','','','','','']);
  const [result,setResult]=useState(null);
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState(null);

  const update=(i,v)=>setOpponents(p=>{const n=[...p];n[i]=v;return n;});
  const filled=opponents.filter(Boolean);
  const ghosts=findMons(GHOST_LIST,filled);
  const defiant=findMons(DEFIANT_LIST,filled);
  const armor=findMons(ARMOR_LIST,filled);
  const arch=filled.length>=2?detectArchetype(filled):null;
  const danger=filled.length>=2?dangerScore(filled):0;
  const leads=filled.length>=2?predictLeads(filled):[];
  const oppLower=filled.map(p=>norm(p));
  const cores=KNOWN_CORES.filter(c=>c.p.every(k=>oppLower.some(o=>o.includes(k))));
  const dangerClr=danger<=3?'var(--teal)':danger<=6?'var(--amber)':'var(--coral)';

  const analyze=async()=>{
    if(filled.length<2){setError('Enter at least 2 opponent Pokemon.');return;}
    setError(null);setBusy(true);setResult(null);
    try{
      const tc=`My current team: ${team.map(p=>`${p.name}(${p.ab},${p.item},${p.mv.join('/')})`).join('; ')}. `;
      const r=await fetch('/api/analyze',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({opponents,teamContext:tc})});
      const d=await r.json();
      if(d.error){setError(d.error);setBusy(false);return;}
      setResult(parseResult(d.result));
    }catch(e){setError('Request failed.');}
    setBusy(false);
  };

  return(
    <div className="grid2">
      <div>
        <span className="sec-label">Opponent Team Preview</span>
        <div className="grid2i">
          {opponents.map((val,i)=>(
            <div key={i} style={{display:'flex',alignItems:'center',gap:8}}>
              <span className="mono" style={{fontSize:13,color:'var(--t3)',minWidth:16}}>{i+1}</span>
              <input type="text" value={val} list="dex" onChange={e=>update(i,e.target.value)} placeholder={`Pokemon ${i+1}`} className="pi" onKeyDown={e=>{if(e.key==='Enter')analyze();}}/>
            </div>
          ))}
        </div>

        {filled.length>=2&&(
          <div className="card-inner" style={{marginBottom:12}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:6}}>
              <span className="mono" style={{fontSize:13,color:'var(--t3)'}}>Danger Score</span>
              <span className="mono" style={{fontSize:14,color:dangerClr,fontWeight:700}}>{danger}/10 · {danger<=3?'Manageable':danger<=6?'Threatening':'Severe'}</span>
            </div>
            <div className="danger-bar"><div className="danger-fill" style={{width:`${danger*10}%`,background:dangerClr}}/></div>
            {arch&&<div style={{display:'flex',alignItems:'center',gap:8,marginTop:10}}>
              <span className="mono" style={{fontSize:12,color:'var(--t3)',textTransform:'uppercase'}}>Archetype</span>
              <span className="mono" style={{fontSize:14,color:'var(--text)',fontWeight:700}}>{arch}</span>
            </div>}
          </div>
        )}

        <div className={`wbox ghost${ghosts.length?' visible':''}`}>⛔ Ghost Types: {ghosts.join(', ')}<br/><span style={{opacity:.8}}>Escape Shadow Tag. Shadow Ball immediately. NEVER Perish Song.</span></div>
        <div className={`wbox defiant${defiant.length?' visible':''}`}>⚠ Defiant: {defiant.join(', ')}<br/><span style={{opacity:.8}}>NEVER Parting Shot or Intimidate into this Pokemon.</span></div>
        <div className={`wbox armor${armor.length?' visible':''}`}>✓ Armor Tail / Queenly Majesty: {armor.join(', ')}<br/><span style={{opacity:.8}}>Tinkaton Mold Breaker Fake Out bypasses this ability.</span></div>
        {cores.map(c=>(
          <div key={c.p.join('+')} className="wbox core visible">🎯 Known Core: {c.p.map(p=>p.charAt(0).toUpperCase()+p.slice(1)).join(' + ')}<br/><span style={{opacity:.8}}>{c.note}</span></div>
        ))}

        {leads.length>0&&(
          <div className="card-inner" style={{marginBottom:12}}>
            <span className="sec-label">Predicted Opponent Leads</span>
            {leads.map((l,i)=>(
              <div key={i} style={{display:'flex',alignItems:'center',gap:10,marginBottom:8}}>
                <img src={getPokemonImage(l.p1)} className="poke-img-xs" alt={l.p1} onError={e=>{e.target.style.display='none';}}/>
                <span className="mono" style={{fontSize:13,color:'var(--text)',fontWeight:600}}>{l.p1}</span>
                <span className="mono" style={{fontSize:13,color:'var(--t3)'}}>+</span>
                <img src={getPokemonImage(l.p2)} className="poke-img-xs" alt={l.p2} onError={e=>{e.target.style.display='none';}}/>
                <span className="mono" style={{fontSize:13,color:'var(--text)',fontWeight:600}}>{l.p2}</span>
                <span className="mono" style={{fontSize:12,color:'var(--amber)',marginLeft:'auto',fontWeight:700}}>{l.pct}%</span>
              </div>
            ))}
          </div>
        )}

        {error&&<p className="errp">{error}</p>}
        <button className="abtn" onClick={analyze} disabled={busy} style={{marginBottom:8}}>{busy?'Analyzing...':'Analyze Matchup →'}</button>
        <p className="mono" style={{fontSize:11,color:'var(--t3)',textAlign:'center',marginBottom:'1.25rem'}}>Powered by Gemini (Free) · ChampionsMeta + PokeSynergy Data</p>

        <span className="sec-label">Session Notes</span>
        <textarea className="ta" placeholder="Log patterns, leads, misplays..."/>
      </div>

      <div>
        {!result&&!busy&&<>
          <div className="bench" style={{paddingBottom:20}}>
            <div style={{fontSize:48,marginBottom:16}}>⚔</div>
            <p className="mono" style={{fontSize:13,lineHeight:2,color:'var(--t3)'}}>Enter opponent team<br/>for AI game plan + set predictions</p>
          </div>
          {filled.length>0&&<><span className="sec-label">Set Predictions</span>{filled.map(p=><MetaCard key={p} name={p}/>)}</>}
        </>}
        {busy&&<div className="bench"><div style={{fontSize:44,marginBottom:14}}>⏳</div><p className="mono" style={{fontSize:13,color:'var(--t2)'}}>Asking Gemini...</p></div>}
        {result&&<>
          {Object.entries(result).map(([key,val])=>(
            <div key={key} className="rsec">
              <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:8}}>
                <span style={{fontSize:18}}>{SEC_ICONS[key]||'•'}</span>
                <span className="mono" style={{fontSize:11,letterSpacing:'.1em',color:SEC_CLRS[key]||'#AFA9EC',textTransform:'uppercase',fontWeight:700}}>{key}</span>
              </div>
              <p className="mono" style={{fontSize:13,color:'var(--t2)',margin:0,lineHeight:1.8,whiteSpace:'pre-wrap'}}>{val}</p>
            </div>
          ))}
          <span className="sec-label" style={{display:'block',marginTop:16,marginBottom:10}}>Opponent Set Predictions</span>
          {filled.map(p=><MetaCard key={p} name={p}/>)}
        </>}
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function Home(){
  const [mainTab,setMainTab]=useState('coach');
  const [teams,setTeams]=useState([{id:1,name:'Main PS Team',archetype:'perish',roster:TEAM_DEFAULT}]);
  const [allMatches,setAllMatches]=useState([]);

  useEffect(()=>{
    try{const s=localStorage.getItem('v8_teams');if(s){const t=JSON.parse(s);if(t?.length)setTeams(t);}}catch(e){}
    try{const s=localStorage.getItem('v8_matches');if(s){const m=JSON.parse(s);if(m?.length)setAllMatches(m);}}catch(e){}
  },[]);
  useEffect(()=>{try{localStorage.setItem('v8_teams',JSON.stringify(teams));}catch(e){}}, [teams]);

  const saveMatches=(data)=>{setAllMatches(data);try{localStorage.setItem('v8_matches',JSON.stringify(data));}catch(e){}};

  const mainTeam=teams.find(t=>t.archetype==='perish')?.roster||TEAM_DEFAULT;

  return(
    <>
      <Head>
        <title>Champions Draft Coach</title>
        <meta name="description" content="Perish Song trap team analyzer — Pokemon Champions Reg M-A"/>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>⚔</text></svg>"/>
      </Head>
      <datalist id="dex">{POKEMON_LIST.map(p=><option key={p} value={p}/>)}</datalist>
      <div className="container">
        <div className="header">
          <span style={{fontSize:32}}>⚔</span>
          <div>
            <h1>CHAMPIONS DRAFT COACH</h1>
            <p>Perish Song Trap · Regulation M-A · Doubles · Gemini (Free) · PokeSynergy + ChampionsMeta + Pikalytics</p>
          </div>
        </div>
        <div className="main-tabs">
          {['coach','speed','archetypes'].map(t=>(
            <button key={t} className={`main-tab${mainTab===t?' on':''}`} onClick={()=>setMainTab(t)}>
              {{coach:'Draft Coach',speed:'Speed Tiers',archetypes:'Archetypes'}[t]}
            </button>
          ))}
        </div>
        {mainTab==='coach'     &&<DraftCoachTab team={mainTeam}/>}
        {mainTab==='speed'     &&<SpeedTab/>}
        {mainTab==='archetypes'&&<ArchetypesSection teams={teams} setTeams={setTeams} allMatches={allMatches} saveMatches={saveMatches}/>}
      </div>
    </>
  );
}
