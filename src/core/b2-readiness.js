import { B2_OBJECTIVE_PARTS } from '../data/b2-multilevel.js';
import { B2_WRITING_PARTS } from '../data/b2-writing.js';

export const EXAM_SKILLS = {
  Reading: { parts: B2_OBJECTIVE_PARTS.Reading, route: 'b2-reading' },
  Listening: { parts: B2_OBJECTIVE_PARTS.Listening, route: 'b2-listening' },
  Writing: { parts: B2_WRITING_PARTS, route: 'b2-writing' },
  Speaking: { parts: [{ id: 'recording' }], route: 'b2-speaking' },
};

export function examReadiness(state, since = null) {
  const skills = {};
  for (const [skill, config] of Object.entries(EXAM_SKILLS)) {
    const stored = state?.b2Training?.[skill] || {};
    const completed = config.parts.filter((part) => {
      const result = stored[part.id];
      return result && (!since || (result.at || '') >= since);
    });
    const scores = completed.map((part) => stored[part.id].lastScore ?? stored[part.id].score ?? 0);
    skills[skill] = {
      completed: completed.length,
      total: config.parts.length,
      score: scores.length ? Math.round(scores.reduce((sum, value) => sum + value, 0) / scores.length) : 0,
      route: config.route,
    };
  }
  const firstIncomplete = Object.entries(skills).find(([, value]) => value.completed < value.total);
  const weakest = Object.entries(skills).sort((a, b) => a[1].score - b[1].score)[0];
  const ready = !firstIncomplete;
  const focus = firstIncomplete || weakest;
  const overall = Math.round(Object.values(skills).reduce((sum, value) => sum + value.score, 0) / Object.keys(skills).length);
  return { skills, ready, overall, focus: { skill: focus[0], ...focus[1] } };
}
