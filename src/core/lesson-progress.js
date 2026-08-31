export const LESSON_COMPLETE_PERCENT = 50;
export const LESSON_MASTERY_PERCENT = 80;

export function lessonScore(record) {
  if (!record) return 0;
  const score = Number(record.score);
  // Самые старые версии сохраняли только факт прохождения без оценки.
  return Number.isFinite(score) ? Math.max(0, Math.min(100, score)) : 100;
}

export function lessonStage(record) {
  if (!record) return 'not-started';
  const score = lessonScore(record);
  if (score >= LESSON_MASTERY_PERCENT) return 'mastered';
  if (score >= LESSON_COMPLETE_PERCENT) return 'completed';
  return 'attempted';
}

export function isLessonMastered(record) {
  return lessonStage(record) === 'mastered';
}

export function lessonAttempt(previous, score, at = new Date().toISOString()) {
  const normalized = Math.max(0, Math.min(100, Number(score) || 0));
  const bestScore = Math.max(lessonScore(previous), normalized);
  const firstSeenAt = previous?.attemptedAt || previous?.completedAt || at;

  return {
    attemptedAt: firstSeenAt,
    completedAt: bestScore >= LESSON_COMPLETE_PERCENT
      ? previous?.completedAt || at
      : null,
    masteredAt: bestScore >= LESSON_MASTERY_PERCENT
      ? previous?.masteredAt || (isLessonMastered(previous) ? previous?.completedAt : null) || at
      : null,
    lastAttemptAt: at,
    attempts: (previous?.attempts || (previous ? 1 : 0)) + 1,
    score: bestScore,
    lastScore: normalized,
  };
}
