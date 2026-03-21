import { UserProfile } from '@/types';
import { SynergyScore, MatchResult } from '@/types/synergy';

// ─── TF-IDF Cosine Similarity ────────────────────────────────────────────────

/**
 * Build a term-frequency map from a list of tokens (skills, interests, bio words)
 */
function buildTF(tokens: string[]): Map<string, number> {
  const tf = new Map<string, number>();
  for (const t of tokens) {
    const key = t.toLowerCase().trim();
    if (key) tf.set(key, (tf.get(key) ?? 0) + 1);
  }
  return tf;
}

/**
 * Cosine similarity between two TF maps
 */
function cosineSimilarity(a: Map<string, number>, b: Map<string, number>): number {
  let dot = 0, normA = 0, normB = 0;
  for (const [term, valA] of a) {
    dot += valA * (b.get(term) ?? 0);
    normA += valA * valA;
  }
  for (const [, valB] of b) normB += valB * valB;
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Build a profile token vector from skills + interests + bio keywords
 */
function profileTokens(user: UserProfile): string[] {
  const tokens: string[] = [
    ...(user.skills ?? []),
    ...(user.interests ?? []),
    // bio words (split on whitespace, filter short words)
    ...(user.bio ?? '').split(/\s+/).filter(w => w.length > 3),
  ];
  return tokens;
}

/**
 * Complementary skill score (0-100).
 * Sweet spot: teams need SOME overlap (shared language) but mostly different skills.
 * Ideal overlap: 20-50% of combined unique skills.
 */
function complementarySkillScore(user1: UserProfile, user2: UserProfile): number {
  const s1 = new Set((user1.skills ?? []).map(s => s.toLowerCase()));
  const s2 = new Set((user2.skills ?? []).map(s => s.toLowerCase()));
  const common = [...s1].filter(s => s2.has(s)).length;
  const total = new Set([...s1, ...s2]).size;
  if (total === 0) return 50;
  const overlap = common / total;
  // Score peaks at 20-50% overlap, drops off on both ends
  if (overlap >= 0.20 && overlap <= 0.50) return 100;
  if (overlap >= 0.10 && overlap < 0.20) return 75;
  if (overlap > 0.50 && overlap <= 0.65) return 75;
  if (overlap < 0.10) return 45; // too different — no common ground
  return 55; // > 65% overlap — too similar, redundant
}

// ─── Main Scoring ─────────────────────────────────────────────────────────────

export function calculateSynergyScore(
  user1: UserProfile,
  user2: UserProfile
): SynergyScore {

  // ── 1. GOAL MATCH (25% weight) ──────────────────────────────────────────
  // Hard rule: win vs learn = friction. Same goal = aligned.
  let goalMatch = 50;
  if (user1.workStyle && user2.workStyle) {
    goalMatch = user1.workStyle.goal === user2.workStyle.goal ? 100 : 20;
  }

  // ── 2. TIME COVERAGE (25% weight) ───────────────────────────────────────
  // Hackathons are 24-36hrs. Complementary schedules = full coverage.
  // day + night > day + day.
  let timeMatch = 50;
  if (user1.workStyle && user2.workStyle) {
    const t1 = user1.workStyle.timePreference;
    const t2 = user2.workStyle.timePreference;
    if (t1 === 'flexible' || t2 === 'flexible') {
      timeMatch = t1 === 'flexible' && t2 === 'flexible' ? 90 : 100;
    } else if (t1 !== t2) {
      timeMatch = 95; // complementary — ideal 24hr coverage
    } else {
      timeMatch = 55; // same shift — gaps in off-hours
    }
  }

  // ── 3. COMMITMENT MATCH (20% weight) ────────────────────────────────────
  // Similar commitment levels avoid resentment.
  let commitmentMatch = 50;
  if (user1.workStyle && user2.workStyle) {
    const order: Record<string, number> = { 'full-time': 3, 'part-time': 2, 'casual': 1 };
    const c1 = order[user1.workStyle.commitment ?? 'part-time'] ?? 2;
    const c2 = order[user2.workStyle.commitment ?? 'part-time'] ?? 2;
    const diff = Math.abs(c1 - c2);
    commitmentMatch = diff === 0 ? 100 : diff === 1 ? 65 : 25;
  }

  // ── 4. SKILL COMPLEMENTARITY (20% weight) ───────────────────────────────
  // TF-IDF cosine on full profile vectors + complementary overlap check.
  const tokens1 = profileTokens(user1);
  const tokens2 = profileTokens(user2);
  const tf1 = buildTF(tokens1);
  const tf2 = buildTF(tokens2);
  const cosine = cosineSimilarity(tf1, tf2); // 0-1, higher = more similar
  const complementary = complementarySkillScore(user1, user2);

  // Blend: we want SOME similarity (shared context) but not too much (redundant)
  // cosine similarity inverted slightly — 0.3-0.6 range is ideal
  const cosineScore = cosine >= 0.3 && cosine <= 0.6
    ? 100
    : cosine < 0.3
      ? Math.round(cosine / 0.3 * 80)   // too different
      : Math.round((1 - (cosine - 0.6) / 0.4) * 80); // too similar

  const skillMatch = Math.round(cosineScore * 0.5 + complementary * 0.5);

  // ── 5. HOURS AVAILABILITY (10% weight) ──────────────────────────────────
  let hoursMatch = 50;
  if (user1.workStyle?.hoursAvailable && user2.workStyle?.hoursAvailable) {
    const diff = Math.abs(user1.workStyle.hoursAvailable - user2.workStyle.hoursAvailable);
    hoursMatch = diff <= 5 ? 100 : diff <= 15 ? 70 : 40;
  }

  const overall = Math.round(
    goalMatch       * 0.25 +
    timeMatch       * 0.25 +
    commitmentMatch * 0.20 +
    skillMatch      * 0.20 +
    hoursMatch      * 0.10
  );

  return {
    overall,
    goalMatch,
    timeMatch,
    commitmentMatch,
    skillMatch,
    breakdown: {
      goal:       describeGoal(goalMatch),
      time:       describeTime(timeMatch),
      commitment: describeCommitment(commitmentMatch),
      skills:     describeSkills(skillMatch),
    },
  };
}

// ─── Find Best Matches ────────────────────────────────────────────────────────

export function findBestMatches(
  currentUser: UserProfile,
  candidates: UserProfile[],
  limit = 10
): MatchResult[] {
  return candidates
    .filter(c => c.uid !== currentUser.uid)
    .map(candidate => {
      const synergyScore = calculateSynergyScore(currentUser, candidate);
      return {
        userId: candidate.uid,
        userName: candidate.name,
        userAvatar: candidate.avatar,
        synergyScore,
        isHighSynergy: synergyScore.overall >= 75,
        compatibilityBadge:
          synergyScore.overall >= 75 ? 'high' :
          synergyScore.overall >= 50 ? 'medium' : 'low',
      } as MatchResult;
    })
    .sort((a, b) => b.synergyScore.overall - a.synergyScore.overall)
    .slice(0, limit);
}

// ─── Descriptions ─────────────────────────────────────────────────────────────

function describeGoal(score: number): string {
  if (score >= 90) return 'Aligned goals — both want the same outcome';
  if (score >= 40) return 'Somewhat aligned goals';
  return 'Conflicting goals — may cause friction';
}

function describeTime(score: number): string {
  if (score >= 95) return 'Complementary schedules — full 24hr team coverage';
  if (score >= 85) return 'Flexible schedules — great coverage';
  if (score >= 50) return 'Same schedule — good overlap, some off-hour gaps';
  return 'Schedule coverage unclear';
}

function describeCommitment(score: number): string {
  if (score >= 90) return 'Same commitment level — no resentment risk';
  if (score >= 60) return 'Compatible commitment levels';
  return 'Very different commitment — may cause imbalance';
}

function describeSkills(score: number): string {
  if (score >= 90) return 'Ideal skill balance — complementary with common ground';
  if (score >= 70) return 'Good complementary skills';
  if (score >= 50) return 'Some skill overlap';
  return 'Skills too similar (redundant) or too different (no common ground)';
}

// ─── Badge Helpers ────────────────────────────────────────────────────────────

export function getSynergyBadgeColor(score: number): string {
  if (score >= 75) return 'bg-green-500';
  if (score >= 50) return 'bg-yellow-500';
  return 'bg-red-500';
}

export function getSynergyBadgeText(score: number): string {
  if (score >= 85) return 'Excellent Match';
  if (score >= 75) return 'High Synergy';
  if (score >= 60) return 'Good Match';
  if (score >= 50) return 'Moderate Match';
  return 'Low Compatibility';
}
