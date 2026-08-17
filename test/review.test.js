/**
 * Проверка тренажёра повторений — прежде всего обратной стороны карточки.
 *
 * Здесь легко построить экран, который ВЫГЛЯДИТ как тренировка речи,
 * но ею не является: показать перевод, дать кнопку «показать ответ»
 * и четыре оценки. Человек видит слово, ставит «помню», интервал растёт —
 * и слово уходит из памяти при формально растущей статистике.
 *
 * Поэтому тесты проверяют не «работают ли кнопки», а невозможность
 * зачесть невоспроизведённое слово: ни через показ ответа, ни через
 * пустой ввод, ни кликом по устаревшей разметке. И одновременно —
 * что честная попытка с опечаткой не считается провалом.
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
const { allLessons, unlockedVocabIds } = await import('../src/data/curriculum.js');
const { getWord } = await import('../src/data/vocab.js');
const { cardId, getCard, GRADE, DIRECTION } = await import('../src/core/srs.js');
const Review = await import('../src/views/review.js');

const LESSON = allLessons().find((l) => l.vocab.length >= 5);
const FUTURE = '2099-01-01';
const NONSENSE = 'zzzz qqqq';

function card(over = {}) {
  return { ease: 2.5, interval: 6, reps: 1, lapses: 0, due: FUTURE, ...over };
}

/**
 * Сессия ровно с одной карточкой воспроизведения впереди.
 *
 * Всем открытым словам заводим узнавание с датой в будущем: тогда долгов
 * нет и новых карточек узнавания тоже, а обратная сторона открывается
 * только у выбранного слова.
 */
function prodSession() {
  resetState();
  update((s) => {
    s.lessons = { [LESSON.id]: { completedAt: '2026-08-16T00:00:00Z', score: 100 } };
  });

  const unlocked = unlockedVocabIds(loadState().lessons);
  // Слово от восьми букв: на нём пропуск одной буквы гарантированно
  // остаётся опечаткой, а не превращается в другое слово
  const targetId = unlocked.find((id) => getWord(id).en.length >= 8);
  assert.ok(targetId, 'в уроке нужно длинное слово, иначе опечатку не проверить');

  update((s) => {
    for (const wid of unlocked) {
      s.cards[cardId(wid, DIRECTION.REC)] = card({ reps: wid === targetId ? 2 : 1 });
    }
  });

  Review.startReview();
  return { id: targetId, word: getWord(targetId) };
}

/** Сессия с карточкой узнавания впереди: уроки пройдены, карточек нет. */
function recSession() {
  resetState();
  update((s) => {
    s.lessons = { [LESSON.id]: { completedAt: '2026-08-16T00:00:00Z', score: 100 } };
  });
  Review.startReview();
}

/** Подставной распознаватель: движок ищется через window при каждом вызове. */
function withEngine(behaviour) {
  class Fake {
    start() {
      setTimeout(() => behaviour(this), 0);
    }
    stop() {}
    abort() {}
  }
  globalThis.window = { SpeechRecognition: Fake };
}

const hears = (text) => (r) =>
  r.onresult({ results: [[{ transcript: text, confidence: 0.9 }]] });
const fails = (code) => (r) => r.onerror({ error: code });

test.afterEach(() => {
  Review.exitReview();
  delete globalThis.window;
});

/* ---------- Ответ нельзя увидеть до попытки ---------- */

test('лицевая сторона воспроизведения не содержит английского слова', () => {
  const { word } = prodSession();
  const html = Review.renderReview();

  assert.ok(!html.includes(word.en), `слово «${word.en}» не должно быть видно до попытки`);
  assert.ok(html.includes('data-prod-input'), 'вместо этого — поле для ввода');
});

test('«показать ответ» на воспроизведении не срабатывает', () => {
  const { word } = prodSession();

  assert.equal(Review.handleReveal(), false, 'обойти попытку нельзя');
  assert.ok(!Review.renderReview().includes(word.en), 'ответ так и не показан');
});

test('без проверки оценку поставить нельзя', () => {
  prodSession();
  assert.equal(Review.handleGrade(GRADE.GOOD), false);
});

test('пустое поле — не ответ', () => {
  const { word } = prodSession();

  Review.syncTyped('');
  assert.equal(Review.handleCheck(), false);
  Review.syncTyped('   ');
  assert.equal(Review.handleCheck(), false, 'пробелы тоже');
  assert.ok(!Review.renderReview().includes(word.en), 'ответ не открылся');
});

/* ---------- Что считается верным ---------- */

test('регистр и знаки препинания ошибкой не считаются', () => {
  const { word } = prodSession();
  Review.syncTyped(`  ${word.en.toUpperCase()}!  `);

  assert.equal(Review.handleCheck(), true);
  assert.equal(Review.handleGrade(GRADE.GOOD), true, 'точный ответ можно оценить как «помню»');
});

test('опечатка — это «почти», а не провал', () => {
  const { id, word } = prodSession();
  Review.syncTyped(word.en.slice(0, -1)); // потеряна последняя буква
  Review.handleCheck();

  const html = Review.renderReview();
  assert.ok(html.includes('Почти'), 'разбор должен назвать это опечаткой');
  assert.equal(Review.handleGrade(GRADE.GOOD), false, 'но «помню» за опечатку не ставится');
  assert.equal(Review.handleGrade(GRADE.HARD), true, 'засчитывается как «трудно»');

  const prod = getCard(cardId(id, DIRECTION.PROD));
  assert.equal(prod.lapses, 0, 'слово вспомнилось — провалом это не считается');
  assert.notEqual(prod.due, today(), 'и повтор всё же отодвигается');
});

