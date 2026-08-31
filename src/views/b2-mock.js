import { loadState, update } from '../core/storage.js';
import { getText, plainText } from '../data/reading.js';
import { tasksForLevel } from '../data/writing-tasks.js';
import { B2_SPEAKING_PROMPTS } from '../data/b2-speaking.js';
import { speak } from '../core/speech.js';
import { createQuiz, currentQuestion, currentOptions, answerQuestion, isCorrect, nextQuestion, quizScore } from '../core/quiz.js';
import { esc } from '../core/ui.js';
import { createDiagnosticSnapshot, diagnosticReport, subjectiveScore } from '../core/b2-diagnostic.js';

export const B2_MOCK_PARTS = [
  ['Reading', 'Прочитай B2-текст и ответь на вопросы.', 'reading'],
  ['Listening', 'Прослушай B2-текст и выполни вопросы.', 'listening'],
  ['Writing', 'Напиши работу B2 в заданном объёме.', 'writing'],
  ['Speaking', 'Ответь вслух на вопрос за 90 секунд.', 'b2-speaking'],
];

const OBJECTIVE_TEXTS = { Reading: 'b2-remote', Listening: 'b2-ice' };
const PRACTICE_RUBRICS = {
  Writing: [
    'Я полностью ответил на задание',
    'Текст разделён на логичные абзацы',
    'Есть связки и разнообразная лексика B2',
    'Я проверил времена, артикли и окончания',
  ],
  Speaking: [
    'Я говорил не меньше 60 секунд',
    'В ответе есть ясная основная мысль',
    'Я дал аргумент и конкретный пример',
    'Я использовал связки и закончил выводом',
  ],
};
let session = null;

function ensureMockState(state) {
  state.b2Mock = state.b2Mock || {};
  state.b2Mock.completed = state.b2Mock.completed || {};
  state.b2Mock.scores = state.b2Mock.scores || {};
  state.b2Mock.history = state.b2Mock.history || [];
  state.b2Mock.currentStartedAt = state.b2Mock.currentStartedAt || new Date().toISOString();
  return state.b2Mock;
}

export function startB2Mock() {
  session = session || { part: null, quiz: null, finished: false };
}

export function exitB2Mock() {
  stopTimer();
  session = null;
}

export function startMockPart(part) {
  if (!B2_MOCK_PARTS.some(([title]) => title === part)) return false;
  const text = getText(OBJECTIVE_TEXTS[part]);
  stopTimer();
  update((state) => ensureMockState(state));
  session = text
    ? { part, quiz: createQuiz(text.questions), finished: false }
    : { part, quiz: null, finished: false, text: '', remainingSeconds: part === 'Speaking' ? 90 : null, timerId: null, rubric: [] };
  return true;
}

export function answerMock(value) {
  const text = getText(OBJECTIVE_TEXTS[session?.part]);
  return !!text && answerQuestion(session.quiz, text.questions, value);
}

export function nextMockQuestion() {
  const text = getText(OBJECTIVE_TEXTS[session?.part]);
  if (!text) return false;
  const step = nextQuestion(session.quiz);
  if (step.finished) {
    const score = quizScore(session.quiz);
    update((state) => {
      const mock = ensureMockState(state);
      mock.completed[session.part] = true;
      mock.scores[session.part] = score.percent;
      mock.currentSavedAt = null;
    });
    session.finished = true;
  }
  return step.moved;
}

export function syncMockText(value) {
  if (session?.part !== 'Writing') return false;
  session.text = value;
  return true;
}

export function mockWritingStatus() {
  const task = tasksForLevel('B2')[2];
  const words = session?.text?.trim().match(/\S+/g)?.length || 0;
  const inRange = words >= task.minWords && words <= task.maxWords;
  const text = words < task.minWords
    ? `Нужно ещё ${task.minWords - words} слов`
    : words > task.maxWords
      ? `Превышение на ${words - task.maxWords} слов`
      : 'Объём подходит';
  return { words, inRange, text, minWords: task.minWords, maxWords: task.maxWords };
}

