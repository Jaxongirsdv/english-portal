/**
 * Интервальные повторения по алгоритму SM-2 (как в Anki).
 *
 * Идея: слово, которое ты вспомнил легко, покажется нескоро;
 * слово, на котором ты споткнулся, вернётся уже сегодня.
 * Это единственная механика, которая реально удерживает лексику
 * в долгой памяти, поэтому она — ядро портала.
 */

import { loadState, update, today, toISODate } from './storage.js';
import { VERDICT } from './compare.js';

/** Оценки, которые ставит пользователь после показа карточки. */
export const GRADE = {
  AGAIN: 0, // не вспомнил
  HARD: 3, // вспомнил с трудом
  GOOD: 4, // вспомнил
  EASY: 5, // легко
};

function newCard(id) {
  return {
    id,
    ease: 2.5, // фактор лёгкости
    interval: 0, // в днях
    reps: 0, // сколько успешных повторов подряд
    lapses: 0, // сколько раз забывал
    lastLapseAt: null, // последняя актуальная ошибка для короткого разбора
    due: today(), // дата следующего показа
  };
}

export function getCard(id) {
  const state = loadState();
  return state.cards[id] || newCard(id);
}

function addDays(dateStr, days) {
  const d = new Date(dateStr + 'T00:00:00'); // локальная полночь
  d.setDate(d.getDate() + days);
  return toISODate(d);
}

/**
 * Пересчитывает карточку после ответа и сохраняет её.
 * Возвращает обновлённую карточку.
 */
export function review(id, grade) {
  const card = { ...getCard(id) };

  if (grade < 3) {
    // Забыл — начинаем цикл заново, но лёгкость слегка падает.
    card.reps = 0;
    card.lapses += 1;
    card.lastLapseAt = today();
    card.interval = 0;
    card.ease = Math.max(1.3, card.ease - 0.2);
    card.due = today(); // вернётся в этой же сессии
  } else {
    card.reps += 1;
    if (card.reps === 1) card.interval = 1;
    else if (card.reps === 2) card.interval = 6;
    else card.interval = Math.round(card.interval * card.ease);

    // Классическая формула SM-2 для фактора лёгкости
    card.ease = Math.max(
      1.3,
      card.ease + (0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02)),
    );
    card.due = addDays(today(), card.interval);
    card.lastLapseAt = null;
  }

  update((s) => {
    s.cards[id] = card;
  });
  return card;
}

/* ---------- Две стороны карточки ---------- */

/**
 * Каждое слово тренируется в двух направлениях:
 *
 *   REC  (узнавание)      англ. → рус.  «увидел hello — понял, что это привет»
 *   PROD (воспроизведение) рус. → англ. «нужно сказать „привет“ — вспомнил hello»
 *
 * Узнавание — пассивный навык: его хватает для чтения, но не для речи.
 * Говорить получается только тогда, когда натренировано воспроизведение,
 * поэтому оно вынесено в отдельную карточку со своим интервалом.
 *
 * id карточки узнавания совпадает с id слова — так сохраняется
 * совместимость с прогрессом, накопленным до появления второй стороны.
 */
export const DIRECTION = { REC: 'rec', PROD: 'prod' };

const PROD_SUFFIX = '::prod';

/** Сколько успешных узнаваний нужно, прежде чем откроется воспроизведение. */
export const PROD_UNLOCK_AFTER = 2;

/** С какого интервала сторона считается выученной. */
const MASTERED_DAYS = 21;

export function cardId(wordId, direction) {
  return direction === DIRECTION.PROD ? wordId + PROD_SUFFIX : wordId;
}

export function parseCardId(id) {
  return id.endsWith(PROD_SUFFIX)
    ? { wordId: id.slice(0, -PROD_SUFFIX.length), direction: DIRECTION.PROD }
    : { wordId: id, direction: DIRECTION.REC };
}

/** Все заведённые карточки этих слов (обе стороны), которые пора повторить. */
export function dueCardIds(wordIds) {
  const state = loadState();
  const t = today();
  const out = [];
  for (const wid of wordIds) {
    for (const dir of [DIRECTION.REC, DIRECTION.PROD]) {
      const card = state.cards[cardId(wid, dir)];
      if (card && card.due <= t) out.push(cardId(wid, dir));
    }
  }
  return out;
}

/** Слова, у которых ещё нет карточки узнавания. */
export function newRecognitionIds(wordIds) {
  const state = loadState();
  return wordIds.filter((wid) => !state.cards[cardId(wid, DIRECTION.REC)]);
}

/**
 * Слова, готовые к воспроизведению: узнавание уже закрепилось,
 * а обратной карточки ещё нет.
 */
export function newProductionIds(wordIds) {
  const state = loadState();
  return wordIds.filter((wid) => {
    const rec = state.cards[cardId(wid, DIRECTION.REC)];
    return rec && rec.reps >= PROD_UNLOCK_AFTER && !state.cards[cardId(wid, DIRECTION.PROD)];
  });
}

/* ---------- Грамматика ---------- */

/**
 * Фразы живут в тех же карточках, что и слова, но под своим префиксом.
 * Общее хранилище даёт им бесплатно и SM-2, и слияние между устройствами;
 * префикс нужен, чтобы подсчёты по словарю не приняли фразу за слово.
 */
