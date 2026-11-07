// Optional AI extras. They only work when VITE_GEMINI_API_KEY is set at build /
// dev-server time; without a key they resolve to null and every caller falls
// back to its offline copy, so the game stays fully playable.
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';

async function callGemini(prompt, systemInstruction) {
  if (!API_KEY) return null;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${API_KEY}`;
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          systemInstruction: { parts: [{ text: systemInstruction }] },
        }),
      });
      if (!response.ok) throw new Error(`Gemini responded ${response.status}`);
      const data = await response.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text ?? null;
    } catch (error) {
      if (attempt === 1) return null;
      await new Promise((resolve) => setTimeout(resolve, 600));
    }
  }
  return null;
}

export function getAdviceTip({ score, savedScore, iulScore, salary, years }) {
  return callGemini(
    `Active: $${Math.floor(score)}, Saved: $${Math.floor(savedScore)}, IUL: $${Math.floor(
      iulScore
    )}, Salary: $${salary}, Tenure: ${years}y. Advice in 15 words.`,
    'You are a professional wealth advisor.'
  );
}

export function getPerformanceReview({ playerName, total, years, strategy }) {
  return callGemini(
    `Review performance: Name: ${playerName}, Wealth: $${total}, Tenure: ${years}y. Strategy: ${strategy}. Elite hedge fund style. Max 40 words.`,
    'Elite wealth auditor.'
  );
}

export function getSocialPost({ playerName, total, years, badgeName }) {
  return callGemini(
    `LinkedIn post for ${playerName} rank "${badgeName}" in Wealth Snake with $${total}. Tenure: ${years}y.`,
    'Viral finance story writer.'
  );
}

export async function getBadgeArtwork({ playerName, badgeName, total }) {
  if (!API_KEY) return null;
  const prompt =
    total < 0
      ? 'Broken vault, red neon lighting.'
      : `3D trophy certificate for ${playerName} as "${badgeName}". Emerald lighting.`;
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict?key=${API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ instances: { prompt }, parameters: { sampleCount: 1 } }),
      }
    );
    if (!response.ok) return null;
    const data = await response.json();
    const base64 = data.predictions?.[0]?.bytesBase64Encoded;
    return base64 ? `data:image/png;base64,${base64}` : null;
  } catch (error) {
    return null;
  }
}