export function startMockSpeakingTimer(onTick) {
  if (session?.part !== 'Speaking' || session.finished || session.timerId || session.remainingSeconds <= 0) return false;
  session.timerId = window.setInterval(() => {
    session.remainingSeconds -= 1;
    if (session.remainingSeconds <= 0) stopTimer();
    onTick();
  }, 1000);
  return true;
}

export function toggleMockCriterion(index) {
  if (!session || !PRACTICE_RUBRICS[session.part] || session.finished) return false;
  const value = Number(index);
  if (!Number.isInteger(value) || !PRACTICE_RUBRICS[session.part][value]) return false;
  const selected = new Set(session.rubric || []);
  if (selected.has(value)) selected.delete(value);
  else selected.add(value);
  session.rubric = [...selected];
  return true;
}

export function finishMockPractice() {
  if (!session || !['Writing', 'Speaking'].includes(session.part)) return false;
  stopTimer();
  const status = session.part === 'Writing' ? mockWritingStatus() : null;
  const score = subjectiveScore(session.part, session.rubric, status?.inRange);
  update((state) => {
    const mock = ensureMockState(state);
    mock.completed[session.part] = true;
    mock.scores[session.part] = score;
    mock.currentSavedAt = null;
  });
  session.finished = true;
  return true;
}

export function mockProgress(state = loadState()) {
  const completed = state.b2Mock?.completed || {};
  const done = B2_MOCK_PARTS.filter(([title]) => completed[title]).length;
  return { completed, done, total: B2_MOCK_PARTS.length };
}

export function finalizeMockAttempt() {
  const state = loadState();
  const progress = mockProgress(state);
  if (progress.done !== progress.total) return false;
  const snapshot = createDiagnosticSnapshot(state.b2Mock);
  update((next) => {
    const mock = ensureMockState(next);
    mock.history = [...mock.history.filter((item) => item.id !== snapshot.id), snapshot].slice(-12);
    mock.currentSavedAt = snapshot.at;
  });
  return true;
}

export function startNewMockAttempt() {
  update((state) => {
    const history = state.b2Mock?.history || [];
    state.b2Mock = {
      completed: {},
      scores: {},
      history,
      currentStartedAt: new Date().toISOString(),
      currentSavedAt: null,
    };
  });
  session = { part: null, quiz: null, finished: false };
  return true;
}

export function toggleMockPart(part) {
  if (!B2_MOCK_PARTS.some(([title]) => title === part)) return false;
  update((state) => {
    const mock = ensureMockState(state);
    mock.completed[part] = !mock.completed[part];
    mock.currentSavedAt = null;
  });
  return true;
}

export function renderB2Mock() {
  if (!session) startB2Mock();
  const state = loadState();
  const { completed, done, total } = mockProgress(state);
  const scores = state.b2Mock?.scores || {};
  const report = done === total ? diagnosticReport(scores) : null;
  const history = state.b2Mock?.history || [];
  if (session.part) return OBJECTIVE_TEXTS[session.part] ? renderObjectivePart() : renderPracticePart();
  return `
    <div class="row-between mb-4"><button class="btn btn-ghost" data-nav="exam-mocks">← Пробники</button><span class="level-code">CEFR B2</span></div>
    <h1>Мини-пробник B2</h1>
    <p class="subtitle">Пройди четыре части по порядку и получи карту готовности по навыкам.</p>
    <div class="card mb-4 b2-mock-summary"><strong>${done} / ${total} частей завершено</strong><span>${done === total ? 'Диагностика завершена. Ниже уже готов персональный разбор.' : 'Объективные части считаются автоматически, Writing и Speaking — по честному чеклисту.'}</span></div>
    <div class="grid grid-2">
      ${B2_MOCK_PARTS.map(([title, text], index) => `<section class="card${completed[title] ? ' b2-mock-done' : ''}"><div class="dashboard-kicker">ЧАСТЬ ${index + 1}</div><h2>${title}</h2><p class="faint">${text}</p><div class="row mt-4"><button class="btn btn-primary" data-b2-mock-start="${title}">${completed[title] ? 'Повторить' : `Начать ${title}`}</button>${completed[title] ? `<span class="word-status mastered">${scores[title] ?? 0}%</span>` : ''}</div></section>`).join('')}
    </div>
    ${report ? renderDiagnosticReport(report, state.b2Mock?.currentSavedAt) : '<div class="callout tip mt-6"><span class="callout-label">Важно</span>Это тренировочная диагностика, а не официальный результат CEFR. Она показывает, какой навык сейчас ограничивает готовность.</div>'}
    ${history.length ? renderMockHistory(history) : ''}`;
}

