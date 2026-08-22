import { getWord } from '../data/vocab.js';
import { unlockedVocabIds } from '../data/curriculum.js';
import { loadState, update, addXp, touchStudyDay } from '../core/storage.js';
import { isSupported, listen, describeError, cancel } from '../core/recognition.js';
import { scoreAttempt, VERDICT } from '../core/compare.js';
import { esc, speakBtn, shuffle, plural } from '../core/ui.js';
import { speak, speakSlow } from '../core/speech.js';

/**
 * Тренажёр произношения.
 *
 * Слова берутся из пройденных уроков — те же, что и в повторении.
 * Режима два: отдельные слова и целые фразы. Фразы сложнее, но именно
 * на них видно, что произношение отдельных слов ещё не даёт беглости.
 */
let s = null;

export function startPronounce() {
  const state = loadState();
  const unlocked = unlockedVocabIds(state.lessons);
  s = {
    mode: s?.mode || 'words', // words | phrases
    queue: shuffle(unlocked),
    status: 'idle', // idle | listening | result | error
    result: null,
    error: null,
    done: 0,
  };
}


export function exitPronounce() {
  cancel();
  s = null;
}

export function setMode(mode) {
  if (!s) return false;
  s.mode = mode;
  s.status = 'idle';
  s.result = null;
  s.error = null;
  return true;
}

function currentWord() {
  if (!s || !s.queue.length) return null;
  return getWord(s.queue[0]);
}

/** Что именно просим произнести — слово или пример из словаря. */
function targetText(word) {
  return s.mode === 'phrases' ? word.example : word.en;
}

function renderUnsupported() {
  return `
    <h1>Произношение</h1>
    <div class="callout warn mt-4">
      <span class="callout-label">Недоступно</span>
      Этот браузер не умеет распознавать речь. Тренажёр работает в Chrome
      и Edge — открой портал там.
    </div>
    <p class="dim mt-4">
      Остальные разделы портала от этого не зависят: уроки, повторения
      и озвучка работают везде.
    </p>
    <button class="btn btn-primary mt-4" data-nav="dashboard">На главную</button>
  `;
}

function renderEmpty() {
  return `
    <div class="empty">
      <div class="empty-icon">📘</div>
      <h1>Сначала урок</h1>
      <p class="subtitle">
        Тренировать произношение можно на словах из пройденных уроков.
      </p>
      <button class="btn btn-primary btn-lg" data-nav="roadmap">К урокам</button>
    </div>`;
}

function verdictBlock(word) {
  const { verdict, heard, score } = s.result;
  const target = targetText(word);
  const percent = Math.round(score * 100);

  if (verdict === VERDICT.EXACT) {
    return `<div class="feedback ok">
      <strong>Отлично — распознано точно.</strong><br />
      Услышано: «${esc(heard)}»
    </div>`;
  }
  if (verdict === VERDICT.CLOSE) {
    return `<div class="feedback ok" style="border-color:var(--amber);background:var(--amber-soft)">
      <strong>Близко — ${percent}% совпадения.</strong><br />
      Услышано: «${esc(heard)}», ожидалось: «${esc(target)}».<br />
      <span class="faint">Послушай образец и повтори, выделяя ударный слог.</span>
    </div>`;
  }
  return `<div class="feedback no">
    <strong>Услышано другое слово.</strong><br />
    Распознано: «${esc(heard || '—')}», ожидалось: «${esc(target)}».<br />
    <span class="faint">Прослушай медленно и попробуй ещё раз.</span>
  </div>`;
}

