import { B2_SPEAKING_PROMPTS } from '../data/b2-speaking.js';
import { addXp, touchStudyDay, update } from '../core/storage.js';
import { esc } from '../core/ui.js';

let s = null;
let timer = null;
let recorder = null;
let stream = null;
let chunks = [];
const SPEAKING_RUBRIC = [
  'Ясно ответил на вопрос и выразил позицию',
  'Дал минимум два аргумента или детали',
  'Привёл конкретный пример',
  'Говорил связно, без длинных пауз и чтения текста',
];

function stopTimer() {
  if (timer) clearInterval(timer);
  timer = null;
}

function releaseStream() {
  stream?.getTracks().forEach((track) => track.stop());
  stream = null;
}

function revokeAudio() {
  if (s?.audioUrl) URL.revokeObjectURL(s.audioUrl);
  if (s) s.audioUrl = null;
}

export function startB2Speaking() {
  s = s || { index: 0, endsAt: null, remaining: 90, completed: false, recording: false, audioUrl: null, error: null, rubric: [] };
}

export function exitB2Speaking() {
  stopTimer();
  if (recorder?.state === 'recording') recorder.stop();
  recorder = null;
  releaseStream();
  revokeAudio();
  s = null;
}

function prompt() {
  return B2_SPEAKING_PROMPTS[s.index];
}

export async function startRecording(rerender) {
  if (!s || timer || s.recording) return false;
  if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
    s.error = 'Этот браузер не поддерживает запись. Открой портал в современном Chrome или Edge.';
    rerender();
    return false;
  }
  try {
    stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    revokeAudio();
    chunks = [];
    recorder = new MediaRecorder(stream);
    recorder.addEventListener('dataavailable', (event) => {
      if (event.data.size) chunks.push(event.data);
    });
    recorder.addEventListener('stop', () => {
      const blob = new Blob(chunks, { type: recorder.mimeType || 'audio/webm' });
      if (!s) {
        releaseStream();
        return;
      }
      s.audioUrl = URL.createObjectURL(blob);
      s.recording = false;
      releaseStream();
      rerender();
    }, { once: true });
    recorder.start();
    s.error = null;
    s.completed = false;
    s.rubric = [];
    s.recording = true;
    s.remaining = 90;
    s.endsAt = Date.now() + 90000;
    timer = setInterval(() => {
      s.remaining = Math.max(0, Math.ceil((s.endsAt - Date.now()) / 1000));
      const label = document.querySelector('[data-b2-speaking-time]');
      if (label) label.textContent = `ОСТАЛОСЬ ${s.remaining} СЕК.`;
      if (!s.remaining) stopRecording(rerender);
    }, 1000);
    rerender();
    return true;
  } catch (error) {
    releaseStream();
    s.error = error?.name === 'NotAllowedError' ? 'Разреши доступ к микрофону, чтобы записать ответ.' : 'Не удалось начать запись. Проверь микрофон и попробуй ещё раз.';
    rerender();
    return false;
  }
}

export function stopRecording(rerender) {
  if (!s?.recording || recorder?.state !== 'recording') return false;
  stopTimer();
  recorder.stop();
  rerender();
  return true;
}

export function completeAttempt() {
  if (!s?.audioUrl || s.completed) return false;
  stopTimer();
  s.completed = true;
  const score = Math.round((s.rubric.length / SPEAKING_RUBRIC.length) * 100);
  update((state) => {
    state.b2Practice = state.b2Practice || { speakingDone: 0 };
    state.b2Practice.speakingDone += 1;
    state.b2Training = state.b2Training || {};
    state.b2Training.Speaking = state.b2Training.Speaking || {};
    const previous = state.b2Training.Speaking.recording || {};
    state.b2Training.Speaking.recording = {
      score: Math.max(previous.score || 0, score),
      lastScore: score,
      at: new Date().toISOString(),
    };
  });
  addXp(8);
  touchStudyDay();
  return true;
}

