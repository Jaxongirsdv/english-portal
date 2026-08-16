/**
 * Проверка целостности учебного контента.
 * Ловит опечатки в уроках раньше, чем они всплывут во время занятия.
 */
import test from 'node:test';
import assert from 'node:assert/strict';

const { VOCAB, VOCAB_BY_ID } = await import('../src/data/vocab.js');
const { CURRICULUM, allLessons, unlockedVocabIds } = await import('../src/data/curriculum.js');

test('id слов уникальны', () => {
  const seen = new Set();
  for (const w of VOCAB) {
    assert.ok(!seen.has(w.id), `дубликат id: ${w.id}`);
    seen.add(w.id);
  }
});

test('у каждого слова есть перевод, транскрипция и пример', () => {
  for (const w of VOCAB) {
    for (const field of ['en', 'ru', 'ipa', 'rus', 'topic', 'level', 'example', 'exampleRu']) {
      assert.ok(w[field], `у слова "${w.id}" не заполнено поле ${field}`);
    }
  }
});

test('id уроков уникальны', () => {
  const seen = new Set();
  for (const l of allLessons()) {
    assert.ok(!seen.has(l.id), `дубликат id урока: ${l.id}`);
    seen.add(l.id);
  }
});

test('слова уроков существуют в словаре', () => {
  for (const lesson of allLessons()) {
    for (const id of lesson.vocab) {
      assert.ok(VOCAB_BY_ID[id], `урок "${lesson.id}" ссылается на несуществующее слово "${id}"`);
    }
  }
});

test('в упражнениях с выбором правильный ответ есть среди вариантов', () => {
  for (const lesson of allLessons()) {
    for (const [i, ex] of lesson.exercises.entries()) {
      const where = `${lesson.id}, упражнение ${i + 1}`;
      if (ex.type === 'choice') {
        assert.ok(ex.options.includes(ex.answer), `${where}: ответ "${ex.answer}" не найден среди вариантов`);
        assert.equal(new Set(ex.options).size, ex.options.length, `${where}: варианты повторяются`);
      }
      if (ex.type === 'listen') {
        assert.ok(ex.options.includes(ex.word), `${where}: слово "${ex.word}" не найдено среди вариантов`);
      }
    }
  }
});

test('в упражнениях «собери предложение» слова складываются в ответ', () => {
  for (const lesson of allLessons()) {
    for (const [i, ex] of lesson.exercises.entries()) {
      if (ex.type !== 'order') continue;
      const where = `${lesson.id}, упражнение ${i + 1}`;
      const fromWords = [...ex.words].sort().join(' ').toLowerCase();
      const fromAnswer = ex.answer.split(/\s+/).sort().join(' ').toLowerCase();
      assert.equal(fromWords, fromAnswer, `${where}: набор слов не совпадает с ответом`);
    }
  }
});

test('у каждого урока есть теория и хотя бы одно упражнение', () => {
  for (const lesson of allLessons()) {
    assert.ok(lesson.theory?.length, `урок "${lesson.id}" без теории`);
    assert.ok(lesson.exercises?.length, `урок "${lesson.id}" без упражнений`);
    assert.ok(lesson.duration > 0, `урок "${lesson.id}" без длительности`);
  }
});

test('таблицы теории не съезжают: в строках столько же ячеек, сколько в шапке', () => {
  for (const lesson of allLessons()) {
    for (const block of lesson.theory) {
      if (block.type !== 'table') continue;
      for (const row of block.rows) {
        assert.equal(
          row.length,
          block.head.length,
          `урок "${lesson.id}": строка [${row.join(', ')}] не совпадает с шапкой по числу столбцов`,
        );
      }
    }
  }
});

test('без пройденных уроков в повторение не попадает ни одного слова', () => {
  assert.deepEqual(unlockedVocabIds({}), []);
});

test('урок открывает ровно свои слова и ничего сверх того', () => {
  const lesson = allLessons().find((l) => l.vocab.length > 0);
  const unlocked = unlockedVocabIds({ [lesson.id]: { score: 100 } });
  assert.deepEqual([...unlocked].sort(), [...new Set(lesson.vocab)].sort());
});

test('слова из непройденных уроков остаются закрытыми', () => {
  const [first, second] = allLessons().filter((l) => l.vocab.length > 0);
  const unlocked = unlockedVocabIds({ [first.id]: { score: 100 } });
  const onlyInSecond = second.vocab.filter((id) => !first.vocab.includes(id));

  assert.ok(onlyInSecond.length, 'нужны уроки с разной лексикой для проверки');
  for (const id of onlyInSecond) {
    assert.ok(!unlocked.includes(id), `слово "${id}" открылось до своего урока`);
  }
});

test('уровни идут по возрастанию и имеют цель', () => {
  const codes = CURRICULUM.map((l) => l.code);
  assert.deepEqual(codes, ['A0', 'A1', 'A2', 'B1', 'B2', 'C1']);
  for (const level of CURRICULUM) {
    assert.ok(level.goal, `у уровня ${level.code} не задана цель`);
    assert.ok(level.units.length, `у уровня ${level.code} нет юнитов`);
  }
});
