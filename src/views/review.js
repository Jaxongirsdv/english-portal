import { getWord, allVocabIds } from '../data/vocab.js';
import { unlockedVocabIds } from '../data/curriculum.js';
import { getGrammarItem, unlockedGrammarIds } from '../data/grammar.js';
import {
  dueCardIds,
  newRecognitionIds,
  newProductionIds,
  parseCardId,
  cardId,
  review,
  stats,
  allowedGrades,
  newCardBudget,
  dueGrammarIds,
  newGrammarIds,
  grammarCardId,
  isGrammarCard,
  grammarItemId,
  getCard,
  GRADE,
  DIRECTION,
} from '../core/srs.js';
import { loadState, update, addXp, touchStudyDay } from '../core/storage.js';
import { esc, speakBtn, shuffle, plural, normalize } from '../core/ui.js';
import { speak } from '../core/speech.js';
import { scoreAttempt, VERDICT } from '../core/compare.js';
import { translationChoices, wordBank } from '../core/choices.js';
import { VOCAB } from '../data/vocab.js';
import {
  isSupported as speechSupported,
  listen,
  cancel,
  describeError,
} from '../core/recognition.js';

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
 *   воспроизведение — сначала попытка, и только потом ответ. Иначе
 *                    достаточно нажать «показать ответ», увидеть слово
 *                    и решить «ну да, я знал» — интервал вырастет,
 *                    а слово не вспомнится ни разу. Это не тренировка,
 *                    а обход тренировки.
 *
 * Попытку можно сделать голосом или письменно — оба способа объективны,
 * оба требуют извлечь слово из памяти. Письменный доступен всегда:
 * распознаванию нужны интернет, микрофон и подходящий браузер.
 *
 * Формат вопроса зависит от того, насколько карточка знакома. Молодую
 * спрашиваем мягче — выбором из вариантов, сборкой из готовых слов;
 * окрепшую заставляем вспоминать целиком. Так нагрузка растёт по мере
 * знакомства, а сессия перестаёт быть одним и тем же экраном двадцать
 * раз подряд: однообразие утомляет быстрее, чем сложность.
 */
let q = null;

function reviewPool(mode = 'normal') {
  const state = loadState();
  const unlocked = unlockedVocabIds(state.lessons);
  const due = mode === 'mistakes'
    ? Object.entries(state.cards || {})
        .filter(([id, card]) => !id.startsWith('grammar:') && card.lastLapseAt)
        .map(([id]) => id)
    : dueCardIds(allVocabIds());
  const grammar = unlockedGrammarIds(state.lessons);
  const dueGrammar = mode === 'mistakes' ? [] : dueGrammarIds(grammar).map(grammarCardId);
  const freshProd = shuffle(newProductionIds(unlocked)).map((w) => cardId(w, DIRECTION.PROD));
  const freshGrammar = shuffle(newGrammarIds(grammar)).map(grammarCardId);
  const freshRec = shuffle(newRecognitionIds(unlocked)).map((w) => cardId(w, DIRECTION.REC));
  const candidates = mode === 'mistakes' ? [] : [...freshProd, ...freshGrammar, ...freshRec];
  const budget = mode === 'mistakes' ? 0 : newCardBudget({
    dueCount: due.length + dueGrammar.length,
    dailyGoal: state.settings.dailyGoal,
  });
  const fresh = shuffle(candidates.slice(0, budget));
  return {
    state,
    unlocked,
    due,
    dueGrammar,
    candidates,
    fresh,
    queue: [...shuffle([...due, ...dueGrammar]), ...fresh],
    budget,
  };
}

/** Открывает обзор, не наваливая всю очередь до выбора размера сессии. */
export function openReview() {
  cancel();
  q = { setup: true };
}