function renderDiagnosticReport(report, savedAt) {
  return `<section class="diagnostic-report mt-6">
    <div class="diagnostic-report__hero"><div><div class="dashboard-kicker">ИТОГ ДИАГНОСТИКИ</div><h2>${esc(report.readiness.title)}</h2><p>${esc(report.readiness.text)}</p></div><div class="diagnostic-score"><strong>${report.overall}%</strong><span>тренировочный результат</span></div></div>
    <div class="diagnostic-skills">${Object.entries(report.skills).map(([skill, score]) => `<div class="diagnostic-skill${skill === report.weakest ? ' is-weak' : ''}"><div><strong>${esc(skill)}</strong><span>${skill === report.weakest ? 'главный фокус' : score >= 70 ? 'уверенно' : 'нужна практика'}</span></div><b>${score}%</b><div class="progress-track"><span style="width:${score}%"></span></div></div>`).join('')}</div>
    <div class="diagnostic-next"><div><span>Следующий шаг · ${esc(report.recommendation.skill)}</span><strong>${esc(report.recommendation.text)}</strong></div><button class="btn btn-primary" data-nav="${esc(report.recommendation.route)}">Тренировать</button></div>
    <div class="row mt-4"><button class="btn" data-b2-mock-save ${savedAt ? 'disabled' : ''}>${savedAt ? 'Результат сохранён' : 'Сохранить результат'}</button><button class="btn btn-ghost" data-b2-mock-new>Новая диагностика</button></div>
    <p class="faint mt-4">Writing и Speaking рассчитаны по самооценке. Для официального прогноза нужна проверка преподавателем или экзаменатором.</p>
  </section>`;
}

function renderMockHistory(history) {
  return `<section class="mock-history mt-6"><div class="row-between"><div><div class="dashboard-kicker">ДИНАМИКА</div><h2>История попыток</h2></div><span class="faint">Последние ${history.length} из 12</span></div><div class="mock-history__list">${[...history].reverse().map((item) => `<article><time>${esc(new Date(item.at).toLocaleDateString('ru-RU'))}</time><strong>${item.overall}%</strong><span>Фокус: ${esc(item.weakest)}</span></article>`).join('')}</div></section>`;
}

function renderObjectivePart() {
  const text = getText(OBJECTIVE_TEXTS[session.part]);
  if (session.finished) {
    const score = quizScore(session.quiz);
    return `<div class="card"><h1>${esc(session.part)} B2</h1><div class="feedback ok"><strong>${score.right} из ${score.total} верно (${score.percent}%)</strong></div><button class="btn btn-primary mt-4" data-b2-mock-back>К пробнику</button></div>`;
  }
  const question = currentQuestion(session.quiz, text.questions);
  const options = currentOptions(session.quiz);
  const answered = session.quiz.picked !== null;
  return `<div class="row-between mb-4"><button class="btn btn-ghost" data-b2-mock-back>← К пробнику</button><span class="level-code">${esc(session.part)} B2</span></div><div class="card"><h1>${session.part === 'Listening' ? 'Сначала прослушай' : esc(text.title)}</h1>${session.part === 'Listening' ? `<button class="btn" data-b2-mock-listen>🔊 Прослушать текст</button>` : `<p class="dim">${esc(plainText(text))}</p>`}<h3>${esc(question.q)}</h3><div class="option-list">${options.map((option) => `<button class="option${answered ? (option === question.answer ? ' correct' : option === session.quiz.picked ? ' wrong' : '') : ''}" data-b2-mock-answer="${esc(option)}" ${answered ? 'disabled' : ''}>${esc(option)}</button>`).join('')}</div>${answered ? `<button class="btn btn-primary mt-4" data-b2-mock-next>${isCorrect(session.quiz, text.questions) ? 'Верно · дальше' : 'Дальше'}</button>` : ''}</div>`;
}

