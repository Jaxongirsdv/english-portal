/**
 * Проверка грамматики в повторениях.
 *
 * Фразы лежат в том же хранилище карточек, что и слова. Это дало им
 * бесплатно и SM-2, и слияние между устройствами — но и опасность:
 * любой подсчёт по словарю, забывший про префикс, начнёт считать фразы
 * словами и молча завысит прогресс. Половина проверок здесь именно
 * про это, а не про сами карточки.
 */
import test from 'node:test';
import assert from 'node:assert/strict';

const store = new Map();
globalThis.localStorage = {
  getItem: (k) => (store.has(k) ? store.get(k) : null),
  setItem: (k, v) => store.set(k, String(v)),
  removeItem: (k) => store.delete(k),
};

const { resetState, update, loadState, today } = await import('../src/core/storage.js');
const {
  allGrammarItems,
  getGrammarItem,
  unlockedGrammarIds,
  grammarByLevel,
} = await import('../src/data/grammar.js');
const {
  grammarCardId,
  isGrammarCard,
  grammarItemId,
  dueGrammarIds,
  newGrammarIds,
  grammarStats,
  review,
  stats,
  GRADE,
} = await import('../src/core/srs.js');
const { sideBalance } = await import('../src/core/analytics.js');
const { masteredCount } = await import('../src/core/merge.js');
const { allVocabIds } = await import('../src/data/vocab.js');

/* ---------- Материал ---------- */

test('фразы собраны из упражнений всех уровней', () => {
  const items = allGrammarItems();
  assert.ok(items.length >= 100, `фраз слишком мало: ${items.length}`);

  const levels = grammarByLevel();
  for (const code of ['A0', 'A1', 'A2', 'B1', 'B2', 'C1']) {
    assert.ok(levels[code] > 0, `уровень ${code} остался без грамматики`);
  }
});

test('у каждой фразы есть обе стороны и происхождение', () => {
  for (const it of allGrammarItems()) {
    assert.ok(it.ru.trim(), `${it.id}: пустая русская сторона`);
    assert.ok(it.en.trim(), `${it.id}: пустой ответ`);
    assert.ok(it.lessonTitle, `${it.id}: непонятно, из какого урока`);
    assert.ok(!it.ru.includes('«'), `${it.id}: кавычки задания просочились в карточку`);
  }
});

test('id фраз уникальны — иначе прогресс склеится', () => {
  const ids = allGrammarItems().map((i) => i.id);
  assert.equal(new Set(ids).size, ids.length);
});

test('подсказка вынесена из фразы, а не оставлена внутри неё', () => {
  const withHint = allGrammarItems().find((i) => i.hint);
  assert.ok(withHint, 'хотя бы одно задание содержит подсказку в скобках');
  assert.ok(!withHint.ru.includes('('), 'в самой фразе скобок быть не должно');
});

test('фразы открываются только пройденными уроками', () => {
  const item = allGrammarItems()[0];
  assert.deepEqual(unlockedGrammarIds({}), [], 'без уроков грамматики нет');

  const unlocked = unlockedGrammarIds({ [item.lessonId]: { score: 100 } });
  assert.ok(unlocked.includes(item.id));
  assert.ok(
    unlocked.every((id) => getGrammarItem(id).lessonId === item.lessonId),
    'чужие уроки не должны просачиваться',
  );
});

/* ---------- Карточки ---------- */

test('id карточки фразы не спутать с id слова', () => {
  const id = grammarCardId('a0-u2-l1#1');
  assert.ok(isGrammarCard(id));
  assert.equal(grammarItemId(id), 'a0-u2-l1#1');

  for (const wordId of allVocabIds()) {
    assert.ok(!isGrammarCard(wordId), `слово ${wordId} принято за фразу`);
  }
});

test('фразы живут по тем же интервалам, что и слова', () => {
  resetState();
  const id = allGrammarItems()[0].id;

  assert.deepEqual(newGrammarIds([id]), [id], 'сначала фраза новая');
  assert.deepEqual(dueGrammarIds([id]), [], 'и повторять её нечего');

  review(grammarCardId(id), GRADE.AGAIN); // не вспомнил — вернётся сегодня
  assert.deepEqual(newGrammarIds([id]), [], 'карточка заведена');
  assert.deepEqual(dueGrammarIds([id]), [id]);

  review(grammarCardId(id), GRADE.GOOD); // интервал 1 день
  assert.deepEqual(dueGrammarIds([id]), [], 'до завтра не спрашивается');
});

test('сводка по фразам считает начатое и закреплённое', () => {
  resetState();
  const [a, b] = allGrammarItems().map((i) => i.id);

  review(grammarCardId(a), GRADE.GOOD);
  let s = grammarStats([a, b]);
  assert.equal(s.total, 2);
  assert.equal(s.started, 1);
  assert.equal(s.untouched, 1);
  assert.equal(s.mastered, 0);

  for (let i = 0; i < 4; i++) review(grammarCardId(a), GRADE.GOOD); // до 21+ дня
  s = grammarStats([a, b]);
  assert.equal(s.mastered, 1);
});

/* ---------- Фразы не должны выдавать себя за слова ---------- */

test('фраза не попадает в статистику словаря', () => {
  resetState();
  review(grammarCardId(allGrammarItems()[0].id), GRADE.GOOD);

  const s = stats(allVocabIds());
  assert.equal(s.learning, 0, 'ни одного слова не начато');
  assert.equal(s.mastered, 0);
});

test('фраза не считается стороной слова в разборе прогресса', () => {
  resetState();
  for (let i = 0; i < 3; i++) review(grammarCardId(allGrammarItems()[i].id), GRADE.GOOD);

  const balance = sideBalance(loadState());
  assert.equal(balance.recognition, 0, 'иначе каждая фраза выглядела бы узнаванием слова');
  assert.equal(balance.production, 0);
});

test('фраза не завышает число выученных слов при слиянии', () => {
  resetState();
  const id = grammarCardId(allGrammarItems()[0].id);
  for (let i = 0; i < 5; i++) review(id, GRADE.GOOD); // интервал заведомо больше 21 дня

  assert.ok(loadState().cards[id].interval >= 21, 'фраза действительно закреплена');
  assert.equal(masteredCount(loadState()), 0, 'но выучены — это про слова');
});
