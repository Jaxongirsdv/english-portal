export const B2_SKILLS = ['Reading', 'Listening', 'Writing', 'Speaking'];

const ROUTES = {
  Reading: 'reading',
  Listening: 'listening',
  Writing: 'b2-writing',
  Speaking: 'b2-speaking',
};

const ACTIONS = {
  Reading: 'Читай B2-тексты на время и разбирай каждый неверный ответ.',
  Listening: 'Слушай текст без подсказки, затем выполняй диктант и вопросы.',
  Writing: 'Пиши одну работу B2 по таймеру и проверяй её по критериям.',
  Speaking: 'Записывай ответ на 60–90 секунд по структуре: мысль, аргумент, пример, вывод.',
};

export function subjectiveScore(part, checked, writingInRange = false) {
  const count = new Set((checked || []).map(Number).filter(Number.isInteger)).size;
  if (part === 'Writing') return Math.round(((Math.min(count, 4) + (writingInRange ? 1 : 0)) / 5) * 100);
  if (part === 'Speaking') return Math.round((Math.min(count, 4) / 4) * 100);
  return 0;
}

export function diagnosticReport(scores = {}) {
  const skills = Object.fromEntries(B2_SKILLS.map((skill) => [skill, Math.max(0, Math.min(100, Number(scores[skill]) || 0))]));
  const ordered = B2_SKILLS.map((skill) => ({ skill, score: skills[skill] })).sort((a, b) => a.score - b.score);
  const overall = Math.round(ordered.reduce((sum, item) => sum + item.score, 0) / ordered.length);
  const weakest = ordered[0];
  const minimum = weakest.score;
  const readiness = overall >= 75 && minimum >= 60
    ? { level: 'high', title: 'Высокая тренировочная готовность', text: 'Результаты ровные. Теперь важнее сохранять темп и работать по экзаменационному времени.' }
    : overall >= 60 && minimum >= 40
      ? { level: 'medium', title: 'Ты близко к B2', text: 'База уже есть, но слабый навык пока может заметно снизить итоговый результат.' }
      : { level: 'low', title: 'Нужна целевая подготовка', text: 'Сначала укрепи самый слабый навык, затем повтори диагностику.' };

  return {
    skills,
    overall,
    weakest: weakest.skill,
    readiness,
    recommendation: { skill: weakest.skill, route: ROUTES[weakest.skill], text: ACTIONS[weakest.skill] },
  };
}

export function createDiagnosticSnapshot(mock, at = new Date().toISOString()) {
  const report = diagnosticReport(mock?.scores);
  return {
    id: mock?.currentStartedAt || at,
    at,
    scores: report.skills,
    overall: report.overall,
    weakest: report.weakest,
    readiness: report.readiness.level,
  };
}