function renderReviewSetup() {
  const pool = reviewPool();
  const dueCount = pool.due.length + pool.dueGrammar.length;
  const mistakeCount = Object.values(pool.state.cards || {}).filter((card) => card.lastLapseAt).length;
  const available = pool.queue.length;
  const recommended = available <= 10 ? 10 : 20;

  return `
    <section class="review-hub">
      <div class="review-hub__intro">
        <div>
          <span class="eyebrow">Умное повторение</span>
          <h1>Выбери темп на сегодня</h1>
          <p class="subtitle">Короткая законченная сессия полезнее, чем бесконечная очередь. Сначала идут срочные карточки, затем новые.</p>
        </div>
        <div class="review-hub__total"><strong>${available}</strong><span>доступно сейчас</span></div>
      </div>

      <div class="review-queue-grid">
        <article><span class="review-queue-dot review-queue-dot--due"></span><strong>${dueCount}</strong><small>срочно повторить</small></article>
        <article><span class="review-queue-dot review-queue-dot--new"></span><strong>${pool.fresh.length}</strong><small>новых в плане</small></article>
        <article><span class="review-queue-dot review-queue-dot--hard"></span><strong>${mistakeCount}</strong><small>проблемных</small></article>
      </div>

      ${available ? `<div class="review-session-grid">
        ${[
          [10, '5 минут', 'Быстрый разогрев'],
          [20, '10 минут', 'Оптимально на день'],
          [40, '20 минут', 'Глубокая практика'],
        ].map(([cards, time, label]) => `
          <button class="review-session${cards === recommended ? ' review-session--recommended' : ''}" data-review-session="${cards}">
            ${cards === recommended ? '<span class="review-session__badge">Рекомендуем</span>' : ''}
            <strong>${time}</strong>
            <span>${label}</span>
            <small>до ${Math.min(cards, available)} карточек</small>
          </button>`).join('')}
      </div>` : `<div class="empty review-hub__empty"><div class="empty-icon">👌</div><h2>Очередь чистая</h2><p class="subtitle">Пройди следующий урок, чтобы открыть новые слова и фразы.</p><button class="btn btn-primary" data-nav="roadmap">К урокам</button></div>`}

      ${mistakeCount ? `<button class="btn btn-ghost review-mistakes-action" data-review-mistakes>Отдельно повторить ошибки · ${mistakeCount}</button>` : ''}
    </section>`;
}


export function startReview(mode = 'normal', maxCards = null) {
  const { state, unlocked, due, dueGrammar, candidates, fresh, queue, budget } = reviewPool(mode);

  // Долги считаем по всему словарю: если слово когда-то было заведено,
  // его надо повторять, даже если урок потом переписали.
  const limit = mode === 'quick' ? 5 : Number.isFinite(maxCards) ? Math.max(1, maxCards) : queue.length;
  const sessionQueue = queue.slice(0, limit);

  q = {
    queue: sessionQueue,
    revealed: false,
    typed: '', // набранный ответ
    heard: '', // что услышал распознаватель либо что было набрано
    verdict: null, // exact | close | wrong; null — проверки не было
    spoken: false, // отвечали голосом или письменно — от этого зависит разбор
    options: null, // варианты для узнавания
    picked: null, // что выбрано
    bank: null, // слова для сборки фразы
    chosen: [], // индексы выбранных слов в банке
    status: 'idle', // idle | listening
    error: null, // сообщение распознавателя
    done: 0,
    total: sessionQueue.length,
    lockedOut: mode !== 'mistakes' && unlocked.length === 0,
    // Придержанные слова — не «ничего не осталось»: об этом надо сказать прямо
    heldBack: candidates.length - fresh.length,
    crowdedOut: mode !== 'mistakes' && budget === 0 && candidates.length > 0,
    mode,
    limited: sessionQueue.length < queue.length,
    remainingAfterSession: Math.max(0, queue.length - sessionQueue.length),
  };
  ensurePrepared();
}

export function startMistakeReview() {
  startReview('mistakes');
}

export function startQuickReview() {
  startReview('quick');
}

export function startReviewSession(cards) {
  const size = Number(cards);
  if (![10, 20, 40].includes(size)) return false;
  startReview('normal', size);
  return true;
}


export function exitReview() {
  cancel(); // микрофон не должен остаться включённым после ухода с экрана
  q = null;
}

