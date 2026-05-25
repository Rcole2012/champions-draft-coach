import { useState } from 'react';
import Head from 'next/head';
import { TEAM, THREATS_STATIC, WINCONS, SPEEDS, POKEMON_LIST } from '../lib/data';

const SC = { HP:'#5DCAA5', Atk:'#F0997B', Def:'#85B7EB', SpA:'#AFA9EC', SpD:'#97C459', Spe:'#EF9F27' };
const TIER_CLR = { S:'#FF4444', A:'#EF9F27', LOVE:'#5DCAA5' };
const TIER_LABEL = { S:'S — cringe to see', A:'A — big threat', LOVE:'love to see' };
const SEC_ICONS = { 'BRING 4':'👥', 'LEAD':'▶', 'TURN 1':'⚔', 'GAME PLAN':'🗺', 'THREATS':'⚠', 'BACKUP LINE':'↩', 'ARCHETYPE':'🏷' };
const SEC_CLRS = { 'BRING 4':'#5DCAA5', 'LEAD':'#AFA9EC', 'TURN 1':'#EF9F27', 'GAME PLAN':'#85B7EB', 'THREATS':'#F0997B', 'BACKUP LINE':'#ED93B1', 'ARCHETYPE':'#C8A2E8' };

const GHOST = ['gengar','basculegion','sinistcha','dragapult','froslass','aegislash','mimikyu','zoroark-h','hisui typhlosion','mismagius','chandelure','gourgeist','drifblim'];
const DEFIANT = ['kingambit'];
const ARMOR = ['farigiraf','serperior'];

function parseResult(text) {
  const keys = ['BRING 4','LEAD','TURN 1','GAME PLAN','THREATS','BACKUP LINE','ARCHETYPE'];
  const out = {};
  keys.forEach((k, i) => {
    const p = new RegExp(`\\*\\*${k}[:\\*]*\\*?\\s*`, 'i');
    const idx = text.search(p);
    if (idx === -1) return;
    let end = text.length;
    for (let j = i + 1; j < keys.length; j++) {
      const ni = text.search(new RegExp(`\\*\\*${keys[j]}[:\\*]*\\*?\\s*`, 'i'));
      if (ni > idx && ni < end) { end = ni; break; }
    }
    out[k] = text.slice(idx, end).replace(p, '').replace(/\*\*/g, '').trim();
  });
  if (!Object.keys(out).length) out['ANALYSIS'] = text;
  return out;
}

function clrFor(name) {
  return TEAM.find(p => p.name === name)?.clr || 'var(--t2)';
}