const GRAMMAR_PREFIX = 'g::';

export function grammarCardId(itemId) {
  return GRAMMAR_PREFIX + itemId;
}

export function isGrammarCard(id) {
  return String(id).startsWith(GRAMMAR_PREFIX);
}

export function grammarItemId(cardId) {
  return String(cardId).slice(GRAMMAR_PREFIX.length);
}

/** Фразы, которые пора повторить. */
export function dueGrammarIds(itemIds) {
  const state = loadState();
  const t = today();
  return itemIds.filter((id) => {
    const card = state.cards[grammarCardId(id)];
    return card && card.due <= t;
  });
}

/** Фразы, ещё ни разу не заведённые в память. */
export function newGrammarIds(itemIds) {
  const state = loadState();
  return itemIds.filter((id) => !state.cards[grammarCardId(id)]);
}

/** Сводка по фразам: сколько начато и сколько закреплено. */
export function grammarStats(itemIds) {
  const state = loadState();
  let started = 0;
  let mastered = 0;
  for (const id of itemIds) {
    const card = state.cards[grammarCardId(id)];
    if (!card) continue;
    started += 1;
    if (card.interval >= MASTERED_DAYS) mastered += 1;
  }
  return { total: itemIds.length, started, mastered, untouched: itemIds.length - started };
}

/** Состояние слова по обеим сторонам. */
export function wordProgress(wordId) {
  const state = loadState();
  const rec = state.cards[cardId(wordId, DIRECTION.REC)] || null;
  const prod = state.cards[cardId(wordId, DIRECTION.PROD)] || null;
  const recMastered = !!rec && rec.interval >= MASTERED_DAYS;
  const prodMastered = !!prod && prod.interval >= MASTERED_DAYS;
  return {
    rec,
    prod,
    recMastered,
    prodMastered,
    started: !!rec || !!prod,
    mastered: recMastered && prodMastered,
  };
}

/**
 * Какие оценки уместны после объективной проверки ответа.
 *
 * Правило одно: потолок ставит код, а человек выбирает только под ним.
 * Так самооценка остаётся там, где она честна (насколько трудно далось),
 * и исчезает там, где она превращалась в самообман (вспомнил ли вообще).
 *
 *   точно  — воспроизведение состоялось, спорить не о чем.
 *            Выбирай интервал сам.
 *   почти  — слово извлечено из памяти, но неточно: опечатка или
 *            смазанное произношение. Это «трудно», и без вариантов:
 *            дать здесь «помню» значило бы вернуть самооценку туда,
 *            где её только что убрали.
 *   мимо   — оценок нет вовсе. Соблазн оставить «трудно» велик, но
 *            в SM-2 эта оценка считается УСПЕХОМ и отодвигает повтор.
 *            Слово, которое не воспроизвелось, ушло бы дальше из памяти
 *            при внешне честной статистике.
 */
export function allowedGrades(verdict) {
  if (verdict === VERDICT.EXACT) return [GRADE.HARD, GRADE.GOOD, GRADE.EASY];
  if (verdict === VERDICT.CLOSE) return [GRADE.HARD];
  return [GRADE.AGAIN];
}

/**
 * Больше новых слов за один присест не осиливает никто: каждое из них
 * возвращается внутри сессии по нескольку раз, пока не уляжется.
 */
export const MAX_NEW_PER_SESSION = 16;

/**
 * Сколько новых карточек завести в этой сессии.
 *
 * Долгов у портала два, и они тянут в разные стороны.
 *
 * Слова из пройденных уроков, ни разу не заведённые в память, сегодня
 * не стоят ничего — но урок на них уже потрачен, и без карточки они
 * просто выветрятся. Их надо заводить.
 *
 * Просроченные повторения, наоборот, стоят времени каждый день и растут
 * сами по себе. Пока их много, новые слова только подливают в костёр —
 * классический способ забросить всё через неделю.
 *
 * Поэтому бюджет отсчитывается от дневной цели, которую человек назначил
 * себе сам, за вычетом уже накопившихся долгов. Новое делится пополам:
 * незнакомое слово стоит примерно двух повторений знакомого.
 */
export function newCardBudget({ dueCount = 0, dailyGoal = 20 } = {}) {
  const room = Math.round(dailyGoal) - Math.max(0, dueCount);
  if (room <= 0) return 0; // сначала разгрести просроченное
  return Math.max(1, Math.min(MAX_NEW_PER_SESSION, Math.round(room / 2)));
}

/** Сводка по словам (не по карточкам): сколько начато, выучено, ждёт повтора. */
export function stats(wordIds) {
  const t = today();
  let learning = 0;
  let mastered = 0;
  let due = 0;
  let untouched = 0;

  for (const wid of wordIds) {
    const p = wordProgress(wid);
    if (!p.started) {
      untouched += 1;
      continue;
    }
    if (p.mastered) mastered += 1;
    else learning += 1;
    if ((p.rec && p.rec.due <= t) || (p.prod && p.prod.due <= t)) due += 1;
  }

  return { total: wordIds.length, untouched, learning, mastered, due };
}