test('другое слово опечаткой не считается', () => {
  const { id } = prodSession();
  Review.syncTyped(NONSENSE);
  Review.handleCheck();

  assert.equal(Review.handleGrade(GRADE.HARD), false, '«трудно» отодвинуло бы повторение');
  assert.equal(Review.handleGrade(GRADE.GOOD), false);
  assert.equal(Review.handleGrade(GRADE.EASY), false);
  assert.equal(Review.handleGrade(GRADE.AGAIN), true);

  const prod = getCard(cardId(id, DIRECTION.PROD));
  assert.equal(prod.due, today(), 'слово возвращается сегодня, а не через интервал');
});

test('неверный ответ возвращает карточку в конец очереди', () => {
  const { word } = prodSession();
  Review.syncTyped(NONSENSE);
  Review.handleCheck();
  Review.handleGrade(GRADE.AGAIN);

  const html = Review.renderReview();
  assert.ok(html.includes('data-prod-input'), 'та же карточка спрашивается снова');
  assert.ok(!html.includes(word.en), 'и снова без подсказки');
  assert.ok(!html.includes(NONSENSE), 'прошлый ответ стёрт');
});

test('«не помню» открывает ответ, но не даёт зачесть слово', () => {
  const { word } = prodSession();

  assert.equal(Review.handleGiveUp(), true);
  assert.ok(Review.renderReview().includes(word.en), 'ответ показан — иначе не выучить');
  assert.equal(Review.handleGrade(GRADE.GOOD), false, 'но «помню» после сдачи невозможно');
});

/* ---------- Голосом ---------- */

test('без распознавания режим остаётся письменным', () => {
  prodSession();
  Review.setAnswerMode('speak'); // движка нет — выбор не должен запирать экран

  const html = Review.renderReview();
  assert.ok(html.includes('data-prod-input'), 'поле ввода на месте');
  assert.ok(!html.includes('data-prod-speak'), 'кнопки записи быть не должно');
  assert.ok(!html.includes('data-prod-mode'), 'и переключателя тоже: выбирать не из чего');
});

test('сказанное верно засчитывается так же, как написанное', async () => {
  const { word } = prodSession();
  withEngine(hears(word.en));
  Review.setAnswerMode('speak');

  const html = Review.renderReview();
  assert.ok(html.includes('data-prod-speak'), 'появилась кнопка записи');
  assert.ok(!html.includes(word.en), 'ответ по-прежнему скрыт');

  await Review.handleSpeak(() => {});
  assert.ok(Review.renderReview().includes(word.en), 'после попытки ответ открыт');
  assert.equal(Review.handleGrade(GRADE.GOOD), true);
});

test('услышанное чужое слово не зачитывается', async () => {
  const { id } = prodSession();
  withEngine(hears(NONSENSE));
  Review.setAnswerMode('speak');

  await Review.handleSpeak(() => {});
  assert.equal(Review.handleGrade(GRADE.GOOD), false);
  assert.equal(Review.handleGrade(GRADE.AGAIN), true);
  assert.equal(getCard(cardId(id, DIRECTION.PROD)).due, today());
});

test('отказ микрофона объясняется и ничего не засчитывает', async () => {
  prodSession();
  withEngine(fails('not-allowed'));
  Review.setAnswerMode('speak');

  await Review.handleSpeak(() => {});
  const html = Review.renderReview();

  assert.ok(html.includes('Нет доступа к микрофону'), 'причина названа прямо');
  assert.ok(html.includes('data-prod-speak'), 'можно попробовать снова');
  assert.equal(Review.handleGrade(GRADE.AGAIN), false, 'попытки не было — оценивать нечего');
});

test('во время записи карточку нельзя сдать или переключить', async () => {
  const { word } = prodSession();
  let resolveEngine;
  withEngine((r) => {
    resolveEngine = () => r.onresult({ results: [[{ transcript: word.en, confidence: 0.9 }]] });
  });
  Review.setAnswerMode('speak');

  const pending = Review.handleSpeak(() => {});
  await new Promise((r) => setTimeout(r, 0)); // движок «запустился»

  assert.equal(Review.handleGiveUp(), false, 'иначе ответ открылся бы дважды');
  assert.equal(Review.setAnswerMode('write'), false);
  assert.equal(Review.handleCheck(), false);

  resolveEngine();
  await pending;
  assert.equal(Review.handleGrade(GRADE.GOOD), true, 'после записи всё работает');
});

/* ---------- Узнавание работает по-прежнему ---------- */

test('на узнавании самооценка сохраняется целиком', () => {
  recSession();

  assert.equal(Review.handleCheck(), false, 'ввод здесь ни при чём');
  assert.equal(Review.handleGiveUp(), false);
  assert.equal(Review.handleReveal(), true);

  const html = Review.renderReview();
  for (const g of [GRADE.AGAIN, GRADE.HARD, GRADE.GOOD, GRADE.EASY]) {
    assert.ok(html.includes(`data-grade="${g}"`), `оценка ${g} доступна`);
  }
  assert.equal(Review.handleGrade(GRADE.GOOD), true);
});
