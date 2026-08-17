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
 * пустой ввод, ни кликом по устаревшей разметке.
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
  // Длинное слово: короткое могло бы случайно совпасть с версткой
  const targetId = unlocked.find((id) => getWord(id).en.length >= 4);

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

test.afterEach(() => Review.exitReview());

/* ---------- Ответ нельзя увидеть до попытки ---------- */

test('лицевая сторона воспроизведения не содержит английского слова', () => {
  const { word } = prodSession();
  const html = Review.renderReview();

  assert.ok(!html.includes(word.en), `слово «${word.en}» не должно быть видно до проверки`);
  assert.ok(html.includes('data-prod-input'), 'вместо этого — поле для ввода');
});

test('«показать ответ» на воспроизведении не срабатывает', () => {
  const { word } = prodSession();

  assert.equal(Review.handleReveal(), false, 'обойти ввод нельзя');
  assert.ok(!Review.renderReview().includes(word.en), 'ответ так и не показан');
});

test('без проверки оценку поставить нельзя', () => {
  prodSession();
  assert.equal(Review.handleGrade(GRADE.GOOD), false);
});

/* ---------- Проверка написанного ---------- */

test('регистр и знаки препинания ошибкой не считаются', () => {
  const { word } = prodSession();
  Review.syncTyped(`  ${word.en.toUpperCase()}!  `);

  assert.equal(Review.handleCheck(), true);
  assert.equal(Review.handleGrade(GRADE.GOOD), true, 'верный ответ можно оценить как «помню»');
});

test('пустое поле — не ответ', () => {
  const { word } = prodSession();

  Review.syncTyped('');
  assert.equal(Review.handleCheck(), false);
  Review.syncTyped('   ');
  assert.equal(Review.handleCheck(), false, 'пробелы тоже');
  assert.ok(!Review.renderReview().includes(word.en), 'ответ не открылся');
});

test('после ошибки «помню» и «трудно» недоступны', () => {
  const { id, word } = prodSession();
  Review.syncTyped(word.en + 'xx');
  Review.handleCheck();

  assert.equal(Review.handleGrade(GRADE.GOOD), false, '«помню» после ошибки — самообман');
  assert.equal(Review.handleGrade(GRADE.EASY), false);
  assert.equal(Review.handleGrade(GRADE.HARD), false, '«трудно» отодвинуло бы повторение');
  assert.equal(Review.handleGrade(GRADE.AGAIN), true);

  const prod = getCard(cardId(id, DIRECTION.PROD));
  assert.equal(prod.due, today(), 'слово возвращается сегодня, а не через интервал');
});

test('неверный ответ возвращает карточку в конец очереди', () => {
  const { word } = prodSession();
  Review.syncTyped('definitely not it');
  Review.handleCheck();
  Review.handleGrade(GRADE.AGAIN);

  const html = Review.renderReview();
  assert.ok(html.includes('data-prod-input'), 'та же карточка спрашивается снова');
  assert.ok(!html.includes(word.en), 'и снова без подсказки');
  assert.ok(!html.includes('definitely not it'), 'прошлый ответ стёрт');
});

test('«не помню» открывает ответ, но не даёт зачесть слово', () => {
  const { word } = prodSession();

  assert.equal(Review.handleGiveUp(), true);
  const html = Review.renderReview();
  assert.ok(html.includes(word.en), 'ответ показан — иначе не выучить');
  assert.equal(Review.handleGrade(GRADE.GOOD), false, 'но «помню» после сдачи невозможно');
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
