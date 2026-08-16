import { listeningPhrases } from '../data/curriculum.js';
import { loadState, update, addXp, touchStudyDay } from '../core/storage.js';
import { diffWords, accuracy, isPerfect, WORD } from '../core/diff.js';
import { speak, speakSlow, isSupported } from '../core/speech.js';
import { esc, shuffle, plural } from '../core/ui.js';

/**
 * Аудирование через диктант.
 *
 * Упражнение на выбор из вариантов проверяет узнавание слова, но не учит
 * разбирать связную речь: варианты подсказывают ответ. Диктант такой
 * подсказки не даёт — приходится расслышать каждое слово, включая
 * служебные, которые в беглой речи и проглатываются.
 */
let s = null;

export function startListening() {
  const state = loadState();
  s = {
    queue: shuffle(listeningPhrases(state.lessons)),
    typed: '',
    checked: false,
    steps: null,
    played: 0,
    done: 0,
    correct: 0,
  };
}


export function exitListening() {
  s = null;
}

function current() {
  return s && s.queue.length ? s.queue[0] : null;
}

/** Проигрываем сразу при показе фразы — так упражнение начинается со звука. */
export function playCurrent(slow = false) {
  const phrase = current();
  if (!phrase) return false;
  s.played += 1;
  if (slow) speakSlow(phrase.en);
  else speak(phrase.en);
  return true;
}

function renderDiff() {
  const parts = s.steps
    .map((step) => {
      if (step.type === WORD.OK) {
        return `<span style="color:var(--green)">${esc(step.expected)}</span>`;
      }
      if (step.type === WORD.MISSING) {
        return `<span style="color:var(--red);text-decoration:underline">${esc(step.expected)}</span>`;
      }
      if (step.type === WORD.WRONG) {
        return `<span style="color:var(--amber)">${esc(step.expected)}</span><span class="faint"> (ты: ${esc(step.actual)})</span>`;
      }
      return `<span class="faint" style="text-decoration:line-through">${esc(step.actual)}</span>`;
    })
    .join(' ');

  const missed = s.steps.filter((x) => x.type === WORD.MISSING).map((x) => x.expected);
  const percent = Math.round(accuracy(s.steps) * 100);
  const perfect = isPerfect(s.steps);

  return `
    <div class="feedback ${perfect ? 'ok' : 'no'}">
      <strong>${perfect ? 'Всё верно 🎉' : `Расслышано ${percent}%`}</strong>
      <div style="font-size:17px;margin-top:10px;line-height:1.8">${parts}</div>
      ${
        missed.length
          ? `<div class="faint" style="margin-top:10px">
              Потеряно: ${missed.map((w) => `<strong>${esc(w)}</strong>`).join(', ')}.
              Чаще всего проглатываются именно короткие служебные слова — слушай ещё раз, следя за ними.
            </div>`
          : ''
      }
    </div>`;
}

export function renderListening() {
  if (!isSupported()) {
    return `
      <h1>Аудирование</h1>
      <div class="callout warn mt-4">
        <span class="callout-label">Недоступно</span>
        В этом браузере нет синтеза речи, а без него диктант невозможен.
        Открой портал в Chrome или Edge.
      </div>
      <button class="btn btn-primary mt-4" data-nav="dashboard">На главную</button>`;
  }

  if (!s) startListening();

  if (!s.queue.length) {
    return `
      <div class="empty">
        <div class="empty-icon">📘</div>
        <h1>${s.done ? 'Фразы закончились' : 'Сначала урок'}</h1>
        <p class="subtitle">
          ${
            s.done
              ? `Разобрано ${plural(s.done, 'фраза', 'фразы', 'фраз')}, из них верно ${s.correct}. Пройди новые уроки — добавятся новые фразы.`
              : 'Диктант собирается из диалогов и примеров пройденных уроков.'
          }
        </p>
        <button class="btn btn-primary btn-lg" data-nav="roadmap">К урокам</button>
      </div>`;
  }

  const phrase = current();

  return `
    <div class="row-between mb-4">
      <button class="btn btn-ghost" data-nav="dashboard">← Выйти</button>
      <span class="faint">Осталось: ${s.queue.length}</span>
    </div>

    <h1>Диктант</h1>
    <p class="subtitle">Прослушай и запиши, что услышал. Регистр и знаки препинания не важны.</p>

    <div class="flashcard" style="padding:32px">
      <div class="row" style="justify-content:center">
        <button class="btn btn-lg" data-listen-play>🔊 Прослушать</button>
        <button class="btn btn-ghost" data-listen-slow>🐢 Медленно</button>
      </div>
      <div class="faint mt-4">
        Прослушано раз: ${s.played}${s.played > 3 ? ' — попробуй записать хотя бы часть' : ''}
      </div>
      ${
        s.checked
          ? `<div class="flash-example" style="margin-top:20px">${esc(phrase.en)}</div>
             <div class="flash-example-ru">${esc(phrase.ru)}</div>
             <div class="faint" style="margin-top:6px">из урока «${esc(phrase.source)}»</div>`
          : ''
      }
    </div>

    <input class="text-input" data-listen-input placeholder="Запиши услышанное…"
           value="${esc(s.typed)}" ${s.checked ? 'disabled' : ''} autocomplete="off" autocapitalize="off" />

    ${s.checked ? renderDiff() : ''}

    <div class="row mt-4">
      ${
        s.checked
          ? `<button class="btn btn-primary btn-lg" data-listen-next>Дальше →</button>
             <button class="btn" data-listen-replay>🔊 Ещё раз</button>`
          : `<button class="btn btn-primary btn-lg" data-listen-check>Проверить</button>`
      }
    </div>
  `;
}

/* ---------- Действия ---------- */

export function syncTyped(value) {
  if (s) s.typed = value;
}

export function handleCheck() {
  if (!s || s.checked) return false;
  const phrase = current();
  if (!phrase) return false;

  s.steps = diffWords(phrase.en, s.typed);
  s.checked = true;

  const perfect = isPerfect(s.steps);
  if (perfect) s.correct += 1;

  update((st) => {
    st.listening = st.listening || { attempts: 0, perfect: 0 };
    st.listening.attempts += 1;
    if (perfect) st.listening.perfect += 1;
  });

  addXp(perfect ? 8 : Math.round(accuracy(s.steps) * 5));
  touchStudyDay();

  // Услышать фразу сразу после разбора полезнее всего: теперь видно текст
  speak(phrase.en);
  return true;
}

export function handleNext() {
  if (!s) return false;
  s.queue.shift();
  s.done += 1;
  s.typed = '';
  s.checked = false;
  s.steps = null;
  s.played = 0;
  return true;
}
