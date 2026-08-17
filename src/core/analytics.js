/**
 * Разбор прогресса.
 *
 * Счётчики вроде «11 уроков, 912 очков» приятны, но ничего не говорят
 * о том, идёт ли учёба на самом деле. Настоящие вопросы другие:
 * не обгоняют ли уроки повторения, начал ли ты вспоминать слова,
 * а не только узнавать их, и не осталось ли шатким основание.
 *
 * Здесь только расчёты — никакой разметки, чтобы их можно было
 * проверить тестами.
 */

import { CURRICULUM, allLessons, unlockedVocabIds } from '../data/curriculum.js';
import { VOCAB_BY_ID } from '../data/vocab.js';
import { cardId, DIRECTION, PROD_UNLOCK_AFTER, wordProgress } from './srs.js';

/** С этого интервала сторона карточки считается выученной. */
const MASTERED_DAYS = 21;

/**
 * Долг по повторениям: сколько слов уроки уже объяснили,
 * но в память ещё не завели.
 */
export function reviewDebt(state) {
  const unlocked = unlockedVocabIds(state.lessons || {});
  const started = unlocked.filter((id) => state.cards?.[id]);
  const waiting = unlocked.filter((id) => !state.cards?.[id]);

  return {
    unlocked: unlocked.length,
    started: started.length,
    waiting: waiting.length,
    // Во сколько раз пройденного больше, чем закреплённого
    ratio: started.length ? unlocked.length / started.length : unlocked.length ? Infinity : 0,
    words: waiting.map((id) => VOCAB_BY_ID[id]?.en).filter(Boolean),
  };
}

/**
 * Соотношение сторон: узнавание против воспроизведения.
 * Узнавания хватает, чтобы читать; говорить получается только
 * с обратной стороной.
 */
export function sideBalance(state) {
  const cards = state.cards || {};
  let recognition = 0;
  let production = 0;
  let readyForProduction = 0;

  for (const id of Object.keys(cards)) {
    if (id.endsWith('::prod')) {
      production += 1;
      continue;
    }
    recognition += 1;
    // Обратная сторона открывается после нескольких успешных узнаваний
    if (cards[id].reps >= PROD_UNLOCK_AFTER && !cards[cardId(id, DIRECTION.PROD)]) {
      readyForProduction += 1;
    }
  }

  return { recognition, production, readyForProduction };
}

/** Уроки, пройденные слабо: к ним стоит вернуться. */
export function weakLessons(state, threshold = 70) {
  const done = state.lessons || {};
  return allLessons()
    .filter((l) => done[l.id] && (done[l.id].score ?? 100) < threshold)
    .map((l) => ({
      id: l.id,
      title: l.title,
      level: l.levelCode,
      unit: l.unitTitle,
      score: done[l.id].score ?? 0,
    }))
    .sort((a, b) => a.score - b.score);
}

/** Продвижение по уровням. */
export function levelProgress(state) {
  const done = state.lessons || {};
  return CURRICULUM.map((level) => {
    const lessons = level.units.flatMap((u) => u.lessons);
    return {
      code: level.code,
      title: level.title,
      total: lessons.length,
      done: lessons.filter((l) => done[l.id]).length,
    };
  });
}

/** Занятия по дням за последние N дней, от старых к новым. */
export function activity(state, days = 14, today = new Date()) {
  const history = state.history || {};
  const out = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    out.push({ date: key, count: history[key] || 0 });
  }
  return out;
}

/** Сводка по словарю: сколько начато, выучено, впереди. */
export function vocabSummary(state) {
  const unlocked = unlockedVocabIds(state.lessons || {});
  let mastered = 0;
  let learning = 0;

  for (const id of unlocked) {
    const p = wordProgress(id);
    if (!p.started) continue;
    if (p.mastered) mastered += 1;
    else learning += 1;
  }
  return { mastered, learning, unlocked: unlocked.length };
}

/**
 * Наблюдения, отсортированные по важности.
 *
 * Смысл не в том, чтобы похвалить, а в том, чтобы назвать одно главное
 * узкое место. Поэтому порядок жёсткий: сначала то, что мешает
 * запоминанию, потом то, что мешает говорить, и лишь затем остальное.
 */
export function insights(state, today = new Date()) {
  const out = [];
  const debt = reviewDebt(state);
  const sides = sideBalance(state);
  const weak = weakLessons(state);

  if (debt.waiting >= 15 && debt.ratio >= 2) {
    out.push({
      level: 'warn',
      title: 'Уроки обгоняют повторения',
      text:
        `Уроки объяснили ${debt.unlocked} слов, а в память заведено ${debt.started}. ` +
        `Оставшиеся ${debt.waiting} через неделю выветрятся: уроки учат, но держат в памяти повторения. ` +
        'Поставь новые уроки на паузу и разбери накопившееся.',
    });
  }

  if (sides.production === 0 && sides.readyForProduction > 0) {
    out.push({
      level: 'warn',
      title: 'Воспроизведение ещё не начиналось',
      text:
        `${sides.readyForProduction} слов готовы к обратной стороне. Сейчас ты их узнаёшь в тексте, ` +
        'но вспомнить, когда захочешь сказать, ещё не тренировался — это и есть разрыв между «читаю» и «говорю».',
    });
  }

  if (weak.length) {
    const worst = weak[0];
    out.push({
      level: 'info',
      title: 'Есть слабо пройденные уроки',
      text:
        `Хуже всего «${worst.title}» (${worst.score}%)` +
        (weak.length > 1 ? ` и ещё ${weak.length - 1}` : '') +
        '. К таким стоит вернуться: следующие уроки опираются на них.',
    });
  }

  const days = activity(state, 2, today);
  const todayCount = days.at(-1).count;
  if (todayCount === 0 && (state.streak || 0) > 0) {
    out.push({
      level: 'info',
      title: 'Сегодня ещё не занимался',
      text: `Серия в ${state.streak} дн. держится до конца суток — хватит нескольких карточек.`,
    });
  }

  if (!out.length && debt.started > 0) {
    out.push({
      level: 'ok',
      title: 'Всё идёт ровно',
      text: 'Повторения поспевают за уроками, обе стороны карточек в работе. Так и продолжай.',
    });
  }

  return out;
}

export { MASTERED_DAYS };
