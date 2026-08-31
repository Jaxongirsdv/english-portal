import { addXp, loadState, touchStudyDay, update } from '../core/storage.js';
import { acceptsAnswer, skillTrainingSummary, trainingResult } from '../core/b2-training.js';
import { speak } from '../core/speech.js';
import { B2_OBJECTIVE_PARTS, MULTILEVEL_FORMAT, b2Part } from '../data/b2-multilevel.js';
import { esc, progressBar } from '../core/ui.js';

let session = null;
let timerId = null;
let audioPlayer = null;

function stopAudio() {
  if (audioPlayer) {
    audioPlayer.pause();
    audioPlayer.currentTime = 0;
  }
  audioPlayer = null;
}

function clearTimer() {
  if (timerId) clearInterval(timerId);
  timerId = null;
}

function secondsLeft() {
  return Math.max(0, Math.ceil(((session?.endsAt || 0) - Date.now()) / 1000));
}

function clock(seconds) {
  const minutes = Math.floor(seconds / 60);
  return `${String(minutes).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
}

function currentQuestion() {
  return session?.part?.questions?.[session.index] || null;
}

function saveResult() {
  const result = trainingResult(session.answers, session.part.questions.length);
  const at = new Date().toISOString();
  update((state) => {
    state.b2Training = state.b2Training || { Reading: {}, Listening: {} };
    state.b2Training[session.skill] = state.b2Training[session.skill] || {};
    const previous = state.b2Training[session.skill][session.part.id] || {};
    state.b2Training[session.skill][session.part.id] = {
      score: Math.max(previous.score || 0, result.percent),
      lastScore: result.percent,
      at,
    };
  });
  addXp(result.right * 4);
  touchStudyDay();
  session.result = result;
  session.phase = 'done';
  clearTimer();
  stopAudio();
}

export function startB2Objective(skill) {
  if (!B2_OBJECTIVE_PARTS[skill]) return false;
  if (!session || session.skill !== skill) session = { skill, phase: 'list' };
  return true;
}

export function exitB2Objective(skill) {
  if (!skill || session?.skill === skill) {
    clearTimer();
    stopAudio();
    session = null;
  }
}

export function startB2ObjectivePart(skill, id, onFinish) {
  const part = b2Part(skill, id);
  if (!part) return false;
  clearTimer();
  stopAudio();
  session = {
    skill,
    part,
    phase: 'task',
    index: 0,
    answers: [],
    feedback: null,
    plays: {},
    endsAt: Date.now() + part.minutes * 60 * 1000,
  };
  timerId = setInterval(() => {
    const label = document.querySelector('[data-b2-objective-timer]');
    if (label) label.textContent = clock(secondsLeft());
    if (!secondsLeft() && session?.phase === 'task') {
      saveResult();
      onFinish?.();
    }
  }, 1000);
  return true;
}

export function backB2Objective() {
  if (!session) return false;
  const skill = session.skill;
  clearTimer();
  stopAudio();
  session = { skill, phase: 'list' };
  return true;
}

export function playB2ObjectiveAudio() {
  if (session?.skill !== 'Listening' || session.phase !== 'task') return false;
  const question = currentQuestion();
  const key = session.part.audio ? session.part.id : question?.id;
  const audio = session.part.audio || question?.audio;
  const audioSrc = session.part.audioSrc || question?.audioSrc;
  if (!key || !audio || (session.plays[key] || 0) >= MULTILEVEL_FORMAT.Listening.plays) return false;
  session.plays[key] = (session.plays[key] || 0) + 1;
  stopAudio();
  if (audioSrc && typeof Audio !== 'undefined') {
    audioPlayer = new Audio(new URL(audioSrc, document.baseURI).href);
    audioPlayer.play().catch(() => speak(audio, { rate: 0.92 }));
  } else {
    speak(audio, { rate: 0.92 });
  }
  const label = document.querySelector('.b2-audio-control span');
  const button = document.querySelector('[data-b2-objective-listen]');
  if (label) label.textContent = `${session.plays[key]}/2 прослушиваний`;
  if (button) button.disabled = session.plays[key] >= MULTILEVEL_FORMAT.Listening.plays;
  return true;
}

export function answerB2Objective(value) {
  if (!session || session.phase !== 'task' || session.feedback) return false;
  const question = currentQuestion();
  const correct = acceptsAnswer(question, value);
  session.answers.push(correct);
  session.feedback = { value: String(value || '').trim(), correct };
  return true;
}

export function nextB2ObjectiveQuestion() {
  if (!session?.feedback || session.phase !== 'task') return false;
  if (session.index + 1 >= session.part.questions.length) {
    saveResult();
    return true;
  }
  stopAudio();
  session.index += 1;
  session.feedback = null;
  return true;
}

function renderList(skill) {
  const parts = B2_OBJECTIVE_PARTS[skill];
  const format = MULTILEVEL_FORMAT[skill];
  const state = loadState();
  const results = state.b2Training?.[skill] || {};
  const summary = skillTrainingSummary(state, skill, parts);
  const title = skill === 'Reading' ? 'Reading B2' : 'Listening B2';
  const description = skill === 'Reading'
    ? 'Читай по формату национального Multilevel: связность, главная мысль, детали и скрытый смысл.'
    : 'Слушай дважды, сначала фиксируя смысл, затем точные детали, слова и числа.';

  return `<header class="b2-trainer-hero">
    <div><div class="dashboard-kicker">UZBEKISTAN MULTILEVEL</div><h1>${title}</h1><p>${description}</p></div>
    <div class="b2-trainer-score"><strong>${summary.completed}/${summary.total}</strong><span>частей пройдено</span></div>
  </header>
  <section class="b2-format-note"><strong>Полный формат: ${format.parts} частей · ${format.questions} заданий · ${format.minutes} минут</strong><span>${skill === 'Listening' ? 'Все части и 35 заданий доступны с готовыми офлайн-аудиофайлами. Голоса синтетические.' : 'Все 5 частей и 35 заданий доступны. Балл является оценочным.'}</span></section>
  <div class="b2-part-grid">
    ${parts.map((part) => {
      const result = results[part.id];
      return `<article class="b2-part-card card"><div class="row-between"><span class="level-code">PART ${part.number}</span>${result ? `<span class="word-status mastered">лучший ${result.score}%</span>` : ''}</div><h2>${esc(part.title)}</h2><p>${esc(part.officialNote)}</p><div class="b2-part-meta"><span>${esc(part.format)}</span><span>${part.minutes} минут</span></div><button class="btn btn-primary" data-b2-objective-start="${esc(part.id)}">${result ? 'Повторить часть' : 'Начать часть'}</button></article>`;
    }).join('')}
  </div>
  <button class="btn btn-ghost mt-6" data-nav="exam-skills">← К экзаменационным навыкам</button>`;
}

function renderPassage(part) {
  if (!part.passage?.length) return '';
  return `<article class="b2-passage">${part.passage.map((paragraph) => `<p>${esc(paragraph)}</p>`).join('')}</article>`;
}

function renderAudioControl(question) {
  if (session.skill !== 'Listening') return '';
  const key = session.part.audio ? session.part.id : question.id;
  const plays = session.plays[key] || 0;
  return `<div class="b2-audio-control"><button class="btn btn-primary" data-b2-objective-listen ${plays >= 2 ? 'disabled' : ''}>▶ Прослушать</button><span>${plays}/2 прослушиваний</span></div>`;
}

function renderAnswer(question) {
  if (question.type === 'input') {
    return `<div class="b2-gap-answer"><input type="text" data-b2-objective-input autocomplete="off" placeholder="Одно слово или число" ${session.feedback ? 'disabled' : ''}><button class="btn btn-primary" data-b2-objective-submit ${session.feedback ? 'disabled' : ''}>Проверить</button></div>`;
  }
  return `<div class="option-list">${question.options.map((option) => {
    const state = !session.feedback ? '' : option === question.answer ? ' correct' : option === session.feedback.value ? ' wrong' : '';
    return `<button class="option${state}" data-b2-objective-answer="${esc(option)}" ${session.feedback ? 'disabled' : ''}>${esc(option)}</button>`;
  }).join('')}</div>`;
}

function renderTask() {
  const question = currentQuestion();
  const answered = session.answers.length;
  const expected = question.answers?.join(' / ') || question.answer;
  const transcript = session.skill === 'Listening' && !session.part.audio && session.feedback
    ? `<div class="b2-transcript"><span>Ты услышал</span>${esc(question.audio)}</div>`
    : '';
  return `<div class="b2-task-top"><button class="btn btn-ghost" data-b2-objective-back>← К частям</button><div class="b2-task-timer"><span>ОСТАЛОСЬ</span><strong data-b2-objective-timer>${clock(secondsLeft())}</strong></div></div>
    <div class="b2-task-progress"><div><span>Part ${session.part.number}</span><strong>${esc(session.part.title)}</strong></div><span>Задание ${session.index + 1} из ${session.part.questions.length}</span></div>
    ${progressBar((answered / session.part.questions.length) * 100)}
    <div class="b2-task-layout mt-4">
      ${renderPassage(session.part)}
      <section class="exercise b2-question">
        ${renderAudioControl(question)}
        <div class="dashboard-kicker">ЗАДАНИЕ ${session.index + 1}</div>
        <h2>${esc(question.prompt)}</h2>
        ${renderAnswer(question)}
        ${session.feedback ? `${transcript}<div class="feedback ${session.feedback.correct ? 'ok' : 'no'}"><strong>${session.feedback.correct ? 'Верно.' : `Правильный ответ: ${esc(expected)}`}</strong><p>${esc(question.explanation)}</p></div><button class="btn btn-primary btn-lg" data-b2-objective-next>${session.index + 1 < session.part.questions.length ? 'Следующее задание →' : 'Получить результат'}</button>` : ''}
      </section>
    </div>`;
}

function renderDone() {
  const result = session.result;
  const transcript = session.skill === 'Listening' && session.part.audio
    ? `<details class="b2-full-transcript"><summary>Открыть текст записи для разбора</summary><p>${esc(session.part.audio)}</p></details>`
    : '';
  return `<section class="b2-result card"><div class="dashboard-kicker">PART ${session.part.number} ЗАВЕРШЁН</div><div class="b2-result-score"><strong>${result.score75}</strong><span>из 75 · оценочный балл</span></div><h1>${result.right} из ${result.total} ответов верно</h1><p>${result.percent >= 70 ? 'Формат понятен. Повтори часть позже, чтобы закрепить результат.' : 'Разбери объяснения и повтори часть: сейчас важнее понять тип ловушки, чем запомнить ответ.'}</p>${transcript}<div class="row"><button class="btn btn-primary" data-b2-objective-retry>Повторить часть</button><button class="btn" data-b2-objective-back>К списку частей</button><button class="btn btn-ghost" data-nav="exam-skills">Все навыки</button></div><p class="faint mt-4">Официальный результат рассчитывается агентством по полной работе. Этот пересчёт нужен только для отслеживания тренировочной динамики.</p></section>`;
}

export function renderB2Objective(skill) {
  if (!session || session.skill !== skill) startB2Objective(skill);
  if (session.phase === 'task') return renderTask();
  if (session.phase === 'done') return renderDone();
  return renderList(skill);
}

export function retryB2ObjectivePart(onFinish) {
  if (!session?.part) return false;
  return startB2ObjectivePart(session.skill, session.part.id, onFinish);
}