function renderPracticePart() {
  if (session.finished) {
    const score = loadState().b2Mock?.scores?.[session.part] || 0;
    return `<div class="card"><h1>${esc(session.part)} B2</h1><div class="feedback ok"><strong>Самооценка: ${score}%</strong><p>Результат рассчитан по отмеченным критериям. Он нужен для выбора фокуса, а не заменяет оценку экзаменатора.</p></div><button class="btn btn-primary mt-4" data-b2-mock-back>К пробнику</button></div>`;
  }

  if (session.part === 'Writing') {
    const task = tasksForLevel('B2')[2];
    const status = mockWritingStatus();
    return `<div class="row-between mb-4"><button class="btn btn-ghost" data-b2-mock-back>← К пробнику</button><span class="level-code">Writing B2 · ${task.minutes} мин</span></div><section class="card"><div class="dashboard-kicker">${esc(task.format)}</div><h1>Writing B2</h1><p class="writing-prompt">${esc(task.prompt)}</p><div class="callout tip"><span class="callout-label">Опора</span>${esc(task.hint)}</div><textarea class="essay-input mt-4" data-b2-mock-writing placeholder="Write your answer in English..." spellcheck="true">${esc(session.text)}</textarea><div class="row-between mt-3"><span class="word-status${status.inRange ? ' mastered' : ''}" data-b2-mock-word-count>${status.words} / ${status.minWords}-${status.maxWords} слов</span><span class="faint" data-b2-mock-word-status>${status.text}</span></div>${renderPracticeRubric('Writing')}<div class="row mt-4"><button class="btn btn-primary" data-b2-mock-finish>Завершить и оценить</button></div></section>`;
  }

  const prompt = B2_SPEAKING_PROMPTS[0];
  const minutes = String(Math.floor(session.remainingSeconds / 60)).padStart(2, '0');
  const seconds = String(session.remainingSeconds % 60).padStart(2, '0');
  const timerLabel = `${minutes}:${seconds}`;
  const timerDone = session.remainingSeconds <= 0;
  return `<div class="row-between mb-4"><button class="btn btn-ghost" data-b2-mock-back>← К пробнику</button><span class="level-code">Speaking B2 · 90 сек</span></div><section class="card b2-speaking"><div class="dashboard-kicker">${esc(prompt.topic)}</div><h1>Speaking B2</h1><p class="writing-prompt">${esc(prompt.prompt)}</p><div class="b2-speaking__grid"><div><h3>Структура ответа</h3><ol>${prompt.structure.map((item) => `<li>${esc(item)}</li>`).join('')}</ol></div><div><h3>Полезные фразы</h3><p>${prompt.phrases.map(esc).join('<br>')}</p></div></div><div class="row mt-4"><strong class="level-code">${timerLabel}</strong><button class="btn" data-b2-mock-speaking-start ${session.timerId || timerDone ? 'disabled' : ''}>${timerDone ? 'Время вышло' : 'Начать таймер'}</button></div>${renderPracticeRubric('Speaking')}<button class="btn btn-primary mt-4" data-b2-mock-finish>Завершить и оценить</button></section>`;
}

function renderPracticeRubric(part) {
  const selected = new Set(session.rubric || []);
  return `<div class="mock-rubric mt-4"><div><strong>Честная самооценка</strong><span>Отметь только то, что действительно получилось.</span></div>${PRACTICE_RUBRICS[part].map((criterion, index) => `<button class="${selected.has(index) ? 'is-checked' : ''}" data-b2-mock-criterion="${index}" aria-pressed="${selected.has(index)}"><span>${selected.has(index) ? '✓' : ''}</span>${esc(criterion)}</button>`).join('')}</div>`;
}

function stopTimer() {
  if (session?.timerId) window.clearInterval(session.timerId);
  if (session) session.timerId = null;
}
