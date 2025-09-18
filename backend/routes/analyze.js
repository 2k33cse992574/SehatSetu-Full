// /routes/analyze.js
import express from "express";
import fetch from "node-fetch";

const router = express.Router();

router.post("/analyze", async (req, res) => {
  const { text, lang, session_id } = req.body || {};
  if (!text) return res.status(400).json({ error: "Missing text" });

  try {
    const r = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama3",
        prompt: `The user has reported symptoms: "${text}". 
Analyze these symptoms in ${lang || "English"}.
Return JSON with this structure ONLY:
{
  "diagnoses": [{"label": "...", "confidence": 0.xx}],
  "severity": "low|medium|high",
  "advice": "short text",
  "doctors": [
    {"id":"1","name":"...","specialty":"...","phone":"...","profile":"..."},
    {"id":"2","name":"...","specialty":"...","phone":"...","profile":"..."}
  ]
}`
      }),
    });

    if (!r.ok) {
      throw new Error("⚠️ Ollama backend not reachable");
    }

    // Ollama streams JSON lines
    let output = "";
    for await (const chunk of r.body) {
      const str = chunk.toString("utf8").trim();
      if (!str) continue;
      try {
        const obj = JSON.parse(str);
        if (obj.response) {
          output += obj.response;
        }
      } catch {
        // skip malformed chunk
      }
    }

    let parsed;
    try {
      parsed = JSON.parse(output);
    } catch {
      parsed = { raw: output };
    }

    // ✅ Use confidence internally, sort, then strip it
    const rawDiagnoses = parsed.diagnoses || [];
    const sortedDiagnoses = rawDiagnoses.sort(
      (a, b) => (b.confidence || 0) - (a.confidence || 0)
    );

    const cleanDiagnoses = sortedDiagnoses.map(d => ({
      label: d.label,
      type: d.type || (d.confidence > 0.6 ? "doctor" : "home-remedy")
    }));

    return res.json({
      diagnoses: cleanDiagnoses,
      severity: parsed.severity,
      advice: parsed.advice,
      doctors: parsed.doctors || []
    });

  } catch (err) {
    console.error("Server error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

export default router;
