/**
 * Проверка разбора диктанта.
 *
 * Здесь важна не столько «правильность» в общем смысле, сколько то,
 * что разбор показывает УЧЕБНО ПОЛЕЗНУЮ картину: какое именно слово
 * потерялось. Сдвиг выравнивания на одно слово превратил бы верный
 * хвост фразы в сплошные ошибки и сбил бы с толку.
 */
import test from 'node:test';
import assert from 'node:assert/strict';

const { diffWords, accuracy, isPerfect, splitWords, normalizeWord, WORD } = await import(
  '../src/core/diff.js'
);

const types = (steps) => steps.map((s) => s.type);

test('регистр и пунктуация не считаются ошибкой', () => {
  assert.equal(normalizeWord('Don’t,'), 'dont');
  const steps = diffWords('I have a car.', 'i have a car');
  assert.ok(isPerfect(steps));
  assert.equal(accuracy(steps), 1);
});

test('пустой ответ помечает все слова потерянными', () => {
  const steps = diffWords('I have a car', '');
  assert.deepEqual(types(steps), [WORD.MISSING, WORD.MISSING, WORD.MISSING, WORD.MISSING]);
  assert.equal(accuracy(steps), 0);
});

test('потерянный артикль не ломает выравнивание остальных слов', () => {
  // Самая частая ошибка на слух: артикль проглочен, всё остальное верно
  const steps = diffWords('I have a car', 'I have car');
  assert.deepEqual(types(steps), [WORD.OK, WORD.OK, WORD.MISSING, WORD.OK]);

  const missing = steps.find((s) => s.type === WORD.MISSING);
  assert.equal(missing.expected, 'a', 'должно быть видно, какое слово потерялось');
});

test('лишнее слово помечается, но не сдвигает остальные', () => {
  const steps = diffWords('I have car', 'I have a car');
  assert.deepEqual(types(steps), [WORD.OK, WORD.OK, WORD.EXTRA, WORD.OK]);
});

test('услышанное не то слово показывается как замена, а не как две ошибки', () => {
  const steps = diffWords('I think so', 'I sink so');
  assert.deepEqual(types(steps), [WORD.OK, WORD.WRONG, WORD.OK]);

  const wrong = steps.find((s) => s.type === WORD.WRONG);
  assert.equal(wrong.expected, 'think');
  assert.equal(wrong.actual, 'sink');
});

test('точность считается по словам оригинала, лишние её не раздувают', () => {
  const steps = diffWords('I have a car', 'I have a car and a dog');
  assert.equal(accuracy(steps), 1, 'все четыре слова оригинала услышаны');
  assert.ok(!isPerfect(steps), 'но дописанное лишнее — не идеальный ответ');
});

test('половина услышанных слов даёт половину точности', () => {
  const steps = diffWords('one two three four', 'one two');
  assert.equal(accuracy(steps), 0.5);
});

test('повторяющиеся слова не путаются между собой', () => {
  const steps = diffWords('I will help you if you help me', 'I will help you if you help me');
  assert.ok(isPerfect(steps));

  const partial = diffWords('I will help you if you help me', 'I will help if you help me');
  assert.equal(partial.filter((s) => s.type === WORD.MISSING).length, 1);
});

test('лишние пробелы не создают пустых слов', () => {
  assert.deepEqual(splitWords('  I   have a  car '), ['I', 'have', 'a', 'car']);
  assert.ok(isPerfect(diffWords('I have a car', '  I   have a  car ')));
});

test('полностью другая фраза не даёт случайных совпадений', () => {
  const steps = diffWords('the weather is nice', 'I bought a car');
  assert.equal(steps.filter((s) => s.type === WORD.OK).length, 0);
  assert.equal(accuracy(steps), 0);
});

test('непохожие слова не склеиваются в «замену»', () => {
  // Ответ мимо кассы: показывать «student вместо Hello» бессмысленно,
  // это два разных слова, а не подмена одного другим
  const steps = diffWords('I am a student', 'Hello what is your name');
  assert.equal(steps.filter((s) => s.type === WORD.WRONG).length, 0);
  assert.equal(steps.filter((s) => s.type === WORD.MISSING).length, 4, 'все слова оригинала потеряны');
});

test('похожие слова по-прежнему склеиваются', () => {
  for (const [expected, heard] of [
    ['think', 'sink'],
    ['three', 'tree'],
    ['walked', 'worked'],
  ]) {
    const steps = diffWords(`I ${expected} so`, `I ${heard} so`);
    assert.equal(
      steps.filter((s) => s.type === WORD.WRONG).length,
      1,
      `${expected}/${heard} — это подмена, её нужно показать одной строкой`,
    );
  }
});
