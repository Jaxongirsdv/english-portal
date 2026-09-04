import { loadState } from '../core/storage.js';
import { b2Sprint, B2_EXAM_DATE } from '../core/b2-sprint.js';
import { B2_SKILLS, diagnosticReport } from '../core/b2-diagnostic.js';
import { skillTrainingSummary } from '../core/b2-training.js';
import { b2DailyFocus, examReadiness } from '../core/b2-readiness.js';
import { B2_OBJECTIVE_PARTS } from '../data/b2-multilevel.js';
import { B2_WRITING_PARTS } from '../data/b2-writing.js';
import { esc, progressBar } from '../core/ui.js';

const SKILL_META = {
  Reading: { icon: 'R', text: '5 частей, 35 заданий, 60 минут.', route: 'b2-reading' },
  Listening: { icon: 'L', text: '6 частей, 35 заданий, два прослушивания.', route: 'b2-listening' },
  Writing: { icon: 'W', text: 'Два email и текст для онлайн-издания.', route: 'b2-writing' },
  Speaking: { icon: 'S', text: 'Запись ответа, аргументы, пример и вывод.', route: 'b2-speaking' },
};

function context() {
  const state = loadState();
  const sprint = b2Sprint();
  const mock = state.b2Mock || {};
  const completed = mock.completed || {};
  const scores = mock.scores || {};
  const done = B2_SKILLS.filter((skill) => completed[skill]).length;
  const report = done === B2_SKILLS.length ? diagnosticReport(scores) : null;
  const readiness = examReadiness(state);
  const dailyFocus = b2DailyFocus(state);
  const examDate = new Date(`${B2_EXAM_DATE}T00:00:00`).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
  return { state, sprint, completed, scores, done, report, readiness, dailyFocus, examDate };
}

function hero(sprint, examDate, title, text) {
  return `<header class="exam-hero"><div><div class="dashboard-kicker">ЭКЗАМЕНАЦИОННАЯ ПРОГРАММА</div><h1>${esc(title)}</h1><p>${esc(text)}</p></div><div class="exam-countdown"><strong>${sprint.examPassed ? '—' : sprint.daysLeft}</strong><span>${sprint.examPassed ? 'цикл завершён' : `дней до ${examDate}`}</span></div></header>`;
}

function baseBridge() {
  return `<section class="exam-base-bridge mt-6"><div><div class="dashboard-kicker">НУЖНО УКРЕПИТЬ ЯЗЫК?</div><h2>Перейти в программу «База»</h2><p>Уроки, словарь и обычная практика находятся отдельно и не засчитываются как экзаменационные задания.</p></div><button class="btn" data-program="foundation">Открыть базу</button></section>`;
}

function diagnosticCard({ done, report }) {
  return `<section class="exam-diagnostic card"><div><div class="dashboard-kicker">ДИАГНОСТИКА</div><h2>${report ? esc(report.readiness.title) : 'Определи стартовый уровень навыков'}</h2><p class="faint">${report ? `Результат ${report.overall}%. Главный фокус: ${esc(report.weakest)}.` : `${done} из 4 частей завершено. Это короткая проверка перед основными тренировками.`}</p></div><div class="exam-diagnostic__progress"><strong>${report ? `${report.overall}%` : `${done}/4`}</strong>${progressBar(report ? report.overall : done * 25, !!report && report.overall >= 70)}</div><button class="btn btn-primary" data-nav="b2-mock">${done ? 'Продолжить' : 'Начать диагностику'}</button></section>`;
}

function fullMockCard(readiness) {
  const completed = Object.values(readiness.skills).reduce((sum, item) => sum + item.completed, 0);
  return `<section class="exam-full-mock card"><div><div class="dashboard-kicker">ПОЛНАЯ РЕПЕТИЦИЯ</div><h2>Письменный блок и Speaking</h2><p class="faint">Reading, Listening и Writing идут под лимитом 2:45. Speaking записывается отдельно.</p></div><div class="exam-diagnostic__progress"><strong>${readiness.ready ? `${readiness.overall}%` : `${completed}/14`}</strong>${progressBar(readiness.ready ? readiness.overall : (completed / 14) * 100, readiness.ready)}</div><button class="btn btn-primary" data-nav="b2-full-mock">Открыть пробник</button></section>`;
}

