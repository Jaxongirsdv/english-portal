/**
 * Слияние прогресса с двух устройств.
 *
 * Занимаясь и на ноутбуке, и на телефоне, получаешь две разошедшиеся
 * истории. Простая перезапись «кто синхронизировался последним» стёрла бы
 * часть занятий, поэтому состояния сливаются по полям.
 *
 * Общий принцип: НИКОГДА не завышать прогресс. Там, где честное значение
 * восстановить нельзя (счётчики попыток), берём максимум, а не сумму —
 * сумма удвоила бы общую часть истории. Лучше слегка недосчитать, чем
 * нарисовать занятия, которых не было.
 */

import { isGrammarCard } from './srs.js';

/** Слово выучено при интервале 21 день — та же граница, что в srs.js. */
const MASTERED_DAYS = 21;

/**
 * Какая из двух карточек «дальше» в изучении.
 * Прогресс по слову почти монотонен, поэтому берём более продвинутую.
 */
function furtherCard(a, b) {
  if (!a) return b;
  if (!b) return a;
  if (a.reps !== b.reps) return a.reps > b.reps ? a : b;
  if (a.interval !== b.interval) return a.interval > b.interval ? a : b;
  // При равном прогрессе оставляем ту, что назначена на более поздний срок:
  // она отражает более свежее повторение
  return a.due >= b.due ? a : b;
}

function mergeCards(local = {}, remote = {}) {
  const out = {};
  for (const id of new Set([...Object.keys(local), ...Object.keys(remote)])) {
    const sources = [local[id], remote[id]].filter(Boolean);
    const card = furtherCard(local[id], remote[id]);
    const hasReviewField = sources.some(
      (source) => Object.hasOwn(source, 'lastReviewAt'),
    );
    const latestReview = sources
      .filter((source) => source.lastReviewAt)
      .sort((a, b) => a.lastReviewAt.localeCompare(b.lastReviewAt))
      .at(-1);

    if (latestReview) {
      // Ошибка активна только до следующей попытки. В отличие от прогресса,
      // здесь побеждает самая свежая попытка, даже если она была успешной.
      out[id] = {
        ...card,
        lastLapseAt: latestReview.lastLapseAt || null,
        lastReviewAt: latestReview.lastReviewAt,
      };
      continue;
    }

    if (hasReviewField) {
      out[id] = { ...card, lastLapseAt: null, lastReviewAt: null };
      continue;
    }

    const hasLapseField = sources.some(
      (source) => source && Object.hasOwn(source, 'lastLapseAt'),
    );
    const lastLapseAt = sources
      .map((source) => source.lastLapseAt)
      .filter(Boolean)
      .sort()
      .at(-1) || null;
    out[id] = card && hasLapseField ? { ...card, lastLapseAt } : card;
  }
  return out;
}

/** Урок пройден — значит пройден. Оставляем первое прохождение и лучший результат. */
function mergeLessons(local = {}, remote = {}) {
  const out = {};
  for (const id of new Set([...Object.keys(local), ...Object.keys(remote)])) {
    const a = local[id];
    const b = remote[id];
    if (!a || !b) {
      out[id] = a || b;
      continue;
    }
    out[id] = {
      completedAt: a.completedAt <= b.completedAt ? a.completedAt : b.completedAt,
      score: Math.max(a.score ?? 0, b.score ?? 0),
    };
  }
  return out;
}

/** История по дням: за один день на одном устройстве — максимум, а не сумма. */
function mergeHistory(local = {}, remote = {}) {
  const out = {};
  for (const day of new Set([...Object.keys(local), ...Object.keys(remote)])) {
    out[day] = Math.max(local[day] || 0, remote[day] || 0);
  }
  return out;
}

function mergeCounters(local = {}, remote = {}, fields) {
  const out = {};
  for (const f of fields) out[f] = Math.max(local[f] || 0, remote[f] || 0);
  return out;
}

function mergePronunciation(local = {}, remote = {}) {
  const out = {};
  for (const id of new Set([...Object.keys(local), ...Object.keys(remote)])) {
    out[id] = mergeCounters(local[id], remote[id], ['attempts', 'exact', 'close']);
  }
  return out;
}

function shiftDate(dateStr, days) {
  const d = new Date(dateStr + 'T00:00:00');
  d.setDate(d.getDate() + days);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/**
 * Пересчитывает стрик по объединённой истории.
 *
 * Складывать стрики двух устройств бессмысленно: занятие в один
 * и тот же день на ноутбуке и на телефоне — это один день, а не два.
 * История после слияния знает все дни занятий, так что стрик
 * восстанавливается из неё точно.
 */
export function recomputeStreak(history, today) {
  const days = Object.keys(history).filter((d) => history[d] > 0);
  if (!days.length) return { streak: 0, lastStudyDate: null };

  const last = days.sort().at(-1);
  // Стрик жив, только если последнее занятие было сегодня или вчера
  if (last !== today && last !== shiftDate(today, -1)) {
    return { streak: 0, lastStudyDate: last };
  }

  let streak = 0;
  let cursor = last;
  while (history[cursor] > 0) {
    streak += 1;
    cursor = shiftDate(cursor, -1);
  }
  return { streak, lastStudyDate: last };
}

/**
 * Сливает два состояния портала.
 *
 * `local` имеет приоритет в настройках: скорость речи, цель на день
 * и ключ API — свойства конкретного устройства, а не общего прогресса.
 */
export function mergeState(local, remote, today) {
  if (!remote) return local;

  const history = mergeHistory(local.history, remote.history);
  const { streak, lastStudyDate } = recomputeStreak(history, today);

  return {
    ...local,
    createdAt:
      local.createdAt && remote.createdAt
        ? local.createdAt <= remote.createdAt
          ? local.createdAt
          : remote.createdAt
        : local.createdAt || remote.createdAt,
    // XP берём максимумом: сложение удвоило бы очки за общую часть истории
    xp: Math.max(local.xp || 0, remote.xp || 0),
    streak,
    lastStudyDate,
    history,
    lessons: mergeLessons(local.lessons, remote.lessons),
    cards: mergeCards(local.cards, remote.cards),
    pronunciation: mergePronunciation(local.pronunciation, remote.pronunciation),
    listening: mergeCounters(local.listening, remote.listening, ['attempts', 'perfect']),
    writing: mergeCounters(local.writing, remote.writing, ['checked', 'errorsFound']),
    // Настройки не синхронизируем — они про устройство, а не про прогресс
    settings: local.settings,
  };
}


/**
 * Сколько слов выучено в состоянии — для показа результата слияния.
 * Фразы грамматики лежат в тех же карточках, но здесь речь о словах,
 * и смешивать их значило бы завышать число на экране слияния.
 */
export function masteredCount(state) {
  return Object.entries(state.cards || {}).filter(
    ([id, c]) => !isGrammarCard(id) && c.interval >= MASTERED_DAYS,
  ).length;
}