function renderEmpty() {
  const s = stats(allVocabIds());
  const { done, heldBack, crowdedOut, lockedOut } = q;
  const mistakeCount = Object.values(loadState().cards || {}).filter((card) => card.lastLapseAt).length;

  // «Нечего повторять» и «новое придержано» — разные вещи, и путать их нельзя:
  // во втором случае работа есть, просто портал решил не наваливать всё сразу.
  const held =
    heldBack > 0
      ? `<div class="callout mt-4" style="max-width:520px;margin-left:auto;margin-right:auto">
          <span class="callout-label">Придержано</span>
          ${
            crowdedOut
              ? `Просроченные повторения занимали всю дневную цель, поэтому новые слова
                 сегодня не предлагались. Долг закрыт — теперь можно брать новые.`
              : `Ещё ${plural(heldBack, 'слово ждёт', 'слова ждут', 'слов ждут')} очереди.
                 Небольшими порциями каждый день память удерживает больше, чем одним рывком.`
          }
        </div>`
      : '';

  return `
    <div class="empty">
      <div class="empty-icon">${done > 0 ? '✨' : lockedOut ? '📘' : '👌'}</div>
      <h1>${done > 0 ? (q.limited ? 'Сессия завершена' : 'На сегодня всё') : lockedOut ? 'Сначала урок' : 'Повторять пока нечего'}</h1>
      <p class="subtitle">
        ${
          done > 0
            ? `Повторено ${plural(done, 'карточка', 'карточки', 'карточек')}. ${q.limited ? `В общей очереди осталось ${q.remainingAfterSession}, но дневная цель уже выполнена.` : 'Интервалы расставлены — возвращайся завтра.'}`
            : lockedOut
              ? 'Слова открываются пройденными уроками, чтобы тренажёр не подсовывал лексику без контекста.'
              : 'Все открытые слова повторены. Пройди следующий урок, чтобы добавить новые.'
        }
      </p>
      ${held}
      <div class="grid grid-3" style="max-width:420px;margin:24px auto">
        <div class="stat"><div class="stat-value">${s.learning}</div><div class="stat-label">в изучении</div></div>
        <div class="stat"><div class="stat-value" style="color:var(--green)">${s.mastered}</div><div class="stat-label">выучено</div></div>
        <div class="stat"><div class="stat-value">${s.untouched}</div><div class="stat-label">впереди</div></div>
      </div>
      <div class="row" style="justify-content:center">
        ${done > 0 && q.limited ? '<button class="btn btn-primary btn-lg" data-review-home>Выбрать ещё сессию</button>' : ''}
        ${mistakeCount && q.mode !== 'mistakes' ? '<button class="btn btn-primary btn-lg" data-review-mistakes>Повторить ошибки · ' + mistakeCount + '</button>' : ''}
        ${
          heldBack > 0
            ? '<button class="btn btn-primary btn-lg" data-nav="review">Взять ещё слов</button>'
            : ''
        }
        <button class="btn btn-lg" data-nav="roadmap">К урокам</button>
      </div>
    </div>`;
}

/** Молодая карточка — та, которую ещё не вспоминали дважды подряд. */
const EASIER_UNTIL_REPS = 2;

function isYoung(cardKey) {
  return getCard(cardKey).reps < EASIER_UNTIL_REPS;
}

/**
 * Готовит вопрос под текущую карточку — ровно один раз.
 *
 * Считать это в разметке нельзя: перерисовка происходит на каждый клик,
 * и варианты тасовались бы прямо под пальцем, а собранные слова исчезали.
 * Та же ошибка уже была в уроке с перемешанными вариантами.
 */
function ensurePrepared() {
  if (!q || !q.queue.length) return;
  const key = q.queue[0];

  if (isGrammarCard(key)) {
    const item = currentGrammar();
    // Молодую фразу собираем из готовых слов: набирать целое предложение
    // с телефона — работа, которая проверяет терпение, а не грамматику
    if (item && q.bank === null && isYoung(key)) q.bank = wordBank(item.en);
    return;
  }

  const { wordId, direction } = parseCardId(key);
  if (direction !== DIRECTION.REC || q.options !== null) return;
  const word = getWord(wordId);
  if (word) q.options = translationChoices(word, VOCAB, 4);
}

/** Текущая фраза, если впереди очереди стоит карточка грамматики. */
function currentGrammar() {
  if (!q || !q.queue.length || !isGrammarCard(q.queue[0])) return null;
  return getGrammarItem(grammarItemId(q.queue[0]));
}

/**
 * Карточка грамматики: русская фраза → английская.
 *
 * Только письменно. Распознаватель на целом предложении у начинающего
 * ошибается слишком часто, и провал произношения выглядел бы как незнание
 * грамматики — две разные вещи, которые нельзя смешивать в одной оценке.
 */
