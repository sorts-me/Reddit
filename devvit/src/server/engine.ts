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
    // If session expired or lost in memory, create a fallback session
    const fallback = createSession();
    return { completed: false, nextQuestion: fallback.firstQuestion };
  }

  // Find question and selected option
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

  // Find next unanswered question
  const nextQuestion = QUESTIONS_DATA.find((q) => !session.answeredQuestionIds.includes(q.id));

  if (nextQuestion) {
    return { completed: false, nextQuestion };
  }

  // All questions answered -> calculate top match recommendations
  const recs = calculateRecommendations(session.userTraits, session.commitmentPreference);
  activeSessions.delete(sessionId);

  return { completed: true, recommendations: recs };
}

function calculateRecommendations(userTraits: TraitWeights, commitmentPref: number = 4): any[] {
  const traitKeys = Object.keys(userTraits);

  const scoredClubs = CLUBS_DATA.map((club) => {
    let dotProduct = 0;
    let userMagnitudeSq = 0;
    let clubMagnitudeSq = 0;
    let traitMatchCount = 0;

    // 1. Interest Dot-Product & Cosine Trait Overlap
    for (const [trait, userWeight] of Object.entries(userTraits)) {
      const uWeight = userWeight as number;
      const cWeight = (club.traits as any)[trait] || 0;

      dotProduct += uWeight * cWeight;
      userMagnitudeSq += uWeight * uWeight;
      if (cWeight > 0) {
        clubMagnitudeSq += cWeight * cWeight;
        if (uWeight > 0) traitMatchCount++;
      }
    }

    const userMag = Math.sqrt(userMagnitudeSq) || 1;
    const clubMag = Math.sqrt(clubMagnitudeSq) || 1;
    const cosineSim = dotProduct / (userMag * clubMag);

    // 2. Trait Overlap Ratio
    const overlapRatio = traitKeys.length > 0 ? traitMatchCount / traitKeys.length : 0;

    // 3. Commitment Alignment Score
    const commitmentDiff = Math.abs(club.commitment_hours - commitmentPref);
    const commitmentScore = Math.max(0, 1 - commitmentDiff / 8);

    // Weighted Hybrid Score: 45% Dot Product, 30% Cosine, 15% Overlap, 10% Commitment
    const normalizedDot = Math.min(1.0, dotProduct / 2.0);
    const finalScore = normalizedDot * 0.45 + cosineSim * 0.3 + overlapRatio * 0.15 + commitmentScore * 0.1;

    let explanation = `Excellent match for your interest in ${club.category.toLowerCase()} activities.`;
    if (dotProduct > 0.8) {
      explanation = `Strong alignment with your core technical & creative preferences.`;
    }

    return {
      club,
      score: Math.min(0.99, Math.max(0.4, finalScore)),
      explanation,
    };
  });

  // Sort descending by score
  scoredClubs.sort((a, b) => b.score - a.score);

  return scoredClubs.slice(0, 3).map((item, index) => ({
    rank: index + 1,
    score: item.score,
    explanation: item.explanation,
    club: item.club,
    club_name: item.club.name,
  }));
}
