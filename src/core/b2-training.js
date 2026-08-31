import { normalize } from './ui.js';

export function acceptsAnswer(question, value) {
  const accepted = question.answers || [question.answer];
  const actual = normalize(value);
  return !!actual && accepted.some((answer) => normalize(answer) === actual);
}

export function trainingResult(answers, total) {
  const right = answers.filter(Boolean).length;
  const percent = total ? Math.round((right / total) * 100) : 0;
  return {
    right,
    total,
    percent,
    score75: Math.round((percent / 100) * 75),
  };
}

export function skillTrainingSummary(state, skill, parts = []) {
  const results = state?.b2Training?.[skill] || {};
  const completed = parts.filter((part) => results[part.id]);
  const scores = completed.map((part) => results[part.id].score || 0);
  return {
    completed: completed.length,
    total: parts.length,
    percent: scores.length ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length) : 0,
  };
}
