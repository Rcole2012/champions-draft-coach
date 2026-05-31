import { buildSystemPrompt } from "../../lib/analysis";
import { META_DB } from "../../lib/pokemon-data";

function oppContext(name) {
  const n = (name || '').toLowerCase().trim();
  const data = Object.values(META_DB).find(d =>
    (d.name||'').toLowerCase() === n ||
    n.includes((d.name||'').toLowerCase().split(' ').slice(-1)[0]) ||
    (d.name||'').toLowerCase().includes(n.split(' ').slice(-1)[0])
  );
  if (!data) return `${name}: unknown Pokemon`;
  const topMoves = (data.moves||[]).slice(0,5).map(m=>`${m.m}(${m.pct}%)`).join(', ');
  const topItems = (data.items||[]).slice(0,3).map(i=>`${i.i}(${i.pct}%)`).join(', ');
  const topAb = (data.abilities||[]).slice(0,1).map(a=>`${a.a}(${a.pct}%)`).join(', ');
  const hasScarf = (data.items||[]).find(i=>i.i==='Choice Scarf');
  const scarfSpd = hasScarf ? ` [SCARF ${hasScarf.pct}%: speed×1.5]` : '';
  return `${data.name}(${(data.types||[]).join('/')})[WR:${data.wr}%] Moves:${topMoves} | Items:${topItems}${scarfSpd} | Ability:${topAb}`;
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { opponents, team, format } = req.body;
  if (!opponents || !Array.isArray(opponents)) return res.status(400).json({ error: "Invalid request" });
  const filled = opponents.filter(o => o?.trim());
  if (filled.length < 2) return res.status(400).json({ error: "At least 2 opponent Pokemon required" });

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "GEMINI_API_KEY not configured" });

  const sys = buildSystemPrompt(team, format || 'doubles');
  const oppData = filled.map((o, i) => `${i+1}. ${o.trim()} — ${oppContext(o.trim())}`).join('\n');
  const prompt = `${sys}\n\nOPPONENT TEAM WITH META DATA:\n${oppData}\n\nAnalyze this matchup now.`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.3, maxOutputTokens: 1600 },
        }),
      }
    );
    if (!response.ok) {
      const err = await response.json();
      return res.status(500).json({ error: err?.error?.message || "Gemini API error" });
    }
    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "No response.";
    return res.status(200).json({ result: text });
  } catch (err) {
    return res.status(500).json({ error: err.message || "Analysis failed" });
  }
}
