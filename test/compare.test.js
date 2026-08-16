/**
 * Проверка оценки произношения.
 *
 * Сам микрофон здесь не участвует: тестируем то, что решает судьбу попытки —
 * насколько снисходительно портал сравнивает услышанное с образцом.
 * Слишком строгое сравнение забракует верную речь, слишком мягкое —
 * засчитает произнесённое неправильно.
 */
import test from 'node:test';
import assert from 'node:assert/strict';

const { levenshtein, similarity, normalizeSpeech, scoreAttempt, VERDICT } = await import(
  '../src/core/compare.js'
);

test('расстояние Левенштейна считается верно', () => {
  assert.equal(levenshtein('', ''), 0);
  assert.equal(levenshtein('cat', 'cat'), 0);
  assert.equal(levenshtein('cat', 'cut'), 1);
  assert.equal(levenshtein('cat', ''), 3);
  assert.equal(levenshtein('think', 'sink'), 2);
});

test('регистр и пунктуация не влияют на сравнение', () => {
  assert.equal(normalizeSpeech('  Hello, WORLD! '), 'hello world');
  assert.equal(similarity('Hello!', 'hello'), 1);
  assert.equal(similarity("Don't", 'dont'), 1);
});

test('точное распознавание засчитывается как безупречное', () => {
  const r = scoreAttempt('water', [{ transcript: 'water', confidence: 0.9 }]);
  assert.equal(r.verdict, VERDICT.EXACT);
  assert.equal(r.heard, 'water');
});

test('лучшая гипотеза выигрывает у первой неудачной', () => {
  // Распознаватель сначала предлагает мусор, верный вариант идёт вторым
  const r = scoreAttempt('water', [
    { transcript: 'wander', confidence: 0.4 },
    { transcript: 'water', confidence: 0.8 },
  ]);
  assert.equal(r.verdict, VERDICT.EXACT, 'верная гипотеза не должна теряться');
});

test('мелкая неточность считается близкой, а не ошибкой', () => {
  const r = scoreAttempt('interesting', [{ transcript: 'intresting' }]);
  assert.equal(r.verdict, VERDICT.CLOSE);
  assert.ok(r.score > 0.7 && r.score < 1);
});

test('другое слово распознаётся как ошибка', () => {
  const r = scoreAttempt('think', [{ transcript: 'sink' }]);
  assert.equal(r.verdict, VERDICT.WRONG, 'подмена /θ/ на /s/ должна отлавливаться');

  const r2 = scoreAttempt('three', [{ transcript: 'tree' }]);
  assert.equal(r2.verdict, VERDICT.WRONG, 'three и tree различает один звук — это не «близко»');

  const r3 = scoreAttempt('water', [{ transcript: 'wander' }]);
  assert.equal(r3.verdict, VERDICT.WRONG);
});

test('на коротких словах порог строже, чем на длинных фразах', () => {
  // Одна буква разницы: на коротком слове — ошибка, в длинной фразе — мелочь
  const short = scoreAttempt('three', [{ transcript: 'tree' }]);
  const long = scoreAttempt('It is going to rain today', [{ transcript: 'It is going to rain toda' }]);

  assert.equal(short.verdict, VERDICT.WRONG);
  assert.notEqual(long.verdict, VERDICT.WRONG, 'в длинной фразе одна буква не должна всё ломать');
});

test('пустой ответ — не ошибка сравнения, а отсутствие речи', () => {
  const r = scoreAttempt('water', []);
  assert.equal(r.verdict, VERDICT.WRONG);
  assert.equal(r.score, 0);
  assert.equal(r.heard, '');
});

test('фразы сравниваются целиком, лишний артикль не бракует попытку', () => {
  const r = scoreAttempt('I have a car', [{ transcript: 'I have car' }]);
  assert.notEqual(r.verdict, VERDICT.WRONG, 'потерянный артикль — не провал');
});

test('совсем другая фраза не проходит', () => {
  const r = scoreAttempt('I have a car', [{ transcript: 'the weather is nice' }]);
  assert.equal(r.verdict, VERDICT.WRONG);
});

test('строки принимаются наравне с объектами распознавателя', () => {
  const r = scoreAttempt('hello', ['hello']);
  assert.equal(r.verdict, VERDICT.EXACT);
});
