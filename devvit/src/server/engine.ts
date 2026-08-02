import { Club, CLUBS_DATA, QUESTIONS_DATA, Question, TraitWeights } from './data.js';

export interface SessionState {
  sessionId: string;
  userTraits: TraitWeights;
  commitmentPreference?: number;
  answeredQuestionIds: number[];
  createdAt: number;
}

const activeSessions = new Map<string, SessionState>();

export function createSession(userId: string = 'reddit_user'): { sessionId: string; firstQuestion: Question } {
  const sessionId = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const session: SessionState = {
    sessionId,
    userTraits: {},
    answeredQuestionIds: [],
    createdAt: Date.now(),
  };

  activeSessions.set(sessionId, session);
  const firstQuestion = QUESTIONS_DATA[0];

  return { sessionId, firstQuestion };
}

export function submitAnswer(
  sessionId: string,
  questionId: number,
  optionId: number
): { completed: boolean; nextQuestion?: Question; recommendations?: any[] } {
  const session = activeSessions.get(sessionId);
  if (!session) {
    const fallback = createSession();
    return { completed: false, nextQuestion: fallback.firstQuestion };
  }

  const question = QUESTIONS_DATA.find((q) => q.id === questionId);
  if (question) {
    const option = question.options.find((o) => o.id === optionId);
    if (option) {
      if (option.traits) {
        for (const [trait, weight] of Object.entries(option.traits)) {
          const current = (session.userTraits as any)[trait] || 0;
          (session.userTraits as any)[trait] = current + (weight as number);
        }
      }
      if (option.commitment) {
        session.commitmentPreference = option.commitment;
      }
    }
  }

  session.answeredQuestionIds.push(questionId);

  const nextQuestion = QUESTIONS_DATA.find((q) => !session.answeredQuestionIds.includes(q.id));

  if (nextQuestion) {
    return { completed: false, nextQuestion };
  }

  const recs = calculateRecommendations(session.userTraits, session.commitmentPreference);
  activeSessions.delete(sessionId);

  return { completed: true, recommendations: recs };
}

export function calculateRecommendations(userTraits: TraitWeights, commitmentPref: number = 4): any[] {
  const traitKeys = Object.keys(userTraits);

  const scoredClubs = CLUBS_DATA.map((club) => {
    let dotProduct = 0;
    let userMagnitudeSq = 0;
    let clubMagnitudeSq = 0;
    let traitMatchCount = 0;
    let quadraticPenalty = 0;
    let isVetoed = false;

    for (const [trait, userWeight] of Object.entries(userTraits)) {
      const uWeight = userWeight as number;
      const cWeight = (club.traits as any)[trait] || 0;

      // 1. Hard Veto Check (Kill Switch)
      if (uWeight <= -0.8 && cWeight >= 0.6) {
        isVetoed = true;
        break;
      }

      // 2. Quadratic Disinterest Penalty
      if (uWeight < 0 && cWeight > 0.3) {
        quadraticPenalty += Math.pow(Math.abs(uWeight) * cWeight, 2);
      }

      if (uWeight > 0) {
        dotProduct += uWeight * cWeight;
        userMagnitudeSq += uWeight * uWeight;
        if (cWeight > 0) {
          clubMagnitudeSq += cWeight * cWeight;
          traitMatchCount++;
        }
      }
    }

    if (isVetoed) {
      return { club, score: 0.0, explanation: 'Filtered out based on explicit preference.' };
    }

    const userMag = Math.sqrt(userMagnitudeSq) || 1;
    const clubMag = Math.sqrt(clubMagnitudeSq) || 1;
    const cosineSim = dotProduct / (userMag * clubMag);

    const overlapRatio = traitKeys.length > 0 ? traitMatchCount / traitKeys.length : 0;
    const commitmentDiff = Math.abs(club.commitment_hours - commitmentPref);
    const commitmentScore = Math.max(0, 1 - commitmentDiff / 8);

    // 3. Hybrid Score minus Quadratic Disinterest Penalty
    const rawScore = (dotProduct / 2.0) * 0.45 + cosineSim * 0.30 + overlapRatio * 0.15 + commitmentScore * 0.10;
    const finalScore = Math.max(0, rawScore - quadraticPenalty);

    let explanation = `Great match for your ${club.category.toLowerCase()} interests.`;
    if (finalScore > 0.8) {
      explanation = `High alignment with your core technical and creative choices.`;
    }

    return {
      club,
      score: Math.min(0.99, Math.max(0.2, finalScore)),
      explanation,
    };
  });

  // Filter out vetoed clubs
  const validClubs = scoredClubs.filter((c) => c.score > 0.0);
  validClubs.sort((a, b) => b.score - a.score);

  // 4. Maximal Marginal Relevance (MMR) for Category Diversity
  const finalRecs: any[] = [];
  const selectedCategories = new Set<string>();

  for (const candidate of validClubs) {
    if (finalRecs.length >= 3) break;
    if (finalRecs.length > 0 && selectedCategories.has(candidate.club.category) && validClubs.length > finalRecs.length + 1) {
      candidate.score *= 0.85;
    }
    finalRecs.push(candidate);
    selectedCategories.add(candidate.club.category);
  }

  finalRecs.sort((a, b) => b.score - a.score);

  return finalRecs.map((item, index) => ({
    rank: index + 1,
    score: item.score,
    explanation: item.explanation,
    club: item.club,
    club_name: item.club.name,
  }));
}
