import { useState, useEffect } from 'react';
import Head from 'next/head';
import { TEAM_DEFAULT, THREATS_STATIC, WINCONS, POKEMON_LIST } from '../lib/data';
import { META_DB, TYPE_COLORS, MOVE_TYPES, COMMON_LEADS, getPokemonImage, SPEED_TIERS, calcSpeed } from '../lib/pokemon-data';

// ── Constants ─────────────────────────────────────────────────────────────────
const SC = {HP:'#5DCAA5',Atk:'#F0997B',Def:'#85B7EB',SpA:'#AFA9EC',SpD:'#97C459',Spe:'#EF9F27'};
const TIER_CLR = {S:'#FF4444',A:'#EF9F27',B:'#85B7EB',C:'#808080',LOVE:'#5DCAA5',CORE:'#AFA9EC'};
const TIER_LABEL = {S:'S — cringe to see',A:'A — big threat',B:'B — manageable',LOVE:'love to see'};
const SEC_ICONS = {'BRING 4':'👥','LEAD':'▶','TURN 1':'⚔','GAME PLAN':'🗺','THREATS':'⚠','BACKUP LINE':'↩','ARCHETYPE':'🏷'};
const SEC_CLRS = {'BRING 4':'#5DCAA5','LEAD':'#AFA9EC','TURN 1':'#EF9F27','GAME PLAN':'#85B7EB','THREATS':'#F0997B','BACKUP LINE':'#ED93B1','ARCHETYPE':'#C8A2E8'};
const GHOST_LIST = ['gengar','basculegion','sinistcha','dragapult','froslass','aegislash','mimikyu','zoroark-h','hisui typhlosion','mismagius','chandelure','gourgeist','drifblim'];
const DEFIANT_LIST = ['kingambit'];
const ARMOR_LIST = ['farigiraf','serperior'];
const MY_NAMES = ['Mega Gengar','Incineroar','Sableye','Primarina','Kommo-o','Tinkaton'];
const LEAD_PAIRS = ['Mega Gengar + Incineroar','Mega Gengar + Sableye','Mega Gengar + Tinkaton','Mega Gengar + Primarina','Mega Gengar + Kommo-o'];

function norm(s){return(s||'').toLowerCase().trim();}
function hasMon(list,arr){return arr.some(o=>list.some(l=>norm(o).includes(norm(l))));}
function findMons(list,arr){return arr.filter(Boolean).filter(o=>list.some(l=>norm(o).includes(norm(l))));}

function detectArchetype(team){
  const o=team.map(p=>norm(p));
  if(o.some(p=>['farigiraf','hatterene','camerupt','golurk','oranguru'].some(k=>p.includes(k))))return'Trick Room';
  if(o.some(p=>['pelipper','politoed'].some(k=>p.includes(k))))return'Rain';
  if(o.some(p=>['torkoal'].some(k=>p.includes(k))||p.includes('charizard')))return'Sun';
  if(o.filter(p=>GHOST_LIST.some(g=>p.includes(g))).length>=2)return'Ghost-Heavy';
  if(o.some(p=>['talonflame','aerodactyl','whimsicott'].some(k=>p.includes(k))))return'Tailwind';
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

// ── Shared Components ─────────────────────────────────────────────────────────
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

function StatBars({stats,name}){
  const primary={HP:['Kommo-o'],Atk:['Incineroar','Tinkaton'],SpA:['Mega Gengar','Primarina'],Def:['Kommo-o'],Spe:['Tinkaton','Mega Gengar']};
  return(
    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'4px 16px',marginTop:8}}>
      {Object.entries(stats).map(([k,v])=>{
        const hi=Object.entries(primary).some(([stat,names])=>stat===k&&names.includes(name));
        return(
          <div key={k} style={{display:'flex',alignItems:'center',gap:8}}>
            <span className="mono" style={{fontSize:10,color:hi?SC[k]:'var(--t3)',minWidth:30,fontWeight:hi?700:400}}>{k}</span>
            <div className="sb" style={{opacity:hi?1:0.7}}><div className="sbf" style={{width:`${Math.min(100,Math.round(v/220*100))}%`,background:SC[k]||'#888'}}/></div>
            <span className="mono" style={{fontSize:10,color:hi?'var(--text)':'var(--t2)',minWidth:28,textAlign:'right',fontWeight:hi?700:400}}>{v}</span>
          </div>
        );
      })}
    </div>
  );
}

