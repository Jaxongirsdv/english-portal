import { addXp, loadState, touchStudyDay, update } from '../core/storage.js';
import { B2_WRITING_PARTS, B2_WRITING_RUBRIC } from '../data/b2-writing.js';
import { esc, progressBar } from '../core/ui.js';

let session = null;
let timer = null;

function words(value) {
  return String(value || '').trim().match(/\S+/g)?.length || 0;
}

function part() {
  return B2_WRITING_PARTS[session.index];
}

function stopTimer() {
  if (timer) clearInterval(timer);
  timer = null;
}

function remaining() {
  return Math.max(0, Math.ceil(((session?.endsAt || 0) - Date.now()) / 1000));
}

function clock(value) {
  return `${String(Math.floor(value / 60)).padStart(2, '0')}:${String(value % 60).padStart(2, '0')}`;
}

export function startB2Writing() {
  session = session || { index: 0, texts: {}, rubric: [], result: null, endsAt: null };
}

export function exitB2Writing() {
  stopTimer();
  session = null;
}

export function selectB2WritingPart(index) {
  const value = Number(index);
  if (!Number.isInteger(value) || !B2_WRITING_PARTS[value]) return false;
  stopTimer();
  session = { index: value, texts: {}, rubric: [], result: null, endsAt: null };
  return true;
}

export function startB2WritingTimer() {
  if (!session || session.endsAt) return false;
  session.endsAt = Date.now() + part().minutes * 60 * 1000;
  timer = setInterval(() => {
    const label = document.querySelector('[data-b2-writing-timer]');
    if (label) label.textContent = clock(remaining());
    if (!remaining()) stopTimer();
  }, 1000);
  return true;
}

export function syncB2Writing(field, value) {
  if (!session || !part().fields.some((item) => item.id === field)) return false;
  session.texts[field] = value;
  return true;
}

export function refreshB2WritingCounters() {
  for (const field of part().fields) {
    const count = words(session.texts[field.id]);
    const label = document.querySelector(`[data-b2-writing-count="${field.id}"]`);
    if (label) {
      label.textContent = `${count} / ${field.minWords}-${field.maxWords}`;
      label.classList.toggle('mastered', count >= field.minWords && count <= field.maxWords);
    }
  }
}

export function toggleB2WritingCriterion(index) {
  const value = Number(index);
  if (!B2_WRITING_RUBRIC[value] || session?.result) return false;
  const selected = new Set(session.rubric);
  if (selected.has(value)) selected.delete(value);
  else selected.add(value);
  session.rubric = [...selected];
  return true;
}

export function finishB2Writing() {
  if (!session || session.result) return false;
  const fields = part().fields;
  const inRange = fields.filter((field) => {
    const count = words(session.texts[field.id]);
    return count >= field.minWords && count <= field.maxWords;
  }).length;
  const volumeScore = Math.round((inRange / fields.length) * 30);
  const rubricScore = Math.round((session.rubric.length / B2_WRITING_RUBRIC.length) * 70);
  const score = volumeScore + rubricScore;
  session.result = { score, score75: Math.round(score * 0.75), inRange, totalFields: fields.length };
  stopTimer();
  update((state) => {
    state.b2Training = state.b2Training || {};
    state.b2Training.Writing = state.b2Training.Writing || {};
    const previous = state.b2Training.Writing[part().id] || {};
    state.b2Training.Writing[part().id] = { score: Math.max(previous.score || 0, score), lastScore: score, at: new Date().toISOString() };
  });
  addXp(12);
  touchStudyDay();
  return true;
}

export function retryB2Writing() {
  if (!session) return false;
  session.result = null;
  session.rubric = [];
  session.endsAt = null;
  return true;
}

export function renderB2Writing() {
  if (!session) startB2Writing();
  const task = part();
  const state = loadState();
  const saved = state.b2Training?.Writing || {};
  if (session.result) {
    return `<section class="b2-result card"><div class="dashboard-kicker">WRITING PART ${task.number}</div><div class="b2-result-score"><strong>${session.result.score75}</strong><span>из 75 · самооценка</span></div><h1>${session.result.score}% по тренировочной рубрике</h1><p>${session.result.inRange}/${session.result.totalFields} текстов попали в нужный объём. Самооценка помогает увидеть структуру, но не заменяет проверку экзаменатора.</p><div class="row"><button class="btn btn-primary" data-b2-writing-retry>Переписать</button><button class="btn" data-nav="exam-skills">Все навыки</button></div></section>`;
  }
  return `<div class="row-between mb-4"><button class="btn btn-ghost" data-nav="exam-skills">← Все навыки</button><span class="level-code">MULTILEVEL · 60 МИНУТ</span></div>
    <header class="b2-writing-head"><div><div class="dashboard-kicker">НОВЫЙ ФОРМАТ</div><h1>Writing B2</h1><p>Part 1: два email. Part 2: текст для онлайн-издания объёмом 180–200 слов.</p></div><div class="b2-task-timer"><span>ОСТАЛОСЬ</span><strong data-b2-writing-timer>${session.endsAt ? clock(remaining()) : `${task.minutes}:00`}</strong></div></header>
    <div class="b2-writing-tabs">${B2_WRITING_PARTS.map((item, index) => `<button class="${index === session.index ? 'active' : ''}" data-b2-writing-part="${index}">Part ${item.number}${saved[item.id] ? ` · ${saved[item.id].score}%` : ''}</button>`).join('')}</div>
    <section class="card b2-writing-prompt"><span>PART ${task.number} · ${task.minutes} минут</span><h2>${esc(task.title)}</h2><p>${esc(task.prompt)}</p><button class="btn" data-b2-writing-start ${session.endsAt ? 'disabled' : ''}>${session.endsAt ? 'Таймер запущен' : 'Начать таймер'}</button></section>
    <div class="b2-writing-fields">${task.fields.map((field) => `<section class="card"><div class="row-between"><strong>${esc(field.label)}</strong><span class="word-status" data-b2-writing-count="${field.id}">${words(session.texts[field.id])} / ${field.minWords}-${field.maxWords}</span></div><p class="faint">${esc(field.task)}</p><textarea class="essay-input" data-b2-writing-input="${field.id}" placeholder="Write in English...">${esc(session.texts[field.id] || '')}</textarea></section>`).join('')}</div>
    <div class="mock-rubric mt-4"><div><strong>Самопроверка по критериям</strong><span>Отмечай после того, как перечитаешь работу.</span></div>${B2_WRITING_RUBRIC.map((item, index) => `<button class="${session.rubric.includes(index) ? 'is-checked' : ''}" data-b2-writing-criterion="${index}" aria-pressed="${session.rubric.includes(index)}"><span>${session.rubric.includes(index) ? '✓' : ''}</span>${esc(item)}</button>`).join('')}</div>
    ${progressBar((session.rubric.length / B2_WRITING_RUBRIC.length) * 100)}
    <button class="btn btn-primary btn-lg mt-4" data-b2-writing-finish>Завершить и оценить</button>`;
}