function skillCard(state, completed, scores, skill) {
  const item = SKILL_META[skill];
  const parts = B2_OBJECTIVE_PARTS[skill] || (skill === 'Writing' ? B2_WRITING_PARTS : null);
  const training = parts ? skillTrainingSummary(state, skill, parts) : null;
  const speaking = state.b2Training?.Speaking?.recording;
  const score = training?.completed
    ? `${training.percent}%`
    : skill === 'Speaking' && speaking
      ? `${speaking.lastScore ?? speaking.score ?? 0}%`
      : completed[skill]
        ? `${scores[skill] ?? 0}%`
        : '→';
  const detail = training?.completed ? `${training.completed}/${training.total} частей` : skill === 'Speaking' && speaking ? 'запись сохранена' : '';
  return `<button class="exam-skill" data-nav="${item.route}"><span>${item.icon}</span><div><h3>${skill}</h3><p>${item.text}</p>${detail ? `<small>${detail}</small>` : ''}</div><strong>${score}</strong></button>`;
}

export function renderExam() {
  const data = context();
  const { sprint, readiness, dailyFocus, examDate } = data;
  const next = readiness.focus;
  return `${hero(sprint, examDate, 'Сегодня в подготовке B2', 'Только экзаменационный формат, время и четыре навыка. Уроки базы сюда не смешиваются.')}
    <section class="exam-today exam-today--adaptive"><div class="exam-today__date">СЕГОДНЯ · ${esc(dailyFocus.skill)}</div><div><span>${dailyFocus.kind === 'repair' ? 'СНАЧАЛА ИСПРАВЬ ПРОБЕЛ' : dailyFocus.kind === 'coverage' ? 'ЗАКРОЙ ФОРМАТ' : 'УКРЕПИ РЕЗУЛЬТАТ'}</span><h2>${esc(dailyFocus.title)}</h2><p>${esc(dailyFocus.text)}</p></div><button class="btn btn-primary" data-nav="${esc(dailyFocus.route)}">${esc(dailyFocus.action)}</button></section>
    <section class="exam-focus card"><div><div class="dashboard-kicker">АДАПТИВНЫЙ СЛЕДУЮЩИЙ ШАГ</div><h2>${readiness.ready ? `Укрепить ${esc(next.skill)}` : `Продолжить ${esc(next.skill)}`}</h2><p class="faint">${readiness.ready ? `Сейчас это самый слабый навык: ${next.score}%.` : `Завершено ${next.completed} из ${next.total} обязательных частей.`}</p></div><button class="btn btn-primary" data-nav="${next.route}">Начать тренировку</button></section>
    <div class="exam-home-links mt-4"><button class="card" data-nav="exam-skills"><span>01</span><strong>Навыки</strong><small>Reading, Listening, Writing, Speaking</small></button><button class="card" data-nav="exam-mocks"><span>02</span><strong>Пробники</strong><small>Диагностика и полная репетиция</small></button><button class="card" data-nav="exam-readiness"><span>03</span><strong>Готовность</strong><small>Результат и слабейший навык</small></button></div>
    ${baseBridge()}`;
}

export function renderExamSkills() {
  const { state, sprint, completed, scores, examDate } = context();
  return `${hero(sprint, examDate, 'Экзаменационные навыки', 'Тренируй каждый навык в полном формате. Только эти результаты формируют карту готовности.')}
    <div class="dashboard-section-head"><div><div class="dashboard-kicker">ЧЕТЫРЕ НАВЫКА</div><h2>Тренировать по отдельности</h2></div><span>последняя попытка</span></div>
    <div class="exam-skills">${B2_SKILLS.map((skill) => skillCard(state, completed, scores, skill)).join('')}</div>
    <section class="exam-mode-note mt-6"><strong>Здесь учитываются только экзаменационные тренировки.</strong><span>Обычное чтение, письмо и аудирование из программы «База» не закрывают эти части.</span></section>
    ${baseBridge()}`;
}