function MetaCard({name}){
  const k=norm(name).replace(/ /g,'-').replace('mega-charizard-y','charizard').replace('mega-floette','mega-floette').replace('mega-froslass','froslass');
  const data=META_DB[k]||META_DB[norm(name).replace(/ /g,'_').replace('-','_')]||Object.values(META_DB).find(d=>norm(d.name)===norm(name)||norm(name).includes(norm(d.name).split('-')[0]));
  if(!data)return null;
  return(
    <div className="card" style={{marginBottom:12}}>
      <div style={{display:'flex',gap:12,alignItems:'flex-start',marginBottom:10}}>
        <img src={getPokemonImage(name)} className="poke-img" alt={name} onError={e=>{e.target.style.display='none';}}/>
        <div style={{flex:1,minWidth:0}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',flexWrap:'wrap',gap:4}}>
            <div>
              <span style={{fontSize:14,fontWeight:600,color:TIER_CLR[data.tier]||'var(--text)',marginRight:6}}>{data.name}</span>
              <div style={{display:'flex',gap:4,marginTop:3,flexWrap:'wrap'}}>
                {(data.types||[]).map(t=><TypeBadge key={t} type={t}/>)}
              </div>
            </div>
            <div style={{textAlign:'right'}}>
              <div className="mono" style={{fontSize:10,color:'var(--t3)'}}>{data.rank?`#${data.rank} · `:''}Usage: {data.usage}%</div>
              <div className="mono" style={{fontSize:12,fontWeight:700,color:data.wr>=58?'var(--teal)':data.wr>=54?'var(--amber)':'var(--coral)'}}>{data.wr}% WR</div>
            </div>
          </div>
          {data.keyWarning&&<p className="mono" style={{fontSize:10,color:data.tier==='S'?'#FF7777':data.tier==='LOVE'?'var(--teal)':'var(--amber)',marginTop:5,lineHeight:1.5}}>{data.keyWarning}</p>}
        </div>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
        <div>
          <span className="sec-label">top moves</span>
          {(data.moves||[]).slice(0,5).map(({m,pct})=>(
            <div key={m} style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:5}}>
              <MoveWithType move={m}/>
              <div style={{display:'flex',alignItems:'center',gap:6}}>
                <div style={{width:44,height:4,background:'var(--b1)',borderRadius:2}}><div style={{width:`${pct}%`,height:4,background:'var(--acc)',borderRadius:2}}/></div>
                <span className="mono" style={{fontSize:10,color:'var(--t3)',minWidth:32,textAlign:'right'}}>{pct}%</span>
              </div>
            </div>
          ))}
        </div>
        <div>
          <span className="sec-label">items</span>
          {(data.items||[]).slice(0,3).map(({i,pct})=>(
            <div key={i} style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:5}}>
              <span className="mono" style={{fontSize:11,color:'var(--t2)'}}>{i}</span>
              <div style={{display:'flex',alignItems:'center',gap:6}}>
                <div style={{width:44,height:4,background:'var(--b1)',borderRadius:2}}><div style={{width:`${pct}%`,height:4,background:'var(--amber)',borderRadius:2}}/></div>
                <span className="mono" style={{fontSize:10,color:'var(--t3)',minWidth:32,textAlign:'right'}}>{pct}%</span>
              </div>
            </div>
          ))}
          <span className="sec-label" style={{marginTop:8}}>ability</span>
          {(data.abilities||[]).slice(0,2).map(({a,pct})=>(
            <div key={a} style={{display:'flex',justifyContent:'space-between',marginBottom:4}}>
              <span className="mono" style={{fontSize:11,color:'var(--purple)'}}>{a}</span>
              <span className="mono" style={{fontSize:10,color:'var(--t3)'}}>{pct}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Speed Tier Tab ────────────────────────────────────────────────────────────
function SpeedTab(){
  const [showScarf,setShowScarf]=useState(true);
  const [filter,setFilter]=useState('all');
  const [search,setSearch]=useState('');

  const sorted=[...SPEED_TIERS].map(p=>{
    const spd=calcSpeed(p.base,p.sp||0,p.nature||'0');
    return{...p,speed:spd,scarfSpeed:Math.floor(spd*1.5)};
  }).sort((a,b)=>b.speed-a.speed);

  const filtered=sorted.filter(p=>{
    if(filter==='mine'&&!p.isMyMon)return false;
    if(filter==='threats'&&p.isMyMon)return false;
    if(filter==='ghost'&&!p.isGhost)return false;
    if(search&&!p.name.toLowerCase().includes(search.toLowerCase()))return false;
    return true;
  });

  const gengarSpeed=calcSpeed(130,8,'+');

  return(
    <div>
      <div className="card" style={{marginBottom:16}}>
        <div style={{display:'flex',gap:24,alignItems:'center',flexWrap:'wrap'}}>
          <div>
            <span className="sec-label">Formula</span>
            <span className="mono" style={{fontSize:11,color:'var(--t2)'}}>(Base + SP + 20) × Nature</span>
          </div>
          <div>
            <span className="sec-label">Scarf</span>
            <span className="mono" style={{fontSize:11,color:'var(--amber)'}}>× 1.5 speed</span>
          </div>
          <div>
            <span className="sec-label">Your Gengar</span>
            <span className="mono" style={{fontSize:12,fontWeight:700,color:'var(--purple)'}}>{gengarSpeed} battle speed</span>
          </div>
          <div style={{marginLeft:'auto',display:'flex',gap:8,flexWrap:'wrap'}}>
            <input className="pi" style={{width:140}} placeholder="search..." value={search} onChange={e=>setSearch(e.target.value)}/>
            {['all','mine','threats','ghost'].map(f=>(
              <button key={f} className={`btn-sm${filter===f?' on':''}`} onClick={()=>setFilter(f)} style={filter===f?{background:'var(--acc)',color:'#eee',borderColor:'var(--acc)'}:{}}>
                {f}
              </button>
            ))}
            <button className="btn-sm" onClick={()=>setShowScarf(s=>!s)} style={showScarf?{background:'rgba(239,159,39,0.2)',color:'var(--amber)',borderColor:'var(--amber)'}:{}}>
              scarf {showScarf?'on':'off'}
            </button>
          </div>
        </div>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(480px,1fr))',gap:8}}>
        {filtered.map((p,i)=>{
          const prev=filtered[i-1];
          const gap=prev&&(prev.speed-p.speed)>=15;
          return(
            <div key={p.name+i}>
              {gap&&<div className="speed-divider" style={{gridColumn:'1/-1'}}/>}
              <div className={`speed-row${p.isMyMon?' my-mon':''}${p.isGhost?' ghost-mon':''}`}>
                <img src={getPokemonImage(p.name)} className="poke-img-sm" alt={p.name} onError={e=>{e.target.style.display='none';}}/>
                <span className="speed-name" style={{color:p.isMyMon?'var(--purple)':p.isGhost?'#FF7777':p.clr||'var(--text)'}}>{p.name}</span>
                <div style={{display:'flex',gap:6,alignItems:'center',minWidth:130}}>
                  <span className="speed-val" style={{color:p.isMyMon?'var(--purple)':p.isGhost?'#FF7777':p.clr||'var(--text)'}}>{p.speed}</span>
                  {showScarf&&!p.isMyMon&&<span className="mono" style={{fontSize:11,color:'var(--amber)',opacity:.8}}>→{p.scarfSpeed}</span>}
                </div>
                <span className="speed-note">{p.note}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="card" style={{marginTop:16}}>
        <span className="sec-label">legend</span>
        <div style={{display:'flex',gap:16,flexWrap:'wrap'}}>
          <div style={{display:'flex',alignItems:'center',gap:8}}><div style={{width:16,height:16,borderRadius:3,background:'rgba(83,74,183,0.2)',border:'1px solid rgba(83,74,183,0.4)'}}/><span className="mono" style={{fontSize:11,color:'var(--t2)'}}>your team</span></div>
          <div style={{display:'flex',alignItems:'center',gap:8}}><div style={{width:16,height:16,borderRadius:3,background:'rgba(255,68,68,0.08)',border:'1px solid rgba(255,68,68,0.3)'}}/><span className="mono" style={{fontSize:11,color:'var(--t2)'}}>ghost type (escapes Shadow Tag)</span></div>
          <div style={{display:'flex',alignItems:'center',gap:8}}><span className="mono" style={{fontSize:11,color:'var(--amber)'}}>→ scarf speed</span></div>
          <div style={{display:'flex',alignItems:'center',gap:8}}><span className="mono" style={{fontSize:11,color:'var(--t3)'}}>SP = effort points in speed</span></div>
        </div>
      </div>
    </div>
  );
}

// ── PS Guide Tab ──────────────────────────────────────────────────────────────
function PSGuideTab(){
  const [sel,setSel]=useState('incineroar');

  const archetypes={
    incineroar:{
      name:'Incineroar Lead',subtitle:'The Standard — most straightforward',clr:'#F0997B',
      summary:'Most straightforward path to victory. Fake Out the biggest threat, Perish Song immediately. Problem: hard countered when two threats target Gengar simultaneously.',
      when:['Opponent has ≤1 immediate Gengar threat','No Kingambit or Competitive users on lead','No Scrappy users (Kangaskhan, Mega Lopunny)','Relatively safe field for Incineroar'],
      whenNot:['Two threats into Gengar simultaneously','Kingambit or Defiant on lead (Parting Shot would trigger Defiant)','Double Dark type leads (Prankster/Intimidate both fail)'],
      turns:[
        {count:'T1 (PS=3)',p1:{mon:'Incineroar',move:'Fake Out',detail:'Target the biggest immediate threat to Gengar'},p2:{mon:'Mega Gengar',move:'Protect',detail:'Blocked from Fake Out + priority damage'},note:'Counter starts when Perish Song is used — T1 is the setup turn'},
        {count:'T2 (PS=3→)',p1:{mon:'Incineroar',move:'Parting Shot → Kommo-o',detail:'Slow speed means it fires late — Gengar enters safely'},p2:{mon:'Mega Gengar',move:'Perish Song',detail:'PS countdown begins. Both opponents are now trapped.'},note:'Parting Shot is slow. Gengar comes in after most attacks have fired this turn.'},
        {count:'T3 (PS=2)',p1:{mon:'Kommo-o',move:'Protect',detail:'Soundproof = immune to Perish Song. Safe anchor.'},p2:{mon:'Mega Gengar',move:'Protect',detail:'Double Protect. Count ticks to 2. Both opponents are stuck.'},note:'Optional: Disable/Encore with Kommo-o slot instead if opponent threatens to escape.'},
        {count:'T4 (PS=1)',p1:{mon:'Kommo-o',move:'Hard Switch OUT',detail:'Switch to bulky resist for incoming damage'},p2:{mon:'Mega Gengar',move:'Hard Switch OUT',detail:'Switch out to refresh PS timer for Gengar'},note:'Both switch out simultaneously. On count 0, both trapped opponents faint.'},
        {count:'T5 (PS=0)',p1:{mon:'Your switch-in',move:'Protect or move',detail:'Absorb any final attacks'},p2:{mon:'Gengar switch-in',move:'Protect',detail:'Gengar re-enters PS-free, ready to set up again'},note:'Both trapped opponents die from PS=0. You are up 4v2. Set up PS again immediately.'},
      ],
    },
    sableye:{
      name:'Sableye Lead',subtitle:'Most Versatile — highest skill ceiling',clr:'#B4B2A9',
      summary:'Most malleable lead. Works against almost everything but requires more turns to set up PS and has no pivoting move — both Pokemon must survive to count zero.',
      when:['Sneasler present on opponent team (bot vs Ghosts)','Multiple setup/status users to Disable','Tailwind or weather teams needing disruption','When Incineroar would trigger Defiant/Competitive'],
      whenNot:['Two faster threats than Gengar simultaneously (Sableye can only Disable one per turn)','Double Dark type leads (Prankster fails on both)','Farigiraf + partner (Armor Tail blocks Fake Out; Prankster fails on Normal/Psychic)'],
      turns:[
        {count:'Option A: Fake Out path',p1:{mon:'Sableye',move:'Fake Out (Prankster)',detail:'Priority — goes first. Target single biggest threat to Gengar.'},p2:{mon:'Mega Gengar',move:'Perish Song',detail:'Only one threat = safe to PS immediately.'},note:'Same path as Incineroar if only one Gengar threat exists. Then double Protect next turn.'},
        {count:'Option B: Double Protect path',p1:{mon:'Sableye',move:'Disable (Prankster)',detail:'Disable the faster threat — Sableye goes first regardless of speed'},p2:{mon:'Mega Gengar',move:'Disable',detail:'Disable the slower threat simultaneously. Both opponents lose their key move.'},note:'Use when two threats exist. Protect both first, then double Disable on the moves they used.'},
        {count:'T3 (whenever safe)',p1:{mon:'Sableye',move:'Encore (Prankster)',detail:'Lock the disabling target into a harmless or wasted move'},p2:{mon:'Mega Gengar',move:'Perish Song',detail:'Set PS when opponents are neutralized via Disable/Encore'},note:'Sableye + Gengar combo: Encore one, Disable other = both offline simultaneously.'},
        {count:'Count 0 (no pivot)',p1:{mon:'Sableye',move:'Hard Switch OUT',detail:'No Flip Turn or Parting Shot — sacrifice if needed'},p2:{mon:'Mega Gengar',move:'Hard Switch OUT',detail:'Both hard switch simultaneously'},note:'Lake2: "Let Sableye go down sometimes if needed — switch Gengar in off the KO. Shadow Tag never fully left the field."'},
      ],
    },
    primarina:{
      name:'Primarina Lead',subtitle:'Double PS — high risk, high reward',clr:'#ED93B1',
      summary:'Two Perish Song users on field simultaneously. Conservative lead — whoever is threatened Protects, the other uses PS. The Flip Turn fires LAST due to low speed, safely returning Gengar.',
      when:['Opponent threatens Gengar but not Primarina','Primarina matchup: threats use Psychic/Ghost/Dark into Gengar, not Fairy/Water/Grass into Prim','When you need the Kommo-o slot for back defense','Against Hydreigon (Prim resists Dragon + Dark)'],
      whenNot:['Opponent threatens both Gengar AND Primarina simultaneously','When you need Fake Out T1 specifically (Prim has no Fake Out)','Double Dark leads (Prim has no Disable/Encore option)'],
      turns:[
        {count:'T1 — Gengar threatened',p1:{mon:'Primarina',move:'Perish Song',detail:'Prim is safer — use PS from the safer slot'},p2:{mon:'Mega Gengar',move:'Protect',detail:'Protected from threats. Cannot PS and Protect both.'},note:'Gengar cannot Protect T2 after Protecting T1 (consecutive Protect fails). Must switch or act.'},
        {count:'T1 — Prim threatened',p1:{mon:'Primarina',move:'Protect',detail:'Protect the threatened slot'},p2:{mon:'Mega Gengar',move:'Perish Song',detail:'Gengar uses PS from safer position'},note:'Whoever is safer uses PS. This is the core read of the Primarina archetype.'},
        {count:'T2 (PS=3→2)',p1:{mon:'Primarina',move:'Flip Turn (FIRES LAST)',detail:'Low speed = fires after all attacks. Gengar enters safely.'},p2:{mon:'Mega Gengar',move:'Switch → Kommo-o',detail:'Manual switch to Kommo-o. Kommo-o immune to PS.'},note:'Gengar switches to Kommo-o, then Prim Flip Turns last — bringing Gengar back in. Gengar is now PS-free.'},
        {count:'T3 (PS=2)',p1:{mon:'New mon (Kommo-o slot)',move:'Protect',detail:''},p2:{mon:'Mega Gengar',move:'Protect',detail:'Double Protect. Count hits 2.'},note:'If no substitute: both slots are vulnerable on this turn. Bulky switch-ins mitigate this.'},
        {count:'T4-5 (PS=1→0)',p1:{mon:'Kommo-o slot',move:'Hard Switch OUT',detail:'Switch to whatever takes least damage'},p2:{mon:'Mega Gengar',move:'Hard Switch OUT',detail:'Double hard switch'},note:'Lake2: Substitute on Gengar makes this much cleaner — adds a buffer turn to allow double Protect.'},
      ],
    },
  };

  const arch=archetypes[sel];
  if(!arch)return null;

  return(
    <div>
      <div style={{display:'flex',gap:8,marginBottom:16,flexWrap:'wrap'}}>
        {Object.entries(archetypes).map(([k,a])=>(
          <button key={k} className={`tab${sel===k?' on':''}`} onClick={()=>setSel(k)} style={sel===k?{borderColor:a.clr,color:a.clr,background:`${a.clr}18`}:{}}>
            {a.name}
          </button>
        ))}
      </div>

      <div className="card" style={{borderLeft:`3px solid ${arch.clr}`,paddingLeft:18,marginBottom:16}}>
        <div style={{marginBottom:6}}>
          <span style={{fontSize:15,fontWeight:600,color:arch.clr}}>{arch.name}</span>
          <span className="mono" style={{fontSize:11,color:'var(--t3)',marginLeft:10}}>{arch.subtitle}</span>
        </div>
        <p style={{fontSize:13,color:'var(--t2)',lineHeight:1.7}}>{arch.summary}</p>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:16}}>
        <div className="card">
          <span className="sec-label" style={{color:'var(--teal)'}}>✓ use this when</span>
          {arch.when.map((w,i)=>(
            <div key={i} style={{display:'flex',gap:8,marginBottom:5}}>
              <span style={{color:'var(--teal)',fontSize:12,marginTop:1}}>•</span>
              <span style={{fontSize:12,color:'var(--t2)',lineHeight:1.5}}>{w}</span>
            </div>
          ))}
        </div>
        <div className="card">
          <span className="sec-label" style={{color:'var(--coral)'}}>✗ avoid when</span>
          {arch.whenNot.map((w,i)=>(
            <div key={i} style={{display:'flex',gap:8,marginBottom:5}}>
              <span style={{color:'var(--coral)',fontSize:12,marginTop:1}}>•</span>
              <span style={{fontSize:12,color:'var(--t2)',lineHeight:1.5}}>{w}</span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <span className="sec-label">turn-by-turn flow</span>
        {arch.turns.map((turn,i)=>(
          <div key={i} className="loop-box">
            <div className="mono" style={{fontSize:11,color:arch.clr,fontWeight:700,marginBottom:8,letterSpacing:'.08em'}}>{turn.count}</div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:turn.note?8:0}}>
              {[turn.p1,turn.p2].map((slot,si)=>(
                <div key={si} style={{background:'var(--bg)',borderRadius:6,padding:'8px 10px',border:'1px solid var(--b1)'}}>
                  <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:4}}>
                    <img src={getPokemonImage(slot.mon.split(' ')[0]==='New'?'Kommo-o':slot.mon.split('→')[0].trim())} className="poke-img-xs" alt={slot.mon} onError={e=>{e.target.style.display='none';}}/>
                    <span className="mono" style={{fontSize:11,fontWeight:700,color:si===0?arch.clr:'var(--purple)'}}>{slot.mon}</span>
                  </div>
                  <div style={{marginBottom:3}}>
                    <MoveWithType move={slot.move.split('→')[0].trim().split(' ')[0]==='Hard'?'Protect':slot.move.split('→')[0].trim().split('(')[0].trim()}/>
                  </div>
                  {slot.detail&&<p className="mono" style={{fontSize:10,color:'var(--t3)',lineHeight:1.4}}>{slot.detail}</p>}
                </div>
              ))}
            </div>
            {turn.note&&<div style={{background:'rgba(83,74,183,0.08)',border:'1px solid rgba(83,74,183,0.2)',borderRadius:6,padding:'7px 10px'}}>
              <p className="mono" style={{fontSize:11,color:'var(--purple)',lineHeight:1.5}}>💡 {turn.note}</p>
            </div>}
          </div>
        ))}
      </div>

      <div className="card" style={{marginTop:8,borderLeft:'2px solid var(--amber)',paddingLeft:14}}>
        <span className="sec-label" style={{color:'var(--amber)'}}>lake2 key insight</span>
        <p style={{fontSize:12,color:'var(--t2)',lineHeight:1.7}}>
          Substitute on Mega Gengar transforms the Primarina archetype into something much cleaner — it adds a free buffer turn allowing double Protect, which shifts Primarina into the same smooth flow as the Incineroar archetype. Without Substitute, the Primarina loop requires more precise damage mitigation on vulnerable turns.
        </p>
      </div>
    </div>
  );
}

// ── Roster Tab ────────────────────────────────────────────────────────────────
function RosterTab({team,setTeam}){
  const [sel,setSel]=useState(null);
  const [editing,setEditing]=useState(null);
  const [draft,setDraft]=useState(null);

  const startEdit=(p)=>{setDraft({...p,mv:[...p.mv],stats:{...p.stats}});setEditing(p.name);};
  const saveEdit=()=>{setTeam(prev=>prev.map(p=>p.name===editing?{...draft}:p));setEditing(null);setDraft(null);};

  return(
    <div>
      <span className="sec-label">click to expand · edit to customize · saves to browser automatically</span>
      {team.map(p=>(
        <div key={p.name} style={{position:'relative'}}>
          {editing===p.name&&draft?(
            <div className="card" style={{borderColor:'var(--acc)'}}>
              <span className="sec-label" style={{color:'var(--purple)'}}>editing — {p.name}</span>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:10}}>
                <div><label className="sec-label">ability</label><input className="pi" value={draft.ab} onChange={e=>setDraft({...draft,ab:e.target.value})}/></div>
                <div><label className="sec-label">item</label><input className="pi" value={draft.item} onChange={e=>setDraft({...draft,item:e.target.value})}/></div>
              </div>
              <label className="sec-label">moves (comma separated)</label>
              <input className="pi" style={{marginBottom:10}} value={draft.mv.join(', ')} onChange={e=>setDraft({...draft,mv:e.target.value.split(',').map(s=>s.trim())})}/>
              <label className="sec-label">notes</label>
              <textarea className="ta" style={{marginBottom:10}} value={draft.note} onChange={e=>setDraft({...draft,note:e.target.value})}/>
              <div style={{display:'flex',gap:8}}><button className="abtn" onClick={saveEdit} style={{flex:1}}>save changes</button><button className="btn-sm" onClick={()=>{setEditing(null);setDraft(null);}}>cancel</button></div>
            </div>
          ):(
            <div className="card-click" style={{borderColor:sel===p.name?p.clr:'var(--b1)'}} onClick={()=>setSel(sel===p.name?null:p.name)}>
              <div style={{display:'flex',gap:12,alignItems:'flex-start'}}>
                <img src={getPokemonImage(p.name)} className="poke-img" alt={p.name} onError={e=>{e.target.style.display='none';}}/>
                <div style={{flex:1}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',flexWrap:'wrap',gap:6}}>
                    <div>
                      <span style={{fontSize:14,fontWeight:600,color:p.clr,marginRight:8}}>{p.name}</span>
                      <span className="rb" style={{background:p.bg,color:p.clr,border:`1px solid ${p.clr}40`}}>{p.role}</span>
                    </div>
                    <span className="mono" style={{fontSize:11,color:'var(--t3)'}}>Spe {p.spe}</span>
                  </div>
                  <div style={{display:'flex',gap:4,marginTop:5,flexWrap:'wrap'}}>
                    {(p.types||[]).map(t=><TypeBadge key={t} type={t}/>)}
                  </div>
                  <p className="mono" style={{fontSize:11,color:'var(--t2)',marginTop:4}}>{p.ab} · {p.item}</p>
                  <div style={{display:'flex',gap:8,flexWrap:'wrap',marginTop:4}}>
                    {(p.mv||[]).map(m=><span key={m}><MoveWithType move={m}/></span>)}
                  </div>
                  {sel===p.name&&(
                    <div style={{marginTop:12,paddingTop:12,borderTop:'1px solid var(--b1)'}}>
                      <p style={{fontSize:12,color:'var(--t2)',fontStyle:'italic',lineHeight:1.65,marginBottom:10}}>{p.note}</p>
                      <StatBars stats={p.stats} name={p.name}/>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          {editing!==p.name&&<button onClick={e=>{e.stopPropagation();startEdit(p);}} className="btn-sm" style={{position:'absolute',top:14,right:14,fontSize:10}}>edit</button>}
        </div>
      ))}
    </div>
  );
}

// ── Threats Tab ───────────────────────────────────────────────────────────────
function ThreatsTab(){
  return(
    <div>
      {['S','A','B','LOVE'].map(tier=>{
        const items=THREATS_STATIC.filter(t=>t.tier===tier);
        if(!items.length)return null;
        return(
          <div key={tier}>
            <div className="tier-divider" style={{borderColor:TIER_CLR[tier]||'#888',color:TIER_CLR[tier]||'#888'}}>{TIER_LABEL[tier]||tier}</div>
            {items.map(t=>(
              <div key={t.name} className="card">
                <div style={{display:'flex',gap:12,alignItems:'flex-start',marginBottom:6}}>
                  <img src={getPokemonImage(t.name)} className="poke-img-sm" alt={t.name} onError={e=>{e.target.style.display='none';}}/>
                  <div style={{flex:1}}>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:4}}>
                      <div style={{display:'flex',alignItems:'center',gap:8}}>
                        <span style={{fontSize:13,fontWeight:600,color:TIER_CLR[tier]||'var(--text)'}}>{t.name}</span>
                        {t.isG&&<span className="rb" style={{background:'#1e0808',color:'#FF4444',border:'1px solid #FF444430',fontSize:10}}>ghost ⛔</span>}
                        {t.hasD&&<span className="rb" style={{background:'#1e1408',color:'var(--amber)',border:'1px solid #EF9F2730',fontSize:10}}>defiant ⚠</span>}
                      </div>
                      <span className="rb" style={{background:'var(--bg4)',color:TIER_CLR[tier]||'#888',fontSize:10}}>{tier}</span>
                    </div>
                    <p className="mono" style={{fontSize:11,color:'var(--t2)',marginTop:4,lineHeight:1.65}}>{t.detail}</p>
                    <p style={{fontSize:11,color:'var(--teal)',marginTop:5,lineHeight:1.5,fontStyle:'italic'}}>Counter: {t.counter}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}

// ── Win Con Tab ───────────────────────────────────────────────────────────────
function WinConTab(){
  return(
    <div>
      {WINCONS.map(w=>(
        <div key={w.arch} className="card" style={{borderLeft:`3px solid ${w.clr}`,paddingLeft:16}}>
          <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:8}}>
            <span style={{fontSize:20}}>{w.icon}</span>
            <span style={{fontSize:14,fontWeight:600,color:w.clr}}>{w.arch}</span>
          </div>
          <p style={{fontSize:13,color:'var(--t2)',lineHeight:1.7}}>{w.plan}</p>
        </div>
      ))}
    </div>
  );
}

// ── Match Log Tab ─────────────────────────────────────────────────────────────
function MatchLogTab(){
  const [matches,setMatches]=useState([]);
  const [form,setForm]=useState({opp:['','','','','',''],my4:[],lead:'',result:'',notes:''});
  const [view,setView]=useState('log');
  const [del,setDel]=useState(null);

  useEffect(()=>{try{const s=localStorage.getItem('ps_matches_v3');if(s)setMatches(JSON.parse(s));}catch(e){}}, []);
  const save=(data)=>{setMatches(data);try{localStorage.setItem('ps_matches_v3',JSON.stringify(data));}catch(e){}};
  const submit=()=>{
    if(!form.result)return;
    save([{id:Date.now(),date:new Date().toLocaleDateString(),opp:form.opp.filter(Boolean),my4:form.my4,lead:form.lead,result:form.result,notes:form.notes,archetype:detectArchetype(form.opp)},...matches]);
    setForm({opp:['','','','','',''],my4:[],lead:'',result:'',notes:''});setView('log');
  };
  const wins=matches.filter(m=>m.result==='W').length;
  const total=matches.length;
  const wr=total?Math.round(wins/total*100):0;
  const byArch={};
  matches.forEach(m=>{if(!byArch[m.archetype])byArch[m.archetype]={w:0,l:0};byArch[m.archetype][m.result==='W'?'w':'l']++;});
  const byLead={};
  matches.forEach(m=>{if(!m.lead)return;if(!byLead[m.lead])byLead[m.lead]={w:0,l:0};byLead[m.lead][m.result==='W'?'w':'l']++;});
  const tc={};matches.forEach(m=>m.opp.forEach(p=>{if(p)tc[p]=(tc[p]||0)+1;}));
  const topT=Object.entries(tc).sort((a,b)=>b[1]-a[1]).slice(0,8);

  return(
    <div>
      <div style={{display:'flex',gap:6,marginBottom:16,flexWrap:'wrap',alignItems:'center'}}>
        {['log','add','stats'].map(v=>(
          <button key={v} className={`tab${view===v?' on':''}`} onClick={()=>setView(v)}>{v==='log'?`log (${total})`:v==='add'?'+ log match':'stats'}</button>
        ))}
        {total>0&&<div style={{marginLeft:'auto',display:'flex',gap:12,alignItems:'center'}}>
          <span className="mono" style={{fontSize:12,color:'var(--teal)'}}>{wins}W</span>
          <span className="mono" style={{fontSize:12,color:'var(--coral)'}}>{total-wins}L</span>
          <span className="mono" style={{fontSize:16,fontWeight:700,color:wr>=50?'var(--teal)':'var(--coral)'}}>{wr}%</span>
        </div>}
      </div>

      {view==='log'&&<div>
        {!matches.length&&<div className="bench"><div style={{fontSize:40,marginBottom:12}}>📋</div><p className="mono" style={{fontSize:11,color:'var(--t3)',lineHeight:1.8}}>no matches logged yet<br/>click "+ log match" after each game</p></div>}
        {matches.map(m=>(
          <div key={m.id} className="card" style={{borderLeft:`3px solid ${m.result==='W'?'var(--teal)':'var(--coral)'}`,paddingLeft:14}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
              <div style={{display:'flex',alignItems:'center',gap:10}}>
                <span style={{fontSize:14,fontWeight:700,color:m.result==='W'?'var(--teal)':'var(--coral)'}}>{m.result==='W'?'WIN':'LOSS'}</span>
                <span className="rb" style={{background:'var(--bg4)',color:'var(--t2)',fontSize:10}}>{m.archetype}</span>
                <span className="mono" style={{fontSize:10,color:'var(--t3)'}}>{m.date}</span>
              </div>
              <button onClick={()=>setDel(del===m.id?null:m.id)} style={{background:'none',border:'none',color:'var(--t3)',cursor:'pointer',fontSize:18,lineHeight:1}}>×</button>
            </div>
            <div style={{display:'flex',gap:6,flexWrap:'wrap',marginBottom:6}}>
              {m.opp.map((p,i)=><div key={i} style={{display:'flex',alignItems:'center',gap:4}}>
                <img src={getPokemonImage(p)} className="poke-img-xs" alt={p} onError={e=>{e.target.style.display='none';}}/>
                <span className="mono" style={{fontSize:10,color:'var(--t2)'}}>{p}</span>
              </div>)}
            </div>
            {m.lead&&<p className="mono" style={{fontSize:11,color:'var(--purple)',marginBottom:3}}>Lead: {m.lead}</p>}
            {m.notes&&<p style={{fontSize:11,color:'var(--t2)',fontStyle:'italic',lineHeight:1.5}}>{m.notes}</p>}
            {del===m.id&&<div style={{marginTop:8,display:'flex',gap:8,alignItems:'center'}}>
              <span className="mono" style={{fontSize:11,color:'var(--coral)'}}>delete?</span>
              <button onClick={()=>{save(matches.filter(x=>x.id!==m.id));setDel(null);}} style={{background:'var(--coral)',border:'none',borderRadius:4,padding:'4px 12px',color:'#fff',fontSize:11,fontFamily:'var(--mono)',cursor:'pointer'}}>yes</button>
              <button onClick={()=>setDel(null)} className="btn-sm">no</button>
            </div>}
          </div>
        ))}
      </div>}

      {view==='add'&&<div>
        <span className="sec-label">opponent team</span>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:14}}>
          {form.opp.map((v,i)=>(
            <div key={i} style={{display:'flex',alignItems:'center',gap:6}}>
              <span className="mono" style={{fontSize:11,color:'var(--t3)',minWidth:14}}>{i+1}</span>
              <input type="text" value={v} list="dex" className="pi" placeholder={`Pokemon ${i+1}`} onChange={e=>{const o=[...form.opp];o[i]=e.target.value;setForm({...form,opp:o});}}/>
            </div>
          ))}
        </div>
        <span className="sec-label">my bring 4</span>
        <div style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:4}}>
          {MY_NAMES.map(p=>{const s=form.my4.includes(p);return(
            <button key={p} onClick={()=>{if(s)setForm({...form,my4:form.my4.filter(x=>x!==p)});else if(form.my4.length<4)setForm({...form,my4:[...form.my4,p]});}}
              style={{display:'flex',alignItems:'center',gap:6,background:s?`${['#AFA9EC','#F0997B','#B4B2A9','#ED93B1','#5DCAA5','#85B7EB'][MY_NAMES.indexOf(p)]}22`:'var(--bg3)',border:`1px solid ${s?['#AFA9EC','#F0997B','#B4B2A9','#ED93B1','#5DCAA5','#85B7EB'][MY_NAMES.indexOf(p)]:'var(--b2)'}`,borderRadius:6,padding:'6px 11px',color:'var(--t2)',fontSize:11,fontFamily:'var(--mono)',cursor:'pointer'}}>
              <img src={getPokemonImage(p)} className="poke-img-xs" alt={p} onError={e=>{e.target.style.display='none';}}/>
              {p}
            </button>);})}
        </div>
        <p className="mono" style={{fontSize:10,color:'var(--t3)',marginBottom:14}}>{form.my4.length}/4 selected</p>
        <span className="sec-label">lead pair</span>
        <select value={form.lead} onChange={e=>setForm({...form,lead:e.target.value})} className="pi" style={{marginBottom:14}}>
          <option value="">— select lead —</option>
          {LEAD_PAIRS.map(l=><option key={l} value={l}>{l}</option>)}
        </select>
        <span className="sec-label">result</span>
        <div style={{display:'flex',gap:10,marginBottom:14}}>
          {['W','L'].map(r=>(
            <button key={r} onClick={()=>setForm({...form,result:r})} style={{flex:1,padding:'12px',border:`1px solid ${form.result===r?(r==='W'?'var(--teal)':'var(--coral)'):'var(--b2)'}`,borderRadius:8,background:form.result===r?(r==='W'?'rgba(93,202,165,0.1)':'rgba(240,153,123,0.1)'):'var(--bg3)',color:form.result===r?(r==='W'?'var(--teal)':'var(--coral)'):'var(--t2)',fontSize:15,fontWeight:700,fontFamily:'var(--mono)',cursor:'pointer'}}>
              {r==='W'?'✓ WIN':'✗ LOSS'}
            </button>
          ))}
        </div>
        <span className="sec-label">notes</span>
        <textarea value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})} className="ta" placeholder="What worked? Key plays? Opponent surprises?" style={{marginBottom:14}}/>
        <button className="abtn" onClick={submit} disabled={!form.result}>save match →</button>
      </div>}

      {view==='stats'&&<div>
        {!total&&<div className="bench"><p className="mono" style={{fontSize:11,color:'var(--t3)'}}>log some matches first</p></div>}
        {total>0&&<>
          <div className="card" style={{marginBottom:12}}>
            <span className="sec-label">overall record</span>
            <div style={{display:'flex',gap:24,alignItems:'center'}}>
              <div style={{textAlign:'center'}}><div style={{fontSize:32,fontWeight:700,color:'var(--teal)',fontFamily:'var(--mono)'}}>{wins}</div><div className="mono" style={{fontSize:10,color:'var(--t3)'}}>wins</div></div>
              <div style={{textAlign:'center'}}><div style={{fontSize:32,fontWeight:700,color:'var(--coral)',fontFamily:'var(--mono)'}}>{total-wins}</div><div className="mono" style={{fontSize:10,color:'var(--t3)'}}>losses</div></div>
              <div style={{textAlign:'center',marginLeft:'auto'}}><div style={{fontSize:42,fontWeight:700,color:wr>=50?'var(--teal)':'var(--coral)',fontFamily:'var(--mono)'}}>{wr}%</div><div className="mono" style={{fontSize:10,color:'var(--t3)'}}>win rate</div></div>
            </div>
          </div>
          {Object.keys(byArch).length>0&&<div className="card" style={{marginBottom:12}}>
            <span className="sec-label">by archetype</span>
            {Object.entries(byArch).sort((a,b)=>(b[1].w+b[1].l)-(a[1].w+a[1].l)).map(([arch,rec])=>{
              const w2=Math.round(rec.w/(rec.w+rec.l)*100);
              return <div key={arch} style={{display:'flex',alignItems:'center',gap:12,marginBottom:8}}>
                <span className="mono" style={{fontSize:11,color:'var(--t2)',minWidth:130}}>{arch}</span>
                <div style={{flex:1,height:6,background:'var(--b1)',borderRadius:3}}><div style={{width:`${w2}%`,height:6,background:w2>=50?'var(--teal)':'var(--coral)',borderRadius:3}}/></div>
                <span className="mono" style={{fontSize:12,color:w2>=50?'var(--teal)':'var(--coral)',minWidth:44,textAlign:'right',fontWeight:700}}>{w2}%</span>
                <span className="mono" style={{fontSize:10,color:'var(--t3)',minWidth:50}}>{rec.w}W {rec.l}L</span>
              </div>;
            })}
          </div>}
          {Object.keys(byLead).length>0&&<div className="card" style={{marginBottom:12}}>
            <span className="sec-label">by lead pair</span>
            {Object.entries(byLead).sort((a,b)=>(b[1].w/(b[1].w+b[1].l))-(a[1].w/(a[1].w+a[1].l))).map(([lead,rec])=>{
              const w2=Math.round(rec.w/(rec.w+rec.l)*100);
              return <div key={lead} style={{display:'flex',alignItems:'center',gap:12,marginBottom:8}}>
                <span className="mono" style={{fontSize:10,color:'var(--purple)',minWidth:190}}>{lead}</span>
                <div style={{flex:1,height:6,background:'var(--b1)',borderRadius:3}}><div style={{width:`${w2}%`,height:6,background:'var(--purple)',borderRadius:3}}/></div>
                <span className="mono" style={{fontSize:12,color:'var(--purple)',minWidth:44,textAlign:'right',fontWeight:700}}>{w2}%</span>
                <span className="mono" style={{fontSize:10,color:'var(--t3)',minWidth:50}}>{rec.w}W {rec.l}L</span>
              </div>;
            })}
          </div>}
          {topT.length>0&&<div className="card">
            <span className="sec-label">most faced</span>
            {topT.map(([name,count])=>(
              <div key={name} style={{display:'flex',alignItems:'center',gap:10,marginBottom:7}}>
                <img src={getPokemonImage(name)} className="poke-img-xs" alt={name} onError={e=>{e.target.style.display='none';}}/>
                <span className="mono" style={{fontSize:12,color:'var(--text)',flex:1}}>{name}</span>
                <span className="mono" style={{fontSize:11,color:'var(--amber)'}}>{count}× ({Math.round(count/total*100)}%)</span>
              </div>
            ))}
          </div>}
        </>}
      </div>}
    </div>
  );
}

// ── Coach Tab ─────────────────────────────────────────────────────────────────
const KNOWN_CORES=[
  {p:['sneasler','garchomp'],note:'Sneasler Fake Out + Garchomp EQ spread. Sableye+Gengar shuts Sneasler down — cannot touch Ghosts.'},
  {p:['sneasler','kingambit'],note:'Kingambit Defiant — NEVER Parting Shot. Kommo-o Body Press handles Kingambit.'},
  {p:['garchomp','charizard'],note:'Highest WR core. Fake Out Charizard + Gengar PS T2. Shuca Berry Incineroar for EQ.'},
  {p:['basculegion','kingambit'],note:'Ghost pivot + Defiant. Shadow Ball Basculegion immediately, never Perish Song it.'},
  {p:['pelipper','archaludon'],note:'Rain + instant Electro Shot. Disable Electro Shot = permanent lockout. Trap Pelipper first.'},
  {p:['farigiraf','camerupt'],note:'Trick Room. Tinkaton Mold Breaker Fake Out on Farigiraf. Protect through TR turns.'},
  {p:['sinistcha','kingambit'],note:'Rage Powder redirects Body Press from Kingambit. Shadow Ball Sinistcha first, then Body Press.'},
  {p:['sneasler','aerodactyl'],note:'Fake Out + Tailwind lead. Gengar Perish Song immediately — Tailwind does not matter for PS countdown.'},
];

function CoachTab({team}){
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
      {/* LEFT */}
      <div>
        <span className="sec-label">opponent team preview</span>
        <div className="grid2i">
          {opponents.map((val,i)=>(
            <div key={i} style={{display:'flex',alignItems:'center',gap:6}}>
              <span className="mono" style={{fontSize:11,color:'var(--t3)',minWidth:14}}>{i+1}</span>
              <input type="text" value={val} list="dex" onChange={e=>update(i,e.target.value)} placeholder={`Pokemon ${i+1}`} className="pi" onKeyDown={e=>{if(e.key==='Enter')analyze();}}/>
            </div>
          ))}
        </div>

        {filled.length>=2&&(
          <div className="card-inner" style={{marginBottom:10}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:4}}>
              <span className="mono" style={{fontSize:11,color:'var(--t3)'}}>danger score</span>
              <span className="mono" style={{fontSize:12,color:dangerClr,fontWeight:700}}>{danger}/10 · {danger<=3?'Manageable':danger<=6?'Threatening':'Severe'}</span>
            </div>
            <div className="danger-bar"><div className="danger-fill" style={{width:`${danger*10}%`,background:dangerClr}}/></div>
            {arch&&<div style={{display:'flex',alignItems:'center',gap:8,marginTop:8}}>
              <span className="mono" style={{fontSize:10,color:'var(--t3)'}}>archetype</span>
              <span className="mono" style={{fontSize:12,color:'var(--text)',fontWeight:600}}>{arch}</span>
            </div>}
          </div>
        )}

        <div className={`wbox ghost${ghosts.length?' visible':''}`}>
          ⛔ ghost types detected: {ghosts.join(', ')}<br/>
          <span style={{opacity:.8}}>Escape Shadow Tag. Shadow Ball immediately. NEVER Perish Song.</span>
        </div>
        <div className={`wbox defiant${defiant.length?' visible':''}`}>
          ⚠ defiant: {defiant.join(', ')}<br/>
          <span style={{opacity:.8}}>NEVER Parting Shot or Intimidate into this Pokemon.</span>
        </div>
        <div className={`wbox armor${armor.length?' visible':''}`}>
          ✓ armor tail / queenly majesty: {armor.join(', ')}<br/>
          <span style={{opacity:.8}}>Tinkaton Mold Breaker Fake Out bypasses this ability.</span>
        </div>
        {cores.map(c=>(
          <div key={c.p.join('+')} className="wbox core visible">
            🎯 known core: {c.p.map(p=>p.charAt(0).toUpperCase()+p.slice(1)).join(' + ')}<br/>
            <span style={{opacity:.8}}>{c.note}</span>
          </div>
        ))}

        {leads.length>0&&(
          <div className="card-inner" style={{marginBottom:10}}>
            <span className="sec-label" style={{color:'var(--purple)'}}>predicted leads</span>
            {leads.map((l,i)=>(
              <div key={i} style={{display:'flex',alignItems:'center',gap:8,marginBottom:6}}>
                <img src={getPokemonImage(l.p1)} className="poke-img-xs" alt={l.p1} onError={e=>{e.target.style.display='none';}}/>
                <span className="mono" style={{fontSize:12,color:'var(--text)',fontWeight:600}}>{l.p1}</span>
                <span className="mono" style={{fontSize:11,color:'var(--t3)'}}>+</span>
                <img src={getPokemonImage(l.p2)} className="poke-img-xs" alt={l.p2} onError={e=>{e.target.style.display='none';}}/>
                <span className="mono" style={{fontSize:12,color:'var(--text)',fontWeight:600}}>{l.p2}</span>
                <span className="mono" style={{fontSize:11,color:'var(--amber)',marginLeft:'auto'}}>{l.pct}% frequency</span>
              </div>
            ))}
          </div>
        )}

        {error&&<p className="errp">{error}</p>}
        <button className="abtn" onClick={analyze} disabled={busy} style={{marginBottom:6}}>{busy?'analyzing...':'analyze matchup →'}</button>
        <p className="mono" style={{fontSize:10,color:'var(--t3)',textAlign:'center',marginBottom:'1rem'}}>powered by Gemini (free) · data from ChampionsMeta + PokeSynergy</p>

        <span className="sec-label">session notes</span>
        <textarea className="ta" placeholder="Log patterns, leads, misplays..."/>
      </div>

      {/* RIGHT */}
      <div>
        {!result&&!busy&&(
          <>
            <div className="bench" style={{paddingBottom:16}}>
              <div style={{fontSize:44,marginBottom:14}}>⚔</div>
              <p className="mono" style={{fontSize:11,lineHeight:2,color:'var(--t3)'}}>enter opponent team<br/>for ai game plan + set predictions</p>
            </div>
            {filled.length>0&&<>
              <span className="sec-label">set predictions</span>
              {filled.map(p=><MetaCard key={p} name={p}/>)}
            </>}
          </>
        )}
        {busy&&<div className="bench"><div style={{fontSize:40,marginBottom:12}}>⏳</div><p className="mono" style={{fontSize:12,color:'var(--t2)'}}>asking Gemini...</p></div>}
        {result&&<>
          {Object.entries(result).map(([key,val])=>(
            <div key={key} className="rsec">
              <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:7}}>
                <span style={{fontSize:16}}>{SEC_ICONS[key]||'•'}</span>
                <span className="mono" style={{fontSize:10,letterSpacing:'.1em',color:SEC_CLRS[key]||'#AFA9EC'}}>{key}</span>
              </div>
              <p className="mono" style={{fontSize:12,color:'var(--t2)',margin:0,lineHeight:1.8,whiteSpace:'pre-wrap'}}>{val}</p>
            </div>
          ))}
          <span className="sec-label" style={{display:'block',marginTop:14,marginBottom:8}}>opponent set predictions</span>
          {filled.map(p=><MetaCard key={p} name={p}/>)}
        </>}
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function Home(){
  const [tab,setTab]=useState('coach');
  const [team,setTeam]=useState(TEAM_DEFAULT);

  useEffect(()=>{try{const s=localStorage.getItem('my_team_v3');if(s){const t=JSON.parse(s);if(t?.length===6)setTeam(t);}}catch(e){}}, []);
  useEffect(()=>{try{localStorage.setItem('my_team_v3',JSON.stringify(team));}catch(e){}}, [team]);

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
          <span style={{fontSize:28}}>⚔</span>
          <div>
            <h1>CHAMPIONS DRAFT COACH</h1>
            <p>Perish Song Trap · Regulation M-A · Doubles · Gemini (free) · PokeSynergy + ChampionsMeta data</p>
          </div>
        </div>
        <div className="tabs">
          {['coach','ps-guide','speed','roster','threats','win-con','match-log'].map(t=>(
            <button key={t} className={`tab${tab===t?' on':''}`} onClick={()=>setTab(t)}>
              {{coach:'draft coach','ps-guide':'ps guide',speed:'speed tiers',roster:'my roster',threats:'meta threats','win-con':'win cons','match-log':'match log'}[t]}
            </button>
          ))}
        </div>
        {tab==='coach'     &&<CoachTab team={team}/>}
        {tab==='ps-guide'  &&<PSGuideTab/>}
        {tab==='speed'     &&<SpeedTab/>}
        {tab==='roster'    &&<RosterTab team={team} setTeam={setTeam}/>}
        {tab==='threats'   &&<ThreatsTab/>}
        {tab==='win-con'   &&<WinConTab/>}
        {tab==='match-log' &&<MatchLogTab/>}
      </div>
    </>
  );
}