export function renderPronounce() {
  if (!isSupported()) return renderUnsupported();
  if (!s) startPronounce();
  if (!s.queue.length) return renderEmpty();

  const word = currentWord();
  if (!word) {
    s.queue.shift();
    return renderPronounce();
  }

  const state = loadState();
  const stat = state.pronunciation[word.id] || { attempts: 0, exact: 0, close: 0 };
  const target = targetText(word);

  return `
    <div class="row-between mb-4">
      <button class="btn btn-ghost" data-nav="dashboard">← Выйти</button>
      <span class="faint">Осталось: ${s.queue.length}</span>
    </div>

    <div class="row mb-4" style="gap:6px">
      <button class="chip" style="${s.mode === 'words' ? 'border-color:var(--accent);color:var(--accent)' : ''}"
              data-pron-mode="words">Слова</button>
      <button class="chip" style="${s.mode === 'phrases' ? 'border-color:var(--accent);color:var(--accent)' : ''}"
              data-pron-mode="phrases">Фразы</button>
    </div>

    <div class="flashcard">
      <div class="flash-word" style="font-size:${s.mode === 'phrases' ? '26px' : '38px'}">
        ${esc(target)}
      </div>
      <div class="flash-ipa">${s.mode === 'words' ? esc(word.ipa) + ' · ' + esc(word.rus) : esc(word.exampleRu)}</div>

      <div class="row mt-4" style="justify-content:center">
        <button class="btn" data-speak="${esc(target)}">🔊 Образец</button>
        <button class="btn btn-ghost" data-speak-slow="${esc(target)}">🐢 Медленно</button>
      </div>

      ${
        stat.attempts
          ? `<div class="faint mt-4">
              Попыток: ${stat.attempts} · точно: ${stat.exact} · близко: ${stat.close}
            </div>`
          : ''
      }
    </div>

    ${
      s.status === 'listening'
        ? `<button class="btn btn-lg" style="width:100%" disabled>🎤 Слушаю… говори</button>`
        : `<button class="btn btn-primary btn-lg" style="width:100%" data-pron-listen>🎤 Сказать</button>`
    }

    ${s.status === 'result' ? verdictBlock(word) : ''}
    ${
      s.status === 'error'
        ? `<div class="feedback no"><strong>${esc(s.error)}</strong></div>`
        : ''
    }

    ${
      s.status === 'result' || s.status === 'error'
        ? `<div class="row mt-4">
            <button class="btn" data-pron-retry>Ещё раз</button>
            <button class="btn btn-primary" data-pron-next>Дальше →</button>
          </div>`
        : ''
    }

    <p class="faint mt-6">
      Тренажёр проверяет, разбирает ли распознаватель твою речь. Это хорошая
      проверка на грубые ошибки, но не оценка акцента: чистое распознавание
      ещё не означает безупречное произношение.
    </p>
  `;
}

/* ---------- Действия ---------- */

export async function handleListen(rerender) {
  if (!s || s.status === 'listening') return;
  const word = currentWord();
  if (!word) return;

  s.status = 'listening';
  s.result = null;
  s.error = null;
  rerender();

  const target = targetText(word);
  try {
    const alternatives = await listen({ lang: 'en-US' });
    const result = scoreAttempt(target, alternatives);
    s.result = result;
    s.status = 'result';

    update((st) => {
      const stat = st.pronunciation[word.id] || { attempts: 0, exact: 0, close: 0 };
      stat.attempts += 1;
      if (result.verdict === VERDICT.EXACT) stat.exact += 1;
      else if (result.verdict === VERDICT.CLOSE) stat.close += 1;
      st.pronunciation[word.id] = stat;
    });

    addXp(result.verdict === VERDICT.EXACT ? 6 : result.verdict === VERDICT.CLOSE ? 3 : 1);
    touchStudyDay();

    // Услышать эталон сразу после своей попытки полезнее всего
    if (result.verdict !== VERDICT.EXACT) speakSlow(target);
  } catch (err) {
    s.error = describeError(err.message);
    s.status = 'error';
  }
  rerender();
}

export function handleRetry() {
  if (!s) return false;
  s.status = 'idle';
  s.result = null;
  s.error = null;
  return true;
}

export function handleNext() {
  if (!s) return false;
  s.queue.shift();
  s.done += 1;
  s.status = 'idle';
  s.result = null;
  s.error = null;
  if (!s.queue.length) startPronounce(); // круг закончился — идём заново
  return true;
}
