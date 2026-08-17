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
  allowedGrades,
  GRADE,
  DIRECTION,
} from '../core/srs.js';
import { loadState, addXp, touchStudyDay } from '../core/storage.js';
import { esc, speakBtn, shuffle, plural, normalize } from '../core/ui.js';
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
 *
 * Стороны проверяются по-разному, и это принципиально:
 *
 *   узнавание      — самооценка. Понял смысл или нет, видно самому.
 *   воспроизведение — ТОЛЬКО письменный ввод. Иначе достаточно нажать
 *                    «показать ответ», увидеть слово и решить «ну да,
 *                    я знал» — интервал вырастет, а слово не вспомнится
 *                    ни разу. Это не тренировка, а обход тренировки.
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
    typed: '', // ответ, набранный для карточки воспроизведения
    correct: null, // результат письменной проверки; null — проверки не было
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
       <div class="flash-ipa">напиши это слово по-английски</div>`
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
        ${isProd ? '✍️ напиши слово' : '👁 узнай слово'}
      </span>
    </div>

    <div class="flashcard">
      ${front}
      ${
        q.revealed
          ? back
          : `<div class="dim" style="padding:14px 0">${
              isProd ? 'Проверить себя можно только письменно' : 'Вспомни перевод, затем открой карточку'
            }</div>`
      }
    </div>

    ${isProd ? renderProdControls(w) : renderRecControls()}
  `;
}

/**
 * Узнавание: ответ открывается кнопкой, оценку ставит человек.
 * Здесь самооценка честна — понял смысл или нет, видно сразу.
 */
function renderRecControls() {
  return q.revealed
    ? gradeRow([GRADE.AGAIN, GRADE.HARD, GRADE.GOOD, GRADE.EASY])
    : '<button class="btn btn-primary btn-lg" style="width:100%" data-reveal>Показать ответ</button>';
}

/**
 * Воспроизведение: сначала ввод, и только потом ответ.
 *
 * autocomplete/autocorrect/spellcheck выключены намеренно — на телефоне
 * подсказка клавиатуры дописала бы слово за тебя, и проверка снова
 * превратилась бы в самообман, только чужими руками.
 */
function renderProdControls(w) {
  if (!q.revealed) {
    return `
      <input class="text-input" data-prod-input placeholder="Напиши по-английски…"
             value="${esc(q.typed)}" autocomplete="off" autocapitalize="off"
             autocorrect="off" spellcheck="false" />
      <div class="row mt-4">
        <button class="btn btn-primary" data-prod-check>Проверить</button>
        <button class="btn btn-ghost" data-prod-giveup>Не помню</button>
      </div>`;
  }

  const typed = q.typed.trim();
  const verdict = q.correct
    ? '<strong>Верно.</strong> Слово вспомнилось само — это и есть воспроизведение.'
    : typed
      ? `Ты написал <strong>«${esc(typed)}»</strong>, а нужно <strong>${esc(w.en)}</strong>.`
      : `Слово не вспомнилось. Правильный ответ — <strong>${esc(w.en)}</strong>.`;

  return `
    <div class="feedback ${q.correct ? 'ok' : 'no'}">${verdict}</div>
    <div class="mt-4">
      ${
        q.correct
          ? gradeRow(allowedGrades(true))
          : `<button class="btn btn-lg" style="width:100%" data-grade="${GRADE.AGAIN}">
               Дальше<small style="display:block;opacity:.6;font-weight:400">слово вернётся сегодня</small>
             </button>`
      }
    </div>`;
}

const GRADE_BTN = {
  [GRADE.AGAIN]: { cls: 'again', label: 'Не помню', hint: 'снова сегодня' },
  [GRADE.HARD]: { cls: 'hard', label: 'Трудно', hint: 'скоро' },
  [GRADE.GOOD]: { cls: 'good', label: 'Помню', hint: 'обычный интервал' },
  [GRADE.EASY]: { cls: 'easy', label: 'Легко', hint: 'надолго' },
};

function gradeRow(grades) {
  return `<div class="grade-row" style="grid-template-columns:repeat(${grades.length},1fr)">
    ${grades
      .map((g) => {
        const b = GRADE_BTN[g];
        return `<button class="grade-btn ${b.cls}" data-grade="${g}">${b.label}<small>${b.hint}</small></button>`;
      })
      .join('')}
  </div>`;
}

/** Текущая сторона карточки — нужна и обработчикам, и проверке. */
function currentDirection() {
  return q && q.queue.length ? parseCardId(q.queue[0]).direction : null;
}

function reveal(correct) {
  q.revealed = true;
  q.correct = correct;
  const w = getWord(parseCardId(q.queue[0]).wordId);
  if (w && loadState().settings.autoSpeak) speak(w.en);
  return true;
}

export function syncTyped(value) {
  if (q) q.typed = value;
}

/**
 * Открыть ответ без проверки можно только на узнавании.
 * На воспроизведении это была бы та самая лазейка.
 */
export function handleReveal() {
  if (!q || !q.queue.length || q.revealed) return false;
  if (currentDirection() === DIRECTION.PROD) return false;
  return reveal(null);
}

export function handleCheck() {
  if (!q || !q.queue.length || q.revealed) return false;
  if (currentDirection() !== DIRECTION.PROD) return false;

  // Пустое поле — не ответ: засчитать его ошибкой значило бы наказать
  // за случайный клик, а верным — открыть дыру шире прежней.
  const answer = normalize(q.typed);
  if (!answer) return false;

  const w = getWord(parseCardId(q.queue[0]).wordId);
  return reveal(answer === normalize(w.en));
}

/** Честное «не помню» до показа ответа — признание, а не самооценка. */
export function handleGiveUp() {
  if (!q || !q.queue.length || q.revealed) return false;
  if (currentDirection() !== DIRECTION.PROD) return false;
  return reveal(false);
}

export function handleGrade(grade) {
  if (!q || !q.revealed) return false;
  const g = Number(grade);

  // После письменной проверки набор оценок задан её результатом.
  // Проверяем и здесь, а не только при отрисовке: клик по устаревшей
  // разметке не должен отодвигать невоспроизведённое слово.
  if (q.correct !== null && !allowedGrades(q.correct).includes(g)) return false;

  const id = q.queue.shift();
  review(id, g);

  // Не вспомнил — карточка вернётся в конец очереди этой же сессии.
  if (g < 3) q.queue.push(id);

  q.revealed = false;
  q.correct = null;
  q.typed = '';
  q.done += 1;
  addXp(g >= 3 ? 5 : 1);
  touchStudyDay();
  return true;
}