// ── Roster ──────────────────────────────────────────────────────────────────
function RosterTab() {
  const [sel, setSel] = useState(null);
  return (
    <div>
      {TEAM.map(p => (
        <div key={p.name} className="pcard"
          style={{ borderColor: sel === p.name ? p.clr : 'var(--b1)' }}
          onClick={() => setSel(sel === p.name ? null : p.name)}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <span style={{ fontSize:13, fontWeight:600, color:p.clr }}>{p.name}</span>
              <span className="rb" style={{ background:p.bg, color:p.clr, border:`1px solid ${p.clr}40` }}>{p.role}</span>
            </div>
            <span className="mono" style={{ fontSize:10, color:'var(--t3)' }}>Spe {p.spe}</span>
          </div>
          <p className="mono" style={{ fontSize:11, color:'var(--t2)', marginTop:3 }}>{p.ab} · {p.item}</p>
          <p className="mono" style={{ fontSize:11, color:'var(--t3)', marginTop:2 }}>{p.mv.join(' / ')}</p>
          {sel === p.name && (
            <div style={{ marginTop:10, paddingTop:10, borderTop:'1px solid var(--b1)' }}>
              <p style={{ fontSize:11, color:'var(--t2)', fontStyle:'italic', marginBottom:9, lineHeight:1.6 }}>{p.note}</p>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'3px 14px' }}>
                {Object.entries(p.stats).map(([k,v]) => (
                  <div key={k} style={{ display:'flex', alignItems:'center', gap:7 }}>
                    <span className="mono" style={{ fontSize:10, color:'var(--t3)', minWidth:28 }}>{k}</span>
                    <div className="sb"><div className="sbf" style={{ width:`${Math.min(100,Math.round(v/220*100))}%`, background:SC[k]||'#888' }}/></div>
                    <span className="mono" style={{ fontSize:10, color:'var(--t2)', minWidth:28, textAlign:'right' }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ── Threats ─────────────────────────────────────────────────────────────────
function ThreatsTab() {
  return (
    <div>
      {['S','A','LOVE'].map(tier => {
        const items = THREATS_STATIC.filter(t => t.tier === tier);
        if (!items.length) return null;
        return (
          <div key={tier}>
            <div className="tier-divider" style={{ borderColor:TIER_CLR[tier], color:TIER_CLR[tier] }}>
              {TIER_LABEL[tier]}
            </div>
            {items.map(t => (
              <div key={t.name} className="scard">
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:4 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                    <span style={{ fontSize:13, fontWeight:600, color:TIER_CLR[tier] }}>{t.name}</span>
                    {t.isG && <span className="rb" style={{ background:'#1e0808', color:'#FF4444', border:'1px solid #FF444430' }}>ghost ⛔</span>}
                    {t.hasD && <span className="rb" style={{ background:'#1e1408', color:'var(--amber)', border:'1px solid #EF9F2730' }}>defiant ⚠</span>}
                  </div>
                  <span className="rb" style={{ background:'var(--bg4)', color:TIER_CLR[tier] }}>{tier}</span>
                </div>
                <p className="mono" style={{ fontSize:11, color:'var(--t2)', margin:'0 0 5px', lineHeight:1.65 }}>{t.detail}</p>
                <p style={{ fontSize:11, color:'var(--teal)', margin:0, lineHeight:1.5, fontStyle:'italic' }}>Counter: {t.counter}</p>
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}

// ── Win Cons ─────────────────────────────────────────────────────────────────
function WinConTab() {
  return (
    <div>
      {WINCONS.map(w => (
        <div key={w.arch} className="scard" style={{ borderLeft:`2px solid ${w.clr}`, paddingLeft:12 }}>
          <div style={{ display:'flex', alignItems:'center', gap:9, marginBottom:5 }}>
            <span style={{ fontSize:18 }}>{w.icon}</span>
            <span style={{ fontSize:13, fontWeight:600, color:w.clr }}>{w.arch}</span>
          </div>
          <p style={{ fontSize:12, color:'var(--t2)', margin:0, lineHeight:1.7 }}>{w.plan}</p>
        </div>
      ))}
    </div>
  );
}

// ── Coach ────────────────────────────────────────────────────────────────────
function CoachTab() {
  const [opponents, setOpponents] = useState(['','','','','','']);
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const update = (i, v) => setOpponents(prev => { const n = [...prev]; n[i] = v; return n; });
  const filled = opponents.filter(Boolean);
  const ghosts  = filled.filter(p => GHOST.some(g => p.toLowerCase().includes(g)));
  const defiant = filled.filter(p => DEFIANT.some(g => p.toLowerCase().includes(g)));
  const armor   = filled.filter(p => ARMOR.some(a => p.toLowerCase().includes(a)));

  const analyze = async () => {
    if (filled.length < 2) { setError('Enter at least 2 opponent Pokemon.'); return; }
    setError(null); setBusy(true); setResult(null);
    try {
      const r = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ opponents }),
      });
      const d = await r.json();
      if (d.error) { setError(d.error); setBusy(false); return; }
      setResult(parseResult(d.result));
    } catch (e) {
      setError('Request failed. Check your connection.');
    }
    setBusy(false);
  };

  return (
    <div className="grid2">
      {/* LEFT */}
      <div>
        <p className="mono" style={{ fontSize:10, letterSpacing:'.12em', color:'var(--t3)', marginBottom:'.6rem' }}>opponent team preview</p>
        <div className="grid2i">
          {opponents.map((val, i) => (
            <div key={i} style={{ display:'flex', alignItems:'center', gap:5 }}>
              <span className="mono" style={{ fontSize:11, color:'var(--t3)', minWidth:12 }}>{i+1}</span>
              <input type="text" value={val} list="dex"
                onChange={e => update(i, e.target.value)}
                placeholder={`Pokemon ${i+1}`} className="pi"
                onKeyDown={e => { if (e.key === 'Enter') analyze(); }} />
            </div>
          ))}
        </div>

        {ghosts.length > 0 && (
          <div className="wbox ghost visible">
            ⛔ ghost types: {ghosts.join(', ')}<br/>
            <span style={{ opacity:.75 }}>Escape Shadow Tag. Shadow Ball immediately. Never Perish Song.</span>
          </div>
        )}
        {defiant.length > 0 && (
          <div className="wbox defiant visible">
            ⚠ defiant: {defiant.join(', ')}<br/>
            <span style={{ opacity:.75 }}>NEVER Parting Shot or Intimidate into this Pokemon.</span>
          </div>
        )}
        {armor.length > 0 && (
          <div className="wbox armor visible">
            ✓ armor tail / queenly majesty: {armor.join(', ')}<br/>
            <span style={{ opacity:.75 }}>Tinkaton Mold Breaker Fake Out bypasses this ability.</span>
          </div>
        )}

        {error && <p className="errp">{error}</p>}
        <button className="abtn" onClick={analyze} disabled={busy} style={{ marginBottom:4 }}>
          {busy ? 'analyzing...' : 'analyze matchup →'}
        </button>
        <p className="mono" style={{ fontSize:10, color:'var(--t3)', textAlign:'center', marginBottom:'.75rem' }}>
          type name — autocomplete suggests · powered by Gemini (free)
        </p>

        <div className="speedbox">
          <p className="mono" style={{ fontSize:10, letterSpacing:'.1em', color:'var(--t3)', marginBottom:6 }}>speed tiers</p>
          {SPEEDS.map(([n,s,c]) => (
            <div key={n} style={{ display:'flex', justifyContent:'space-between', marginBottom:2 }}>
              <span className="mono" style={{ fontSize:10, color:'var(--t2)' }}>{n}</span>
              <span className="mono" style={{ fontSize:10, color:c, fontWeight:700 }}>{s}</span>
            </div>
          ))}
        </div>

        <div style={{ marginTop:'.75rem' }}>
          <p className="mono" style={{ fontSize:10, letterSpacing:'.1em', color:'var(--t3)', marginBottom:4 }}>session notes</p>
          <textarea className="ta" placeholder="Log patterns, leads, misplays..." />
        </div>
      </div>

      {/* RIGHT */}
      <div>
        {!result && !busy && (
          <div className="bench">
            <div style={{ fontSize:40, marginBottom:12 }}>⚔</div>
            <p className="mono" style={{ fontSize:11, lineHeight:1.9, color:'var(--t3)' }}>
              enter opponent team<br/>to get your game plan<br/><br/>
              <span style={{ fontSize:10 }}>warnings appear instantly<br/>as you type names</span>
            </p>
          </div>
        )}
        {busy && (
          <div className="bench">
            <div style={{ fontSize:36, marginBottom:10 }}>⏳</div>
            <p className="mono" style={{ fontSize:11, color:'var(--t2)' }}>asking Gemini...</p>
          </div>
        )}
        {result && Object.entries(result).map(([key, val]) => (
          <div key={key} className="rsec">
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:5 }}>
              <span>{SEC_ICONS[key] || '•'}</span>
              <span className="mono" style={{ fontSize:10, letterSpacing:'.1em', color:SEC_CLRS[key] || '#AFA9EC' }}>{key}</span>
            </div>
            <p className="mono" style={{ fontSize:12, color:'var(--t2)', margin:0, lineHeight:1.75, whiteSpace:'pre-wrap' }}>{val}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function Home() {
  const [tab, setTab] = useState('coach');
  return (
    <>
      <Head>
        <title>Champions Draft Coach</title>
        <meta name="description" content="Perish Song trap team analyzer for Pokemon Champions Reg M-A. Powered by Gemini (free)." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>⚔</text></svg>" />
      </Head>

      <datalist id="dex">
        {POKEMON_LIST.map(p => <option key={p} value={p} />)}
      </datalist>

      <div className="container">
        <div className="header">
          <span className="header-icon">⚔</span>
          <div>
            <h1>CHAMPIONS DRAFT COACH</h1>
            <p>Perish Song Trap · Regulation M-A · Doubles · Powered by Gemini (free)</p>
          </div>
        </div>

        <div className="tabs">
          {['coach','roster','threats','win-con'].map(t => (
            <button key={t} className={`tab${tab===t?' on':''}`} onClick={() => setTab(t)}>
              {{ coach:'draft coach', roster:'my roster', threats:'meta threats', 'win-con':'win cons' }[t]}
            </button>
          ))}
        </div>

        {tab === 'coach'   && <CoachTab />}
        {tab === 'roster'  && <RosterTab />}
        {tab === 'threats' && <ThreatsTab />}
        {tab === 'win-con' && <WinConTab />}
      </div>
    </>
  );
}
