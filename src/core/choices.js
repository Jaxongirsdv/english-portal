/**
 * Подбор неверных вариантов для карточек с выбором.
 *
 * Вариант выбора хорош ровно настолько, насколько правдоподобны отвлекающие.
 * Четыре случайных слова со всего словаря угадываются по теме, не зная языка:
 * если правильный ответ «спасибо», а рядом «холодильник», «сентябрь» и
 * «переговоры», выбор ничего не проверяет. Поэтому берём сначала соседей
 * по теме, затем по уровню и только потом кого придётся.
 */

import { shuffle } from './ui.js';

/** Слова, которые нельзя ставить рядом: их перевод совпадает с верным. */
function usable(word, target) {
  return word && word.id !== target.id && word.ru !== target.ru;
}

/**
 * Варианты ответа для узнавания: перевод целевого слова и ещё count-1 чужих.
 * Возвращает перемешанный список строк — порядок закрепляется вызывающим,
 * иначе перерисовка тасовала бы варианты под курсором.
 */
export function translationChoices(target, pool, count = 4) {
  const candidates = pool.filter((w) => usable(w, target));

  const sameTopic = shuffle(candidates.filter((w) => w.topic === target.topic));
  const sameLevel = shuffle(candidates.filter((w) => w.topic !== target.topic && w.level === target.level));
  const rest = shuffle(candidates.filter((w) => w.topic !== target.topic && w.level !== target.level));

  const picked = [];
  const seen = new Set([target.ru]);
  for (const w of [...sameTopic, ...sameLevel, ...rest]) {
    if (picked.length >= count - 1) break;
    if (seen.has(w.ru)) continue; // два одинаковых перевода делают вопрос нечестным
    seen.add(w.ru);
    picked.push(w.ru);
  }

  return shuffle([target.ru, ...picked]);
}

/**
 * Банк слов для сборки фразы.
 * Возвращает перемешанные слова ответа: собрать предложение из готовых
 * кусочков легче, чем набрать его целиком, и на телефоне это решает.
 */
export function wordBank(sentence) {
  return shuffle(String(sentence).trim().split(/\s+/).filter(Boolean));
}
