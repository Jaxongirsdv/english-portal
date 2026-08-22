/**
 * Проверка вариантов ответа.
 *
 * Вопрос с выбором проверяет знание только если отвлекающие правдоподобны.
 * Плохо подобранные варианты дают верный ответ угадать, не зная языка, —
 * и тогда карточка показывает прогресс там, где его нет.
 */
import test from 'node:test';
import assert from 'node:assert/strict';

const { translationChoices, wordBank } = await import('../src/core/choices.js');
const { VOCAB, allVocabIds } = await import('../src/data/vocab.js');

const POOL = VOCAB;
const target = VOCAB.find((w) => POOL.filter((x) => x.topic === w.topic).length >= 5);

test('вариантов ровно столько, сколько просили, и все разные', () => {
  const opts = translationChoices(target, POOL, 4);
  assert.equal(opts.length, 4);
  assert.equal(new Set(opts).size, 4, 'повтор среди вариантов делает вопрос бессмысленным');
});

test('верный перевод всегда среди вариантов', () => {
  for (const w of VOCAB.slice(0, 40)) {
    assert.ok(translationChoices(w, POOL, 4).includes(w.ru), `${w.id}: верного ответа нет в списке`);
  }
});

test('отвлекающие берутся из той же темы, пока она не кончится', () => {
  const sameTopic = POOL.filter((w) => w.topic === target.topic && w.id !== target.id);
  assert.ok(sameTopic.length >= 3, 'для этой проверки нужна тема побольше');

  const opts = translationChoices(target, POOL, 4).filter((o) => o !== target.ru);
  const fromTopic = opts.filter((o) => sameTopic.some((w) => w.ru === o));
  assert.equal(fromTopic.length, opts.length, 'соседей по теме хватало — чужих брать не следовало');
});

test('слово с тем же переводом в варианты не попадёт', () => {
  // Иначе получается вопрос без верного ответа: два варианта одинаково верны
  const twin = { id: 'twin', ru: target.ru, en: 'twin', topic: target.topic, level: target.level };
  const opts = translationChoices(target, [...POOL, twin], 4);
  assert.equal(opts.filter((o) => o === target.ru).length, 1);
});

test('порядок вариантов меняется от вызова к вызову', () => {
  // Иначе верный ответ всегда оказывался бы на одном месте
  const runs = new Set();
  for (let i = 0; i < 30; i++) runs.add(translationChoices(target, POOL, 4).join('|'));
  assert.ok(runs.size > 1, 'варианты обязаны перемешиваться');
});

test('крошечный словарь не ломает подбор', () => {
  const tiny = [target, { id: 'x', ru: 'иной', en: 'other', topic: 'z', level: 'A0' }];
  const opts = translationChoices(target, tiny, 4);
  assert.ok(opts.includes(target.ru));
  assert.equal(new Set(opts).size, opts.length, 'дубликатов быть не должно даже при нехватке слов');
  assert.ok(opts.length <= 4);
});

test('банк слов содержит ровно слова предложения', () => {
  const bank = wordBank('I have got a computer');
  assert.equal(bank.length, 5);
  assert.deepEqual([...bank].sort(), ['I', 'a', 'computer', 'got', 'have'].sort());
});

test('банк не теряет повторяющиеся слова', () => {
  // «to be or not to be»: наивная реализация через Set схлопнула бы to и be
  const bank = wordBank('to be or not to be');
  assert.equal(bank.length, 6);
  assert.equal(bank.filter((w) => w === 'to').length, 2);
});

test('лишние пробелы не создают пустых кусочков', () => {
  assert.deepEqual(wordBank('  hello   world  ').sort(), ['hello', 'world']);
});

test('в словаре нет слова без темы или уровня — подбор на них опирается', () => {
  const broken = VOCAB.filter((w) => !w.topic || !w.level);
  assert.deepEqual(broken.map((w) => w.id), [], 'иначе отвлекающие станут случайными');
  assert.equal(VOCAB.length, allVocabIds().length);
});
