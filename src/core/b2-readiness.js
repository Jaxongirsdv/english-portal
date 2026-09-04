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

/**
 * Один осмысленный шаг для сегодняшней экзаменационной тренировки.
 *
 * Полный план по датам полезен как ориентир, но не должен заставлять
 * повторять Reading, когда реальная проблема — уже пройденный Listening.
 * Сначала возвращаем к части ниже 70%, затем закрываем пробелы формата,
 * и только после полного покрытия работаем с самым слабым средним навыком.
 */
export function b2DailyFocus(state) {
  const readiness = examReadiness(state);
  const weakParts = [];

  for (const [skill, config] of Object.entries(EXAM_SKILLS)) {
    const stored = state?.b2Training?.[skill] || {};
    for (const part of config.parts) {
      const result = stored[part.id];
      if (!result) continue;
      const score = result.lastScore ?? result.score ?? 0;
      if (score < 70) weakParts.push({ skill, part, score, route: config.route });
    }
  }

  weakParts.sort((a, b) => a.score - b.score);
  if (weakParts.length) {
    const item = weakParts[0];
    return {
      kind: 'repair', skill: item.skill, route: item.route,
      title: `Исправить ${item.skill}: ${item.part.title || 'слабую часть'}`,
      text: `Последний результат — ${item.score}%. Повтори эту часть до перехода дальше.`,
      action: `Повторить ${item.skill}`,
    };
  }

  const incomplete = Object.entries(readiness.skills)
    .filter(([, item]) => item.completed < item.total)
    .sort((a, b) => (a[1].completed / a[1].total) - (b[1].completed / b[1].total))[0];
  if (incomplete) {
    const [skill, item] = incomplete;
    return {
      kind: 'coverage', skill, route: item.route,
      title: `Закрыть ${skill}: ${item.completed + 1}-ю часть`,
      text: `Пройдено ${item.completed} из ${item.total} частей. Результат появится в карте готовности.`,
      action: `Тренировать ${skill}`,
    };
  }

  const item = readiness.focus;
  return {
    kind: 'strengthen', skill: item.skill, route: item.route,
    title: `Укрепить ${item.skill}`,
    text: `Все части пройдены. Самый низкий текущий средний результат — ${item.score}%.`,
    action: `Тренировать ${item.skill}`,
  };
}
