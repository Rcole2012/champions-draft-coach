import { SYSTEM_PROMPT } from "../../lib/data";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { opponents } = req.body;
  if (!opponents || !Array.isArray(opponents)) {
    return res.status(400).json({ error: "Invalid request body" });
  }

  const filled = opponents.filter((o) => o?.trim());
  if (filled.length < 2) {
    return res.status(400).json({ error: "At least 2 opponent Pokemon required" });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "GEMINI_API_KEY not configured" });
  }

  const list = opponents
    .map((o, i) => (o?.trim() ? `${i + 1}. ${o.trim()}` : null))
    .filter(Boolean)
    .join(", ");

  const prompt = `${SYSTEM_PROMPT}\n\nOpponent team: ${list}\n\nAnalyze.`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-8b:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.4,
            maxOutputTokens: 1200,
          },
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
    console.error(err);
    return res.status(500).json({ error: err.message || "Analysis failed" });
  }
}
