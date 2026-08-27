import { B2_SPEAKING_PROMPTS } from '../data/b2-speaking.js';
import { addXp, touchStudyDay, update } from '../core/storage.js';
import { esc } from '../core/ui.js';

let s = null;
let timer = null;

function stopTimer() {
  if (timer) clearInterval(timer);
  timer = null;
}

export function startB2Speaking() {
  s = s || { index: 0, endsAt: null, remaining: 90, completed: false };
}

export function exitB2Speaking() {
  stopTimer();
  s = null;
}

function prompt() {
  return B2_SPEAKING_PROMPTS[s.index];
}

export function startTimer(rerender) {
  if (!s || timer) return false;
  s.completed = false;
  s.remaining = 90;
  s.endsAt = Date.now() + 90000;
  timer = setInterval(() => {
    s.remaining = Math.max(0, Math.ceil((s.endsAt - Date.now()) / 1000));
    if (!s.remaining) stopTimer();
    rerender();
  }, 1000);
  rerender();
  return true;
}

export function completeAttempt() {
  if (!s || s.completed) return false;
  stopTimer();
  s.remaining = 0;
  s.completed = true;
  update((state) => {
    state.b2Practice = state.b2Practice || { speakingDone: 0 };
    state.b2Practice.speakingDone += 1;
  });
  addXp(8);
  touchStudyDay();
  return true;
}

export function nextPrompt() {
  if (!s) return false;
  stopTimer();
  s.index = (s.index + 1) % B2_SPEAKING_PROMPTS.length;
  s.endsAt = null;
  s.remaining = 90;
  s.completed = false;
  return true;
}

export function renderB2Speaking() {
  if (!s) startB2Speaking();
  const task = prompt();
  const running = !!timer;

  return `
    <div class="row-between mb-4">
      <button class="btn btn-ghost" data-nav="review">← К повторению</button>
      <span class="level-code">CEFR B2</span>
    </div>
    <h1>Speaking B2</h1>
    <p class="subtitle">Говори вслух 60-90 секунд. Важна ясная мысль, аргументы и пример, а не идеальный акцент.</p>

    <section class="b2-speaking card">
      <div class="dashboard-kicker">${esc(task.topic)} · ${running ? `ОСТАЛОСЬ ${s.remaining} СЕК.` : '90 СЕКУНД'}</div>
      <h2>${esc(task.prompt)}</h2>
      <div class="b2-speaking__grid">
        <div><strong>Структура ответа</strong><ol>${task.structure.map((item) => `<li>${esc(item)}</li>`).join('')}</ol></div>
        <div><strong>Полезные фразы</strong>${task.phrases.map((item) => `<span class="chip">${esc(item)}</span>`).join('')}</div>
      </div>
    </section>

    ${s.completed ? '<div class="feedback ok mt-4"><strong>Попытка засчитана.</strong> Слушай себя: была ли позиция, две причины и пример?</div>' : ''}
    <div class="row mt-4" style="flex-wrap:wrap">
      <button class="btn btn-primary btn-lg" data-b2-speaking-start ${running ? 'disabled' : ''}>${running ? 'Говори…' : 'Начать 90 секунд'}</button>
      <button class="btn" data-b2-speaking-complete ${!s.endsAt || s.completed ? 'disabled' : ''}>Я ответил</button>
      <button class="btn btn-ghost" data-b2-speaking-next ${running ? 'disabled' : ''}>Другой вопрос</button>
    </div>
    <p class="faint mt-6">Не читай готовый текст. Говори по опорным пунктам, затем повтори ответ лучше ещё раз.</p>
  `;
}
