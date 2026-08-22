/**
 * Грамматика в интервальных повторениях.
 *
 * До сих пор повторялись только слова. Упражнения урока проходились
 * один раз и исчезали навсегда — правило «в третьем лице добавляется -s»
 * забывалось ровно так же, как слово water, но у слова была карточка,
 * а у правила нет. Портал систематически терял то, чему уже научил.
 *
 * Материал не сочиняется заново: карточкой становится предложение из
 * упражнений «переведи» и «собери», которые курс уже проверяет. Это
 * честнее авторской выдумки — фразы согласованы с теорией урока, и их
 * лексика заведомо открыта к тому моменту, когда карточка появится.
 *
 * В «собери» слова даются готовыми, а здесь их надо вспомнить самому:
 * то же предложение работает строже, чем в уроке.
 */

import { allLessons } from './curriculum.js';

/** Русскую фразу берём из кавычек: «Мы живём здесь» → Мы живём здесь. */
function extractRu(prompt) {
  const quoted = prompt.match(/«([^»]+)»/);
  if (quoted) return quoted[1];
  // Без кавычек фразы нет — остаётся сама формулировка задания
  return prompt.replace(/^(Переведи|Собери|Напиши)[^:]*:\s*/i, '').trim();
}

/**
 * Подсказка в скобках («… (English)») переносится отдельно: в самом
 * задании она помогает, а внутри карточки притворялась бы частью фразы.
 */
function extractHint(prompt) {
  const hint = prompt.match(/\(([^)]+)\)\s*$/);
  return hint ? hint[1] : '';
}

function build() {
  const items = [];
  for (const lesson of allLessons()) {
    lesson.exercises.forEach((ex, i) => {
      if (ex.type !== 'translate' && ex.type !== 'order') return;
      items.push({
        // id привязан к уроку и месту в нём — переживает пересборку данных
        id: `${lesson.id}#${i}`,
        ru: extractRu(ex.prompt),
        en: ex.answer,
        hint: extractHint(ex.prompt),
        lessonId: lesson.id,
        lessonTitle: lesson.title,
        levelCode: lesson.levelCode,
      });
    });
  }
  return items;
}

const ITEMS = build();
const BY_ID = Object.fromEntries(ITEMS.map((it) => [it.id, it]));

export function allGrammarItems() {
  return ITEMS;
}

export function getGrammarItem(id) {
  return BY_ID[id] || null;
}

export function allGrammarIds() {
  return ITEMS.map((it) => it.id);
}

/** Фразы из пройденных уроков — остальные ещё не объяснены. */
export function unlockedGrammarIds(completedLessons = {}) {
  return ITEMS.filter((it) => completedLessons[it.lessonId]).map((it) => it.id);
}

/** Сколько фраз даёт каждый уровень — для разбора прогресса. */
export function grammarByLevel() {
  const out = {};
  for (const it of ITEMS) out[it.levelCode] = (out[it.levelCode] || 0) + 1;
  return out;
}