export function renderExamMocks() {
  const data = context();
  return `${hero(data.sprint, data.examDate, 'Пробники B2', 'Диагностика определяет стартовый фокус. Полная репетиция проверяет темп и устойчивость под временем.')}${diagnosticCard(data)}${fullMockCard(data.readiness)}<p class="faint mt-4">Диагностика короче полного формата. Для оценки готовности используй полную репетицию.</p>`;
}

function weakAttempts(state) {
  const items = [];
  for (const skill of B2_SKILLS) {
    const parts = B2_OBJECTIVE_PARTS[skill] || (skill === 'Writing' ? B2_WRITING_PARTS : [{ id: 'recording', title: 'Запись ответа' }]);
    const stored = state.b2Training?.[skill] || {};
    for (const part of parts) {
      const result = stored[part.id];
      if (!result) continue;
      const score = result.lastScore ?? result.score ?? 0;
      if (score < 70) items.push({ skill, title: part.title || 'Запись ответа', score, route: SKILL_META[skill].route, at: result.at });
    }
  }
  return items.sort((a, b) => a.score - b.score || (b.at || '').localeCompare(a.at || ''));
}

export function renderExamErrors() {
  const { state, sprint, examDate } = context();
  const weak = weakAttempts(state);
  return `${hero(sprint, examDate, 'Экзаменационные ошибки', 'Здесь собраны только слабые части экзаменационных тренировок. Ошибки словаря и уроков остаются в программе «База».')}
    ${weak.length ? `<div class="exam-error-list">${weak.map((item) => `<article class="card"><div><span>${esc(item.skill)}</span><h2>${esc(item.title)}</h2><p>Последний результат ниже порога 70%.</p></div><strong>${item.score}%</strong><button class="btn btn-primary" data-nav="${item.route}">Повторить часть</button></article>`).join('')}</div>` : `<section class="empty card"><div class="empty-icon">✓</div><h2>Слабые части пока не найдены</h2><p>Пройди диагностику или одну из экзаменационных тренировок — результаты ниже 70% появятся здесь.</p><button class="btn btn-primary mt-4" data-nav="exam-mocks">Открыть пробники</button></section>`}`;
}

export function renderExamReadiness() {
  const { readiness, sprint, examDate } = context();
  const complete = Object.values(readiness.skills).reduce((sum, item) => sum + item.completed, 0);
  return `${hero(sprint, examDate, 'Готовность к B2', 'Карта показывает покрытие формата и последний результат по каждому навыку, отдельно от общего учебного прогресса.')}
    <section class="readiness-summary card"><div><div class="dashboard-kicker">ПОКРЫТИЕ ФОРМАТА</div><h2>${readiness.ready ? `${readiness.overall}% · все части пройдены` : `${complete} из 14 частей завершено`}</h2><p>${readiness.ready ? `Текущий главный фокус — ${esc(readiness.focus.skill)}.` : `Следующий обязательный раздел — ${esc(readiness.focus.skill)}.`}</p></div><button class="btn btn-primary" data-nav="${readiness.focus.route}">${readiness.ready ? 'Укрепить слабый навык' : 'Продолжить подготовку'}</button></section>
    <div class="exam-readiness-grid mt-4">${Object.entries(readiness.skills).map(([skill, item]) => `<article class="card"><div class="row-between"><span class="level-code">${esc(skill)}</span><strong>${item.score}%</strong></div><h2>${item.completed}/${item.total} частей</h2>${progressBar((item.completed / item.total) * 100, item.completed === item.total)}<button class="btn mt-4" data-nav="${item.route}">Открыть ${esc(skill)}</button></article>`).join('')}</div>
    <p class="faint mt-4">Проценты являются тренировочной самооценкой и не заменяют официальный результат экзамена.</p>`;
}
