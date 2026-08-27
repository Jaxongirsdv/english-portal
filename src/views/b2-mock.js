import { loadState, update } from '../core/storage.js';
import { getText, plainText } from '../data/reading.js';
import { tasksForLevel } from '../data/writing-tasks.js';
import { B2_SPEAKING_PROMPTS } from '../data/b2-speaking.js';
import { speak } from '../core/speech.js';
import { createQuiz, currentQuestion, currentOptions, answerQuestion, isCorrect, nextQuestion, quizScore } from '../core/quiz.js';
import { esc } from '../core/ui.js';

export const B2_MOCK_PARTS = [
  ['Reading', 'Прочитай B2-текст и ответь на вопросы.', 'reading'],
  ['Listening', 'Прослушай B2-текст и выполни вопросы.', 'listening'],
  ['Writing', 'Напиши работу B2 в заданном объёме.', 'writing'],
  ['Speaking', 'Ответь вслух на вопрос за 90 секунд.', 'b2-speaking'],
];

const OBJECTIVE_TEXTS = { Reading: 'b2-remote', Listening: 'b2-ice' };
let session = null;

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
  session = text
    ? { part, quiz: createQuiz(text.questions), finished: false }
    : { part, quiz: null, finished: false, text: '', remainingSeconds: part === 'Speaking' ? 90 : null, timerId: null };
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
      state.b2Mock = state.b2Mock || { completed: {}, scores: {} };
      state.b2Mock.completed[session.part] = true;
      state.b2Mock.scores = state.b2Mock.scores || {};
      state.b2Mock.scores[session.part] = score.percent;
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

export function finishMockPractice() {
  if (!session || !['Writing', 'Speaking'].includes(session.part)) return false;
  stopTimer();
  update((state) => {
    state.b2Mock = state.b2Mock || { completed: {}, scores: {} };
    state.b2Mock.completed[session.part] = true;
  });
  session.finished = true;
  return true;
}

export function mockProgress(state = loadState()) {
  const completed = state.b2Mock?.completed || {};
  const done = B2_MOCK_PARTS.filter(([title]) => completed[title]).length;
  return { completed, done, total: B2_MOCK_PARTS.length };
}

export function toggleMockPart(part) {
  if (!B2_MOCK_PARTS.some(([title]) => title === part)) return false;
  update((state) => {
    state.b2Mock = state.b2Mock || { completed: {} };
    state.b2Mock.completed[part] = !state.b2Mock.completed[part];
  });
  return true;
}

export function renderB2Mock() {
  if (!session) startB2Mock();
  const { completed, done, total } = mockProgress();
  if (session.part) return OBJECTIVE_TEXTS[session.part] ? renderObjectivePart() : renderPracticePart();
  return `
    <div class="row-between mb-4"><button class="btn btn-ghost" data-nav="dashboard">← Главная</button><span class="level-code">CEFR B2</span></div>
    <h1>Мини-пробник B2</h1>
    <p class="subtitle">Пройди все четыре части по очереди. После каждого блока возвращайся сюда и отмечай выполнение.</p>
    <div class="card mb-4 b2-mock-summary"><strong>${done} / ${total} частей завершено</strong><span>${done === total ? 'Пробник пройден. Посмотри слабый навык в «Прогрессе».' : 'Отмечай часть только после честной попытки.'}</span></div>
    <div class="grid grid-2">
      ${B2_MOCK_PARTS.map(([title, text], index) => `<section class="card${completed[title] ? ' b2-mock-done' : ''}"><div class="dashboard-kicker">ЧАСТЬ ${index + 1}</div><h2>${title}</h2><p class="faint">${text}</p><div class="row mt-4"><button class="btn btn-primary" data-b2-mock-start="${title}">${completed[title] ? 'Повторить' : `Начать ${title}`}</button>${completed[title] ? `<span class="word-status mastered">${OBJECTIVE_TEXTS[title] ? `${loadState().b2Mock?.scores?.[title] ?? 0}%` : 'Выполнено'}</span>` : ''}</div></section>`).join('')}
    </div>
    <div class="callout tip mt-6"><span class="callout-label">Как оценить себя</span>После пробника открой «Прогресс»: слабый навык станет следующим фокусом на главной.</div>`;
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
    return `<div class="card"><h1>${esc(session.part)} B2</h1><div class="feedback ok"><strong>Часть отмечена как выполненная.</strong><p>Это самопроверка: вернись к ответу и сверь его с опорой перед экзаменом.</p></div><button class="btn btn-primary mt-4" data-b2-mock-back>К пробнику</button></div>`;
  }

  if (session.part === 'Writing') {
    const task = tasksForLevel('B2')[2];
    const status = mockWritingStatus();
    return `<div class="row-between mb-4"><button class="btn btn-ghost" data-b2-mock-back>← К пробнику</button><span class="level-code">Writing B2 · ${task.minutes} мин</span></div><section class="card"><div class="dashboard-kicker">${esc(task.format)}</div><h1>Writing B2</h1><p class="writing-prompt">${esc(task.prompt)}</p><div class="callout tip"><span class="callout-label">Опора</span>${esc(task.hint)}</div><textarea class="essay-input mt-4" data-b2-mock-writing placeholder="Write your answer in English..." spellcheck="true">${esc(session.text)}</textarea><div class="row-between mt-3"><span class="word-status${status.inRange ? ' mastered' : ''}" data-b2-mock-word-count>${status.words} / ${status.minWords}-${status.maxWords} слов</span><span class="faint" data-b2-mock-word-status>${status.text}</span></div><div class="row mt-4"><button class="btn btn-primary" data-b2-mock-finish>Завершить Writing</button></div></section>`;
  }

  const prompt = B2_SPEAKING_PROMPTS[0];
  const minutes = String(Math.floor(session.remainingSeconds / 60)).padStart(2, '0');
  const seconds = String(session.remainingSeconds % 60).padStart(2, '0');
  const timerLabel = `${minutes}:${seconds}`;
  const timerDone = session.remainingSeconds <= 0;
  return `<div class="row-between mb-4"><button class="btn btn-ghost" data-b2-mock-back>← К пробнику</button><span class="level-code">Speaking B2 · 90 сек</span></div><section class="card b2-speaking"><div class="dashboard-kicker">${esc(prompt.topic)}</div><h1>Speaking B2</h1><p class="writing-prompt">${esc(prompt.prompt)}</p><div class="b2-speaking__grid"><div><h3>Структура ответа</h3><ol>${prompt.structure.map((item) => `<li>${esc(item)}</li>`).join('')}</ol></div><div><h3>Полезные фразы</h3><p>${prompt.phrases.map(esc).join('<br>')}</p></div></div><div class="row mt-4"><strong class="level-code">${timerLabel}</strong><button class="btn" data-b2-mock-speaking-start ${session.timerId || timerDone ? 'disabled' : ''}>${timerDone ? 'Время вышло' : 'Начать таймер'}</button><button class="btn btn-primary" data-b2-mock-finish>Завершить Speaking</button></div></section>`;
}

function stopTimer() {
  if (session?.timerId) window.clearInterval(session.timerId);
  if (session) session.timerId = null;
}