function renderGrammar() {
  const item = currentGrammar();
  if (!item) {
    q.queue.shift();
    return renderReview();
  }

  const progress = q.total ? ((q.total - q.queue.length) / q.total) * 100 : 0;

  return `
    <div class="row-between mb-4">
      <button class="btn btn-ghost" data-nav="dashboard">← Выйти</button>
      <span class="faint">Сессия: ${q.done}/${q.total}</span>
    </div>
    <div class="progress mb-4"><div class="progress-bar" style="width:${progress}%"></div></div>

    <div class="row mb-4" style="justify-content:center">
      <span class="word-status learning">📐 построй фразу</span>
    </div>

    <div class="flashcard">
      <div class="flash-word" style="font-size:26px;color:var(--accent)">${esc(item.ru)}</div>
      <div class="flash-ipa">
        ${q.bank ? 'собери фразу из слов' : 'напиши это по-английски'}${
          item.hint ? ` · подсказка: ${esc(item.hint)}` : ''
        }
      </div>
      ${
        q.revealed
          ? `<div class="flash-ru" style="color:var(--text);font-size:20px">
               ${esc(item.en)} ${speakBtn(item.en)}
             </div>
             <div class="faint">из урока «${esc(item.lessonTitle)}» · ${esc(item.levelCode)}</div>`
          : '<div class="dim" style="padding:14px 0">Ответ откроется после попытки</div>'
      }
    </div>

    ${q.revealed ? renderVerdict({ en: item.en }, { phrase: true }) : renderGrammarInput()}
  `;
}

function renderGrammarInput() {
  // Молодая фраза собирается из готовых слов, окрепшая набирается целиком
  if (q.bank) return renderGrammarBank();

  return `
    <input class="text-input" data-prod-input placeholder="Напиши предложение по-английски…"
           value="${esc(q.typed)}" autocomplete="off" autocapitalize="off"
           autocorrect="off" spellcheck="false" />
    <div class="row mt-4">
      <button class="btn btn-primary" data-prod-check>Проверить</button>
      <button class="btn btn-ghost" data-prod-giveup>Не помню</button>
    </div>`;
}

/**
 * Сборка фразы из слов.
 *
 * chosen хранит индексы банка, а не сами слова: в предложении вроде
 * «to be or not to be» одинаковые слова иначе удаляли бы друг друга.
 */
function renderGrammarBank() {
  const chosenChips = q.chosen
    .map((bankIdx, pos) => `<button class="chip" data-bank-undo="${pos}">${esc(q.bank[bankIdx])}</button>`)
    .join('');

  return `
    <div class="answer-zone">
      ${chosenChips || '<span class="faint">Нажимай на слова ниже…</span>'}
    </div>
    <div class="word-bank">
      ${q.bank
        .map((w, i) =>
          q.chosen.includes(i) ? '' : `<button class="chip" data-bank-pick="${i}">${esc(w)}</button>`,
        )
        .join('')}
    </div>
    <div class="row mt-4">
      <button class="btn btn-primary" data-prod-check>Проверить</button>
      <button class="btn btn-ghost" data-prod-giveup>Не помню</button>
    </div>`;
}

