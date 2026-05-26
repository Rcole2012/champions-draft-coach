import { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';
import { TEAM_DEFAULT, THREATS_STATIC, WINCONS, SPEEDS, POKEMON_LIST, SYSTEM_PROMPT } from '../lib/data';
import { META_DB, TYPE_COLORS, MOVE_TYPES, COMMON_LEADS, getPokemonImage } from '../lib/pokemon-data';

// ── Helpers ──────────────────────────────────────────────────────────────────
const SC = {HP:'#5DCAA5',Atk:'#F0997B',Def:'#85B7EB',SpA:'#AFA9EC',SpD:'#97C459',Spe:'#EF9F27'};
const TIER_CLR = {S:'#FF4444',A:'#EF9F27',LOVE:'#5DCAA5'};
const TIER_LABEL = {S:'S — cringe to see',A:'A — big threat',LOVE:'love to see'};
const SEC_ICONS = {'BRING 4':'👥','LEAD':'▶','TURN 1':'⚔','GAME PLAN':'🗺','THREATS':'⚠','BACKUP LINE':'↩','ARCHETYPE':'🏷'};
const SEC_CLRS = {'BRING 4':'#5DCAA5','LEAD':'#AFA9EC','TURN 1':'#EF9F27','GAME PLAN':'#85B7EB','THREATS':'#F0997B','BACKUP LINE':'#ED93B1','ARCHETYPE':'#C8A2E8'};
const GHOST_LIST = ['gengar','basculegion','sinistcha','dragapult','froslass','aegislash','mimikyu','zoroark-h','hisui typhlosion','mismagius','chandelure','gourgeist','drifblim'];
const DEFIANT_LIST = ['kingambit'];
const ARMOR_LIST = ['farigiraf','serperior'];
const SCARF_BOOST = ['garchomp','basculegion','rotom','delphox','hydreigon','aerodactyl','sneasler'];
const MY_TEAM_NAMES = ['Mega Gengar','Incineroar','Sableye','Primarina','Kommo-o','Tinkaton'];
const LEAD_PAIRS = ['Mega Gengar + Incineroar','Mega Gengar + Sableye','Mega Gengar + Tinkaton','Mega Gengar + Primarina','Mega Gengar + Kommo-o'];

function norm(s){ return (s||'').toLowerCase().trim(); }
function has(list, arr){ return arr.some(o=>list.some(l=>norm(o).includes(norm(l)))); }
function find(list, arr){ return arr.filter(Boolean).filter(o=>list.some(l=>norm(o).includes(norm(l)))); }

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

function detectArchetype(team){
  const o=team.map(p=>norm(p));
  if(o.some(p=>['farigiraf','hatterene','camerupt','golurk','oranguru'].some(k=>p.includes(k))))return'Trick Room';
  if(o.some(p=>['pelipper','politoed'].some(k=>p.includes(k))))return'Rain';
  if(o.some(p=>['torkoal','charizard-y','charizard y'].some(k=>p.includes(k))||p.includes('charizard')))return'Sun';
  if(o.filter(p=>GHOST_LIST.some(g=>p.includes(g))).length>=2)return'Ghost-Heavy';
  if(o.some(p=>['whimsicott','talonflame','aerodactyl'].some(k=>p.includes(k))))return'Tailwind';
  if(o.some(p=>['sneasler','kingambit'].some(k=>p.includes(k)))&&o.some(p=>['garchomp','basculegion'].some(k=>p.includes(k))))return'Hyper Offense';
  return'Balanced';
}

function dangerScore(team){
  const o=team.filter(Boolean);
  let score=0;
  o.forEach(p=>{
    const n=norm(p);
    if(['kingambit','mimikyu','zoroark-h','mega golurk','mega lopunny','kangaskhan'].some(k=>n.includes(k.split(' ').pop()||k)))score+=2;
    if(['hydreigon','gallade','hatterene','delphox','mega gardevoir'].some(k=>n.includes(k)))score+=1.5;
    if(GHOST_LIST.some(g=>n.includes(g)))score+=1.5;
    if(['serperior','farigiraf'].some(k=>n.includes(k)))score+=1;
    if(['sneasler'].some(k=>n.includes(k)))score-=1; // love to see
  });
  return Math.min(10,Math.max(0,Math.round(score)));
}

function predictLead(opponents){
  const opp=opponents.filter(Boolean).map(p=>norm(p));
  const leads=[];
  opp.forEach(p=>{
    for(const[key,data]of Object.entries(COMMON_LEADS)){
      if(p.includes(key)){
        const partner=data.partners.find(pt=>opp.some(o=>o.includes(norm(pt))));
        leads.push({p1:key.charAt(0).toUpperCase()+key.slice(1),p2:partner||data.partners[0],pct:data.pct});
      }
    }
  });
  return leads.slice(0,2);
}

// ── Type Badge ────────────────────────────────────────────────────────────────
function TypeBadge({type}){
  return <span className="type-badge" style={{background:TYPE_COLORS[type]||'#888',fontSize:9}}>{type}</span>;
}

function MoveWithType({move}){
  const type=MOVE_TYPES[move];
  const clr=TYPE_COLORS[type]||'#555';
  return(
    <span className="move-pill">
      {move}
      {type&&<span className="move-type" style={{background:clr}}>{type}</span>}
    </span>
  );
}

// ── Pokemon Card (with image) ─────────────────────────────────────────────────
function PokeCard({name,types,item,ability,moves,stats,note,clr,bg,role,spe,expanded,onClick}){
  return(
    <div className="card-click" style={{borderColor:expanded?clr:'var(--b1)'}} onClick={onClick}>
      <div className="poke-card">
        <img src={getPokemonImage(name)} className="poke-img" alt={name} onError={e=>{e.target.style.display='none';}}/>
        <div style={{flex:1}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
            <div>
              <span style={{fontSize:13,fontWeight:600,color:clr,marginRight:6}}>{name}</span>
              <span className="rb" style={{background:bg,color:clr,border:`1px solid ${clr}40`}}>{role}</span>
            </div>
            <span className="mono" style={{fontSize:10,color:'var(--t3)'}}>Spe {spe}</span>
          </div>
          <div style={{display:'flex',gap:4,marginTop:3,flexWrap:'wrap'}}>
            {(types||[]).map(t=><TypeBadge key={t} type={t}/>)}
          </div>
          <p className="mono" style={{fontSize:11,color:'var(--t2)',marginTop:3}}>{ability} · {item}</p>
          <div style={{display:'flex',gap:6,flexWrap:'wrap',marginTop:3}}>
            {(moves||[]).map(m=><span key={m} style={{fontSize:11,fontFamily:'var(--mono)',color:'var(--t2)'}}><MoveWithType move={m}/></span>)}
          </div>
        </div>
      </div>
      {expanded&&(
        <div style={{marginTop:10,paddingTop:10,borderTop:'1px solid var(--b1)'}}>
          <p style={{fontSize:11,color:'var(--t2)',fontStyle:'italic',marginBottom:8,lineHeight:1.6}}>{note}</p>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'3px 14px'}}>
            {Object.entries(stats||{}).map(([k,v])=>{
              const isPrimary=(k==='SpA'&&['Mega Gengar','Primarina'].includes(name))||(k==='Def'&&['Kommo-o'].includes(name))||(k==='Atk'&&['Incineroar','Tinkaton'].includes(name))||(k==='Spe'&&name==='Tinkaton');
              return(
                <div key={k} style={{display:'flex',alignItems:'center',gap:7}}>
                  <span className="mono" style={{fontSize:10,color:isPrimary?SC[k]:'var(--t3)',minWidth:28,fontWeight:isPrimary?700:400}}>{k}</span>
                  <div className="sb"><div className="sbf" style={{width:`${Math.min(100,Math.round(v/220*100))}%`,background:SC[k]||'#888',opacity:isPrimary?1:0.6}}/></div>
                  <span className="mono" style={{fontSize:10,color:isPrimary?'var(--text)':'var(--t2)',minWidth:28,textAlign:'right',fontWeight:isPrimary?700:400}}>{v}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Meta Pokemon Card (opponent's Pokemon with sets) ──────────────────────────
function MetaPokeCard({name}){
  const key=norm(name).replace(' ','-').replace('wash-rotom','wash-rotom').replace('kommo-o','kommo_o');
  const data=META_DB[key]||META_DB[norm(name).replace(/ /g,'-')]||META_DB[norm(name).split(' ').pop()];
  if(!data)return null;
  return(
    <div className="card" style={{marginTop:8}}>
      <div className="poke-card" style={{marginBottom:8}}>
        <img src={getPokemonImage(name)} className="poke-img" alt={name} onError={e=>{e.target.style.display='none';}}/>
        <div style={{flex:1}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
            <span style={{fontSize:13,fontWeight:600,color:TIER_CLR[data.tier]||'var(--text)'}}>{data.name}</span>
            <div style={{textAlign:'right'}}>
              <span className="mono" style={{fontSize:10,color:'var(--t3)'}}>#{data.rank} · {data.usage}% usage</span><br/>
              <span className="mono" style={{fontSize:11,color:data.wr>=55?'var(--teal)':'var(--coral)',fontWeight:700}}>{data.wr}% WR</span>
            </div>
          </div>
          <div style={{display:'flex',gap:4,marginTop:3,flexWrap:'wrap'}}>
            {(data.types||[]).map(t=><TypeBadge key={t} type={t}/>)}
          </div>
          {data.keyWarning&&<p className="mono" style={{fontSize:10,color:data.tier==='S'?'#FF6666':data.tier==='LOVE'?'var(--teal)':'var(--amber)',marginTop:4,lineHeight:1.5}}>{data.keyWarning}</p>}
        </div>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
        <div>
          <p className="mono" style={{fontSize:10,color:'var(--t3)',marginBottom:4,letterSpacing:'.08em'}}>TOP MOVES</p>
          {(data.moves||[]).slice(0,4).map(({m,pct})=>(
            <div key={m} className="item-row">
              <MoveWithType move={m}/>
              <span className="mono" style={{fontSize:10,color:'var(--t3)'}}>{pct}%</span>
            </div>
          ))}
        </div>
        <div>
          <p className="mono" style={{fontSize:10,color:'var(--t3)',marginBottom:4,letterSpacing:'.08em'}}>ITEMS / ABILITY</p>
          {(data.items||[]).slice(0,3).map(({i,pct})=>(
            <div key={i} className="item-row">
              <span className="mono" style={{fontSize:11,color:'var(--t2)'}}>{i}</span>
              <div style={{display:'flex',alignItems:'center',gap:4}}>
                <div style={{width:40,height:4,background:'var(--b1)',borderRadius:2}}>
                  <div style={{width:`${pct}%`,height:4,background:'var(--purple)',borderRadius:2}}/>
                </div>
                <span className="mono" style={{fontSize:10,color:'var(--t3)',minWidth:32,textAlign:'right'}}>{pct}%</span>
              </div>
            </div>
          ))}
          {(data.abilities||[]).slice(0,1).map(({a,pct})=>(
            <div key={a} className="item-row" style={{marginTop:4}}>
              <span className="mono" style={{fontSize:11,color:'var(--purple)'}}>{a}</span>
              <span className="mono" style={{fontSize:10,color:'var(--t3)'}}>{pct}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Roster Tab ────────────────────────────────────────────────────────────────
function RosterTab({team,setTeam}){
  const [sel,setSel]=useState(null);
  const [editing,setEditing]=useState(null);
  const [draft,setDraft]=useState(null);

  const startEdit=(p)=>{setDraft({...p,mv:[...p.mv],types:[...p.types],stats:{...p.stats}});setEditing(p.name);};
  const saveEdit=()=>{
    setTeam(prev=>prev.map(p=>p.name===editing?{...draft}:p));
    setEditing(null);setDraft(null);
  };

  return(
    <div>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
        <p className="mono" style={{fontSize:10,color:'var(--t3)',letterSpacing:'.1em'}}>MY ROSTER — click to expand, edit to customize</p>
      </div>
      {team.map(p=>(
        <div key={p.name}>
          {editing===p.name&&draft?(
            <div className="card" style={{borderColor:'var(--acc)'}}>
              <p className="mono" style={{fontSize:10,color:'var(--purple)',marginBottom:8,letterSpacing:'.1em'}}>EDITING — {p.name}</p>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:8}}>
                <div><label className="mono" style={{fontSize:10,color:'var(--t3)',display:'block',marginBottom:3}}>ABILITY</label>
                  <input className="pi" value={draft.ab} onChange={e=>setDraft({...draft,ab:e.target.value})}/></div>
                <div><label className="mono" style={{fontSize:10,color:'var(--t3)',display:'block',marginBottom:3}}>ITEM</label>
                  <input className="pi" value={draft.item} onChange={e=>setDraft({...draft,item:e.target.value})}/></div>
              </div>
              <label className="mono" style={{fontSize:10,color:'var(--t3)',display:'block',marginBottom:3}}>MOVES (comma separated)</label>
              <input className="pi" style={{marginBottom:8}} value={draft.mv.join(', ')} onChange={e=>setDraft({...draft,mv:e.target.value.split(',').map(s=>s.trim())})}/>
              <label className="mono" style={{fontSize:10,color:'var(--t3)',display:'block',marginBottom:3}}>NOTES</label>
              <textarea className="ta" style={{marginBottom:8}} value={draft.note} onChange={e=>setDraft({...draft,note:e.target.value})}/>
              <div style={{display:'flex',gap:8}}>
                <button className="abtn" onClick={saveEdit} style={{flex:1}}>save changes</button>
                <button className="btn-sm" onClick={()=>{setEditing(null);setDraft(null);}}>cancel</button>
              </div>
            </div>
          ):(
            <div style={{position:'relative'}}>
              <PokeCard {...p} expanded={sel===p.name} onClick={()=>setSel(sel===p.name?null:p.name)}/>
              <button onClick={e=>{e.stopPropagation();startEdit(p);}} className="btn-sm" style={{position:'absolute',top:10,right:10,fontSize:10}}>edit</button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ── Threats Tab ───────────────────────────────────────────────────────────────
function ThreatsTab(){
  return(
    <div>
      {['S','A','LOVE'].map(tier=>{
        const items=THREATS_STATIC.filter(t=>t.tier===tier);
        if(!items.length)return null;
        return(
          <div key={tier}>
            <div className="tier-divider" style={{borderColor:TIER_CLR[tier],color:TIER_CLR[tier]}}>{TIER_LABEL[tier]}</div>
            {items.map(t=>(
              <div key={t.name} className="card">
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:4}}>
                  <div style={{display:'flex',alignItems:'center',gap:8}}>
                    <img src={getPokemonImage(t.name)} className="poke-img-sm" alt={t.name} onError={e=>{e.target.style.display='none';}}/>
                    <span style={{fontSize:13,fontWeight:600,color:TIER_CLR[tier]}}>{t.name}</span>
                    {t.isG&&<span className="rb" style={{background:'#1e0808',color:'#FF4444',border:'1px solid #FF444430',fontSize:10}}>ghost ⛔</span>}
                    {t.hasD&&<span className="rb" style={{background:'#1e1408',color:'var(--amber)',border:'1px solid #EF9F2730',fontSize:10}}>defiant ⚠</span>}
                  </div>
                  <span className="rb" style={{background:'var(--bg4)',color:TIER_CLR[tier],fontSize:10}}>{tier}</span>
                </div>
                <p className="mono" style={{fontSize:11,color:'var(--t2)',margin:'0 0 5px',lineHeight:1.65}}>{t.detail}</p>
                <p style={{fontSize:11,color:'var(--teal)',margin:0,lineHeight:1.5,fontStyle:'italic'}}>Counter: {t.counter}</p>
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
        <div key={w.arch} className="card" style={{borderLeft:`2px solid ${w.clr}`,paddingLeft:12}}>
          <div style={{display:'flex',alignItems:'center',gap:9,marginBottom:5}}>
            <span style={{fontSize:18}}>{w.icon}</span>
            <span style={{fontSize:13,fontWeight:600,color:w.clr}}>{w.arch}</span>
          </div>
          <p style={{fontSize:12,color:'var(--t2)',margin:0,lineHeight:1.7}}>{w.plan}</p>
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

  useEffect(()=>{try{const s=localStorage.getItem('ps_matches_v2');if(s)setMatches(JSON.parse(s));}catch(e){}}, []);
  const save=(data)=>{setMatches(data);try{localStorage.setItem('ps_matches_v2',JSON.stringify(data));}catch(e){}};

  const submit=()=>{
    if(!form.result)return;
    const match={id:Date.now(),date:new Date().toLocaleDateString(),opp:form.opp.filter(Boolean),my4:form.my4,lead:form.lead,result:form.result,notes:form.notes,archetype:detectArchetype(form.opp)};
    save([match,...matches]);
    setForm({opp:['','','','','',''],my4:[],lead:'',result:'',notes:''});
    setView('log');
  };

  const wins=matches.filter(m=>m.result==='W').length;
  const total=matches.length;
  const wr=total?Math.round(wins/total*100):0;

  const byArch={};
  matches.forEach(m=>{if(!byArch[m.archetype])byArch[m.archetype]={w:0,l:0};byArch[m.archetype][m.result==='W'?'w':'l']++;});
  const byLead={};
  matches.forEach(m=>{if(!m.lead)return;if(!byLead[m.lead])byLead[m.lead]={w:0,l:0};byLead[m.lead][m.result==='W'?'w':'l']++;});
  const threatCount={};
  matches.forEach(m=>m.opp.forEach(p=>{if(p)threatCount[p]=(threatCount[p]||0)+1;}));
  const topThreats=Object.entries(threatCount).sort((a,b)=>b[1]-a[1]).slice(0,8);

  return(
    <div>
      <div style={{display:'flex',gap:6,marginBottom:14,flexWrap:'wrap',alignItems:'center'}}>
        {['log','add','stats'].map(v=>(
          <button key={v} className={`tab${view===v?' on':''}`} onClick={()=>setView(v)}>
            {v==='log'?`match log (${total})`:v==='add'?'+ log match':'stats'}
          </button>
        ))}
        {total>0&&<div style={{marginLeft:'auto',display:'flex',gap:10,alignItems:'center'}}>
          <span className="mono" style={{fontSize:11,color:'var(--teal)'}}>{wins}W</span>
          <span className="mono" style={{fontSize:11,color:'var(--coral)'}}>{total-wins}L</span>
          <span className="mono" style={{fontSize:14,fontWeight:700,color:wr>=50?'var(--teal)':'var(--coral)'}}>{wr}%</span>
        </div>}
      </div>

      {view==='log'&&<div>
        {matches.length===0&&<div className="bench"><div style={{fontSize:36,marginBottom:10}}>📋</div><p className="mono" style={{fontSize:11,color:'var(--t3)',lineHeight:1.8}}>no matches logged yet<br/>click "+ log match" after each game</p></div>}
        {matches.map(m=>(
          <div key={m.id} className="card" style={{borderLeft:`3px solid ${m.result==='W'?'var(--teal)':'var(--coral)'}`,paddingLeft:11}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:4}}>
              <div style={{display:'flex',alignItems:'center',gap:8}}>
                <span style={{fontSize:14,fontWeight:700,color:m.result==='W'?'var(--teal)':'var(--coral)'}}>{m.result==='W'?'WIN':'LOSS'}</span>
                <span className="rb" style={{background:'var(--bg4)',color:'var(--t2)',fontSize:10}}>{m.archetype}</span>
                <span className="mono" style={{fontSize:10,color:'var(--t3)'}}>{m.date}</span>
              </div>
              <button onClick={()=>setDel(del===m.id?null:m.id)} style={{background:'none',border:'none',color:'var(--t3)',cursor:'pointer',fontSize:16}}>×</button>
            </div>
            <div style={{display:'flex',gap:6,flexWrap:'wrap',marginBottom:4}}>
              {m.opp.map((p,i)=><div key={i} style={{display:'flex',alignItems:'center',gap:3}}>
                <img src={getPokemonImage(p)} style={{width:20,height:20,objectFit:'contain'}} alt={p} onError={e=>{e.target.style.display='none';}}/>
                <span className="mono" style={{fontSize:10,color:'var(--t2)'}}>{p}</span>
              </div>)}
            </div>
            {m.lead&&<p className="mono" style={{fontSize:11,color:'var(--purple)',marginBottom:2}}>Lead: {m.lead}</p>}
            {m.notes&&<p style={{fontSize:11,color:'var(--t2)',fontStyle:'italic',lineHeight:1.5}}>{m.notes}</p>}
            {del===m.id&&<div style={{marginTop:8,display:'flex',gap:8,alignItems:'center'}}>
              <span className="mono" style={{fontSize:11,color:'var(--coral)'}}>delete?</span>
              <button onClick={()=>{save(matches.filter(x=>x.id!==m.id));setDel(null);}} style={{background:'var(--coral)',border:'none',borderRadius:4,padding:'3px 10px',color:'#fff',fontSize:11,fontFamily:'var(--mono)',cursor:'pointer'}}>yes</button>
              <button onClick={()=>setDel(null)} className="btn-sm">no</button>
            </div>}
          </div>
        ))}
      </div>}

      {view==='add'&&<div>
        <p className="mono" style={{fontSize:10,letterSpacing:'.1em',color:'var(--t3)',marginBottom:8}}>opponent team</p>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:7,marginBottom:14}}>
          {form.opp.map((v,i)=>(
            <div key={i} style={{display:'flex',alignItems:'center',gap:5}}>
              <span className="mono" style={{fontSize:11,color:'var(--t3)',minWidth:12}}>{i+1}</span>
              <input type="text" value={v} list="dex" className="pi" placeholder={`Pokemon ${i+1}`} onChange={e=>{const o=[...form.opp];o[i]=e.target.value;setForm({...form,opp:o});}}/>
            </div>
          ))}
        </div>
        <p className="mono" style={{fontSize:10,letterSpacing:'.1em',color:'var(--t3)',marginBottom:6}}>my bring 4</p>
        <div style={{display:'flex',gap:6,flexWrap:'wrap',marginBottom:14}}>
          {MY_TEAM_NAMES.map(p=>{const s=form.my4.includes(p);return(
            <button key={p} onClick={()=>{if(s)setForm({...form,my4:form.my4.filter(x=>x!==p)});else if(form.my4.length<4)setForm({...form,my4:[...form.my4,p]});}}
              style={{display:'flex',alignItems:'center',gap:5,background:s?'#1a1535':'var(--bg3)',border:`1px solid ${s?'var(--acc)':'var(--b2)'}`,borderRadius:6,padding:'5px 10px',color:s?'var(--purple)':'var(--t2)',fontSize:11,fontFamily:'var(--mono)',cursor:'pointer'}}>
              <img src={getPokemonImage(p)} style={{width:20,height:20,objectFit:'contain'}} alt={p} onError={e=>{e.target.style.display='none';}}/>
              {p}
            </button>);
          })}
        </div>
        <p className="mono" style={{fontSize:10,color:'var(--t3)',marginBottom:14}}>{form.my4.length}/4 selected</p>
        <p className="mono" style={{fontSize:10,letterSpacing:'.1em',color:'var(--t3)',marginBottom:6}}>lead pair</p>
        <select value={form.lead} onChange={e=>setForm({...form,lead:e.target.value})} className="pi" style={{marginBottom:14}}>
          <option value="">— select lead —</option>
          {LEAD_PAIRS.map(l=><option key={l} value={l}>{l}</option>)}
        </select>
        <p className="mono" style={{fontSize:10,letterSpacing:'.1em',color:'var(--t3)',marginBottom:6}}>result</p>
        <div style={{display:'flex',gap:8,marginBottom:14}}>
          {['W','L'].map(r=>(
            <button key={r} onClick={()=>setForm({...form,result:r})} style={{flex:1,padding:'10px',border:`1px solid ${form.result===r?(r==='W'?'var(--teal)':'var(--coral)'):'var(--b2)'}`,borderRadius:8,background:form.result===r?(r==='W'?'#0a2010':'#200a0a'):'var(--bg3)',color:form.result===r?(r==='W'?'var(--teal)':'var(--coral)'):'var(--t2)',fontSize:14,fontWeight:700,fontFamily:'var(--mono)',cursor:'pointer'}}>
              {r==='W'?'WIN':'LOSS'}
            </button>
          ))}
        </div>
        <textarea value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})} className="ta" placeholder="What worked? What went wrong?" style={{marginBottom:14}}/>
        <button className="abtn" onClick={submit} disabled={!form.result}>save match →</button>
      </div>}

      {view==='stats'&&<div>
        {total===0&&<div className="bench"><p className="mono" style={{fontSize:11,color:'var(--t3)'}}>log some matches first to see stats</p></div>}
        {total>0&&<>
          <div className="card" style={{marginBottom:10}}>
            <p className="mono" style={{fontSize:10,letterSpacing:'.1em',color:'var(--t3)',marginBottom:8}}>overall record</p>
            <div style={{display:'flex',gap:20,alignItems:'center'}}>
              <div style={{textAlign:'center'}}><div style={{fontSize:28,fontWeight:700,color:'var(--teal)',fontFamily:'var(--mono)'}}>{wins}</div><div className="mono" style={{fontSize:10,color:'var(--t3)'}}>wins</div></div>
              <div style={{textAlign:'center'}}><div style={{fontSize:28,fontWeight:700,color:'var(--coral)',fontFamily:'var(--mono)'}}>{total-wins}</div><div className="mono" style={{fontSize:10,color:'var(--t3)'}}>losses</div></div>
              <div style={{textAlign:'center',marginLeft:'auto'}}><div style={{fontSize:36,fontWeight:700,color:wr>=50?'var(--teal)':'var(--coral)',fontFamily:'var(--mono)'}}>{wr}%</div><div className="mono" style={{fontSize:10,color:'var(--t3)'}}>win rate</div></div>
            </div>
          </div>
          {Object.keys(byArch).length>0&&<div className="card" style={{marginBottom:10}}>
            <p className="mono" style={{fontSize:10,letterSpacing:'.1em',color:'var(--t3)',marginBottom:8}}>by archetype</p>
            {Object.entries(byArch).sort((a,b)=>(b[1].w+b[1].l)-(a[1].w+a[1].l)).map(([arch,rec])=>{
              const w2=Math.round(rec.w/(rec.w+rec.l)*100);
              return <div key={arch} style={{display:'flex',alignItems:'center',gap:10,marginBottom:7}}>
                <span className="mono" style={{fontSize:11,color:'var(--t2)',minWidth:120}}>{arch}</span>
                <div style={{flex:1,height:6,background:'var(--b1)',borderRadius:3}}><div style={{width:`${w2}%`,height:6,background:w2>=50?'var(--teal)':'var(--coral)',borderRadius:3}}/></div>
                <span className="mono" style={{fontSize:11,color:w2>=50?'var(--teal)':'var(--coral)',minWidth:40,textAlign:'right'}}>{w2}%</span>
                <span className="mono" style={{fontSize:10,color:'var(--t3)',minWidth:40}}>{rec.w}W {rec.l}L</span>
              </div>;
            })}
          </div>}
          {Object.keys(byLead).length>0&&<div className="card" style={{marginBottom:10}}>
            <p className="mono" style={{fontSize:10,letterSpacing:'.1em',color:'var(--t3)',marginBottom:8}}>by lead pair</p>
            {Object.entries(byLead).sort((a,b)=>(b[1].w/(b[1].w+b[1].l))-(a[1].w/(a[1].w+a[1].l))).map(([lead,rec])=>{
              const w2=Math.round(rec.w/(rec.w+rec.l)*100);
              return <div key={lead} style={{display:'flex',alignItems:'center',gap:10,marginBottom:7}}>
                <span className="mono" style={{fontSize:10,color:'var(--purple)',minWidth:180}}>{lead}</span>
                <div style={{flex:1,height:6,background:'var(--b1)',borderRadius:3}}><div style={{width:`${w2}%`,height:6,background:'var(--purple)',borderRadius:3}}/></div>
                <span className="mono" style={{fontSize:11,color:'var(--purple)',minWidth:40,textAlign:'right'}}>{w2}%</span>
                <span className="mono" style={{fontSize:10,color:'var(--t3)',minWidth:40}}>{rec.w}W {rec.l}L</span>
              </div>;
            })}
          </div>}
          {topThreats.length>0&&<div className="card">
            <p className="mono" style={{fontSize:10,letterSpacing:'.1em',color:'var(--t3)',marginBottom:8}}>most faced pokemon</p>
            {topThreats.map(([name,count])=>(
              <div key={name} style={{display:'flex',alignItems:'center',gap:8,marginBottom:5}}>
                <img src={getPokemonImage(name)} style={{width:24,height:24,objectFit:'contain'}} alt={name} onError={e=>{e.target.style.display='none';}}/>
                <span className="mono" style={{fontSize:11,color:'var(--t2)',flex:1}}>{name}</span>
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
function CoachTab({team}){
  const [opponents,setOpponents]=useState(['','','','','','']);
  const [result,setResult]=useState(null);
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState(null);

  const update=(i,v)=>setOpponents(prev=>{const n=[...prev];n[i]=v;return n;});
  const filled=opponents.filter(Boolean);
  const ghosts=find(GHOST_LIST,filled);
  const defiant=find(DEFIANT_LIST,filled);
  const armor=find(ARMOR_LIST,filled);
  const arch=filled.length>=2?detectArchetype(filled):null;
  const danger=filled.length>=2?dangerScore(filled):0;
  const predictedLeads=filled.length>=2?predictLead(filled):[];

  const KNOWN_CORES=[
    {pokemon:['sneasler','garchomp'],note:'Most common core. Sneasler Fake Out + Garchomp EQ spread. Sableye+Gengar shuts Sneasler down.'},
    {pokemon:['sneasler','kingambit'],note:'Defiant is the concern — never Parting Shot. Kommo-o Body Press.'},
    {pokemon:['garchomp','charizard'],note:'Highest WR core. Fake Out Charizard + Gengar Perish Song.'},
    {pokemon:['basculegion','kingambit'],note:'Ghost pivot + Defiant. Shadow Ball Basculegion, Kommo-o handles Kingambit.'},
    {pokemon:['pelipper','archaludon'],note:'Rain + Electro Shot. Disable Electro Shot = lockout. Trap Pelipper first.'},
    {pokemon:['farigiraf','camerupt'],note:'Trick Room. Tinkaton Mold Breaker Fake Out on Farigiraf first.'},
  ];
  const oppLower=filled.map(p=>norm(p));
  const matchedCores=KNOWN_CORES.filter(c=>c.pokemon.every(k=>oppLower.some(o=>o.includes(k))));

  const dangerClr=danger<=3?'var(--teal)':danger<=6?'var(--amber)':'var(--coral)';

  const analyze=async()=>{
    if(filled.length<2){setError('Enter at least 2 opponent Pokemon.');return;}
    setError(null);setBusy(true);setResult(null);
    try{
      const teamContext=`My current team: ${team.map(p=>`${p.name}(${p.ab},${p.item},${p.mv.join('/')})`).join('; ')}. `;
      const r=await fetch('/api/analyze',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({opponents,teamContext})});
      const d=await r.json();
      if(d.error){setError(d.error);setBusy(false);return;}
      setResult(parseResult(d.result));
    }catch(e){setError('Request failed.');}
    setBusy(false);
  };

  return(
    <div className="grid2">
      <div>
        <p className="mono" style={{fontSize:10,letterSpacing:'.12em',color:'var(--t3)',marginBottom:'.6rem'}}>opponent team preview</p>
        <div className="grid2i">
          {opponents.map((val,i)=>(
            <div key={i} style={{display:'flex',alignItems:'center',gap:5}}>
              <span className="mono" style={{fontSize:11,color:'var(--t3)',minWidth:12}}>{i+1}</span>
              <input type="text" value={val} list="dex" onChange={e=>update(i,e.target.value)} placeholder={`Pokemon ${i+1}`} className="pi" onKeyDown={e=>{if(e.key==='Enter')analyze();}}/>
            </div>
          ))}
        </div>

        {filled.length>=2&&<div style={{marginBottom:8}}>
          <div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}>
            <span className="mono" style={{fontSize:10,color:'var(--t3)'}}>danger score</span>
            <span className="mono" style={{fontSize:11,color:dangerClr,fontWeight:700}}>{danger}/10 — {danger<=3?'Manageable':danger<=6?'Threatening':'Severe'}</span>
          </div>
          <div className="danger-bar"><div className="danger-fill" style={{width:`${danger*10}%`,background:dangerClr}}/></div>
          {arch&&<div style={{display:'flex',alignItems:'center',gap:6,marginTop:6}}>
            <span className="mono" style={{fontSize:10,color:'var(--t3)'}}>archetype:</span>
            <span className="mono" style={{fontSize:11,color:'var(--text)',fontWeight:600}}>{arch}</span>
          </div>}
        </div>}

        {ghosts.length>0&&<div className="wbox ghost visible">⛔ ghost types: {ghosts.join(', ')}<br/><span style={{opacity:.75}}>Escape Shadow Tag. Shadow Ball immediately. Never Perish Song.</span></div>}
        {defiant.length>0&&<div className="wbox defiant visible">⚠ defiant: {defiant.join(', ')}<br/><span style={{opacity:.75}}>NEVER Parting Shot or Intimidate into this Pokemon.</span></div>}
        {armor.length>0&&<div className="wbox armor visible">✓ armor tail / queenly majesty: {armor.join(', ')}<br/><span style={{opacity:.75}}>Tinkaton Mold Breaker Fake Out bypasses this.</span></div>}
        {matchedCores.length>0&&<div className="wbox core visible">🎯 known core: {matchedCores.map(c=>c.pokemon.join('+')).join(', ')}<br/>{matchedCores.map(c=><span key={c.pokemon.join('')}>{c.note}</span>)}</div>}

        {predictedLeads.length>0&&<div className="card-inner" style={{marginBottom:8}}>
          <p className="mono" style={{fontSize:10,letterSpacing:'.08em',color:'var(--purple)',marginBottom:6}}>PREDICTED OPPONENT LEADS</p>
          {predictedLeads.map((l,i)=>(
            <div key={i} style={{display:'flex',alignItems:'center',gap:8,marginBottom:4}}>
              <img src={getPokemonImage(l.p1)} style={{width:24,height:24,objectFit:'contain'}} alt={l.p1} onError={e=>{e.target.style.display='none';}}/>
              <span className="mono" style={{fontSize:11,color:'var(--text)'}}>{l.p1}</span>
              <span className="mono" style={{fontSize:11,color:'var(--t3)'}}>+</span>
              <img src={getPokemonImage(l.p2)} style={{width:24,height:24,objectFit:'contain'}} alt={l.p2} onError={e=>{e.target.style.display='none';}}/>
              <span className="mono" style={{fontSize:11,color:'var(--text)'}}>{l.p2}</span>
              <span className="mono" style={{fontSize:10,color:'var(--amber)',marginLeft:'auto'}}>{l.pct}%</span>
            </div>
          ))}
        </div>}

        {error&&<p className="errp">{error}</p>}
        <button className="abtn" onClick={analyze} disabled={busy} style={{marginBottom:4}}>{busy?'analyzing...':'analyze matchup →'}</button>
        <p className="mono" style={{fontSize:10,color:'var(--t3)',textAlign:'center',marginBottom:'.75rem'}}>powered by Gemini (free)</p>

        <div className="speedbox">
          <p className="mono" style={{fontSize:10,letterSpacing:'.1em',color:'var(--t3)',marginBottom:6}}>speed tiers</p>
          {SPEEDS.map(([n,s,c])=>(
            <div key={n} style={{display:'flex',justifyContent:'space-between',marginBottom:2}}>
              <span className="mono" style={{fontSize:10,color:'var(--t2)'}}>{n}</span>
              <span className="mono" style={{fontSize:10,color:c,fontWeight:700}}>{s}</span>
            </div>
          ))}
        </div>

        <div style={{marginTop:'.75rem'}}>
          <p className="mono" style={{fontSize:10,letterSpacing:'.1em',color:'var(--t3)',marginBottom:4}}>session notes</p>
          <textarea className="ta" placeholder="Log patterns, leads, misplays..."/>
        </div>
      </div>

      <div>
        {!result&&!busy&&<>
          <div className="bench">
            <div style={{fontSize:40,marginBottom:12}}>⚔</div>
            <p className="mono" style={{fontSize:11,lineHeight:1.9,color:'var(--t3)'}}>enter opponent team<br/>for game plan + set predictions</p>
          </div>
          {filled.length>=1&&<div>
            <p className="mono" style={{fontSize:10,letterSpacing:'.1em',color:'var(--t3)',marginBottom:8}}>set predictions</p>
            {filled.map(p=><MetaPokeCard key={p} name={p}/>)}
          </div>}
        </>}
        {busy&&<div className="bench"><div style={{fontSize:36,marginBottom:10}}>⏳</div><p className="mono" style={{fontSize:11,color:'var(--t2)'}}>asking Gemini...</p></div>}
        {result&&<>
          {Object.entries(result).map(([key,val])=>(
            <div key={key} className="rsec">
              <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:5}}>
                <span>{SEC_ICONS[key]||'•'}</span>
                <span className="mono" style={{fontSize:10,letterSpacing:'.1em',color:SEC_CLRS[key]||'#AFA9EC'}}>{key}</span>
              </div>
              <p className="mono" style={{fontSize:12,color:'var(--t2)',margin:0,lineHeight:1.75,whiteSpace:'pre-wrap'}}>{val}</p>
            </div>
          ))}
          <div style={{marginTop:10}}>
            <p className="mono" style={{fontSize:10,letterSpacing:'.1em',color:'var(--t3)',marginBottom:8}}>opponent set predictions</p>
            {filled.map(p=><MetaPokeCard key={p} name={p}/>)}
          </div>
        </>}
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function Home(){
  const [tab,setTab]=useState('coach');
  const [team,setTeam]=useState(TEAM_DEFAULT);

  useEffect(()=>{
    try{const s=localStorage.getItem('my_team_v2');if(s){const t=JSON.parse(s);if(t&&t.length===6)setTeam(t);}}catch(e){}
  },[]);

  useEffect(()=>{
    try{localStorage.setItem('my_team_v2',JSON.stringify(team));}catch(e){}
  },[team]);

  return(
    <>
      <Head>
        <title>Champions Draft Coach</title>
        <meta name="description" content="Perish Song trap team analyzer for Pokemon Champions Reg M-A."/>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>⚔</text></svg>"/>
      </Head>
      <datalist id="dex">{POKEMON_LIST.map(p=><option key={p} value={p}/>)}</datalist>
      <div className="container">
        <div className="header">
          <span style={{fontSize:24}}>⚔</span>
          <div>
            <h1>CHAMPIONS DRAFT COACH</h1>
            <p>Perish Song Trap · Reg M-A · Doubles · Powered by Gemini (free)</p>
          </div>
        </div>
        <div className="tabs">
          {['coach','roster','threats','win-con','match-log'].map(t=>(
            <button key={t} className={`tab${tab===t?' on':''}`} onClick={()=>setTab(t)}>
              {{coach:'draft coach',roster:'my roster',threats:'meta threats','win-con':'win cons','match-log':'match log'}[t]}
            </button>
          ))}
        </div>
        {tab==='coach'     &&<CoachTab team={team}/>}
        {tab==='roster'    &&<RosterTab team={team} setTeam={setTeam}/>}
        {tab==='threats'   &&<ThreatsTab/>}
        {tab==='win-con'   &&<WinConTab/>}
        {tab==='match-log' &&<MatchLogTab/>}
      </div>
    </>
  );
}
