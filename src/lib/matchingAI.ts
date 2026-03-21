/**
 * matchingAI.ts
 * Gemini-powered "why this person" reasoning for top match candidates.
 * Called ONCE per batch (not per candidate) to keep token usage minimal.
 */

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_API_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

// Shared rate limiter — max 10 AI calls per 60s across the session
const aiCallTimestamps: number[] = [];
function checkRateLimit(): boolean {
  const now = Date.now();
  const filtered = aiCallTimestamps.filter(t => now - t < 60_000);
  aiCallTimestamps.length = 0;
  aiCallTimestamps.push(...filtered);
  if (aiCallTimestamps.length >= 10) return false;
  aiCallTimestamps.push(now);
  return true;
}

export interface CandidateSummary {
  uid: string;
  name: string;
  skills: string[];
  interests?: string[];
  workStyle?: {
    goal?: string;
    timePreference?: string;
    commitment?: string;
  };
  experience?: string;
  synergyScore: number;
}

export interface AIMatchReason {
  uid: string;
  reason: string; // 1-2 sentence explanation
}

/**
 * Ask Gemini to explain WHY each top candidate is a good match.
 * Sends ONE batch request for up to 5 candidates.
 * Returns a map of uid → reason string.
 */
export async function getAIMatchReasons(
  currentUser: { name: string; skills: string[]; interests?: string[]; workStyle?: Record<string, string> },
  hackathonTitle: string,
  hackathonSkills: string[],
  candidates: CandidateSummary[]
): Promise<Map<string, string>> {
  const result = new Map<string, string>();

  if (!GEMINI_API_KEY || candidates.length === 0) return result;
  if (!checkRateLimit()) return result; // silently skip if rate limited

  // Build a compact prompt — minimal tokens
  const candidateList = candidates
    .map((c, i) =>
      `${i + 1}. uid:${c.uid} name:${c.name} skills:[${c.skills.join(',')}] ` +
      `time:${c.workStyle?.timePreference ?? '?'} goal:${c.workStyle?.goal ?? '?'} ` +
      `commitment:${c.workStyle?.commitment ?? '?'} synergy:${c.synergyScore}%`
    )
    .join('\n');

  const prompt = `You are a hackathon team matching assistant.

Current user: ${currentUser.name}
Their skills: ${currentUser.skills.join(', ')}
Their time preference: ${currentUser.workStyle?.timePreference ?? 'unknown'}
Their goal: ${currentUser.workStyle?.goal ?? 'unknown'}

Hackathon: "${hackathonTitle}"
Required skills: ${hackathonSkills.join(', ') || 'none specified'}

Top candidates (pre-filtered by algorithm):
${candidateList}

For each candidate, write ONE sentence (max 20 words) explaining why they are a good match for this user and hackathon. Focus on skill gaps filled, schedule coverage, or goal alignment.

Respond ONLY with valid JSON array, no markdown:
[{"uid":"<uid>","reason":"<one sentence>"},...]`;

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.4,
          maxOutputTokens: 400, // tight limit — just short reasons
        },
      }),
    });

    if (!response.ok) return result;

    const data = await response.json();
    const text: string = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';

    // Parse JSON — strip any accidental markdown fences
    const clean = text.replace(/```json|```/g, '').trim();
    const parsed: AIMatchReason[] = JSON.parse(clean);

    for (const item of parsed) {
      if (item.uid && item.reason) result.set(item.uid, item.reason);
    }
  } catch {
    // Silently fail — UI falls back to algorithm descriptions
  }

  return result;
}