export function renderReview() {
  if (!q) startReview();
  if (q.setup) return renderReviewSetup();
  if (q.queue.length === 0) return renderEmpty();
  ensurePrepared();
  if (isGrammarCard(q.queue[0])) return renderGrammar();

  const { wordId, direction } = parseCardId(q.queue[0]);
  const w = getWord(wordId);
  if (!w) {
    q.queue.shift();
    return renderReview();
  }

  const isProd = direction === DIRECTION.PROD;
  const progress = q.total ? ((q.total - q.queue.length) / q.total) * 100 : 0;

  const speaking = isProd && answerMode() === 'speak';

  // Лицевая сторона: узнавание показывает слово, воспроизведение — перевод.
  const front = isProd
    ? `<div class="flash-word" style="color:var(--accent)">${esc(w.ru)}</div>
       <div class="flash-ipa">${speaking ? 'скажи' : 'напиши'} это слово по-английски</div>`
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
      <span class="faint">Сессия: ${q.done}/${q.total}</span>
    </div>
    <div class="progress mb-4"><div class="progress-bar" style="width:${progress}%"></div></div>

    <div class="row mb-4" style="justify-content:center">
      <span class="word-status ${isProd ? 'learning' : 'new'}">
        ${isProd ? (speaking ? '🎤 скажи слово' : '✍️ напиши слово') : '👁 узнай слово'}
      </span>
    </div>

    <div class="flashcard">
      ${front}
      ${
        q.revealed
          ? back
          : `<div class="dim" style="padding:14px 0">${
              isProd ? 'Ответ откроется после попытки' : 'Вспомни перевод, потом выбери его ниже'
            }</div>`
      }
    </div>

    ${isProd ? renderProdControls(w) : renderRecControls(w)}
  `;
}

/**
 * Узнавание: выбор перевода из четырёх.
 *
 * Раньше здесь была самооценка — «показать ответ» и четыре кнопки. Это
 * оставалось последним местом, где цифра зависела от честности с собой:
 * увидел перевод, решил «ну да, знал», интервал вырос. Выбор проверяет
 * то же самое объективно, занимает один тап и не требует печати.
 *
 * Отвлекающие берутся из той же темы — иначе ответ угадывался бы
 * по несовпадению области, а не по знанию слова.
 */
function renderRecControls(w) {
  if (!q.revealed) {
    return `<div class="choice-grid">
      ${(q.options || [])
        .map(
          (opt) => `<button class="option" data-pick="${esc(opt)}">${esc(opt)}</button>`,
        )
        .join('')}
    </div>`;
  }

  return `
    <div class="choice-grid mb-4">
      ${(q.options || [])
        .map((opt) => {
          const right = opt === w.ru;
          const cls = right ? ' correct' : opt === q.picked ? ' wrong' : '';
          return `<button class="option${cls}" disabled>${esc(opt)}</button>`;
        })
        .join('')}
    </div>
    ${gradeRow(allowedGrades(q.verdict))}`;
}

/**
 * Способ ответа на обратной стороне.
 *
 * Если распознавание недоступно, режим всегда письменный — иначе выбор
 * «говорить» превратил бы экран в тупик на первом же телефоне без
 * подходящего браузера.
 */
function answerMode() {
  const mode = loadState().settings.prodAnswer;
  return mode === 'speak' && speechSupported() ? 'speak' : 'write';
}

export function setAnswerMode(mode) {
  if (!q || q.revealed || q.status === 'listening') return false;
  update((s) => {
    s.settings.prodAnswer = mode === 'speak' ? 'speak' : 'write';
  });
  q.error = null;
  return true;
}

const ACTIVE_CHIP = 'border-color:var(--accent);color:var(--accent)';

/**
 * Воспроизведение: сначала попытка, и только потом ответ.
 *
 * autocomplete/autocorrect/spellcheck выключены намеренно — на телефоне
 * подсказка клавиатуры дописала бы слово за тебя, и проверка снова
 * превратилась бы в самообман, только чужими руками.
 */
function renderProdControls(w) {
  if (q.revealed) return renderVerdict(w);

  const mode = answerMode();
  const listening = q.status === 'listening';

  // Переключатель показываем только там, где есть из чего выбирать
  const switcher = speechSupported()
    ? `<div class="row mb-4" style="gap:6px;justify-content:center">
         <button class="chip" style="${mode === 'write' ? ACTIVE_CHIP : ''}" data-prod-mode="write">⌨️ Написать</button>
         <button class="chip" style="${mode === 'speak' ? ACTIVE_CHIP : ''}" data-prod-mode="speak">🎤 Сказать</button>
       </div>`
    : '';

  const attempt =
    mode === 'speak'
      ? `${
          listening
            ? '<button class="btn btn-lg" style="width:100%" disabled>🎤 Слушаю… говори</button>'
            : '<button class="btn btn-primary btn-lg" style="width:100%" data-prod-speak>🎤 Записать ответ</button>'
        }
        ${q.error ? `<div class="feedback no mt-4"><strong>${esc(q.error)}</strong></div>` : ''}`
      : `<input class="text-input" data-prod-input placeholder="Напиши по-английски…"
                value="${esc(q.typed)}" autocomplete="off" autocapitalize="off"
                autocorrect="off" spellcheck="false" />
         <div class="row mt-4">
           <button class="btn btn-primary" data-prod-check>Проверить</button>
         </div>`;

  return `
    ${switcher}
    ${attempt}
    <div class="row mt-4">
      <button class="btn btn-ghost" data-prod-giveup ${listening ? 'disabled' : ''}>Не помню</button>
    </div>`;
}

/** Разбор попытки: что именно вышло и какие оценки после этого возможны. */
function renderVerdict(w, { phrase = false } = {}) {
  const heard = q.heard.trim();
  const spoken = q.spoken;

  let tone = 'no';
  let text;
  if (q.verdict === VERDICT.EXACT) {
    tone = 'ok';
    text = phrase
      ? '<strong>Верно.</strong> Фраза собрана самостоятельно — это и есть владение правилом.'
      : '<strong>Верно.</strong> Слово вспомнилось само — это и есть воспроизведение.';
  } else if (q.verdict === VERDICT.CLOSE) {
    // Промахнулась рука или язык, но не память: слово было извлечено
    tone = 'close';
    text = `<strong>Почти.</strong> ${
      spoken ? 'Услышано' : 'Ты написал'
    } «${esc(heard)}», а нужно <strong>${esc(w.en)}</strong>.<br />
      <span class="faint">${
        phrase ? 'Фразу ты собрал верно, но написал неточно' : 'Слово ты вспомнил, но неточно'
      } — засчитываем как «трудно».</span>`;
  } else if (heard) {
    text = `${spoken ? 'Услышано' : 'Ты написал'} «${esc(heard)}», а нужно <strong>${esc(w.en)}</strong>.`;
  } else {
    text = `${
      phrase ? 'Фраза не собралась' : 'Слово не вспомнилось'
    }. Правильный ответ — <strong>${esc(w.en)}</strong>.`;
  }

  const grades = allowedGrades(q.verdict);
  const hint = {
    [GRADE.AGAIN]: 'слово вернётся сегодня',
    [GRADE.HARD]: 'повторим раньше обычного',
  };

  return `
    <div class="feedback ${tone === 'close' ? 'ok' : tone}"
         ${tone === 'close' ? 'style="border-color:var(--amber);background:var(--amber-soft)"' : ''}>
      ${text}
    </div>
    <div class="mt-4">
      ${
        grades.length === 1
          ? `<button class="btn btn-lg" style="width:100%" data-grade="${grades[0]}">
               Дальше<small style="display:block;opacity:.6;font-weight:400">${hint[grades[0]]}</small>
             </button>`
          : gradeRow(grades)
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
  if (grades.length === 1) {
    const hint = {
      [GRADE.AGAIN]: 'слово вернётся сегодня',
      [GRADE.HARD]: 'повторим раньше обычного',
    }[grades[0]];
    return `<button class="btn btn-lg" style="width:100%" data-grade="${grades[0]}">
        Дальше<small style="display:block;opacity:.6;font-weight:400">${hint}</small>
      </button>`;
  }
  return `<div class="grade-row" style="grid-template-columns:repeat(${grades.length},1fr)">
    ${grades
      .map((g) => {
        const b = GRADE_BTN[g];
        return `<button class="grade-btn ${b.cls}" data-grade="${g}">${b.label}<small>${b.hint}</small></button>`;
      })
      .join('')}
  </div>`;
}

/**
 * Текущая сторона карточки. У фразы стороны нет вовсе: parseCardId принял бы
 * её за узнавание слова, и «показать ответ» снова открыл бы ответ даром.
 */
function currentDirection() {
  if (!q || !q.queue.length || isGrammarCard(q.queue[0])) return null;
  return parseCardId(q.queue[0]).direction;
}

/** Что именно надо воспроизвести, если карточка этого требует. */
function expectedAnswer() {
  if (!q || !q.queue.length) return null;
  if (isGrammarCard(q.queue[0])) return currentGrammar()?.en ?? null;
  if (currentDirection() !== DIRECTION.PROD) return null;
  return getWord(parseCardId(q.queue[0]).wordId)?.en ?? null;
}

function reveal(verdict, heard = '', { spoken = false } = {}) {
  q.revealed = true;
  q.verdict = verdict;
  q.heard = heard;
  q.spoken = spoken;
  q.status = 'idle';
  q.error = null;

  const sample = isGrammarCard(q.queue[0])
    ? currentGrammar()?.en
    : getWord(parseCardId(q.queue[0]).wordId)?.en;
  if (sample && loadState().settings.autoSpeak) speak(sample);
  return true;
}

export function syncTyped(value) {
  if (q) q.typed = value;
}

/**
 * Выбор перевода на карточке узнавания.
 *
 * Кнопки «показать ответ» больше нет вовсе: она позволяла увидеть перевод
 * и самому решить, знал ли ты его. Теперь ответ определяется выбором,
 * и решает не память о собственной уверенности, а совпадение.
 */
export function handlePick(value) {
  if (!q || !q.queue.length || q.revealed) return false;
  if (isGrammarCard(q.queue[0]) || currentDirection() !== DIRECTION.REC) return false;

  const w = getWord(parseCardId(q.queue[0]).wordId);
  if (!w || !q.options?.includes(value)) return false;

  q.picked = value;
  return reveal(value === w.ru ? VERDICT.EXACT : VERDICT.WRONG, value);
}

/** Слово из банка отправляется в собираемую фразу. */
export function handleBankPick(index) {
  const i = Number(index);
  if (!q || q.revealed || !q.bank || q.chosen.includes(i)) return false;
  if (!Number.isInteger(i) || i < 0 || i >= q.bank.length) return false;
  q.chosen = [...q.chosen, i];
  return true;
}

/** Взятое по ошибке слово возвращается в банк. */
export function handleBankUndo(position) {
  const p = Number(position);
  if (!q || q.revealed || !q.bank) return false;
  if (!Number.isInteger(p) || p < 0 || p >= q.chosen.length) return false;
  q.chosen = q.chosen.filter((_, idx) => idx !== p);
  return true;
}

/** Что человек в итоге ответил: набранное или собранное из банка. */
function currentAnswerText() {
  if (q.bank) return q.chosen.map((i) => q.bank[i]).join(' ');
  return q.typed;
}

export function handleCheck() {
  if (!q || !q.queue.length || q.revealed || q.status === 'listening') return false;
  const expected = expectedAnswer();
  if (expected === null) return false;

  // Пустой ответ — не ответ: засчитать его ошибкой значило бы наказать
  // за случайный клик, а верным — открыть дыру шире прежней.
  const answer = currentAnswerText();
  if (!normalize(answer)) return false;

  // Тот же разбор, что и для речи: опечатка — это «почти», а не провал,
  // но порог зависит от длины образца, иначе tree сошло бы за three
  const { verdict } = scoreAttempt(expected, [answer]);
  return reveal(verdict, answer.trim());
}

export async function handleSpeak(rerender) {
  if (!q || !q.queue.length || q.revealed || q.status === 'listening') return;
  // Голосом отвечают только на слово: распознаватель на целом предложении
  // у начинающего ошибается слишком часто, и провал произношения выглядел бы
  // как незнание грамматики
  if (currentDirection() !== DIRECTION.PROD) return;

  const expected = expectedAnswer();
  q.status = 'listening';
  q.error = null;
  rerender();

  try {
    const alternatives = await listen({ lang: 'en-US' });
    // Пока шла запись, карточку могли закрыть другим способом
    if (!q || q.revealed || !q.queue.length) return;
    const { verdict, heard } = scoreAttempt(expected, alternatives);
    reveal(verdict, heard, { spoken: true });
  } catch (err) {
    if (!q) return;
    q.status = 'idle';
    q.error = describeError(err.message);
  }
  rerender();
}

/** Честное «не помню» до показа ответа — признание, а не самооценка. */
export function handleGiveUp() {
  if (!q || !q.queue.length || q.revealed || q.status === 'listening') return false;
  if (expectedAnswer() === null) return false;
  return reveal(VERDICT.WRONG);
}

export function handleGrade(grade) {
  if (!q || !q.revealed) return false;
  const g = Number(grade);

  // После проверки набор оценок задан её результатом. Проверяем и здесь,
  // а не только при отрисовке: клик по устаревшей разметке не должен
  // отодвигать невоспроизведённое слово.
  if (q.verdict !== null && !allowedGrades(q.verdict).includes(g)) return false;

  const id = q.queue.shift();
  review(id, g);

  // Не вспомнил — карточка вернётся в конец очереди этой же сессии.
  if (g < 3) q.queue.push(id);

  q.revealed = false;
  q.verdict = null;
  q.heard = '';
  q.spoken = false;
  q.options = null;
  q.picked = null;
  q.bank = null;
  q.chosen = [];
  q.typed = '';
  q.error = null;
  q.status = 'idle';
  q.done += 1;
  addXp(g >= 3 ? 5 : 1);
  touchStudyDay();
  // Готовим следующую карточку сразу: полагаться на то, что первой
  // случится отрисовка, — значит держать обработчики в зависимости
  // от порядка вызовов
  ensurePrepared();
  return true;
}