export function toggleSpeakingCriterion(index) {
  const value = Number(index);
  if (!s?.audioUrl || s.completed || !SPEAKING_RUBRIC[value]) return false;
  const selected = new Set(s.rubric);
  if (selected.has(value)) selected.delete(value);
  else selected.add(value);
  s.rubric = [...selected];
  return true;
}

export function nextPrompt() {
  if (!s) return false;
  stopTimer();
  if (recorder?.state === 'recording') recorder.stop();
  releaseStream();
  revokeAudio();
  s.index = (s.index + 1) % B2_SPEAKING_PROMPTS.length;
  s.endsAt = null;
  s.remaining = 90;
  s.completed = false;
  s.recording = false;
  s.error = null;
  s.rubric = [];
  return true;
}

export function renderB2Speaking() {
  if (!s) startB2Speaking();
  const task = prompt();
  const running = s.recording;

  return `
    <div class="row-between mb-4">
      <button class="btn btn-ghost" data-nav="exam">← Экзамен B2</button>
      <span class="level-code">MULTILEVEL SPEAKING</span>
    </div>
    <h1>Speaking B2</h1>
    <p class="subtitle">Говори вслух 60-90 секунд. Важна ясная мысль, аргументы и пример, а не идеальный акцент.</p>

    <section class="b2-speaking card">
      <div class="dashboard-kicker">${esc(task.topic)} · <span data-b2-speaking-time>${running ? `ОСТАЛОСЬ ${s.remaining} СЕК.` : '90 СЕКУНД'}</span></div>
      <h2>${esc(task.prompt)}</h2>
      <div class="b2-speaking__grid">
        <div><strong>Структура ответа</strong><ol>${task.structure.map((item) => `<li>${esc(item)}</li>`).join('')}</ol></div>
        <div><strong>Полезные фразы</strong>${task.phrases.map((item) => `<span class="chip">${esc(item)}</span>`).join('')}</div>
      </div>
    </section>

    ${s.audioUrl ? `<section class="speaking-recording card mt-4"><strong>Твоя запись</strong><audio controls src="${esc(s.audioUrl)}"></audio><p class="faint">Прослушай ответ полностью, затем оцени его по критериям.</p></section><div class="mock-rubric mt-4"><div><strong>Самооценка Speaking</strong><span>Отмечай только то, что действительно слышно в записи.</span></div>${SPEAKING_RUBRIC.map((item, index) => `<button class="${s.rubric.includes(index) ? 'is-checked' : ''}" data-b2-speaking-criterion="${index}" aria-pressed="${s.rubric.includes(index)}" ${s.completed ? 'disabled' : ''}><span>${s.rubric.includes(index) ? '✓' : ''}</span>${esc(item)}</button>`).join('')}</div>${!s.completed ? '<button class="btn btn-primary mt-4" data-b2-speaking-save>Сохранить самооценку</button>' : ''}` : ''}
    ${s.completed ? `<div class="feedback ok mt-4"><strong>Попытка сохранена: ${Math.round((s.rubric.length / SPEAKING_RUBRIC.length) * 100)}%.</strong> Повтори ответ и постарайся улучшить слабые критерии.</div>` : ''}
    ${s.error ? `<div class="feedback no mt-4"><strong>${esc(s.error)}</strong></div>` : ''}
    <div class="row mt-4" style="flex-wrap:wrap">
      <button class="btn btn-primary btn-lg" data-b2-speaking-start ${running ? 'disabled' : ''}>${running ? 'Идёт запись…' : s.audioUrl ? 'Записать заново' : 'Начать запись'}</button>
      <button class="btn" data-b2-speaking-complete ${!running ? 'disabled' : ''}>Завершить запись</button>
      <button class="btn btn-ghost" data-b2-speaking-next ${running ? 'disabled' : ''}>Другой вопрос</button>
    </div>
    <p class="faint mt-6">Не читай готовый текст. Говори по опорным пунктам, затем повтори ответ лучше ещё раз.</p>
  `;
}
