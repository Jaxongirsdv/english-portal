import { getWord, allVocabIds } from '../data/vocab.js';
import { unlockedVocabIds } from '../data/curriculum.js';
import {
  dueCardIds,
  newRecognitionIds,
  newProductionIds,
  parseCardId,
  cardId,
  review,
  stats,
  DIRECTION,
} from '../core/srs.js';
import { loadState, addXp, touchStudyDay } from '../core/storage.js';
import { esc, speakBtn, shuffle, plural } from '../core/ui.js';
import { speak } from '../core/speech.js';

/**
 * Тренажёр интервальных повторений.
 *
 * Очередь строится из карточек ДВУХ типов и в таком порядке:
 *   1. всё, что пора повторить (обе стороны, вперемешку);
 *   2. новые обратные карточки — слова, которые уже узнаются;
 *   3. новые слова из пройденных уроков.
 *
 * Порядок не случаен: долги важнее нового материала, а обратная сторона
 * важнее нового слова — иначе словарь растёт вширь, а говорить не выходит.
 */
let q = null;

const NEW_PER_SESSION = 8;

export function startReview() {
  const state = loadState();
  const unlocked = unlockedVocabIds(state.lessons);

  // Долги считаем по всему словарю: если слово когда-то было заведено,
  // его надо повторять, даже если урок потом переписали.
  const due = dueCardIds(allVocabIds());

  const freshProd = shuffle(newProductionIds(unlocked)).map((w) => cardId(w, DIRECTION.PROD));
  const freshRec = shuffle(newRecognitionIds(unlocked)).map((w) => cardId(w, DIRECTION.REC));
  const fresh = [...freshProd, ...freshRec].slice(0, NEW_PER_SESSION);

  q = {
    queue: [...shuffle(due), ...fresh],
    revealed: false,
    done: 0,
    total: due.length + fresh.length,
    lockedOut: unlocked.length === 0,
  };
}


export function exitReview() {
  q = null;
}

function renderEmpty() {
  const s = stats(allVocabIds());
  const done = q.done;

  return `
    <div class="empty">
      <div class="empty-icon">${done > 0 ? '✨' : q.lockedOut ? '📘' : '👌'}</div>
      <h1>${done > 0 ? 'На сегодня всё' : q.lockedOut ? 'Сначала урок' : 'Повторять пока нечего'}</h1>
      <p class="subtitle">
        ${
          done > 0
            ? `Повторено ${plural(done, 'карточка', 'карточки', 'карточек')}. Интервалы расставлены — возвращайся завтра.`
            : q.lockedOut
              ? 'Слова открываются пройденными уроками, чтобы тренажёр не подсовывал лексику без контекста.'
              : 'Все открытые слова повторены. Пройди следующий урок, чтобы добавить новые.'
        }
      </p>
      <div class="grid grid-3" style="max-width:420px;margin:0 auto 24px">
        <div class="stat"><div class="stat-value">${s.learning}</div><div class="stat-label">в изучении</div></div>
        <div class="stat"><div class="stat-value" style="color:var(--green)">${s.mastered}</div><div class="stat-label">выучено</div></div>
        <div class="stat"><div class="stat-value">${s.untouched}</div><div class="stat-label">впереди</div></div>
      </div>
      <button class="btn btn-primary btn-lg" data-nav="roadmap">К урокам</button>
    </div>`;
}

export function renderReview() {
  if (!q) startReview();
  if (q.queue.length === 0) return renderEmpty();

  const { wordId, direction } = parseCardId(q.queue[0]);
  const w = getWord(wordId);
  if (!w) {
    q.queue.shift();
    return renderReview();
  }

  const isProd = direction === DIRECTION.PROD;
  const progress = q.total ? ((q.total - q.queue.length) / q.total) * 100 : 0;

  // Лицевая сторона: узнавание показывает слово, воспроизведение — перевод.
  const front = isProd
    ? `<div class="flash-word" style="color:var(--accent)">${esc(w.ru)}</div>
       <div class="flash-ipa">скажи по-английски</div>`
    : `<div class="flash-word">${esc(w.en)} ${speakBtn(w.en)}</div>
       <div class="flash-ipa">${esc(w.ipa)}</div>`;

  const back = isProd
    ? `<div class="flash-ru" style="color:var(--text)">${esc(w.en)} ${speakBtn(w.en)}</div>
       <div class="faint">${esc(w.ipa)} · ${esc(w.rus)}</div>
       <div class="flash-example">${esc(w.example)} ${speakBtn(w.example)}</div>
       <div class="flash-example-ru">${esc(w.exampleRu)}</div>`
    : `<div class="flash-ru">${esc(w.ru)}</div>
       <div class="faint">${esc(w.rus)}</div>
       <div class="flash-example">${esc(w.example)} ${speakBtn(w.example)}</div>
       <div class="flash-example-ru">${esc(w.exampleRu)}</div>`;

  return `
    <div class="row-between mb-4">
      <button class="btn btn-ghost" data-nav="dashboard">← Выйти</button>
      <span class="faint">Осталось: ${q.queue.length}</span>
    </div>
    <div class="progress mb-4"><div class="progress-bar" style="width:${progress}%"></div></div>

    <div class="row mb-4" style="justify-content:center">
      <span class="word-status ${isProd ? 'learning' : 'new'}">
        ${isProd ? '✍️ вспомни слово' : '👁 узнай слово'}
      </span>
    </div>

    <div class="flashcard">
      ${front}
      ${
        q.revealed
          ? back
          : `<div class="dim" style="padding:14px 0">${
              isProd ? 'Вспомни английское слово, затем проверь себя' : 'Вспомни перевод, затем открой карточку'
            }</div>`
      }
    </div>

    ${
      q.revealed
        ? `<div class="grade-row">
            <button class="grade-btn again" data-grade="0">Не помню<small>снова сегодня</small></button>
            <button class="grade-btn hard" data-grade="3">Трудно<small>скоро</small></button>
            <button class="grade-btn good" data-grade="4">Помню<small>обычный интервал</small></button>
            <button class="grade-btn easy" data-grade="5">Легко<small>надолго</small></button>
          </div>`
        : `<button class="btn btn-primary btn-lg" style="width:100%" data-reveal>Показать ответ</button>`
    }
  `;
}

export function handleReveal() {
  if (!q || !q.queue.length) return false;
  q.revealed = true;
  const { wordId } = parseCardId(q.queue[0]);
  const w = getWord(wordId);
  if (w && loadState().settings.autoSpeak) speak(w.en);
  return true;
}

export function handleGrade(grade) {
  if (!q || !q.revealed) return false;
  const id = q.queue.shift();
  const g = Number(grade);
  review(id, g);

  // Не вспомнил — карточка вернётся в конец очереди этой же сессии.
  if (g < 3) q.queue.push(id);

  q.revealed = false;
  q.done += 1;
  addXp(g >= 3 ? 5 : 1);
  touchStudyDay();
  return true;
}
